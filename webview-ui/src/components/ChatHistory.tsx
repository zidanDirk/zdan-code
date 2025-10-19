import type { ChatMessage as ChatMessageType } from "@zdan-code/types";
import { ChatMessage } from "./ChatMessage";

interface ChatHistoryProps {
  messages: ChatMessageType[];
}

export function ChatHistory({ messages }: ChatHistoryProps) {
  return (
    <div className="chat-history">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
    </div>
  );
}
