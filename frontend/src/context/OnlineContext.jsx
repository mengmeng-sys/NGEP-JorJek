import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSocket } from "./SocketContext";

const OnlineContext = createContext(null);

export function OnlineProvider({ children }) {
  const [onlineUsers, setOnlineUsers] = useState(() => new Set());
  const { on, off } = useSocket();

  useEffect(() => {
    const handleOnline = (data) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.add(data.userId);
        return next;
      });
    };
    const handleOffline = (data) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
    };
    on("user_online", handleOnline);
    on("user_offline", handleOffline);
    return () => {
      off("user_online", handleOnline);
      off("user_offline", handleOffline);
    };
  }, [on, off]);

  const isOnline = useCallback((userId) => onlineUsers.has(userId), [onlineUsers]);

  return (
    <OnlineContext.Provider value={{ onlineUsers, isOnline }}>
      {children}
    </OnlineContext.Provider>
  );
}

export const useOnline = () => {
  const context = useContext(OnlineContext);
  if (!context) {
    throw new Error("useOnline must be used within an OnlineProvider");
  }
  return context;
};
