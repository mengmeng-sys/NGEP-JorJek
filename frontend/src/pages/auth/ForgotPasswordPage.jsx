import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSent(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FBFBFB] flex flex-col justify-center items-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-sm sm:max-w-md bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-xs p-5 sm:p-8">
        {/* Header */}
        <div className="text-center mb-5 sm:mb-6">
          <Link to="/" className="inline-block group">
            <img
              src="/jorjek_logo.jpg"
              alt="JorJek"
              className="h-9 sm:h-11 w-auto mx-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mt-3 leading-tight">
            Reset Password
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Enter your university email to receive recovery instructions
          </p>
        </div>

        {isSent ? (
          <div className="bg-orange-50/70 border border-orange-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center animate-in fade-in duration-150">
            <span className="text-3xl block">📬</span>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 mt-2.5">
              Recovery Link Sent
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-600 mt-1.5 leading-relaxed break-words">
              If an account exists for <strong className="text-gray-900">{email}</strong>, check your student inbox for the password reset link.
            </p>
            <div className="mt-5 space-y-2">
              <Link
                to="/auth/login"
                className="w-full inline-block bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
              >
                Return to Login
              </Link>
              <button
                type="button"
                onClick={() => setIsSent(false)}
                className="text-[11px] font-semibold text-gray-400 hover:text-gray-700 block w-full pt-1"
              >
                Try another email
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                University Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. srun.vireak@student.cadt.edu.kh"
                className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all shadow-2xs"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold py-2.5 sm:py-3 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
            >
              Send Reset Link
            </button>

            <div className="text-center pt-2 border-t border-gray-100">
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>

      {/* Campus Auth Footer */}
      <p className="text-[11px] text-gray-400 mt-6 text-center">
        Need help? Contact{' '}
        <Link to="/contact" className="text-[#FF4F00] font-semibold hover:underline">
          Campus Support
        </Link>
      </p>
    </div>
  );
}