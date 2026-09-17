import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';
import { postsApi, usersApi } from '@/lib/api';
import { UserAvatar } from '@/components/shared/UserAvatar';

export default function ExplorePage() {
  const navigate = useNavigate();
  const [trendingTags, setTrendingTags] = useState([]);
  const [suggestedMentors, setSuggestedMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef(null);

  useEffect(() => {
    async function loadExploreData() {
      setLoading(true);
      try {
        const [postData, mentors] = await Promise.all([
          postsApi.list({ limit: 100 }),
          usersApi.topMentors().catch(() => []),
        ]);

        // Tally tag usage across the campus feed.
        const tagCounts = {};
        postData.posts.forEach((p) => {
          (p.tags || []).forEach((t) => {
            const key = String(t).replace(/^#/, '');
            tagCounts[key] = (tagCounts[key] || 0) + 1;
          });
        });
        const topTags = Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([name, count]) => ({
            name: `#${name}`,
            posts: `${count} post${count === 1 ? '' : 's'}`,
          }));

        // If the feed is empty (no tags yet), fall back to the fixed starter set.
        setTrendingTags(
          topTags.length > 0
            ? topTags
            : [
                { name: '#C++', posts: '0 posts' },
                { name: '#SQL', posts: '0 posts' },
                { name: '#Java', posts: '0 posts' },
                { name: '#Machine Learning', posts: '0 posts' },
                { name: '#Figma', posts: '0 posts' },
                { name: '#WebDev', posts: '0 posts' },
                { name: '#Architecture', posts: '0 posts' },
                { name: '#Mobile', posts: '0 posts' },
              ]
        );
        setSuggestedMentors(mentors.slice(0, 10));
      } catch (err) {
        console.error('Failed to load explore data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadExploreData();
  }, []);

  const handleSearch = (value) => {
    setSearchQuery(value);
    setShowResults(value.trim().length > 0);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!value.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await usersApi.search(value.trim());
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <ThreeColumnLayout>
      <div className="space-y-6 sm:space-y-8">

        {/* Page Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF4F00] shrink-0">
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

          {loading ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-xs text-gray-400">
              Loading campus tags...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {trendingTags.map((tag) => (
                <Link
                  key={tag.name}
                  to={`/?tag=${encodeURIComponent(tag.name.replace('#', ''))}`}
                  className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:border-orange-300 hover:shadow-xs transition-all flex flex-col justify-between min-h-21.25 sm:min-h-23.75 group active:scale-[0.98]"
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
          )}
        </section>

         {/* 2. User Search & Suggested Mentors */}
         <section>
           <div className="flex items-center justify-between mb-3 sm:mb-4">
             <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
               Find Users
             </h2>
           </div>

           <div className="relative mb-4">
             <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
               <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
             <input
               type="text"
               value={searchQuery}
               onChange={(e) => handleSearch(e.target.value)}
               placeholder="Search users by name..."
               className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all"
             />
             {searchQuery && (
               <button
                 type="button"
                 onClick={() => { setSearchQuery(''); setSearchResults([]); setShowResults(false); }}
                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
               >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             )}
           </div>

           {showResults && (
             <div className="bg-white border border-gray-200 rounded-xl shadow-lg mb-4 max-h-72 overflow-y-auto">
               {searchLoading ? (
                 <div className="p-4 text-center">
                   <div className="w-5 h-5 border-2 border-[#FF4F00] border-t-transparent rounded-full animate-spin mx-auto" />
                 </div>
               ) : searchResults.length === 0 ? (
                 <div className="p-4 text-center text-xs text-gray-400">No users found</div>
               ) : (
                 searchResults.map((user) => (
                   <button
                     key={user.id}
                     type="button"
                     onClick={() => navigate(`/user/${(user.display_name || '').toLowerCase().replace(/\s+/g, '')}`)}
                     className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left cursor-pointer border-b border-gray-50 last:border-b-0"
                   >
                      <UserAvatar initials={getInitials(user.display_name)} userId={user.id} size="md" />
                     <div className="min-w-0 flex-1">
                       <div className="flex items-center gap-2">
                         <span className="text-xs font-bold text-gray-900 truncate">{user.display_name}</span>
                         <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded shrink-0 ${
                           user.role === 'PROFESSOR' ? 'bg-orange-50 text-[#FF4F00] border border-orange-100' : 'bg-gray-100 text-gray-600'
                         }`}>
                           {user.role}
                         </span>
                       </div>
                     </div>
                   </button>
                 ))
               )}
             </div>
           )}

           <div className="flex items-center justify-between mb-3 sm:mb-4">
             <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
               Suggested Mentors
             </h2>
             <span className="text-[10px] text-gray-400 font-medium">Swipe to browse →</span>
           </div>

          {/* Horizontal scroll container with native touch momentum & snap alignment */}
           <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 -mx-3 px-3 sm:-mx-4 sm:px-4 lg:mx-0 lg:px-0 scroll-smooth snap-x snap-mandatory">
            {suggestedMentors.length === 0 && !loading ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-xs text-gray-400 w-full">
                No peer mentors found yet.
              </div>
            ) : (
              suggestedMentors.map((mentor) => (
                <div
                  key={mentor.id || mentor.displayName}
                  className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 w-41.25 sm:w-48.75 shrink-0 flex flex-col items-center text-center shadow-xs snap-start hover:border-gray-300 transition-all justify-between"
                >
                  <div className="flex flex-col items-center w-full">
                    {/* Avatar */}
                     <UserAvatar initials={mentor.initials} userId={mentor.id} size="lg" className="mb-2.5 shadow-2xs" />

                    {/* Name */}
                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-snug truncate w-full" title={mentor.displayName || mentor.name}>
                      {mentor.displayName || mentor.name}
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
              ))
            )}
          </div>
        </section>

      </div>
    </ThreeColumnLayout>
  );
}