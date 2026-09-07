import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreatePostModal } from '@/components/post/CreatePostModal';
import { AuthModal } from '@/components/auth/AuthModal';

export default function Navbar() {
  const navigate = useNavigate();
  
  // Controls logged-in user state
  const [user, setUser] = useState(null); 
  
  // Modal visibility states
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Opens the Auth Modal with specified tab
  const openAuth = (tab) => {
    setAuthTab(tab);
    setIsAuthModalOpen(true);
  };

  // Called when the user clicks Login or Register inside AuthModal
  const handleLoginSuccess = (userData) => {
    setUser(userData || { displayName: 'Yuki Osei', email: 'yo@university.edu' });
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-3 bg-white border-b border-gray-200">
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center">
          <Link to="/" className="flex items-center">
            <img src="/jorjek_logo.jpg" alt="jorjek logo" className="h-10 w-auto object-contain" />
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl px-8">
          <div className="relative flex items-center w-full h-11 rounded-xl border border-gray-200 bg-[#FAFAFA] focus-within:bg-white focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all">
            <div className="grid place-items-center h-full w-12 text-gray-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              className="peer h-full w-full outline-none text-sm text-gray-800 placeholder-gray-400 bg-transparent pr-4"
              type="text"
              placeholder="Search for skills, topics, or mentors..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(`/?tag=${e.target.value}`);
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button 
            onClick={() => setIsPostModalOpen(true)} 
            className="flex items-center justify-center px-5 py-2 bg-[#FF4F00] text-white text-sm font-bold rounded-xl hover:bg-[#E64700] transition-colors shadow-sm"
          >
            + Post
          </button>

          {/* Conditional Rendering: Login Button VS Profile Icon */}
          {!user ? (
            <button 
              onClick={() => openAuth('login')}
              className="flex items-center justify-center px-5 py-2 bg-white text-[#FF4F00] text-sm font-bold rounded-xl border border-[#FF4F00] hover:bg-orange-50 transition-colors"
            >
              Log in
            </button>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center justify-center h-10 w-10 bg-[#111827] text-white text-xs font-bold rounded-full hover:ring-2 hover:ring-offset-2 hover:ring-gray-800 transition-all"
              >
                YO
              </button>

              {/* Profile Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-150 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {/* User Info Header */}
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {user.displayName || 'oengnaly2005'}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      {user.email || 'oengnaly2005@gmail.com'}
                    </p>
                  </div>

                  {/* Settings Link */}
                  <Link
                    to="/settings"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Settings</span>
                  </Link>

                  {/* Log out */}
                  <div className="border-t border-gray-100 pt-1">
                    <button 
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

      {/* Modals */}
      <CreatePostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        initialTab={authTab} 
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}