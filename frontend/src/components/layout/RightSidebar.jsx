import React from 'react';
import { TopMentorsList } from '@/components/profile/TopMentorsList';

export function RightSidebar() {
  return (
    <aside className="hidden lg:block lg:col-span-3">
      <div className="sticky top-24 space-y-6">
        
        {/* Getting Started Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">
              Getting Started
            </h3>
            <span className="text-xs font-bold text-[#FF4F00]">1/4 Completed</span>
          </div>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            Complete your setup to unlock the Top Mentors leaderboard.
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5">
            <div className="bg-[#FF4F00] h-1.5 rounded-full w-1/4"></div>
          </div>

          {/* Checklist */}
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#FF4F00] flex items-center justify-center text-white">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-400 line-through">Add your Department & Skills</span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-200"></div>
              <span className="text-gray-700 font-medium">Upvote a helpful post</span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-200"></div>
              <span className="text-gray-700 font-medium">Save a resource for later</span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-200"></div>
              <span className="text-gray-700 font-medium">Leave your first comment</span>
            </li>
          </ul>
        </div>

        {/* Top Mentors Container */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-4">
            Top Mentors
          </h3>
          {/* Renders CS2's TopMentorsList component inside this styled box */}
          <TopMentorsList />
        </div>

      </div>
    </aside>
  );
}