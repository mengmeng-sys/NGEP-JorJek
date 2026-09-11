import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';
import { PostCard } from '@/components/post/PostCard';

export default function UserProfilePage() {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'reviews' | 'about'

  // Mock public profile data
  const profile = {
    displayName: 'Kwame Mensah',
    handle: username || 'kwamemensah',
    role: 'STUDENT',
    avatarInitials: 'KM',
    department: 'Computer Science & Software Engineering',
    university: 'CADT',
    bio: 'Junior CS student focused on backend systems, SQL optimization, and distributed databases. Active peer mentor for Year 1 & 2 programming labs.',
    isAvailableForMentoring: true,
    karma: 412,
    postsCount: 18,
    sessionsConducted: 24,
    rating: 4.9,
    expertise: ['#SQL', '#PostgreSQL', '#Database Design', '#C++'],
  };

  const userPosts = [
    {
      id: 1,
      author: 'Kwame Mensah',
      role: 'STUDENT',
      tag: '#SQL',
      timestamp: '3h ago',
      title: 'How do I implement a CREATE VIEW statement for a multi-table database dashboard?',
      content:
        "I am working on a university group presentation and need help joining the user account table with the favorites list. Our schema has three relations and I can't figure out which join order reduces the query cost.",
      upvotes: 124,
      hasUpvoted: false,
      comments: 14,
      isSaved: false,
    },
    {
      id: 14,
      author: 'Kwame Mensah',
      role: 'STUDENT',
      tag: '#C++',
      timestamp: '2w ago',
      title: 'Guide: Common pointer pitfalls when building dynamic arrays from scratch',
      content:
        'A quick cheat sheet summarizing double free errors, dangling pointers, and memory leaks with diagram examples from our lab 3 exercises.',
      upvotes: 89,
      hasUpvoted: true,
      comments: 8,
      isSaved: true,
    },
  ];

  const reviews = [
    {
      id: 1,
      reviewer: 'Lena Brandt',
      role: 'STUDENT',
      initials: 'LB',
      date: '3 days ago',
      topic: 'SQL Joins & Normalization',
      comment: 'Super patient and clear! Kwame walked me through query execution plans and helped me understand indexes in under 30 minutes.',
      rating: 5,
    },
    {
      id: 2,
      reviewer: 'Yola Osei',
      role: 'STUDENT',
      initials: 'YO',
      date: '2 weeks ago',
      topic: 'C++ Memory Management',
      comment: 'Very helpful debugging session for our data structures assignment. Highly recommend booking time with him.',
      rating: 5,
    },
  ];

  return (
    <ThreeColumnLayout>
      {/* Back Link */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-5 font-medium transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to feed
      </Link>

      {/* Main Profile Header Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          
          {/* Avatar and Primary Info */}
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#8B5CF6] text-white text-2xl font-black flex items-center justify-center flex-shrink-0 shadow-sm">
              {profile.avatarInitials}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                  {profile.displayName}
                </h1>
                <span className="bg-purple-50 text-[#8B5CF6] text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wide border border-purple-100">
                  {profile.role}
                </span>
                {profile.isAvailableForMentoring && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Available for Mentoring
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-500 font-medium">
                @{profile.handle} • {profile.department}
              </p>
              <p className="text-xs text-gray-400">{profile.university}</p>

              <p className="text-xs text-gray-600 max-w-xl pt-2 leading-relaxed">
                {profile.bio}
              </p>
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex md:flex-col gap-2 flex-shrink-0">
            <button
              type="button"
              className="flex-1 md:flex-initial bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm text-center"
            >
              Request Session
            </button>
            <button
              type="button"
              className="flex-1 md:flex-initial bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors text-center"
            >
              Share Profile
            </button>
          </div>
        </div>

        {/* Expertise Tags */}
        <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
            Focus Areas:
          </span>
          {profile.expertise.map((tag) => (
            <span
              key={tag}
              className="bg-orange-50/70 border border-orange-200/80 text-[#FF4F00] text-xs font-bold px-3 py-1 rounded-lg"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Karma & Performance Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-100 text-center">
          <div className="bg-[#FAFAFA] rounded-xl p-3 border border-gray-100">
            <span className="text-lg font-bold text-gray-900 block leading-tight">{profile.karma}</span>
            <span className="text-[11px] text-gray-400 font-medium">Campus Karma</span>
          </div>
          <div className="bg-[#FAFAFA] rounded-xl p-3 border border-gray-100">
            <span className="text-lg font-bold text-gray-900 block leading-tight">{profile.postsCount}</span>
            <span className="text-[11px] text-gray-400 font-medium">Discussions</span>
          </div>
          <div className="bg-[#FAFAFA] rounded-xl p-3 border border-gray-100">
            <span className="text-lg font-bold text-gray-900 block leading-tight">{profile.sessionsConducted}</span>
            <span className="text-[11px] text-gray-400 font-medium">Sessions Mentored</span>
          </div>
          <div className="bg-[#FAFAFA] rounded-xl p-3 border border-gray-100">
            <span className="text-lg font-bold text-emerald-600 block leading-tight">★ {profile.rating}</span>
            <span className="text-[11px] text-gray-400 font-medium">Peer Rating</span>
          </div>
        </div>
      </div>

      {/* Profile Content Sub-Tabs */}
      <div className="flex items-center gap-3 border-b border-gray-200 mb-5">
        <button
          type="button"
          onClick={() => setActiveTab('posts')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'posts'
              ? 'text-[#FF4F00] border-[#FF4F00]'
              : 'text-gray-400 border-transparent hover:text-gray-700'
          }`}
        >
          Shared Posts ({userPosts.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'reviews'
              ? 'text-[#FF4F00] border-[#FF4F00]'
              : 'text-gray-400 border-transparent hover:text-gray-700'
          }`}
        >
          Mentoring Reviews ({reviews.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {userPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-3.5">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#111827] text-white text-[10px] font-bold flex items-center justify-center">
                    {rev.initials}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block leading-tight">{rev.reviewer}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{rev.topic} • {rev.date}</span>
                  </div>
                </div>
                <div className="text-xs text-amber-500 font-bold">
                  {'★'.repeat(rev.rating)}
                </div>
              </div>
              <p className="text-xs text-gray-600 pl-9 leading-relaxed">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      )}
    </ThreeColumnLayout>
  );
}