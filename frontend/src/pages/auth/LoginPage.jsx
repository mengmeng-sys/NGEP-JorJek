import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '@/config/msalConfig';
import { BackHomeArrow } from '@/components/shared/BackHomeArrow';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginMicrosoft, verifyMfa } = useAuth();
  const { instance, inProgress, accounts } = useMsal();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [totpCode, setTotpCode] = useState('');

   useEffect(() => {
     instance.handleRedirectPromise().then(async (res) => {
       if (res?.account) {
         instance.setActiveAccount(res.account);
         try {
           let idToken = res.idToken;
           if (!idToken) {
             try {
               const tokenRes = await instance.acquireTokenSilent(loginRequest, { account: res.account });
               idToken = tokenRes.idToken;
             } catch {
               await instance.acquireTokenRedirect(loginRequest);
               return;
             }
           }
           if (!idToken) {
             setError('Microsoft sign in failed. Please try again.');
             return;
           }
           await loginMicrosoft(idToken);
           navigate('/');
         } catch (err) {
           const msg = err?.message || '';
           if (msg.toLowerCase().includes('no account') || msg.includes('404')) {
             navigate('/auth/signup');
           } else {
             setError(msg || 'Microsoft sign in failed.');
           }
         }
       }
     }).catch(() => {});
   }, [instance]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      const result = await login(email.trim(), password);
      if (result?.mfaRequired) {
        setMfaToken(result.mfaToken);
        setMfaRequired(true);
        setSubmitting(false);
        return;
      }
      if (result?.mfaSetupRequired) {
        navigate("/auth/mfa-setup", { state: { mfaToken: result.mfaToken } });
        return;
      }
      const isAdmin = result?.role === 'SUPER_ADMIN' || result?.role === 'MODERATOR';
      navigate(isAdmin ? '/admin' : '/');
    } catch (err) {
      setError(err?.message || 'Sign in failed. Check your credentials and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMfaVerify = async (e) => {
    e.preventDefault();
    if (totpCode.length < 6) return;
    setError('');
    setSubmitting(true);
    try {
      const user = await verifyMfa(mfaToken, totpCode);
      const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'MODERATOR';
      navigate(isAdmin ? '/admin' : '/');
    } catch (err) {
      setError(err?.message || 'Invalid verification code. Please try again.');
      setTotpCode('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMfaBack = () => {
    setMfaRequired(false);
    setMfaToken('');
    setTotpCode('');
    setError('');
  };

  const handleMicrosoftLogin = async () => {
    setError('');
    try {
      await instance.loginRedirect(loginRequest);
    } catch (err) {
      setError('Microsoft sign in failed.');
    }
  };

  const account = accounts[0];

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-[#FBFBFB] dark:bg-gray-950">

      {/* Left Column: Academic Branding Hero (Desktop Only) */}
      <div className="hidden lg:flex flex-col justify-between bg-linear-to-br from-[#111827] via-[#161F30] to-[#1F2937] p-10 xl:p-14 text-white relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#FF4F00]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-50 dark:bg-blue-900/200/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <Link to="/" className="inline-block group">
            <img
              src="/jorjek_logo.jpg"
              alt="JorJek"
              className="h-10 w-auto object-contain rounded-lg transition-transform group-hover:scale-105"
            />
          </Link>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 uppercase tracking-widest font-bold">CADT Academic Knowledge Network</p>
        </div>
        <div className="relative z-10 max-w-lg space-y-4 my-auto py-10">
          <span className="inline-block px-2.5 py-1 bg-white dark:bg-gray-900/10 text-orange-400 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-wider">Campus Hub</span>
          <h2 className="text-2xl xl:text-3xl font-black leading-snug tracking-tight">Connect with campus mentors and verified coursework solutions.</h2>
          <p className="text-xs xl:text-sm text-gray-300 dark:text-gray-600 leading-relaxed font-normal">Ask targeted questions, join peer study sessions, and review code with CADT faculty and students.</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="bg-white dark:bg-gray-900/10 px-2.5 py-1 rounded-lg text-xs font-semibold text-orange-300">#C++</span>
            <span className="bg-white dark:bg-gray-900/10 px-2.5 py-1 rounded-lg text-xs font-semibold text-orange-300">#SQL</span>
            <span className="bg-white dark:bg-gray-900/10 px-2.5 py-1 rounded-lg text-xs font-semibold text-orange-300">#MachineLearning</span>
            <span className="bg-white dark:bg-gray-900/10 px-2.5 py-1 rounded-lg text-xs font-semibold text-orange-300">#Figma</span>
          </div>
        </div>
        <div className="relative z-10 text-[11px] text-gray-400 dark:text-gray-500 font-medium">© 2026 JorJek Campus. Verified for @cadt.edu.kh</div>
      </div>

      <div className="flex flex-col justify-center items-center px-4 py-8 sm:p-12 min-h-screen lg:min-h-0 relative">
        <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
          <BackHomeArrow />
        </div>
        <div className="w-full max-w-md sm:max-w-lg bg-white dark:bg-gray-900 sm:bg-transparent border sm:border-0 border-gray-200 dark:border-gray-800 rounded-2xl p-7 sm:p-0 shadow-xs sm:shadow-none space-y-5 sm:space-y-6">

          {/* Mobile Header Brand */}
          <div className="lg:hidden text-center mb-4">
            <Link to="/" className="inline-block group">
              <img
                src="/jorjek_logo.jpg"
                alt="JorJek"
                className="h-10 w-auto mx-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              {mfaRequired ? 'Two-Factor Authentication' : 'Welcome Back'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {mfaRequired
                ? 'Enter the 6-digit code from your authenticator app'
                : 'Sign in with your CADT university credentials'}
            </p>
          </div>

          {mfaRequired ? (
            <form onSubmit={handleMfaVerify} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-1.5">Verification Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full bg-[#FAFAFA] dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 sm:px-4 py-3 sm:py-3.5 text-xs text-center tracking-[0.4em] text-gray-900 dark:text-gray-100 outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all shadow-2xs"
                />
              </div>
              {error && (
                <p className="text-[11px] sm:text-xs text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-900/20 border border-red-100 rounded-lg px-3 py-2">{error}</p>
              )}
              <button type="submit" disabled={submitting || totpCode.length < 6} className="w-full bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold py-3 sm:py-3.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting ? 'Verifying…' : 'Verify'}
              </button>
              <button type="button" onClick={handleMfaBack} className="w-full text-center text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-semibold cursor-pointer">
                Back to sign in
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-1.5">CADT Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. srun.vireak@student.cadt.edu.kh" className="w-full bg-[#FAFAFA] dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs text-gray-900 dark:text-gray-100 outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all shadow-2xs" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Password</label>
                  <Link to="/auth/forgot-password" className="text-[11px] sm:text-xs font-semibold text-[#FF4F00] hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full bg-[#FAFAFA] dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs text-gray-900 dark:text-gray-100 outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all shadow-2xs pr-14" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs font-bold p-1 cursor-pointer">
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              {error && (
                <p className="text-[11px] sm:text-xs text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-900/20 border border-red-100 rounded-lg px-3 py-2">{error}</p>
              )}
              <button type="submit" disabled={submitting} className="w-full bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold py-3 sm:py-3.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          )}

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            <span className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold">OR</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          </div>

          <button
            type="button"
            onClick={handleMicrosoftLogin}
            disabled={inProgress !== 'none'}
            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 sm:py-3 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 transition-all shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1h10v10H1z" fill="#F25022"/>
              <path d="M12 1h10v10H12z" fill="#7FBA00"/>
              <path d="M1 12h10v10H1z" fill="#00A4EF"/>
              <path d="M12 12h10v10H12z" fill="#FFB900"/>
            </svg>
            {inProgress !== 'none' ? 'Redirecting…' : 'Sign in with Microsoft'}
          </button>

          <div className="text-center pt-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              New to the platform?{' '}
              <Link to="/auth/signup" className="text-[#FF4F00] font-bold hover:underline">Create student account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};