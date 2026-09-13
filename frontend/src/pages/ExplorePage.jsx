import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';

export default function ExplorePage() {
  const navigate = useNavigate();

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
      handle: 'profcarver',
      role: 'PROFESSOR',
      specialty: 'C++ & Systems',
    },
    {
      initials: 'YT',
      name: 'Dr. Yuki Tanaka',
      handle: 'dryukitanaka',
      role: 'PROFESSOR',
      specialty: 'Databases & SQL',
    },
    {
      initials: 'AS',
      name: 'Prof. Amara Singh',
      handle: 'profamarasingh',
      role: 'PROFESSOR',
      specialty: 'Machine Learning',
    },
    {
      initials: 'NO',
      name: 'Nadia Osei',
      handle: 'nadiaosei',
      role: 'STUDENT',
      specialty: 'UI/UX & Figma',
    },
    {
      initials: 'RC',
      name: 'Rafael Costa',
      handle: 'rafaelcosta',
      role: 'STUDENT',
      specialty: 'Java & Algorithms',
    },
  ];

  return (
    <ThreeColumnLayout>
      <div className="space-y-6 sm:space-y-8">
        
        {/* Page Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF4F00] flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">Discover JorJek</h1>
            <p className="text-[11px] sm:text-xs text-gray-400">Explore trending syllabus tags and active faculty mentors</p>
          </div>
        </div>

        {/* 1. Trending Tags Section */}
        <section>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Trending Tags
            </h2>
            <span className="text-[10px] text-gray-400 font-medium sm:hidden">Tap to filter</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {trendingTags.map((tag) => (
              <Link
                key={tag.name}
                to={`/?tag=${encodeURIComponent(tag.name.replace('#', ''))}`}
                className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:border-orange-300 hover:shadow-xs transition-all flex flex-col justify-between min-h-[85px] sm:min-h-[95px] group active:scale-[0.98]"
              >
                <span className="text-sm sm:text-base font-bold text-[#FF4F00] group-hover:text-[#E64700] leading-tight truncate">
                  {tag.name}
                </span>
                <span className="text-[11px] sm:text-xs text-gray-400 font-medium">
                  {tag.posts}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 2. Suggested Mentors Section */}
        <section>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Suggested Mentors
            </h2>
            <span className="text-[10px] text-gray-400 font-medium">Swipe to browse →</span>
          </div>

          {/* Horizontal scroll container with native touch momentum & snap alignment */}
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth snap-x snap-mandatory">
            {suggestedMentors.map((mentor) => (
              <div
                key={mentor.name}
                className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 w-[165px] sm:w-[195px] flex-shrink-0 flex flex-col items-center text-center shadow-xs snap-start hover:border-gray-300 transition-all justify-between"
              >
                <div className="flex flex-col items-center w-full">
                  {/* Avatar */}
                  <div className="w-11 h-11 sm:w-12 sm:h-12 bg-[#111827] text-white font-bold text-xs sm:text-sm rounded-full flex items-center justify-center mb-2.5 shadow-2xs">
                    {mentor.initials}
                  </div>

                  {/* Name */}
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-snug truncate w-full" title={mentor.name}>
                    {mentor.name}
                  </h3>

                  {/* Role Pill */}
                  <span
                    className={`mt-1.5 text-[9px] font-extrabold px-2 py-0.5 rounded tracking-wide ${
                      mentor.role === 'PROFESSOR'
                        ? 'bg-orange-50 text-[#FF4F00] border border-orange-100'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {mentor.role}
                  </span>

                  {/* Specialty */}
                  <p className="text-[11px] text-gray-400 mt-2 font-medium line-clamp-1 w-full" title={mentor.specialty}>
                    {mentor.specialty}
                  </p>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={() => navigate(`/user/${mentor.handle}`)}
                  className="mt-3.5 w-full border border-[#FF4F00] text-[#FF4F00] hover:bg-orange-50 active:bg-orange-100 text-xs font-bold py-1.5 sm:py-2 rounded-lg transition-colors cursor-pointer"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>
    </ThreeColumnLayout>
  );
}