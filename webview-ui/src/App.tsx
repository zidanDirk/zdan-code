import { useEffect, useState } from "react";
import type { ChatMessage as ChatMessageType } from "@zdan-code/types";
import vscode from "./utils/vscode";
import { ChatInput } from "./components/ChatInput";
import { ChatHistory } from "./components/ChatHistory";
import "./App.css";

function App() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
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

  const handleSendMessage = (text: string) => {
    vscode.postMessage({ type: "userMessage", payload: text });
  };

  return (
    <>
      <h1>Hello Zdan Code</h1>
      <ChatHistory messages={messages} />
      <ChatInput onSendMessage={handleSendMessage}></ChatInput>
    </>
  );
}

export default App;
