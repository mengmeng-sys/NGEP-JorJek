import React from 'react';
import { Link } from 'react-router-dom';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';

export default function ExplorePage() {
  const trendingTags = [
    { name: '#Figma', posts: '1,204 posts' },
    { name: '#SQL', posts: '987 posts' },
    { name: '#C++', posts: '854 posts' },
    { name: '#Machine Learning', posts: '1,031 posts' },
    { name: '#Java', posts: '762 posts' },
    { name: '#Python', posts: '1,456 posts' },
    { name: '#React', posts: '693 posts' },
    { name: '#Linux', posts: '421 posts' },
  ];

  const suggestedMentors = [
    {
      initials: 'JC',
      name: 'Prof. James Carver',
      role: 'PROFESSOR',
      specialty: 'C++ & Systems',
    },
    {
      initials: 'YT',
      name: 'Dr. Yuki Tanaka',
      role: 'PROFESSOR',
      specialty: 'Databases & SQL',
    },
    {
      initials: 'AS',
      name: 'Prof. Amara Singh',
      role: 'PROFESSOR',
      specialty: 'Machine Learning',
    },
    {
      initials: 'NO',
      name: 'Nadia Osei',
      role: 'STUDENT',
      specialty: 'UI/UX & Figma',
    },
    {
      initials: 'RC',
      name: 'Rafael Costa',
      role: 'STUDENT',
      specialty: 'Java & Algorithms',
    },
  ];

  return (
    <ThreeColumnLayout>
      {/* Page Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-7 h-7 rounded-full border border-[#FF4F00] flex items-center justify-center text-[#FF4F00]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Discover JorJek</h1>
      </div>

      {/* 1. Trending Tags Section */}
      <section className="mb-8">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
          Trending Tags
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {trendingTags.map((tag) => (
            <Link
              key={tag.name}
              to={`/tags/${tag.name.replace('#', '')}`}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-orange-200 hover:shadow-sm transition-all flex flex-col justify-between min-h-[95px]"
            >
              <span className="text-base font-bold text-[#FF4F00] leading-tight">
                {tag.name}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {tag.posts}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. Suggested Mentors Section */}
      <section>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
          Suggested Mentors
        </h2>

        {/* Horizontal scroll container with hidden scrollbar */}
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar">
          {suggestedMentors.map((mentor) => (
            <div
              key={mentor.name}
              className="bg-white border border-gray-200 rounded-xl p-5 min-w-[190px] max-w-[200px] flex-shrink-0 flex flex-col items-center text-center shadow-sm"
            >
              {/* Avatar */}
              <div className="w-12 h-12 bg-[#111827] text-white font-bold text-sm rounded-full flex items-center justify-center mb-3">
                {mentor.initials}
              </div>

              {/* Name */}
              <h3 className="font-bold text-sm text-gray-900 leading-snug line-clamp-1">
                {mentor.name}
              </h3>

              {/* Role Pill */}
              <span
                className={`mt-1.5 text-[9px] font-bold px-2 py-0.5 rounded tracking-wider ${
                  mentor.role === 'PROFESSOR'
                    ? 'bg-orange-50 text-[#FF4F00] border border-orange-100'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {mentor.role}
              </span>

              {/* Specialty */}
              <p className="text-xs text-gray-400 mt-2 font-medium">
                {mentor.specialty}
              </p>

              {/* Action Button */}
              <button className="mt-4 w-full border border-[#FF4F00] text-[#FF4F00] hover:bg-orange-50 text-xs font-bold py-2 rounded-lg transition-colors">
                View Profile
              </button>
            </div>
          ))}
        </div>
      </section>
    </ThreeColumnLayout>
  );
}