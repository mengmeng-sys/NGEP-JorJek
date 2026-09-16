import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '@/config/msalConfig';
import { BackHomeArrow } from '@/components/shared/BackHomeArrow';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginMicrosoft } = useAuth();
  const { instance, inProgress, accounts } = useMsal();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    instance.handleRedirectPromise().then(async (res) => {
      if (res?.account) {
        instance.setActiveAccount(res.account);
        try {
          let idToken = res.idToken;
          if (!idToken) {
            const tokenRes = await instance.acquireTokenSilent(loginRequest);
            idToken = tokenRes.idToken;
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
      const loggedInUser = await login(email.trim(), password);
      const isAdmin = loggedInUser?.role === 'SUPER_ADMIN' || loggedInUser?.role === 'MODERATOR';
      navigate(isAdmin ? '/admin' : '/');
    } catch (err) {
      setError(err?.message || 'Sign in failed. Check your credentials and try again.');
    } finally {
      setSubmitting(false);
    }
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
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-[#FBFBFB]">

      {/* Left Column: Academic Branding Hero (Desktop Only) */}
      <div className="hidden lg:flex flex-col justify-between bg-linear-to-br from-[#111827] via-[#161F30] to-[#1F2937] p-10 xl:p-14 text-white relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#FF4F00]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <Link to="/" className="inline-block group">
            <img
              src="/jorjek_logo.jpg"
              alt="JorJek"
              className="h-10 w-auto object-contain rounded-lg transition-transform group-hover:scale-105"
            />
          </Link>
          <p className="text-[11px] text-gray-400 mt-2 uppercase tracking-widest font-bold">CADT Academic Knowledge Network</p>
        </div>
        <div className="relative z-10 max-w-lg space-y-4 my-auto py-10">
          <span className="inline-block px-2.5 py-1 bg-white/10 text-orange-400 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-wider">Campus Hub</span>
          <h2 className="text-2xl xl:text-3xl font-black leading-snug tracking-tight">Connect with campus mentors and verified coursework solutions.</h2>
          <p className="text-xs xl:text-sm text-gray-300 leading-relaxed font-normal">Ask targeted questions, join peer study sessions, and review code with CADT faculty and students.</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="bg-white/10 px-2.5 py-1 rounded-lg text-xs font-semibold text-orange-300">#C++</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg text-xs font-semibold text-orange-300">#SQL</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg text-xs font-semibold text-orange-300">#MachineLearning</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg text-xs font-semibold text-orange-300">#Figma</span>
          </div>
        </div>
        <div className="relative z-10 text-[11px] text-gray-400 font-medium">© 2026 JorJek Campus. Verified for @cadt.edu.kh</div>
      </div>

      <div className="flex flex-col justify-center items-center px-4 py-8 sm:p-12 min-h-screen lg:min-h-0 relative">
        <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
          <BackHomeArrow />
        </div>
        <div className="w-full max-w-sm sm:max-w-md bg-white sm:bg-transparent border sm:border-0 border-gray-200 rounded-2xl p-6 sm:p-0 shadow-xs sm:shadow-none space-y-5 sm:space-y-6">

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
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Welcome Back</h1>
            <p className="text-xs text-gray-500 mt-1">Sign in with your CADT university credentials</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">CADT Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. srun.vireak@student.cadt.edu.kh" className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all shadow-2xs" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Password</label>
                <Link to="/auth/forgot-password" className="text-[11px] sm:text-xs font-semibold text-[#FF4F00] hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all shadow-2xs pr-14" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs font-bold p-1 cursor-pointer">
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-[11px] sm:text-xs text-red-600 font-semibold bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}
            <button type="submit" disabled={submitting} className="w-full bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold py-3 sm:py-3.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-[11px] text-gray-400 font-semibold">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <button
            type="button"
            onClick={handleMicrosoftLogin}
            disabled={inProgress !== 'none'}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-xl px-4 py-2.5 sm:py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1h10v10H1z" fill="#F25022"/>
              <path d="M12 1h10v10H12z" fill="#7FBA00"/>
              <path d="M1 12h10v10H1z" fill="#00A4EF"/>
              <path d="M12 12h10v10H12z" fill="#FFB900"/>
            </svg>
            {inProgress !== 'none' ? 'Redirecting…' : 'Sign in with Microsoft'}
          </button>

          <div className="text-center pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              New to the platform?{' '}
              <Link to="/auth/signup" className="text-[#FF4F00] font-bold hover:underline">Create student account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};