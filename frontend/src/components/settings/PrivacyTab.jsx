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
    { key: 'showProfileToGuests', title: 'Show my profile to guests', desc: 'Non-registered users can view your posts and profile page.' },
    { key: 'allowDirectRequests', title: 'Allow direct session requests', desc: 'Users can request a private mentoring session from your profile.' },
    { key: 'showOnlineStatus', title: 'Show online status', desc: 'Display a green dot when you are active on the platform.' },
    { key: 'receiveEmailNotifications', title: 'Receive email notifications', desc: 'Get notified by email when someone replies to your post.' },
  ];

  return (
    <div>
      <div className="border-b border-gray-100 pb-5 mb-6">
        <h2 className="text-lg font-bold text-gray-900">Privacy</h2>
        <p className="text-xs text-gray-500 mt-0.5">Control who can see your activity and contact you.</p>
      </div>

      <div className="space-y-6">
        {toggles.map((item) => (
          <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0">
            <div>
              <h3 className="text-xs font-bold text-gray-900">{item.title}</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
            </div>
            <button
              type="button"
              onClick={() => togglePrivacy(item.key)}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                privacySettings[item.key] ? 'bg-[#FF4F00]' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                privacySettings[item.key] ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}