import React from 'react';
import { TopMentorsList } from '@/components/profile/TopMentorsList';
import { CommunityRulesCard } from './CommunityRulesCard';
import { GettingStartedCard } from './GettingStartedCard';

export function RightSidebar({ onOpenAuth }) {
  return (
    <aside className="w-full lg:col-span-3">
      {/* On desktop: sticky column; on mobile/tablet: stacks neatly with fluid spacing */}
      <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-20">
        
        {/* Getting Started Guide */}
        <GettingStartedCard onOpenAuth={onOpenAuth} />

        {/* Community Guidelines (Accordion on mobile, static on desktop) */}
        <CommunityRulesCard />

        {/* Top Mentors Container */}
        <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">
              Top Mentors
            </h3>
            <span className="text-[10px] font-bold text-[#FF4F00] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
              Verified
            </span>
          </div>

          {/* Renders Mentors List with fluid horizontal containment */}
          <div className="overflow-x-auto">
            <TopMentorsList />
          </div>
        </div>

      </div>
    </aside>
  );
}