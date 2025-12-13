import { Todo } from './tools';

export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
}
export type WebviewMessage = { type: 'webviewDidLaunch' } | { type: 'userMessage'; payload: string };

export interface CodeContextPayload {
	language: string;
	content: string;
	path: string;
}

export type ExtensionMessage = { type: 'updateChat'; payload: ChatMessage[] } | { type: 'addContext'; payload: CodeContextPayload } | { type: 'updateTodos'; payload: Todo[] };
