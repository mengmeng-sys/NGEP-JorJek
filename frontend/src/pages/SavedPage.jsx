import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';
import { PostCard } from '@/components/post/PostCard';

export default function SavedPage() {
  // Sample initial state with 1 saved post matching your design
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

  return (
    <ThreeColumnLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <svg
            className="w-5 h-5 text-[#FF4F00]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <h1 className="text-xl font-bold text-gray-900">Your Saved Resources</h1>
        </div>
        <p className="text-sm text-gray-500">
          {savedPosts.length === 0
            ? 'Posts you save will appear here for quick access'
            : `${savedPosts.length} post saved to your bookmarks`}
        </p>
      </div>

      {/* Conditional Rendering: Empty State vs Saved List */}
      {savedPosts.length === 0 ? (
        <div className="bg-[#FBFBFB] border border-gray-100 rounded-2xl p-16 flex flex-col items-center justify-center text-center min-h-[420px]">
          {/* Outline Bookmark Icon */}
          <div className="text-gray-300 mb-4">
            <svg
              className="w-16 h-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>

          <h2 className="text-base font-bold text-gray-800 mb-2">Nothing here yet!</h2>
          <p className="text-xs text-gray-400 max-w-xs mb-6 leading-relaxed">
            Click the <strong className="font-semibold text-gray-600">Save</strong> icon on any post to keep your study materials here.
          </p>

          <Link
            to="/"
            className="bg-[#FF4F00] hover:bg-[#E64700] text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            Browse the feed →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {savedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </ThreeColumnLayout>
  );
}