import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from './NotificationBell';
import { CreatePostModal } from '@/components/post/CreatePostModal';
import { AuthModal } from '@/components/auth/AuthModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');

  const openAuth = (tab) => {
    setAuthTab(tab);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 z-40 relative">
        {/* Brand */}
        <div className="flex-shrink-0 flex items-center gap-4">
          <Link to="/" className="flex items-center">
            <img src="/jorjek_logo.jpg" alt="JorJek Logo" className="h-12 w-auto" />
          </Link>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-2xl px-8">
          <div className="relative flex items-center w-full h-11 rounded-lg border border-gray-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-orange-200 focus-within:border-orange-500 transition-all shadow-sm">
            <div className="grid place-items-center h-full w-12 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              className="peer h-full w-full outline-none text-sm text-gray-700 placeholder-gray-400 pr-2"
              type="text"
              placeholder="Search for skills, topics, or mentors..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(`/search?q=${e.target.value}`);
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <button 
            onClick={() => setIsPostModalOpen(true)} 
            className="flex items-center justify-center px-5 py-2.5 bg-[#FF4F00] text-white text-sm font-bold rounded-lg hover:bg-[#E64700] transition-colors shadow-sm"
          >
            + Post
          </button>

          {!user ? (
            <button 
              onClick={() => openAuth('login')}
              className="flex items-center justify-center px-5 py-2.5 bg-white text-[#FF4F00] text-sm font-bold rounded-lg border border-[#FF4F00] hover:bg-orange-50 transition-colors"
            >
              Log in
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="relative group cursor-pointer">
                <button className="flex items-center justify-center h-10 w-10 bg-[#111827] text-white text-sm font-bold rounded-full hover:ring-2 hover:ring-offset-2 hover:ring-gray-800 transition-all">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                </button>
                <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Post Modal */}
      <CreatePostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        initialTab={authTab}
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
}