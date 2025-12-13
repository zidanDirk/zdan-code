import * as vscode from 'vscode';
import { Provider } from './core/webview/Provider';
import { ChatMessage, Todo, TodoWriteParameters } from '@zdan-code/types';
import { getConfig } from './core/config';
import { streamComplete } from './core/llm/stream';
import { randomUUID } from 'crypto';

let chatHistory: ChatMessage[] = [];
let todos: Todo[] = [];

async function handleUserMessage(provider: Provider, userMessage: string) {
	chatHistory.push({
		id: Date.now().toString(),
		role: 'user',
		content: userMessage
	});
	provider.sendMessage({ type: 'updateChat', payload: chatHistory });
	const config = getConfig();
	if (!config.apiKey || !config.baseUrl) {
		chatHistory.push({
			id: Date.now().toString(),
			role: 'assistant',
			content: 'API key 或者 Base URL 没有配置. 请检查你的配置.'
		});
		provider.sendMessage({ type: 'updateChat', payload: chatHistory });
		return;
	}
	const assistantMessage: ChatMessage = {
		id: Date.now().toString(),
		role: 'assistant',
		content: ''
	};
	chatHistory.push(assistantMessage);
	try {
		const stream = streamComplete(chatHistory, config);
		for await (const token of stream) {
			assistantMessage.content += token;
			provider.sendMessage({ type: 'updateChat', payload: chatHistory });
		}
		// 真实 AI 响应解析
		const toolCodeMatch = assistantMessage.content.match(/<tool_code>([\s\S]*?)<\/tool_code>/);
		if (toolCodeMatch) {
			try {
				const toolParameters: TodoWriteParameters = JSON.parse(toolCodeMatch[1]);
				debugger;
				if (toolParameters.tool_name === 'TodoWrite') {
					// 使用从 AI 获取的数据更新 todos 状态
					todos = toolParameters.todos.map((todo) => ({ ...todo, id: randomUUID() }));
					provider.updateTodos(todos);
				}
			} catch (error) {
				console.error('Failed to parse tool code:', error);
				// 可以在这里向用户发送一个错误消息
			}
		}
	} catch (error: any) {
		assistantMessage.content = `Error: ${error.message}`;
		provider.sendMessage({ type: 'updateChat', payload: chatHistory });
	}
}

export function activate(context: vscode.ExtensionContext) {
	const provider = new Provider(context.extensionUri, (message) => {
		if (message.type === 'userMessage') {
			handleUserMessage(provider, message.payload);
		}
	});

	vscode.commands.registerCommand('zdan-code.addSelectionToChat', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor && !editor.selection.isEmpty) {
			const selection = editor.document.getText(editor.selection);
			const path = editor.document.uri.fsPath;
			const language = editor.document.languageId;
			provider.addContextToChat({ language, content: selection, path });
		}
	});

	context.subscriptions.push(vscode.window.registerWebviewViewProvider(Provider.viewType, provider));
}
