import OpenAI from 'openai';
import { ChatMessage } from '@zdan-code/types';
import { Config } from '../config';

// 新增系统提示词
const SYSTEM_PROMPT = `You are zdan-code, an AI assistant. You can use tools by responding with a <tool_code> XML tag.

For example, to create a todo list, you can use the TodoWrite tool like this:
<tool_code>
{
  "tool_name": "TodoWrite",
  "todos": [
    { "content": "First item", "status": "pending" },
    { "content": "Second item", "status": "in_progress" }
  ]
}
</tool_code>
`;

export async function* streamComplete(chatHistory: ChatMessage[], config: Config): AsyncGenerator<string> {
	const openai = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseUrl });

	// 修改 messages 消息类型
	const messages: { role: 'user' | 'assistant' | 'system'; content: string }[] = chatHistory.map(({ role, content }) => ({ role, content }));

	// 在消息列表开头注入系统提示
	messages.unshift({ role: 'system', content: SYSTEM_PROMPT });

	const stream = await openai.chat.completions.create({
		model: config.model,
		messages,
		stream: true
	});

	for await (const chunk of stream) {
		yield chunk.choices[0]?.delta?.content || '';
	}
}
