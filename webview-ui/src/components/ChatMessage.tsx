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
	const cleanContent = message.content.replace(/<tool_code>[\s\S]*?<\/tool_code>/, '').trim();

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
