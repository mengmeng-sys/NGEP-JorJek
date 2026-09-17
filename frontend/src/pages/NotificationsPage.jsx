import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notificationsApi } from "@/lib/api";
import { normalizeNotification } from "@/lib/adapters";
import { useSocket } from "@/context/SocketContext";
import { ThreeColumnLayout } from "@/components/layout/ThreeColumnLayout";
import { getApiErrorMessage } from "@/lib/apiClient";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { on, off } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const handleNotification = (raw) => {
      const notification = normalizeNotification(raw);
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
    };

    on("notification", handleNotification);
    return () => off("notification", handleNotification);
  }, [on, off]);

  async function load() {
    setLoading(true);
    try {
      const data = await notificationsApi.list();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  const markAsRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      alert(getApiErrorMessage(err));
    }
  };

  const removeNotification = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await notificationsApi.remove(id);
    } catch (err) {
      console.error(err);
    }
  };

  const clearRead = async () => {
    setNotifications((prev) => prev.filter((n) => !n.read));
    try {
      await notificationsApi.clearRead();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <ThreeColumnLayout>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 sm:px-8 py-5 border-b border-gray-100 bg-gray-50/30">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'All caught up!'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {notifications.some((n) => n.read) && (
              <button
                type="button"
                onClick={clearRead}
                className="px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-lg transition-colors cursor-pointer"
              >
                Clear read
              </button>
            )}
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#FF4F00] hover:bg-orange-600 rounded-lg transition-colors cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-gray-200 border-t-[#FF4F00] rounded-full animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Loading notifications…</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 px-4">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">No notifications yet</p>
              <p className="text-xs text-gray-400 mt-1">When someone comments on your post or replies to you, it'll appear here.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.read) markAsRead(n.id);
                  if (n.link) navigate(n.link);
                }}
                className={`group flex items-start gap-4 px-6 sm:px-8 py-4 transition-colors ${
                  !n.read ? 'bg-orange-50/30 hover:bg-orange-50/50 cursor-pointer' : 'hover:bg-gray-50/50 cursor-pointer'
                }`}
              >
                {/* Avatar with type badge */}
                <div className="relative shrink-0">
                  <div className={`h-11 w-11 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    n.type === 'vote'
                      ? 'bg-linear-to-br from-green-400 to-emerald-500'
                      : n.isReply
                        ? 'bg-linear-to-br from-violet-500 to-purple-600'
                        : 'bg-linear-to-br from-orange-400 to-[#FF4F00]'
                  }`}>
                    {n.actorInitials || 'U'}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                    n.type === 'vote' ? 'bg-green-100' : n.isReply ? 'bg-violet-100' : 'bg-orange-100'
                  }`}>
                    {n.type === 'vote' ? (
                      <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                    ) : n.isReply ? (
                      <svg className="w-3 h-3 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 leading-relaxed">
                    <span className="font-semibold">{n.actorName || 'Someone'}</span>
                    {' '}
                    <span className="text-gray-600">
                      {n.type === 'vote' ? 'upvoted your post' : n.isReply ? 'replied to your comment' : 'commented on your post'}
                    </span>
                  </p>
                  {n.message && (
                    <div className="mt-2 px-3 py-2 bg-gray-50 border-l-3 border-gray-200 rounded-r-lg">
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed italic">
                        "{n.message}"
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {n.type === 'vote' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Upvote
                      </span>
                    ) : n.isReply ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Reply
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Comment
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {n.timestamp || 'Recently'}
                    </span>
                  </div>
                </div>

                {/* Right side actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(n.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 p-1.5 -m-1.5 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                    title="Remove notification"
                    aria-label="Remove notification"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  {!n.read && (
                    <span className="w-3 h-3 rounded-full bg-[#FF4F00] ring-4 ring-orange-100" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ThreeColumnLayout>
  );
}
