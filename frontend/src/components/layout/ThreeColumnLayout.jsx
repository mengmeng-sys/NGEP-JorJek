import React from 'react';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { MainContent } from './MainContent';

export function ThreeColumnLayout({ children }) {
  return (
    <div className="w-full px-6 lg:px-10 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Sticky Left Sidebar */}
        <div className="hidden lg:block lg:col-span-2 sticky top-[4.5rem] h-[calc(100vh-5.5rem)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <LeftSidebar />
        </div>

        {/* Scrollable Center Main Content */}
        <MainContent>{children}</MainContent>

        {/* Sticky Right Sidebar */}
        <div className="hidden lg:block lg:col-span-3 sticky top-[4.5rem] h-[calc(100vh-5.5rem)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-6">
          <RightSidebar />
        </div>

      </div>
    </div>
  );
}