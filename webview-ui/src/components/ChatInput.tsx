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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSendMessage(value);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder="Type a message..."
      />
      <button type="submit">Send</button>
    </form>
  );
}
