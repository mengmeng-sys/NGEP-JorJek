import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    navigate('/auth/verify-otp', { state: { email, from: 'login' } });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#FBFBFB]">
      
      {/* Left Column: Academic Branding Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#111827] to-[#1F2937] p-12 text-white relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="text-2xl font-black tracking-tight text-white inline-block">
            JorJek<span className="text-[#FF4F00]">.</span>
          </Link>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">
            CADT Academic Knowledge Network
          </p>
        </div>

        <div className="relative z-10 max-w-md space-y-4">
          <h2 className="text-3xl font-bold leading-tight">
            Connect with campus mentors and solved coursework.
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed font-normal">
            Ask technical questions, join peer study sessions, and review code with CADT faculty and students.
          </p>
          <div className="flex gap-2 pt-2">
            <span className="bg-white/10 px-3 py-1 rounded-lg text-xs font-semibold text-orange-300">#C++</span>
            <span className="bg-white/10 px-3 py-1 rounded-lg text-xs font-semibold text-orange-300">#SQL</span>
            <span className="bg-white/10 px-3 py-1 rounded-lg text-xs font-semibold text-orange-300">#MachineLearning</span>
          </div>
        </div>

        <div className="relative z-10 text-xs text-gray-400 font-medium">
          © 2026 JorJek Campus. Exclusive to @cadt.edu.kh
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="flex flex-col justify-center items-center p-8 sm:p-12">
        <div className="w-full max-w-sm space-y-6">
          
          <div className="lg:hidden text-center mb-6">
            <Link to="/" className="text-2xl font-black text-gray-900 tracking-tight">
              JorJek<span className="text-[#FF4F00]">.</span>
            </Link>
          </div>

          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Welcome Back</h1>
            <p className="text-xs text-gray-500 mt-1">Sign in with your CADT university credentials</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none focus:border-[#FF4F00] transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/auth/forgot-password" className="text-xs font-semibold text-[#FF4F00] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none focus:border-[#FF4F00] transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs font-semibold"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Sign In
            </button>
          </form>

          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              New to the platform?{' '}
              <Link to="/auth/signup" className="text-[#FF4F00] font-bold hover:underline">
                Create student account
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}