import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// This tab used to be a second, independent editor for displayName/bio/avatar
// — the exact same fields the "Edit Profile" panel on the user's own profile
// page (UserProfilePage.jsx) edits. Two editable forms for the same data is a
// real footgun (whichever was saved last silently wins, and it's unclear to
// the user which page is "the" place to edit their profile), so this is now
// a read-only summary with a link to the one place profile editing happens.
export function GeneralTab() {
  const { user } = useAuth();

  const initials =
    user?.initials ||
    (user?.displayName
      ? user.displayName.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
      : 'U');

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="border-b border-gray-100 pb-4 sm:pb-5 mb-5 sm:mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">General</h2>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-snug">
            A summary of your public profile. Head to your profile page to make changes.
          </p>
        </div>
        <Link
          to={`/user/${user?.handle || 'me'}`}
          className="shrink-0 inline-flex items-center gap-1.5 bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Profile
        </Link>
      </div>

      <div className="space-y-5 sm:space-y-6">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4 p-4 bg-gray-50/70 rounded-xl border border-gray-100">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white text-lg font-bold flex items-center justify-center ring-2 ring-white shadow-xs overflow-hidden shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.displayName || 'Profile picture'} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{user?.displayName || 'Your Name'}</p>
            <p className="text-xs text-gray-400 truncate">@{user?.handle || 'username'}</p>
          </div>
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
            user?.role === 'PROFESSOR'
              ? 'bg-orange-50 text-[#FF4F00] border border-orange-100'
              : 'bg-blue-50 text-blue-600 border border-blue-100'
          }`}>
            {user?.role || 'STUDENT'}
          </span>
        </div>

        {/* Bio */}
        {user?.bio && (
          <div>
            <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-2">Bio</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed bg-gray-50/70 rounded-xl border border-gray-100 p-3.5">
              {user.bio}
            </p>
          </div>
        )}

        {/* Academic Info */}
        {(user?.gen || user?.department || user?.specialization) && (
          <div>
            <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-2">Academic Info</h3>
            <div className="flex flex-wrap gap-2">
              {user?.gen && (
                <span className="text-[11px] font-medium text-gray-600 bg-gray-50/70 border border-gray-100 rounded-lg px-2.5 py-1.5">
                  Gen {user.gen}
                </span>
              )}
              {user?.department && (
                <span className="text-[11px] font-medium text-gray-600 bg-gray-50/70 border border-gray-100 rounded-lg px-2.5 py-1.5">
                  {user.department}
                </span>
              )}
              {user?.specialization && (
                <span className="text-[11px] font-medium text-gray-600 bg-gray-50/70 border border-gray-100 rounded-lg px-2.5 py-1.5">
                  {user.specialization}
                </span>
              )}
            </div>
          </div>
        )}

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
      </div>
    </div>
  );
}
