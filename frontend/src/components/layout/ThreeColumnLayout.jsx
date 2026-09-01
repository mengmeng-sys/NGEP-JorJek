import React from 'react';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { MainContent } from './MainContent';

export function ThreeColumnLayout({ children }) {
  return (
    // w-full instead of max-w-7xl forces the layout to span the entire screen width
    <div className="w-full px-6 lg:px-10 py-6">
      
      {/* 
        Using a 12-column grid:
        - Left Sidebar takes 2 columns (compact & near the left edge)
        - Main Content takes 7 columns (much wider for your posts)
        - Right Sidebar takes 3 columns (near the right edge)
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar (2 cols) */}
        <div className="hidden lg:block lg:col-span-2">
          <LeftSidebar />
        </div>

        {/* Center Main Content (7 cols) */}
        <div className="col-span-1 lg:col-span-7">
          <MainContent>{children}</MainContent>
        </div>

        {/* Right Sidebar (3 cols) */}
        <div className="hidden lg:block lg:col-span-3">
          <RightSidebar />
        </div>

      </div>
    </div>
  );
}