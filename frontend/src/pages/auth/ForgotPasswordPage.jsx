import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '@/config/msalConfig';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { resetPasswordMicrosoft } = useAuth();
  const { instance, inProgress, accounts } = useMsal();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    instance.handleRedirectPromise().then((res) => {
      if (res?.account) {
        setAccount(res.account);
        instance.setActiveAccount(res.account);
      }
    }).catch(() => {});
  }, [instance]);

  const passwordCriteria = useMemo(() => ({
    minLength: newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecial: /[^A-Za-z0-9]/.test(newPassword),
  }), [newPassword]);

  const isPasswordStrong = Object.values(passwordCriteria).every(Boolean);
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isFormValid = isPasswordStrong && doPasswordsMatch;

  const handleMicrosoft = async () => {
    setError('');
    try {
      await instance.loginRedirect(loginRequest);
    } catch (err) {
      setError('Microsoft sign in failed. Please try again.');
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!isFormValid || !account) return;
    setError('');
    setSending(true);
    try {
      let idToken = '';
      try {
        const tokenResult = await instance.acquireTokenSilent(loginRequest, { account });
        idToken = tokenResult.idToken;
      } catch {
        await instance.acquireTokenRedirect(loginRequest);
        return;
      }
      if (!idToken) {
        setError('Could not verify your identity. Please try again.');
        setSending(false);
        return;
      }
      await resetPasswordMicrosoft(idToken, newPassword);
      setDone(true);
    } catch (err) {
      setError(err?.message || 'Could not reset password. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FBFBFB] dark:bg-gray-950 flex flex-col justify-center items-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl shadow-xs p-5 sm:p-8">
        <div className="text-center mb-5 sm:mb-6">
          <Link to="/" className="inline-block group">
            <img src="/jorjek_logo.jpg" alt="JorJek" className="h-9 sm:h-11 w-auto mx-auto object-contain transition-transform group-hover:scale-105" />
          </Link>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mt-3 leading-tight">Reset Password</h1>
          <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
            {done ? 'Your password has been updated' : account ? 'Enter your new password' : 'Verify your identity with Microsoft to reset your password'}
          </p>
        </div>

        {done ? (
          <div className="bg-orange-50 dark:bg-orange-900/20/70 border border-orange-200 dark:border-orange-900/30 rounded-xl p-4 sm:p-6 text-center">
            <span className="text-3xl block">✓</span>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 mt-2.5">Password Reset Successfully</h3>
            <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <button type="button" onClick={() => {
              const msalAccounts = instance.getAllAccounts();
              if (msalAccounts.length > 0) {
                instance.logoutRedirect({
                  account: msalAccounts[0],
                  postLogoutRedirectUri: window.location.origin + '/auth/login',
                });
              } else {
                navigate('/auth/login');
              }
            }} className="w-full bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98 mt-5">
              Go to Sign In
            </button>
          </div>
        ) : !account ? (
          <div className="space-y-4">
            <button type="button" onClick={handleMicrosoft} disabled={inProgress !== 'none'} className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 sm:py-3 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 transition-all shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
              <svg width="18" height="18" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1h10v10H1z" fill="#F25022"/>
                <path d="M12 1h10v10H12z" fill="#7FBA00"/>
                <path d="M1 12h10v10H1z" fill="#00A4EF"/>
                <path d="M12 12h10v10H12z" fill="#FFB900"/>
              </svg>
              {inProgress !== 'none' ? 'Redirecting…' : 'Verify with Microsoft'}
            </button>
            {error && (
              <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-900/20 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}
            <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-800">
              <button type="button" onClick={() => navigate('/auth/login')} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 transition-colors cursor-pointer">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Sign In</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-1.5">New Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="w-full bg-[#FAFAFA] dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs text-gray-900 dark:text-gray-100 outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all shadow-2xs pr-14" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs font-bold p-1 cursor-pointer">
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-lg p-3 space-y-1">
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Password Requirements</p>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold ${passwordCriteria.minLength ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>{passwordCriteria.minLength ? '✓' : '○'}</span>
                <span className={`text-[10px] ${passwordCriteria.minLength ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>At least 8 characters</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold ${passwordCriteria.hasUpper ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>{passwordCriteria.hasUpper ? '✓' : '○'}</span>
                <span className={`text-[10px] ${passwordCriteria.hasUpper ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>One uppercase letter</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold ${passwordCriteria.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>{passwordCriteria.hasNumber ? '✓' : '○'}</span>
                <span className={`text-[10px] ${passwordCriteria.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>One number</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold ${passwordCriteria.hasSpecial ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>{passwordCriteria.hasSpecial ? '✓' : '○'}</span>
                <span className={`text-[10px] ${passwordCriteria.hasSpecial ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>One special character</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-1.5">Confirm Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" className={`w-full bg-[#FAFAFA] dark:bg-gray-800 border rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs text-gray-900 dark:text-gray-100 outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all shadow-2xs pr-14${confirmPassword && !doPasswordsMatch ? 'border-red-300' : 'border-gray-200 dark:border-gray-800'}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs font-bold p-1 cursor-pointer">
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {confirmPassword && !doPasswordsMatch && (
                <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold mt-1">Passwords do not match</p>
              )}
            </div>

            {error && (
              <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-900/20 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}
            <button type="submit" disabled={sending || !isFormValid} className="w-full bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold py-2.5 sm:py-3 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed">
              {sending ? 'Resetting…' : 'Reset Password'}
            </button>
            <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-800">
              <button type="button" onClick={() => {
                const msalAccounts = instance.getAllAccounts();
                if (msalAccounts.length > 0) {
                  instance.logoutRedirect({
                    account: msalAccounts[0],
                    postLogoutRedirectUri: window.location.origin + '/auth/login',
                  });
                } else {
                  navigate('/auth/login');
                }
              }} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 transition-colors cursor-pointer">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        )}
      </div>

      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-6 text-center">
        Need help? Contact{' '}
        <Link to="/contact" className="text-[#FF4F00] font-semibold hover:underline">Campus Support</Link>
      </p>
    </div>
  );
}
