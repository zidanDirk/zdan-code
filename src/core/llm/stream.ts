import OpenAI from "openai";
import { ChatMessage } from "@zdan-code/types";
import { Config } from "../config";

export async function* streamComplete(
  chatHistory: ChatMessage[],
  config: Config,
): AsyncGenerator<string> {
  const openai = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseUrl });

  const messages = chatHistory.map(({ role, content }) => ({ role, content }));

  const stream = await openai.chat.completions.create({
    model: config.model,
    messages,
    stream: true,
  });

  for await (const chunk of stream) {
    yield chunk.choices[0]?.delta?.content || "";
  }
}
