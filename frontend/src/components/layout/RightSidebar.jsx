import React from 'react';
import { TopMentorsList } from '@/components/profile/TopMentorsList';
import { CommunityRulesCard } from './CommunityRulesCard';
import { GettingStartedCard } from './GettingStartedCard';

export function RightSidebar({ onOpenAuth }) {
  return (
    <aside className="hidden lg:block lg:col-span-3">
      <div className="sticky top-24 space-y-6">
        
       <GettingStartedCard onOpenAuth={onOpenAuth} />

        <CommunityRulesCard />

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
