export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}
export type WebviewMessage =
  | { type: "webviewDidLaunch" }
  | { type: "userMessage"; payload: string };

export type ExtensionMessage = { type: "updateChat"; payload: ChatMessage[] };
