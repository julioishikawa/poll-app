import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { App } from "./app";
import { Toaster } from "sonner";
import { WebSocketProvider } from "./hooks/web-socket-provider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WebSocketProvider>
      <App />
      <Toaster richColors />
    </WebSocketProvider>
  </React.StrictMode>
);
