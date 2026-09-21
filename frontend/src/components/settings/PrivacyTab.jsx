import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export function PrivacyTab() {
  const { user, updateUserProfile } = useAuth();

  const [privacySettings, setPrivacySettings] = useState({
    showProfileToGuests: true,
    allowDirectRequests: true,
    showOnlineStatus: false,
    receiveEmailNotifications: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load the user's saved settings whenever the auth user is available.
  useEffect(() => {
    if (!user?.id) return;
    setPrivacySettings({
      showProfileToGuests: user.showProfileToGuests ?? true,
      allowDirectRequests: user.allowDirectRequests ?? true,
      showOnlineStatus: user.showOnlineStatus ?? false,
      receiveEmailNotifications: user.receiveEmailNotifications ?? true,
    });
  }, [user?.id, user?.showProfileToGuests, user?.allowDirectRequests, user?.showOnlineStatus, user?.receiveEmailNotifications]);

  const togglePrivacy = (key) => {
    setSaved(false);
    setPrivacySettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateUserProfile(privacySettings);
      setSaved(true);
    } catch (err) {
      alert(err?.message || 'Could not save your privacy settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggles = [
    {
      key: 'showProfileToGuests',
      title: 'Show my profile to guests',
      desc: 'Non-registered users can view your posts and profile page.',
    },
    {
      key: 'allowDirectRequests',
      title: 'Allow direct session requests',
      desc: 'Users can request a private mentoring session from your profile.',
    },
    {
      key: 'showOnlineStatus',
      title: 'Show online status',
      desc: 'Display an active indicator when you are online.',
    },
    {
      key: 'receiveEmailNotifications',
      title: 'Receive email notifications',
      desc: 'Get notified by email when someone replies to your post.',
    },
  ];

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="border-b border-gray-100 dark:border-gray-800 pb-4 sm:pb-5 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
          Privacy
        </h2>
        <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
          Control who can see your activity and contact you.
        </p>
      </div>

      {/* Toggles Container */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {toggles.map((item) => {
          const isChecked = privacySettings[item.key];

          return (
            <label
              key={item.key}
              htmlFor={`toggle-${item.key}`}
              className="flex items-center justify-between gap-3 sm:gap-4 py-3.5 sm:py-4 cursor-pointer select-none group"
            >
              {/* Setting Description */}
              <div className="min-w-0 pr-1 sm:pr-2">
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:hover:text-gray-300 transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 mt-0.5 sm:mt-1 leading-relaxed break-words">
                  {item.desc}
                </p>
              </div>

              {/* Accessible Touch Switch */}
              <div className="flex-shrink-0 flex items-center p-1">
                <button
                  id={`toggle-${item.key}`}
                  type="button"
                  role="switch"
                  aria-checked={isChecked}
                  onClick={() => togglePrivacy(item.key)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:ring-offset-2 ${
                    isChecked ? 'bg-[#FF4F00]' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-900 shadow-xs ring-0 transition duration-200 ease-in-out ${
                      isChecked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </label>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="pt-5 sm:pt-6 mt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
        {saved && (
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Saved
          </span>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={`w-full sm:w-auto bg-[#FF4F00] hover:bg-[#E64700] text-white font-bold text-xs px-6 py-3 sm:py-2.5 rounded-xl transition-all shadow-xs text-center active:scale-98 ${
            saving ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}