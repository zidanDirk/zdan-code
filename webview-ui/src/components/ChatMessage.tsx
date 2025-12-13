import type { ChatMessage as ChatMessageType } from '@zdan-code/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface ChatMessageProps {
	message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
	const messageClass = message.role === 'user' ? 'user-message' : 'assistant-message';

	// 在渲染前移除工具标签
	const cleanContent = message.content
		.replace(/<tool_code\b[^>]*>[\s\S]*?<\/tool_code>/g, '')
		.replace(/<tool_result\b[^>]*>[\s\S]*?<\/tool_result>/g, '') // <-- 新增此行
		.trim();

	console.log(`message.content`, message.content);
	console.log(`cleanContent`, cleanContent);

	if (!cleanContent) return null; // 如果消息只包含工具调用，则不渲染任何内容

	return (
		<div className={`message ${messageClass}`}>
			<div className="markdown-body">
				<ReactMarkdown
					remarkPlugins={[remarkGfm]}
					components={{
						code({ node, className, children, ...props }) {
							const { ref, ...rest } = props;
							const match = /language-(\w+)/.exec(className || '');
							return match ? (
								<SyntaxHighlighter style={vs as any} language={match[1]} PreTag="div" {...rest}>
									{String(children).replace(/\n$/, '')}
								</SyntaxHighlighter>
							) : (
								<code className={className} {...props}>
									{children}
								</code>
							);
						}
					}}
				>
					{cleanContent}
				</ReactMarkdown>
			</div>
		</div>
	);
}
