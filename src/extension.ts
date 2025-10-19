import * as vscode from "vscode";
import { Provider } from "./core/webview/Provider";
import { ChatMessage } from "@zdan-code/types";

let chatHistory: ChatMessage[] = [];

async function handleUserMessage(provider: Provider, userMessage: string) {
  chatHistory.push({
    id: Date.now().toString(),
    role: "user",
    content: userMessage,
  });
  provider.sendMessage({ type: "updateChat", payload: chatHistory });

  const thinkingMessage: ChatMessage = {
    id: Date.now().toString(),
    role: "assistant",
    content: "Thinking...",
  };
  chatHistory.push(thinkingMessage);
  provider.sendMessage({ type: "updateChat", payload: chatHistory });

  await new Promise((resolve) => setTimeout(resolve, 1000));

  chatHistory = chatHistory.filter(
    (message) => message.id !== thinkingMessage.id,
  );
  chatHistory.push({
    id: Date.now().toString(),
    role: "assistant",
    content: `You said: ${userMessage}`,
  });
  provider.sendMessage({ type: "updateChat", payload: chatHistory });
}

export function activate(context: vscode.ExtensionContext) {
  const provider = new Provider(context.extensionUri, (message) => {
    if (message.type === "userMessage") {
      handleUserMessage(provider, message.payload);
    }
  });

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(Provider.viewType, provider),
  );
}
