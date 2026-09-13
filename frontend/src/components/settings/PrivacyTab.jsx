import React, { useState } from 'react';

export function PrivacyTab() {
  const [privacySettings, setPrivacySettings] = useState({
    showProfileToGuests: true,
    allowDirectRequests: true,
    showOnlineStatus: false,
    receiveEmailNotifications: true,
  });

  const togglePrivacy = (key) => {
    setPrivacySettings((prev) => ({ ...prev, [key]: !prev[key] }));
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
      <div className="border-b border-gray-100 pb-4 sm:pb-5 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
          Privacy
        </h2>
        <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-snug">
          Control who can see your activity and contact you.
        </p>
      </div>

      {/* Toggles Container */}
      <div className="divide-y divide-gray-100">
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
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-gray-700 transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 leading-relaxed break-words">
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
                    isChecked ? 'bg-[#FF4F00]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
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
      <div className="pt-5 sm:pt-6 mt-2 border-t border-gray-100 flex justify-end">
        <button
          type="button"
          className="w-full sm:w-auto bg-[#FF4F00] hover:bg-[#E64700] text-white font-bold text-xs px-6 py-3 sm:py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98 text-center"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}