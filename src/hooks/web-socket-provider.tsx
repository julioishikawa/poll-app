import { createContext, useContext } from "react";

interface WebSocketContextType {
  getWebSocketURL: (pollId: string) => string;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const getWebSocketURL = (pollId: string) => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = "localhost:3333";
    console.log(
      "WebSocket URL:",
      `${protocol}//${host}/polls/${pollId}/results`
    );
    return `${protocol}//${host}/polls/${pollId}/results`;
  };

  const value = { getWebSocketURL };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (pollId: string): string => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context.getWebSocketURL(pollId);
};
