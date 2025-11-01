import { useEffect, useRef } from 'react';

interface ChatInputProps {
  value: string;
  onValueChange: (value: string) => void;
  onSendMessage: (text: string) => void;
}

export function ChatInput({
  value,
  onValueChange,
  onSendMessage,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整 textarea 高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSendMessage(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSendMessage(value);
      }
    }
  };

  return (
    <div className="chat-input-container">
      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="textarea-container">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
            className="chat-textarea"
            rows={1}
          />
          <button type="submit" className="send-button" disabled={!value.trim()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22,2 15,22 11,13 2,9"></polygon>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
