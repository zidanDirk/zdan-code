import { useEffect, useRef, useState } from 'react';
import type { ChatMessage as ChatMessageType, Todo } from '@zdan-code/types';
import vscode from './utils/vscode';
import { ChatInput } from './components/ChatInput';
import { ChatHistory } from './components/ChatHistory';
import { TodoList } from './components/TodoList';
import './App.css';

function App() {
	const [messages, setMessages] = useState<ChatMessageType[]>([]);
	const [inputValue, setInputValue] = useState('');
	const [todos, setTodos] = useState<Todo[]>([]);
	const chatContainerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		vscode.postMessage({ type: 'webviewDidLaunch' });

		const handleMessage = (event: MessageEvent) => {
			const message = event.data;
			switch (message.type) {
				case 'updateChat':
					setMessages(message.payload);
					break;
				case 'addContext':
					const { language, content } = message.payload;
					const formattedContext = `\`\`\`${language}\n${content}\n\`\`\`\n`;
					setInputValue((prev) => `${prev}${prev ? '\n' : ''}${formattedContext}`);
					break;
				case 'updateTodos':
					setTodos(message.payload);
					break;
				default:
					break;
			}
		};

		window.addEventListener('message', handleMessage);

		return () => {
			window.removeEventListener('message', handleMessage);
		};
	}, []);
	useEffect(() => {
		console.log(`messages log`, messages, chatContainerRef.current, chatContainerRef?.current?.scrollHeight);
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
		}
	}, [messages]);

	const handleSendMessage = (text: string) => {
		vscode.postMessage({ type: 'userMessage', payload: text });
		setInputValue('');
	};

	return (
		<main className="main-window" ref={chatContainerRef}>
			<h1>Hello Zdan Code</h1>
			<TodoList todos={todos} />
			<ChatHistory messages={messages} />
			<ChatInput value={inputValue} onValueChange={setInputValue} onSendMessage={handleSendMessage}></ChatInput>
		</main>
	);
}

export default App;
