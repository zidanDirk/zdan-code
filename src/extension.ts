import * as vscode from 'vscode';
import { Provider } from './core/webview/Provider';
import { ChatMessage, Todo } from '@zdan-code/types';
import { getConfig } from './core/config';
import { streamComplete } from './core/llm/stream';

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
		debugger;
		if (assistantMessage.content.includes('TodoWrite')) {
			todos = [
				{ id: '1', content: 'First task from AI', status: 'pending' },
				{ id: '2', content: 'Second task, in progress', status: 'in_progress' },
				{ id: '3', content: 'A completed task', status: 'completed' }
			];
			provider.updateTodos(todos);
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
