import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

/**
 * TN2: transport is decided by NOTIFICATION_TRANSPORT on the backend
 * (task tracker #9). This component polls; if the team switches to
 * websockets, replace the interval below with a socket.io listener —
 * the rest of the component (state, render) doesn't need to change.
 */
export function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const poll = () =>
      apiFetch("/notifications").then((ns) => setCount(ns.filter((n) => !n.read).length));
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, []);

  return <span title="Notifications">🔔 {count > 0 ? count : ""}</span>;
}
