import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreatePostModal } from '@/components/post/CreatePostModal';

export default function Navbar() {
  const navigate = useNavigate();

  // Logged-in user state (Defaults to mock CADT user; null when logged out)
  const [user, setUser] = useState({
    displayName: 'Srun Vireak',
    email: 'srun.vireak@student.cadt.edu.kh',
    handle: 'srunvireak',
    initials: 'SV',
  });

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const menuRef = useRef(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/?tag=${encodeURIComponent(searchQuery.trim().replace(/^#/, ''))}`);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsMenuOpen(false);
    navigate('/auth/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 sm:px-8 py-3 bg-white border-b border-gray-200">
        
        {/* Brand Logo */}
        <div className="flex-shrink-0 flex items-center">
          <Link to="/" className="flex items-center gap-1.5">
            <span className="text-xl font-black text-gray-900 tracking-tight">
              JorJek<span className="text-[#FF4F00]">.</span>
            </span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl px-4 sm:px-8">
          <div className="relative flex items-center w-full h-10 rounded-xl border border-gray-200 bg-[#FAFAFA] focus-within:bg-white focus-within:border-[#FF4F00] focus-within:ring-1 focus-within:ring-[#FF4F00] transition-all">
            <div className="grid place-items-center h-full w-10 text-gray-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              className="peer h-full w-full outline-none text-xs text-gray-800 placeholder-gray-400 bg-transparent pr-4 font-medium"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for skills, topics, or mentors (press Enter)..."
              onKeyDown={handleSearchKeyDown}
            />
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3 flex-shrink-0">
          
          {/* Create Post Button */}
          <button 
            type="button"
            onClick={() => {
              if (!user) {
                navigate('/auth/login');
              } else {
                setIsPostModalOpen(true);
              }
            }} 
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#FF4F00] text-white text-xs font-bold rounded-xl hover:bg-[#E64700] transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Post</span>
          </button>

          {/* Conditional Display: Login/Signup links vs Avatar Dropdown */}
          {!user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/auth/login"
                className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-gray-900 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/auth/signup"
                className="px-4 py-2 bg-white text-[#FF4F00] border border-[#FF4F00] text-xs font-bold rounded-xl hover:bg-orange-50 transition-colors"
              >
                Sign up
              </Link>
            </div>
          ) : (
            <div className="relative" ref={menuRef}>
              <button 
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center justify-center h-9 w-9 bg-[#111827] text-white text-xs font-bold rounded-full hover:ring-2 hover:ring-offset-2 hover:ring-gray-800 transition-all cursor-pointer shadow-xs"
                title="Account menu"
              >
                {user.initials || 'ME'}
              </button>

              {/* Profile Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {/* User Overview */}
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {user.displayName}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5 font-medium">
                      {user.email}
                    </p>
                  </div>

                  {/* Public Profile */}
                  <Link
                    to={`/user/${user.handle || 'me'}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>View Profile</span>
                  </Link>

                  {/* Settings */}
                  <Link
                    to="/settings"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Account Settings</span>
                  </Link>

                  {/* Log out */}
                  <div className="border-t border-gray-100 pt-1 mt-1">
                    <button 
                      type="button"
                      onClick={handleLogout} 
                      className="w-full flex items-center gap-2.5 text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Post Creation Modal */}
      <CreatePostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
        onPublish={(postPayload) => {
          console.log('Publishing new post:', postPayload);
        }}
      />
    </>
  );
}