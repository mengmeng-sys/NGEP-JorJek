import React, { useState } from 'react';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { RightSidebar } from '@/components/layout/RightSidebar';

export function ThreeColumnLayout({ children, onOpenAuth }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    /* h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] locks layout exactly to the window below Navbar */
    <div className="w-full bg-[#FBFBFB] relative h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden">
      <div className="w-full h-full px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 h-full items-start">
          
          {/* 1. Left Sidebar: Independent Scroll Container */}
          <aside className="hidden lg:block lg:col-span-3 xl:col-span-2 h-full overflow-y-auto py-4 no-scrollbar">
            <LeftSidebar />
          </aside>

          {/* 2. Center Main Feed: Independent Scroll Container */}
          <main className="w-full lg:col-span-6 xl:col-span-7 h-full overflow-y-auto py-4 no-scrollbar min-w-0">
            {children}
          </main>

          {/* 3. Right Sidebar: Independent Scroll Container */}
          <aside className="hidden lg:block lg:col-span-3 xl:col-span-3 h-full overflow-y-auto py-4 no-scrollbar">
            <RightSidebar onOpenAuth={onOpenAuth} />
          </aside>

        </div>
      </div>

      {/* Floating Action Button on Mobile */}
      <button
        type="button"
        onClick={() => setIsMobileSidebarOpen(true)}
        className="lg:hidden fixed bottom-5 right-5 z-30 bg-[#111827] text-white p-3 sm:p-3.5 rounded-full shadow-xl hover:bg-black transition-all flex items-center gap-2 text-xs font-bold active:scale-95 cursor-pointer"
      >
        <svg className="w-4 h-4 text-[#FF4F00]" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span>Rules & Mentors</span>
      </button>

      {/* Mobile Full-Width Slide-Up Modal */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex items-end justify-center bg-black/60 backdrop-blur-xs p-0">
          <div className="bg-white rounded-t-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-5 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center pb-2.5 border-b border-gray-100">
              <span className="font-bold text-sm text-gray-900">Campus Overview</span>
              <button 
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="text-xs font-bold text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <RightSidebar onOpenAuth={onOpenAuth} />
          </div>
        </div>
      )}
    </div>
  );
}