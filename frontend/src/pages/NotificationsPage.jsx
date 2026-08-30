import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

// Route: "/notifications". Owner: CS2
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    apiFetch("/notifications").then(setNotifications);
  }, []);

  return (
    <main>
      <h1>Notifications</h1>
      <ul>
        {notifications.map((n) => (
          <li key={n.id}>{n.type}</li>
        ))}
      </ul>
    </main>
  );
}
