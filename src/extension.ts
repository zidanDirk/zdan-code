import * as vscode from "vscode";
import { Provider } from "./core/webview/Provider";
export function activate(context: vscode.ExtensionContext) {
  const provider = new Provider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(Provider.viewType, provider),
  );
}
