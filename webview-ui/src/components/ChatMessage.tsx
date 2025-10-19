import type { ChatMessage as ChatMessageType } from "@zdan-code/types";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const messageClass =
    message.role === "user" ? "user-message" : "assistant-message";

  return (
    <div className={`message ${messageClass}`}>
      <p>{message.content}</p>
    </div>
  );
}
