import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export function GeneralTab() {
  const { user, updateUserProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
    }
  }, [user?.displayName, user?.bio]);

  const hasChanges = displayName.trim() !== (user?.displayName || '') || bio.trim() !== (user?.bio || '');

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateUserProfile({ displayName: displayName.trim(), bio: bio.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err?.message || 'Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="border-b border-gray-100 pb-4 sm:pb-5 mb-5 sm:mb-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">General</h2>
        <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-snug">
          Manage your public profile information visible to other CADT students.
        </p>
      </div>

      <div className="space-y-5 sm:space-y-6">
        {/* Avatar + Name Preview */}
        <div className="flex items-center gap-4 p-4 bg-gray-50/70 rounded-xl border border-gray-100">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white text-lg font-bold flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-xs">
            {displayName ? displayName.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() : (user?.initials || 'U')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{displayName || 'Your Name'}</p>
            <p className="text-xs text-gray-400 truncate">@{displayName ? displayName.toLowerCase().replace(/\s+/g, '') : 'username'}</p>
          </div>
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
            user?.role === 'PROFESSOR'
              ? 'bg-orange-50 text-[#FF4F00] border border-orange-100'
              : 'bg-blue-50 text-blue-600 border border-blue-100'
          }`}>
            {user?.role || 'STUDENT'}
          </span>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => { setDisplayName(e.target.value); setSaved(false); }}
            placeholder="How should we call you?"
            className="w-full border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-900 outline-none focus:bg-white focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all bg-[#FAFAFA] shadow-2xs"
          />
          <p className="text-[10px] text-gray-400 mt-1">This is the name other users will see on your posts and comments.</p>
        </div>

        {/* Bio */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider">
              Bio
            </label>
            <span className="text-[10px] text-gray-400">{bio.length}/200</span>
          </div>
          <textarea
            rows={3}
            maxLength={200}
            value={bio}
            onChange={(e) => { setBio(e.target.value); setSaved(false); }}
            placeholder="Tell others about yourself, what you're studying, or what you're working on..."
            className="w-full border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all bg-[#FAFAFA] focus:bg-white resize-none shadow-2xs leading-relaxed"
          />
        </div>

        {/* Account Info (Read-only) */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-3">Account Information</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2.5 px-3 bg-gray-50/70 rounded-lg">
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-gray-500">University Email</span>
              </div>
              <span className="text-xs font-medium text-gray-700 truncate max-w-[200px]">{user?.email || '—'}</span>
            </div>
            <div className="flex items-center justify-between py-2.5 px-3 bg-gray-50/70 rounded-lg">
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-gray-500">Member Since</span>
              </div>
              <span className="text-xs font-medium text-gray-700">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Save Footer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            {saved && (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Changes saved
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
              hasChanges && !saving
                ? 'bg-[#FF4F00] hover:bg-[#E64700] text-white shadow-xs cursor-pointer active:scale-98'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
