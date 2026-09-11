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
    <div className="min-h-screen bg-[#FBFBFB] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block text-2xl font-black text-gray-900 tracking-tight">
            JorJek<span className="text-[#FF4F00]">.</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mt-2">Reset Password</h1>
          <p className="text-xs text-gray-500 mt-1">Enter your CADT email to receive a password reset link</p>
        </div>

        {isSent ? (
          <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-5 text-center">
            <span className="text-2xl">📬</span>
            <h3 className="text-xs font-bold text-gray-900 mt-2">Recovery Email Dispatched</h3>
            <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
              If an account is associated with <strong>{email}</strong>, check your student mailbox for reset instructions.
            </p>
            <Link to="/auth/login" className="inline-block mt-4 text-xs font-bold text-[#FF4F00] hover:underline">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                CADT Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. srun.vireak@student.cadt.edu.kh"
                className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-[#FF4F00] transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold py-3 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Send Reset Link
            </button>

            <div className="text-center pt-2">
              <Link to="/auth/login" className="text-xs font-semibold text-gray-500 hover:text-gray-800">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}