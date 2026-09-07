import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function AuthModal({ isOpen, onClose, initialTab = 'register' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'register' or 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, signup } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setEmail('');
      setPassword('');
      setError('');
      setSubmitting(false);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (activeTab === 'login') {
        await login(email, password);
      } else {
        await signup(email, password, email.split('@')[0] || 'User');
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
        
        {/* Header with Brand & Close Icon */}
        <div className="flex items-center justify-between px-7 pt-6 pb-2">
          <span className="text-2xl font-black text-[#FF4F00] tracking-tight">jorjek.</span>
          <button 
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-gray-100 px-7 mt-2">
          <button
            type="button"
            onClick={() => switchTab('register')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'register'
                ? 'text-gray-900 border-[#FF4F00]'
                : 'text-gray-400 border-transparent hover:text-gray-700'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => switchTab('login')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'login'
                ? 'text-gray-900 border-[#FF4F00]'
                : 'text-gray-400 border-transparent hover:text-gray-700'
            }`}
          >
            Log In
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-7 pt-6">
          {activeTab === 'register' ? (
            <div className="mb-5">
              <h3 className="text-base font-bold text-gray-900">Join jorjek. to save posts</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Create a free account to save posts, request mentoring sessions, and more.
              </p>
            </div>
          ) : (
            <div className="mb-5">
              <h3 className="text-base font-bold text-gray-900">Welcome back</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Log in to access your saved posts and mentoring sessions.
              </p>
            </div>
          )}

          {/* Form Inputs */}
          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="University email"
              required
              className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            />
          </div>

          {error && (
            <p className="mt-3 text-xs font-semibold text-red-600">{error}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-5 py-3 rounded-xl font-bold text-sm text-white bg-[#FF9E79] hover:bg-[#FF4F00] transition-colors shadow-sm disabled:opacity-60"
          >
            {submitting ? 'Please wait…' : activeTab === 'register' ? 'Create Account' : 'Log In'}
          </button>

          {/* Bottom Switch Link */}
          <div className="mt-5 text-center">
            {activeTab === 'register' ? (
              <p className="text-xs text-gray-500 font-medium">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className="font-bold text-[#FF4F00] hover:underline"
                >
                  Log in
                </button>
              </p>
            ) : (
              <p className="text-xs text-gray-500 font-medium">
                New to jorjek.?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('register')}
                  className="font-bold text-[#FF4F00] hover:underline"
                >
                  Register
                </button>
              </p>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}