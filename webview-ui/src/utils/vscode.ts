// @ts-ignore
const vscode = acquireVsCodeApi();

export default {
  postMessage: (message: any) => {
    vscode.postMessage(message);
  },
};
