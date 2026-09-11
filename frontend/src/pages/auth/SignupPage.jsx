import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');

  // Domain restriction validator
  const validateEmailDomain = (val) => {
    setEmail(val);
    const domainRegex = /@(student\.cadt\.edu\.kh|cadt\.edu\.kh)$/i;
    if (val && !domainRegex.test(val)) {
      setEmailError('Email must end with @student.cadt.edu.kh or @cadt.edu.kh');
    } else {
      setEmailError('');
    }
  };

  // Strong password checks
  const passwordCriteria = useMemo(() => ({
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  }), [password]);

  const isPasswordStrong = Object.values(passwordCriteria).every(Boolean);
  const isValidEmail = Boolean(email) && !emailError;

  const handleSignup = (e) => {
    e.preventDefault();
    if (!isPasswordStrong || !isValidEmail || !username.trim() || !dob) return;

    // Proceed to OTP verification with signup metadata passed
    navigate('/auth/verify-otp', {
      state: {
        email,
        from: 'signup',
        userMeta: { username, dob, gender },
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        
        <div className="text-center mb-6">
          <Link to="/" className="inline-block text-2xl font-black text-gray-900 tracking-tight">
            JorJek<span className="text-[#FF4F00]">.</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mt-2">Create CADT Account</h1>
          <p className="text-xs text-gray-500 mt-1">Join the university academic & mentoring exchange</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          
          {/* Username */}
          <div>
            <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
              Full Name / Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Srun Vireak"
              className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 outline-none focus:bg-white focus:border-[#FF4F00] transition-all"
            />
          </div>

          {/* DOB & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                Date of Birth
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:bg-white focus:border-[#FF4F00] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none focus:border-[#FF4F00]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Email with CADT restriction */}
          <div>
            <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
              University Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => validateEmailDomain(e.target.value)}
              placeholder="name@student.cadt.edu.kh"
              className={`w-full bg-[#FAFAFA] border rounded-xl px-4 py-2.5 text-xs text-gray-900 outline-none transition-all ${
                emailError ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#FF4F00]'
              }`}
            />
            {emailError && (
              <p className="text-[11px] text-red-600 font-semibold mt-1">{emailError}</p>
            )}
          </div>

          {/* Password with dynamic checklist */}
          <div>
            <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create strong password"
              className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 outline-none focus:bg-white focus:border-[#FF4F00] transition-all"
            />

            {/* Validation indicators */}
            <div className="grid grid-cols-2 gap-2 mt-2.5 bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-[11px]">
              <span className={`flex items-center gap-1.5 ${passwordCriteria.minLength ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                {passwordCriteria.minLength ? '✓' : '○'} Min 8 characters
              </span>
              <span className={`flex items-center gap-1.5 ${passwordCriteria.hasUpper ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                {passwordCriteria.hasUpper ? '✓' : '○'} Upper case letter
              </span>
              <span className={`flex items-center gap-1.5 ${passwordCriteria.hasNumber ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                {passwordCriteria.hasNumber ? '✓' : '○'} At least 1 number
              </span>
              <span className={`flex items-center gap-1.5 ${passwordCriteria.hasSpecial ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                {passwordCriteria.hasSpecial ? '✓' : '○'} Special character
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isPasswordStrong || !isValidEmail || !username.trim() || !dob}
            className={`w-full text-white text-xs font-bold py-3 rounded-xl transition-all shadow-sm mt-2 ${
              isPasswordStrong && isValidEmail && username.trim() && dob
                ? 'bg-[#FF4F00] hover:bg-[#E64700] cursor-pointer'
                : 'bg-orange-200 cursor-not-allowed'
            }`}
          >
            Continue to Verification
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-[#FF4F00] font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}