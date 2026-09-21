import React from 'react';
import { TopUsersList } from '@/components/profile/TopMentorsList';
import { CommunityRulesCard } from './CommunityRulesCard';
import { GettingStartedCard } from './GettingStartedCard';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export function RightSidebar({ onOpenAuth }) {
  return (
    <aside className="w-full lg:col-span-3">
      <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-20">

        {/* Getting Started Guide */}
        <GettingStartedCard onOpenAuth={onOpenAuth} />

        {/* Community Guidelines */}
        <CommunityRulesCard />

         {/* Top Users */}
         <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
           {/* Header */}
           <div className="flex items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
             <div className="flex items-center gap-2">
               <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                 <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                   <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                 </svg>
               </div>
               <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Top Users</h3>
             </div>
             <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
               This Week
             </span>
           </div>

           {/* Users List */}
           <div className="px-2 sm:px-3 pb-3">
             <TopUsersList />
           </div>
         </div>

         {/* Theme Toggle */}
         <ThemeToggle className="w-full justify-center" />

       </div>
    </aside>
  );
}