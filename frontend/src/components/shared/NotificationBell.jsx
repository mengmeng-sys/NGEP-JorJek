import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

  return (
    <Link to="/notifications" title="Notifications" className="relative flex items-center justify-center h-10 w-10 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-[#FF4F00] rounded-full">
          {count}
        </span>
      )}
    </Link>
  );
}