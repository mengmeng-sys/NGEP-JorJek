import React from 'react';
import { NavLink, Link, useSearchParams, useNavigate } from 'react-router-dom';

export function LeftSidebar({ savedCount = 1 }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTag = searchParams.get('tag');

  const skillTags = ['C++', 'SQL', 'Java', 'Machine Learning', 'Figma'];

  const getNavLinkClass = ({ isActive }) =>
    `flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
      isActive && !activeTag
        ? 'bg-[#FFF4F0] text-[#FF4F00]'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
    }`;

  const handleTagClick = (tag) => {
    if (activeTag === tag) {
      navigate('/');
    } else {
      navigate(`/?tag=${encodeURIComponent(tag)}`);
    }
  };

  return (
    <aside className="w-full space-y-8">
      {/* Navigation Section */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-4">
          Navigation
        </p>

        <nav className="space-y-1">
          <NavLink to="/" end className={getNavLinkClass}>
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </div>
          </NavLink>

          <NavLink to="/popular" className={getNavLinkClass}>
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span>Popular</span>
            </div>
          </NavLink>

          <NavLink to="/explore" className={getNavLinkClass}>
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
              </svg>
              <span>Explore</span>
            </div>
          </NavLink>

          <NavLink to="/saved" className={getNavLinkClass}>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span>Saved</span>
            </div>
            {savedCount > 0 && (
              <span className="w-5 h-5 bg-[#FF4F00] text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </NavLink>
        </nav>
      </div>

      {/* Skill Tags Section */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-4">
          Skill Tags
        </p>
        <div className="flex flex-col space-y-1">
          {skillTags.map((tag) => {
            const isSelected = activeTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`text-left px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#FFF4F0] text-[#FF4F00] font-bold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Compact Left Sidebar Footer */}
      <div className="pt-6 border-t border-gray-200 px-3 text-[11px] text-gray-400 space-y-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1 font-medium">
          <Link to="/about" className="hover:text-gray-700 transition-colors">About Us</Link>
          <Link to="/contact" className="hover:text-gray-700 transition-colors">Contact</Link>
          <Link to="/privacy" className="hover:text-gray-700 transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-gray-700 transition-colors">Terms</Link>
        </div>
        <p className="text-[10px] text-gray-400">© 2026 JorJek Campus. All rights reserved.</p>
      </div>
    </aside>
  );
}