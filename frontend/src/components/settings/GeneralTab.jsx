import React, { useState } from 'react';

export function GeneralTab() {
  const [displayName, setDisplayName] = useState('Yola Osei');
  const [role, setRole] = useState('Student');
  const [bio, setBio] = useState('Computer Science student passionate about database architecture and systems programming.');

  return (
    <div>
      <div className="border-b border-gray-100 pb-5 mb-6">
        <h2 className="text-lg font-bold text-gray-900">General</h2>
        <p className="text-xs text-gray-500 mt-0.5">Manage your display name, profile picture, and academic details.</p>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-[#111827] text-white font-bold flex items-center justify-center text-sm shadow-sm">
          YO
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="border border-[#FF4F00] text-[#FF4F00] hover:bg-orange-50 font-bold text-xs px-4 py-2 rounded-xl transition-colors">
            Change Picture
          </button>
          <button type="button" className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors">
            Remove
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-2">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all bg-[#FAFAFA] focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-2">University Email</label>
          <div className="relative flex items-center">
            <input
              type="email"
              disabled
              value="yola.osei@cadt.edu.kh"
              className="w-full border border-gray-200 bg-gray-50/80 rounded-xl px-4 py-3 text-sm text-gray-500 cursor-not-allowed pr-10"
            />
            <svg className="w-4 h-4 text-gray-400 absolute right-3.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-2">Platform Role</label>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            {['Student', 'Professor'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                  role === r
                    ? 'bg-[#FFF4F0] text-[#FF4F00] border-orange-200'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-2">Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Share a short summary of what you are working on or studying..."
            className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all bg-[#FAFAFA] focus:bg-white resize-none"
          />
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button type="button" className="bg-[#FF4F00] hover:bg-[#E64700] text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-colors shadow-sm">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}