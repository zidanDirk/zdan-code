import * as vscode from "vscode";
import { Provider } from "./core/webview/Provider";
import { ChatMessage } from "@zdan-code/types";
import { getConfig } from "./core/config";
import { streamComplete } from "./core/llm/stream";

let chatHistory: ChatMessage[] = [];

async function handleUserMessage(provider: Provider, userMessage: string) {
  chatHistory.push({
    id: Date.now().toString(),
    role: "user",
    content: userMessage,
  });
  provider.sendMessage({ type: "updateChat", payload: chatHistory });
  const config = getConfig();
  if (!config.apiKey || !config.baseUrl) {
    chatHistory.push({
      id: Date.now().toString(),
      role: "assistant",
      content: "API key 或者 Base URL 没有配置. 请检查你的配置.",
    });
    provider.sendMessage({ type: "updateChat", payload: chatHistory });
    return;
  }
  const assistantMessage: ChatMessage = {
    id: Date.now().toString(),
    role: "assistant",
    content: "",
  };
  chatHistory.push(assistantMessage);
  try {
    const stream = streamComplete(chatHistory, config);
    for await (const token of stream) {
      assistantMessage.content += token;
      provider.sendMessage({ type: "updateChat", payload: chatHistory });
    }
  } catch (error: any) {
    assistantMessage.content = `Error: ${error.message}`;
    provider.sendMessage({ type: "updateChat", payload: chatHistory });
  }
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
