import React, { useState, useEffect } from 'react';
import { LeftSidebar, fetchSkillTags } from '@/components/layout/LeftSidebar';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { CommunityRulesCard } from '@/components/layout/CommunityRulesCard';
import { TopUsersList } from '@/components/profile/TopMentorsList';

export function ThreeColumnLayout({ children, onOpenAuth }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [skillTags, setSkillTags] = useState([]);

  useEffect(() => {
    fetchSkillTags().then(setSkillTags);
  }, []);

  return (
    <div className="w-full bg-[#FBFBFB] relative h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden">
      <div className="w-full h-full px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 h-full items-start">
          
          <aside className="hidden lg:block lg:col-span-3 xl:col-span-2 h-full overflow-y-auto py-4 no-scrollbar">
            <LeftSidebar skillTags={skillTags} />
          </aside>

          <main className="w-full lg:col-span-6 xl:col-span-7 h-full overflow-y-auto no-scrollbar min-w-0">
            <div className="py-4">
              {children}
            </div>
          </main>

          <aside className="hidden lg:block lg:col-span-3 xl:col-span-3 h-full overflow-y-auto py-4 no-scrollbar">
            <RightSidebar onOpenAuth={onOpenAuth} />
          </aside>

        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsMobileSidebarOpen(true)}
        className="lg:hidden fixed bottom-5 right-5 z-30 bg-[#111827] text-white p-3 sm:p-3.5 rounded-full shadow-xl hover:bg-black transition-all flex items-center gap-2 text-xs font-bold active:scale-95 cursor-pointer"
      >
        <svg className="w-4 h-4 text-[#FF4F00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <span>Rules & Top Users</span>
      </button>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex items-end justify-center bg-black/60 backdrop-blur-xs p-0">
          <div className="bg-white rounded-t-2xl w-full max-h-[85vh] overflow-y-auto p-4 sm:p-5 space-y-5 animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center pb-2.5 border-b border-gray-100">
              <span className="font-bold text-sm text-gray-900">Rules & Top Users</span>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="text-xs font-bold text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <CommunityRulesCard />
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Top Users</h3>
              <TopUsersList />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
