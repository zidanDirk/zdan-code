import { useEffect, useRef, useState } from "react";
import type { ChatMessage as ChatMessageType } from "@zdan-code/types";
import vscode from "./utils/vscode";
import { ChatInput } from "./components/ChatInput";
import { ChatHistory } from "./components/ChatHistory";
import "./App.css";

function App() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    vscode.postMessage({ type: "webviewDidLaunch" });

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === "updateChat") {
        setMessages(message.payload);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);
  useEffect(() => {
    console.log(
      `messages log`,
      messages,
      chatContainerRef.current,
      chatContainerRef?.current?.scrollHeight,
    );
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (text: string) => {
    vscode.postMessage({ type: "userMessage", payload: text });
  };

  return (
    <main className="main-window" ref={chatContainerRef}>
      <h1>Hello Zdan Code</h1>
      <ChatHistory messages={messages} />
      <ChatInput onSendMessage={handleSendMessage}></ChatInput>
    </main>
  );
}

export default App;
