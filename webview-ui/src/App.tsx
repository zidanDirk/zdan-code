import { useEffect } from "react";
import vscode from "./utils/vscode";
import "./App.css";

function App() {
  useEffect(() => {
    vscode.postMessage({ type: "webviewDidLaunch" });
  }, []);

  return (
    <>
      <h1>Hello Zdan Code</h1>
    </>
  );
}

export default App;
