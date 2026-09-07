import React, { useState } from 'react';

export function AuthModal({ isOpen, onClose, initialTab = 'register', onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLoginSuccess) {
      onLoginSuccess({
        displayName: email.split('@')[0] || 'Yuki Osei',
        email: email,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-2">
          <span className="text-2xl font-black text-[#FF4F00] tracking-tight">jorjek.</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-gray-100 px-7 mt-2">
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'register' ? 'text-gray-900 border-[#FF4F00]' : 'text-gray-400 border-transparent'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'login' ? 'text-gray-900 border-[#FF4F00]' : 'text-gray-400 border-transparent'
            }`}
          >
            Log In
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-7 pt-6">
          <div className="mb-5">
            <h3 className="text-base font-bold text-gray-900">
              {activeTab === 'register' ? 'Join jorjek. to save posts' : 'Welcome back'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {activeTab === 'register'
                ? 'Create a free account to save posts, request mentoring sessions, and more.'
                : 'Log in to access your saved posts and mentoring sessions.'}
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="University email"
              required
              className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:bg-white focus:border-orange-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:bg-white focus:border-orange-500"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-5 py-3 rounded-xl font-bold text-sm text-white bg-[#FF4F00] hover:bg-[#E64700] transition-colors shadow-sm"
          >
            {activeTab === 'register' ? 'Create Account' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}