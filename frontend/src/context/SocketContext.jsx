import { createContext, useContext, useEffect, useRef, useCallback, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export function SocketProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const pendingSubs = useRef([]);
  const [isConnected, setIsConnected] = useState(false);

  if (isAuthenticated && user?.id && !socketRef.current) {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join", user.id);
      for (const sub of pendingSubs.current) sub();
      pendingSubs.current = [];
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socketRef.current = socket;
  }

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    if (!socketRef.current) return;

    const socket = socketRef.current;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      pendingSubs.current = [];
      setIsConnected(false);
    };
  }, [isAuthenticated, user?.id]);

  const joinPost = useCallback((postId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("join_post", postId);
    }
  }, []);

  const leavePost = useCallback((postId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("leave_post", postId);
    }
  }, []);

  const on = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    } else {
      pendingSubs.current.push(() => socketRef.current && socketRef.current.on(event, handler));
    }
  }, []);

  const off = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler);
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, joinPost, leavePost, on, off }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
