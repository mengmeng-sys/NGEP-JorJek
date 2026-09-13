import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';
import { PostCard } from '@/components/post/PostCard';

export default function SavedPage() {
  const [savedPosts, setSavedPosts] = useState([
    {
      id: 1,
      author: 'Kwame Mensah',
      role: 'STUDENT',
      tags: ['SQL'],
      timestamp: '3h ago',
      title: 'How do I implement a CREATE VIEW statement for a multi-table database dashboard?',
      content:
        "I am working on a university group presentation and need help joining the user account table with the favorites list. Our schema has three relations and I can't figure out which join order reduces the query cost.",
      upvotes: 124,
      comments: 14,
      isSaved: true,
    },
  ]);

  const handleToggleSave = (postId) => {
    setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <ThreeColumnLayout>
      <div className="w-full space-y-4 sm:space-y-5">
        
        {/* Responsive Header Banner */}
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF4F00] flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight truncate">
                Your Saved Resources
              </h1>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-snug truncate">
                {savedPosts.length === 0
                  ? 'Posts you save will appear here for quick access'
                  : `${savedPosts.length} ${savedPosts.length === 1 ? 'post' : 'posts'} saved to your bookmarks`}
              </p>
            </div>
          </div>
        </div>

        {/* Saved Feed vs Empty State */}
        {savedPosts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-8 sm:p-14 flex flex-col items-center justify-center text-center shadow-xs min-h-[360px] sm:min-h-[400px]">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-orange-50/70 border border-orange-100 text-[#FF4F00] flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>

            <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5">
              Nothing saved yet!
            </h2>
            <p className="text-xs text-gray-400 max-w-xs mb-5 sm:mb-6 leading-relaxed">
              Click the <strong className="font-semibold text-gray-700">Save</strong> bookmark button on questions or study guides to collect them here.
            </p>

            <Link
              to="/"
              className="w-full sm:w-auto bg-[#FF4F00] hover:bg-[#E64700] text-white font-bold text-xs px-6 py-3 sm:py-2.5 rounded-xl transition-all shadow-xs inline-flex items-center justify-center gap-1.5 active:scale-98 text-center"
            >
              Browse campus feed →
            </Link>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {savedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        )}

      </div>
    </ThreeColumnLayout>
  );
}