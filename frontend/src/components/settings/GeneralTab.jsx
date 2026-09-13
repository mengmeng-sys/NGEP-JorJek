import React, { useState } from 'react';

export function GeneralTab() {
  const [displayName, setDisplayName] = useState('Yola Osei');
  const [role, setRole] = useState('Student');
  const [bio, setBio] = useState(
    'Computer Science student passionate about database architecture and systems programming.'
  );

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="border-b border-gray-100 pb-4 sm:pb-5 mb-5 sm:mb-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">General</h2>
        <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-snug">
          Manage your display name, profile picture, and academic details.
        </p>
      </div>

      {/* Avatar Management Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 sm:gap-4 mb-6 sm:mb-8 p-3.5 sm:p-0 bg-gray-50/70 sm:bg-transparent rounded-xl border border-gray-100 sm:border-0">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#111827] text-white font-black flex items-center justify-center text-xs sm:text-sm shadow-xs flex-shrink-0">
            YO
          </div>
          <div className="sm:hidden">
            <span className="text-xs font-bold text-gray-900 block leading-tight">Profile Photo</span>
            <span className="text-[10px] text-gray-400 font-medium">PNG, JPG up to 5MB</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            type="button"
            className="flex-1 sm:flex-initial border border-[#FF4F00] text-[#FF4F00] hover:bg-orange-50 font-bold text-xs px-3.5 sm:px-4 py-2 rounded-xl transition-all shadow-2xs text-center cursor-pointer active:scale-98"
          >
            Change Picture
          </button>
          <button
            type="button"
            className="flex-1 sm:flex-initial text-xs font-semibold text-gray-400 hover:text-red-500 py-2 transition-colors text-center cursor-pointer"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4 sm:space-y-5">
        {/* Display Name */}
        <div>
          <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-900 outline-none focus:bg-white focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all bg-[#FAFAFA] shadow-2xs"
          />
        </div>

        {/* Locked University Email */}
        <div>
          <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
            University Email
          </label>
          <div className="relative flex items-center">
            <input
              type="email"
              disabled
              value="yola.osei@cadt.edu.kh"
              className="w-full border border-gray-200 bg-gray-50/90 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-500 cursor-not-allowed pr-10 shadow-2xs"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute right-3.5 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Managed via CADT single sign-on directory.</p>
        </div>

        {/* Role Toggle */}
        <div>
          <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
            Platform Role
          </label>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full sm:max-w-xs">
            {['Student', 'Professor'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer select-none active:scale-98 ${
                  role === r
                    ? 'bg-[#FFF4F0] text-[#FF4F00] border-orange-200 shadow-2xs'
                    : 'bg-[#FAFAFA] border-gray-200 text-gray-600 hover:bg-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Bio Textarea */}
        <div>
          <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
            Bio
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Share a short summary of what you are working on or studying..."
            className="w-full border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all bg-[#FAFAFA] focus:bg-white resize-none shadow-2xs leading-relaxed"
          />
        </div>

        {/* Save Footer Button */}
        <div className="pt-3 sm:pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            className="w-full sm:w-auto bg-[#FF4F00] hover:bg-[#E64700] text-white font-bold text-xs px-6 py-3 sm:py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98 text-center"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}