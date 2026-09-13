import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { ThreeColumnLayout } from "@/components/layout/ThreeColumnLayout";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/notifications")
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to load notifications:", err))
      .finally(() => setLoading(false));
  }, []);

  const markAsRead = async (id) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ThreeColumnLayout>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
            <p className="text-xs text-gray-500 mt-0.5">Stay updated on your coursework, replies, and sessions.</p>
          </div>
          <span className="text-xs font-bold text-[#FF4F00] bg-orange-50 px-2.5 py-1 rounded-lg">
            {notifications.filter((n) => !n.read).length} Unread
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">No notifications found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`py-4 flex items-start gap-4 transition-colors cursor-pointer ${
                  !n.read ? "bg-orange-50/20 -mx-4 px-4 rounded-xl" : ""
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#111827] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {n.actorInitials || "CADT"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-900">{n.title || n.type}</h3>
                    <span className="text-[10px] text-gray-400">{n.timestamp || "Recently"}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.message || n.body || n.content}</p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-[#FF4F00] mt-1.5 flex-shrink-0" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </ThreeColumnLayout>
  );
}