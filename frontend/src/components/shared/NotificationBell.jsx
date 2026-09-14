import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { notificationsApi } from "@/lib/api";

export function NotificationBell() {
  const [count, setCount] = useState(0);
  const { on, off, isConnected } = useSocket();

  useEffect(() => {
    notificationsApi.list().then((ns) => setCount(ns.filter((n) => !n.read).length));
  }, []);

  useEffect(() => {
    const handleNotification = () => {
      setCount((prev) => prev + 1);
    };

    on("notification", handleNotification);
    return () => off("notification", handleNotification);
  }, [on, off]);

  return <span title="Notifications">🔔 {count > 0 ? count : ""}</span>;
}
