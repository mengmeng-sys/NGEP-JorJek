import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import MicrosoftAuthButton from '@/components/auth/MicrosoftAuthButton';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { resetPasswordMicrosoft } = useAuth();

  const [msIdToken, setMsIdToken] = useState('');
  const [verified, setVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const isPasswordValid = newPassword.length >= 6;

  const handleMicrosoft = ({ idToken }) => {
    setMsIdToken(idToken);
    setVerified(true);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) return;
    setError('');
    setSending(true);
    try {
      await resetPasswordMicrosoft(msIdToken, newPassword);
      setDone(true);
    } catch (err) {
      setError(err?.message || 'Could not reset password. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FBFBFB] flex flex-col justify-center items-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-sm sm:max-w-md bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-xs p-5 sm:p-8">
        <div className="text-center mb-5 sm:mb-6">
          <Link to="/" className="inline-block group">
            <img src="/jorjek_logo.jpg" alt="JorJek" className="h-9 sm:h-11 w-auto mx-auto object-contain transition-transform group-hover:scale-105" />
          </Link>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mt-3 leading-tight">Reset Password</h1>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
            {done ? 'Your password has been updated' : verified ? 'Enter your new password' : 'Verify your identity with Microsoft to reset your password'}
          </p>
        </div>

        {done ? (
          <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-4 sm:p-6 text-center">
            <span className="text-3xl block">✓</span>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 mt-2.5">Password Reset Successfully</h3>
            <p className="text-[11px] sm:text-xs text-gray-600 mt-1.5 leading-relaxed">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <button
              type="button"
              onClick={() => navigate('/auth/login')}
              className="w-full bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98 mt-5"
            >
              Go to Sign In
            </button>
          </div>
        ) : !verified ? (
          <div className="space-y-4">
            <MicrosoftAuthButton mode="reset" onSuccess={handleMicrosoft} />
            <div className="text-center pt-2 border-t border-gray-100">
              <Link to="/auth/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all shadow-2xs pr-14"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs font-bold p-1 cursor-pointer">
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {newPassword && !isPasswordValid && (
                <p className="text-[11px] text-red-600 font-semibold mt-1">Password must be at least 6 characters</p>
              )}
            </div>

            {error && (
              <p className="text-[11px] text-red-600 font-semibold bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={sending || !isPasswordValid}
              className="w-full bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold py-2.5 sm:py-3 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? 'Resetting…' : 'Reset Password'}
            </button>

            <div className="text-center pt-2 border-t border-gray-100">
              <Link to="/auth/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>

      <p className="text-[11px] text-gray-400 mt-6 text-center">
        Need help? Contact{' '}
        <Link to="/contact" className="text-[#FF4F00] font-semibold hover:underline">Campus Support</Link>
      </p>
    </div>
  );
}
