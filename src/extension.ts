import * as vscode from 'vscode';
import { Provider } from './core/webview/Provider';
import { ChatMessage, Todo, TodoWriteParameters, ToolParameters } from '@zdan-code/types';
import { getConfig } from './core/config';
import { streamComplete } from './core/llm/stream';
import { randomUUID } from 'crypto';

let chatHistory: ChatMessage[] = [];
let todos: Todo[] = [];

// 新函数：处理整个 LLM 交互循环
async function runLLMLoop(provider: Provider, initialChatHistory: ChatMessage[]) {
	let currentChatHistory = [...initialChatHistory];
	const config = getConfig();

	while (true) {
		debugger;
		let assistantResponse = '';
		// 1. 调用 LLM
		const stream = streamComplete(currentChatHistory, config);
		for await (const token of stream) {
			assistantResponse += token;
		}

		debugger;
		// 2. 将 AI 的原始回复（可能包含工具调用）添加到历史记录
		currentChatHistory.push({ role: 'assistant', content: assistantResponse, id: randomUUID() });

		// 3. 解析工具调用
		const toolCodeMatch = assistantResponse.match(/<tool_code>([\s\S]*?)<\/tool_code>/);

		if (!toolCodeMatch) {
			// 没有工具调用，这是最终答案，流式传输给用户
			// (Simplified: send the whole message at once for now)
			provider.sendMessage({ type: 'updateChat', payload: currentChatHistory });
			chatHistory = currentChatHistory; // 更新全局历史记录
			return; // 结束循环
		}

		// 4. 执行工具
		const toolParameters: ToolParameters = JSON.parse(toolCodeMatch[1]);
		let toolResult = '';

		try {
			switch (toolParameters.tool_name) {
				case 'Read':
					const fileUri = vscode.Uri.file(toolParameters.file_path);
					const content = await vscode.workspace.fs.readFile(fileUri);
					toolResult = `File content:\n${Buffer.from(content).toString('utf-8')}`;
					break;
				case 'Edit':
					// (为简化，此处省略 Edit 的实现，我们将在下一步完成)
					toolResult = 'Edit tool is not yet implemented.';
					break;
				case 'TodoWrite':
					todos = toolParameters.todos.map((t: Omit<Todo, 'id'>) => ({ ...t, id: randomUUID() }));
					provider.updateTodos(todos);
					toolResult = 'Todo list updated successfully.';
					break;
			}
		} catch (e) {
			if (e instanceof Error) {
				toolResult = `Error executing tool: ${e.message}`;
			} else {
				toolResult = `Error executing tool`;
			}
		}
		// 5. 将工具结果添加到历史记录，并准备下一次循环
		const toolResultMessage = `<tool_result tool_name='${toolParameters.tool_name}'>${toolResult}</tool_result>`;
		currentChatHistory.push({ role: 'user' as const, content: toolResultMessage, id: randomUUID() });
		// 循环将继续，带着工具结果再次调用 LLM
	}
}

async function handleUserMessage(provider: Provider, userMessage: string) {
	const userMessageEntry = { role: 'user' as const, content: userMessage, id: randomUUID() };
	chatHistory.push(userMessageEntry);
	provider.sendMessage({ type: 'updateChat', payload: chatHistory });
	await runLLMLoop(provider, chatHistory);
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
