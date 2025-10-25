import * as vscode from "vscode";

export interface Config {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export function getConfig(): Config {
  const config = vscode.workspace.getConfiguration("zdan-code");
  return {
    apiKey: config.get<string>("apiKey") || "",
    baseUrl: config.get<string>("baseUrl") || "",
    model: config.get<string>("model") || "qwen3-coder-plus",
  };
}
