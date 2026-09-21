import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CreatePostModal } from '@/components/post/CreatePostModal';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useTheme } from '@/context/ThemeContext';
import { notificationsApi, postsApi, tagsApi } from "@/lib/api";
import { normalizeNotification } from "@/lib/adapters";
import { getApiErrorMessage } from "@/lib/apiClient";

export default function Navbar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTag = searchParams.get('tag');

  // Consume shared auth state and actions from AuthContext
   const { user, logout } = useAuth();
   const { on, off, isConnected } = useSocket();
   const { theme, toggleTheme } = useTheme();

  // Modal & Panel visibility states
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Keep the navbar's search box in sync with ?q= on the search results page,
  // so it shows what you searched for instead of sitting empty next to the
  // results (previously the results page had its own second search box —
  // that's been removed in favor of this one being the single source of truth).
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  // Notifications Data
  const [notifications, setNotifications] = useState([]);

  const [skillTags, setSkillTags] = useState(['C++', 'SQL', 'Java', 'Machine Learning', 'Figma']);

  useEffect(() => {
    let cancelled = false;
    // Same "Featured" tags the desktop sidebar shows (LeftSidebar.jsx) — keep this
    // drawer's list in sync with the admin-curated set instead of a hardcoded fallback.
    tagsApi
      .list({ featured: true })
      .then((data) => {
        const backendTags = Array.isArray(data?.tags)
          ? data.tags.map((t) => String(t.name || t.slug || '').replace(/^#/, '')).filter(Boolean)
          : [];
        if (!cancelled && backendTags.length > 0) setSkillTags(backendTags);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    notificationsApi.list()
      .then((data) => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch((err) => console.error("Failed to load notifications:", err));
  }, [user]);

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

  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const sidebarDrawerRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await notificationsApi.markAllRead();
    } catch {
      /* silent */
    }
  };

  const handleNotificationClick = async (notif) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    if (!notif.read) {
      notificationsApi.markRead(notif.id).catch(() => {});
    }
    setIsNotificationsOpen(false);
    if (notif.link) navigate(notif.link);
  };

  const handleDeleteNotification = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    notificationsApi.remove(id).catch(() => {});
  };

  const handleClearRead = async () => {
    setNotifications((prev) => prev.filter((n) => !n.read));
    notificationsApi.clearRead().catch(() => {});
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsMobileSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleTagClick = (tag) => {
    setIsSidebarDrawerOpen(false);
    if (activeTag === tag) {
      navigate('/');
    } else {
      navigate(`/?tag=${encodeURIComponent(tag)}`);
    }
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    setIsMenuOpen(false);
    setIsNotificationsOpen(false);
    setIsSidebarDrawerOpen(false);
    navigate('/auth/login');
  };

  const getNavLinkClass = ({ isActive }) =>
    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
      isActive && !activeTag
        ? 'bg-[#FFF4F0] dark:bg-orange-900/20 text-[#FF4F00]'
        : 'text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-100 font-medium'
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* 1. Left: Sidebar Toggle Icon + Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsSidebarDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:border-gray-800 cursor-pointer"
              title="Open Navigation Menu"
              aria-label="Open sidebar navigation"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h16" />
              </svg>
            </button>

            <Link to="/" className="flex items-center group">
              <img 
                src="/jorjek_logo.jpg" 
                alt="JorJek" 
                className="h-9 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105" 
              />
            </Link>
          </div>

          {/* 2. Center: Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-2">
             <div className="relative flex items-center w-full h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#FAFAFA] dark:bg-gray-800 focus-within:bg-white dark:focus-within:bg-gray-700 focus-within:border-[#FF4F00] focus-within:ring-1 focus-within:ring-[#FF4F00] transition-all">
               <div className="grid place-items-center h-full w-10 text-gray-400 dark:text-gray-500">
                 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
               </div>
               <input
                 type="text"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onKeyDown={handleSearchSubmit}
                 placeholder="Search topics, skills ...."
                 className="w-full h-full outline-none text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent pr-4 font-medium"
               />
             </div>
          </div>

          {/* 3. Right: Action CTAs */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* Mobile Search Expand Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 transition-colors cursor-pointer"
              aria-label="Open search input"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

              {/* Theme Toggle — hidden on very small screens, shown in sidebar drawer */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`hidden sm:flex p-2 rounded-xl border transition-all cursor-pointer shrink-0 items-center justify-center ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-amber-400'
                    : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
                }`}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Create Post Button */}
             <button
               type="button"
               onClick={() => {
                 if (!user) {
                   navigate('/auth/login');
                 } else {
                   setIsPostModalOpen(true);
                 }
               }}
               className="flex items-center gap-1 px-2.5 sm:px-4 py-2 bg-[#FF4F00] text-white text-xs font-bold rounded-xl hover:bg-[#E64700] transition-colors shadow-xs cursor-pointer active:scale-95"
             >
               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
               </svg>
               <span className="hidden xs:inline">Post</span>
             </button>

             {!user ? (
               <div className="flex items-center gap-1 shrink-0">
                 <Link
                   to="/auth/login"
                   className="px-2 sm:px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                 >
                   Log in
                 </Link>
                 <Link
                   to="/auth/signup"
                   className="px-2.5 sm:px-4 py-2 bg-white dark:bg-gray-900 text-[#FF4F00] border border-[#FF4F00] text-xs font-bold rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                 >
                   Sign up
                 </Link>
               </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                
                {/* Notifications Anchor */}
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotificationsOpen(!isNotificationsOpen);
                      setIsMenuOpen(false);
                    }}
                    className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
                      isNotificationsOpen
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900/30 text-[#FF4F00]'
                        : 'bg-[#FAFAFA] dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 dark:text-gray-500'
                    }`}
                    aria-label="Notifications"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>

                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF4F00] px-1 text-[9px] font-black text-white shadow-xs">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Flyout */}
                  {isNotificationsOpen && (
                    <div className="fixed sm:absolute top-16 sm:top-auto sm:right-0 inset-x-4 sm:inset-x-auto sm:w-105 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50/50 dark:bg-gray-800/50">
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="bg-[#FF4F00] text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-none">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {notifications.some((n) => n.read) && (
                            <button
                              type="button"
                              onClick={handleClearRead}
                              className="text-[11px] font-medium text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 dark:text-red-400 transition-colors cursor-pointer"
                            >
                              Clear read
                            </button>
                          )}
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={handleMarkAllRead}
                              className="text-[11px] font-semibold text-[#FF4F00] hover:text-orange-700 dark:hover:text-orange-300 transition-colors cursor-pointer"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Notification List */}
                      <div className="max-h-95 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-12 flex flex-col items-center gap-2">
                            <svg className="w-10 h-10 text-gray-200 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">No notifications yet</p>
                            <p className="text-[11px] text-gray-300 dark:text-gray-600">When someone comments or replies, you'll see it here.</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`group flex items-start gap-3.5 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800/50 transition-colors cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-b-0 ${
                                !notif.read ? 'bg-orange-50 dark:bg-orange-900/20/40 dark:bg-orange-900/20' : ''
                              }`}
                            >
                              {/* Avatar with type icon */}
                              <div className="relative shrink-0">
                                <UserAvatar
                                  initials={notif.actorInitials}
                                  userId={notif.payload?.actorId}
                                  avatarUrl={notif.actorAvatar}
                                  size="md"
                                  className="ring-2 ring-white dark:ring-gray-900"
                                />
                                <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center ${
                                  notif.type === 'vote' ? 'bg-green-100 dark:bg-green-900/30' : notif.isReply ? 'bg-violet-100 dark:bg-violet-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
                                }`}>
                                  {notif.type === 'vote' ? (
                                    <svg className="w-2.5 h-2.5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                                    </svg>
                                  ) : notif.isReply ? (
                                    <svg className="w-2.5 h-2.5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                  ) : (
                                    <svg className="w-2.5 h-2.5 text-orange-500 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                  )}
                                </div>
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] text-gray-900 dark:text-gray-100 leading-snug">
                                  <span className="font-semibold">{notif.actorName}</span>
                                  {' '}
                                  <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                                    {notif.type === 'vote' ? 'upvoted your post' : notif.type === 'reply' && notif.isReply ? 'replied to your comment' : notif.type === 'reply' ? 'commented on your post' : notif.title}
                                  </span>
                                </p>
                                {notif.message && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                    "{notif.message}"
                                  </p>
                                )}
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  {notif.isReply && (
                                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 px-1.5 py-0.5 rounded">
                                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                      </svg>
                                      Reply
                                    </span>
                                  )}
                                  <span className="text-[11px] text-gray-400 dark:text-gray-500">
                                    {notif.timestamp || 'Recently'}
                                  </span>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-col items-center gap-1 shrink-0">
                                {!notif.read && (
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF4F00] ring-4 ring-orange-100 dark:ring-orange-900/30" />
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteNotification(notif.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 dark:text-red-400 p-1 -m-1 transition-all cursor-pointer"
                                  title="Remove notification"
                                  aria-label="Remove notification"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-2.5 bg-gray-50 dark:bg-gray-800/50/50 dark:bg-gray-800/50 text-center">
                          <Link
                            to="/notifications"
                            onClick={() => setIsNotificationsOpen(false)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF4F00] hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                          >
                            View all notifications
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Profile Menu Anchor */}
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(!isMenuOpen);
                      setIsNotificationsOpen(false);
                    }}
                    className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 bg-[#111827] text-white text-xs font-bold rounded-full hover:ring-2 hover:ring-offset-2 hover:ring-gray-800 transition-all cursor-pointer shadow-xs overflow-hidden"
                    aria-label="Open profile settings menu"
                  >
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.displayName || 'Profile'} className="h-full w-full object-cover" />
                    ) : (
                      user.initials || (user.displayName ? user.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'ME')
                    )}
                  </button>

                  {isMenuOpen && (
                    <div className="fixed sm:absolute top-16 sm:top-auto sm:right-0 inset-x-4 sm:inset-x-auto sm:w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                          {user.displayName || user.name || 'Student'}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5 font-medium">
                          {user.email}
                        </p>
                      </div>

                      <Link
                        to={`/user/${user.handle || 'me'}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-100 transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>View Profile</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-100 transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Account Settings</span>
                      </Link>

                      {user?.role === "SUPER_ADMIN" || user?.role === "MODERATOR" ? (
                        <Link
                          to="/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 dark:bg-orange-900/20 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                          <span>Admin Dashboard</span>
                        </Link>
                      ) : null}

                      <div className="border-t border-gray-100 dark:border-gray-800 pt-1 mt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 text-left px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 dark:bg-red-900/20 transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Log out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Mobile Full-Width Search Input Row */}
        {isMobileSearchOpen && (
          <div className="md:hidden px-4 pb-3 pt-1 border-t border-gray-100 dark:border-gray-800 animate-in fade-in duration-150">
            <div className="relative flex items-center w-full h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-[#FAFAFA] dark:bg-gray-800 focus-within:bg-white dark:focus-within:bg-gray-800 dark:bg-gray-900 focus-within:border-[#FF4F00] transition-all">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
                placeholder="Search topics, skills, or mentors..."
                className="w-full h-full pl-3 pr-8 outline-none text-xs text-gray-800 dark:text-gray-200 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent font-medium"
              />
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(false)}
                className="absolute right-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 dark:text-gray-400 dark:text-gray-500 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Slide-over Left Navigation Drawer */}
      {isSidebarDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsSidebarDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 max-w-full flex">
            <div
              ref={sidebarDrawerRef}
              className="w-72 sm:w-80 bg-white dark:bg-gray-900 shadow-2xl border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between p-5 animate-in slide-in-from-left duration-200 overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                  <Link
                    to="/"
                    onClick={() => setIsSidebarDrawerOpen(false)}
                    className="flex items-center"
                  >
                    <img 
                      src="/jorjek_logo.jpg" 
                      alt="JorJek" 
                      className="h-8 w-auto object-contain" 
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsSidebarDrawerOpen(false)}
                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 dark:text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-3">
                    Navigation
                  </p>
                  <nav className="space-y-1">
                    <NavLink
                      to="/"
                      end
                      onClick={() => setIsSidebarDrawerOpen(false)}
                      className={getNavLinkClass}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span>Home</span>
                      </div>
                    </NavLink>

                    <NavLink
                      to="/popular"
                      onClick={() => setIsSidebarDrawerOpen(false)}
                      className={getNavLinkClass}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <span>Popular</span>
                      </div>
                    </NavLink>

                    <NavLink
                      to="/explore"
                      onClick={() => setIsSidebarDrawerOpen(false)}
                      className={getNavLinkClass}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
                        </svg>
                        <span>Explore</span>
                      </div>
                    </NavLink>

                    <NavLink
                      to="/saved"
                      onClick={() => setIsSidebarDrawerOpen(false)}
                      className={getNavLinkClass}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        <span>Saved</span>
                      </div>
                    </NavLink>
                  </nav>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-3">
                    Skill Tags
                  </p>
                  <div className="flex flex-col space-y-1">
                    {skillTags.map((tag) => {
                      const isSelected = activeTag != null && activeTag.toLowerCase() === tag.toLowerCase();
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagClick(tag)}
                          className={`text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#FFF4F0] dark:bg-orange-900/20 text-[#FF4F00] font-bold'
                              : 'text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800/50'
                          }`}
                        >
                          #{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Mobile-only theme toggle in drawer */}
               <div className="sm:hidden pt-4 border-t border-gray-100 dark:border-gray-800">
                 <button
                   type="button"
                   onClick={toggleTheme}
                   className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                     theme === 'dark'
                       ? 'bg-gray-800 text-amber-400'
                       : 'bg-gray-50 text-gray-700'
                   }`}
                 >
                   {theme === 'dark' ? (
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                     </svg>
                   ) : (
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                     </svg>
                   )}
                   {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                 </button>
               </div>

               <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 dark:text-gray-500 space-y-2">
                 <div className="flex flex-wrap gap-x-3 gap-y-1 font-medium">
                   <Link to="/about" onClick={() => setIsSidebarDrawerOpen(false)} className="hover:text-gray-700 dark:hover:text-gray-300">About Us</Link>
                   <Link to="/contact" onClick={() => setIsSidebarDrawerOpen(false)} className="hover:text-gray-700 dark:hover:text-gray-300">Contact</Link>
                   <Link to="/privacy" onClick={() => setIsSidebarDrawerOpen(false)} className="hover:text-gray-700 dark:hover:text-gray-300">Privacy</Link>
                   <Link to="/terms" onClick={() => setIsSidebarDrawerOpen(false)} className="hover:text-gray-700 dark:hover:text-gray-300">Terms</Link>
                 </div>
                 <p className="text-[10px] text-gray-400 dark:text-gray-500">© 2026 JorJek Campus. All rights reserved.</p>
               </div>

            </div>
          </div>
        </div>
      )}

      {/* Post Modal */}
      <CreatePostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        isUploading={isUploading}
        onPublish={async (postPayload) => {
          setIsUploading(true);
          try {
            await postsApi.create({
              type: postPayload.type || 'question',
              title: postPayload.title,
              content: postPayload.details ?? postPayload.content,
              tags: postPayload.tags || [],
              allowMentoring: postPayload.allowMentoring,
              imageFile: postPayload.imageFile,
              image_url: postPayload.image_url,
            });
            setIsPostModalOpen(false);
            navigate('/');
          } catch (err) {
            alert(getApiErrorMessage(err));
          } finally {
            setIsUploading(false);
          }
        }}
      />
    </>
  );
}