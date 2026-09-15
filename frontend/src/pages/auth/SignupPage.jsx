import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { BackHomeArrow } from '@/components/shared/BackHomeArrow';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signupEmail } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gen, setGen] = useState('');
  const [department, setDepartment] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const departmentOptions = [
    {
      name: 'Computer Science',
      specializations: ['Software Engineering', 'Data Science'],
    },
    {
      name: 'Telecommunications and Networking',
      specializations: ['Telecommunications and Networking Engineering', 'Cybersecurity'],
    },
    {
      name: 'Digital Business',
      specializations: ['E-commerce'],
    },
  ];

  const availableSpecializations = departmentOptions.find((d) => d.name === department)?.specializations || [];

  const handleDepartmentChange = (deptName) => {
    setDepartment(deptName);
    setSpecialization('');
  };

  // Domain restriction validator — mirrors the backend's CADT_EMAIL_DOMAIN gate.
  const validateEmailDomain = (val) => {
    setEmail(val);
    const domainRegex = /@student\.cadt\.edu\.kh$/i;
    if (val && !domainRegex.test(val)) {
      setEmailError('Email must end with @student.cadt.edu.kh');
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
  const isFormValid = isPasswordStrong && isValidEmail && Boolean(username.trim()) && Boolean(gen) && Boolean(department) && Boolean(specialization);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setSubmitError('');
    setSubmitting(true);
    try {
      await signupEmail({
        displayName: username.trim(),
        cadtEmail: email.trim(),
        password,
        role: 'STUDENT',
        gen: Number(gen),
        department: department.trim(),
        specialization: specialization.trim(),
      });
      navigate('/auth/verify-otp', {
        state: {
          email,
          from: 'signup',
          userMeta: { username },
        },
      });
    } catch (err) {
      setSubmitError(err?.message || 'We could not create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FBFBFB] flex flex-col justify-center items-center px-3.5 sm:px-6 py-6 sm:py-12 relative">
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
        <BackHomeArrow />
      </div>
      <div className="w-full max-w-md sm:max-w-lg bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-xs p-5 sm:p-8">
        
        {/* Header with Brand Asset */}
        <div className="text-center mb-5 sm:mb-6">
          <Link to="/" className="inline-block group">
            <img 
              src="/jorjek_logo.jpg" 
              alt="JorJek" 
              className="h-9 sm:h-11 w-auto mx-auto object-contain transition-transform group-hover:scale-105" 
            />
          </Link>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mt-2.5 sm:mt-3 leading-tight">
            Create CADT Account
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Join the university academic & mentoring exchange
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-3.5 sm:space-y-4">
          
          {/* Full Name / Username */}
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
              className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all shadow-2xs"
            />
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
              className={`w-full bg-[#FAFAFA] border rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs text-gray-900 outline-none transition-all shadow-2xs ${
                emailError 
                  ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20' 
                  : 'border-gray-200 focus:bg-white focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00]'
              }`}
            />
            {emailError && (
              <p className="text-[11px] text-red-600 font-semibold mt-1 leading-snug">
                {emailError}
              </p>
            )}
          </div>

          {/* Password with dynamic checklist */}
          <div>
            <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create strong password"
                className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all shadow-2xs pr-14"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs font-bold p-1 cursor-pointer"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Validation indicators */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 mt-2.5 bg-[#FAFAFA] p-2.5 sm:p-3 rounded-xl border border-gray-100 text-[10px] sm:text-[11px]">
              <span className={`flex items-center gap-1.5 ${passwordCriteria.minLength ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                <span>{passwordCriteria.minLength ? '✓' : '○'}</span> Min 8 characters
              </span>
              <span className={`flex items-center gap-1.5 ${passwordCriteria.hasUpper ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                <span>{passwordCriteria.hasUpper ? '✓' : '○'}</span> Uppercase letter
              </span>
              <span className={`flex items-center gap-1.5 ${passwordCriteria.hasNumber ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                <span>{passwordCriteria.hasNumber ? '✓' : '○'}</span> At least 1 number
              </span>
              <span className={`flex items-center gap-1.5 ${passwordCriteria.hasSpecial ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                <span>{passwordCriteria.hasSpecial ? '✓' : '○'}</span> Special character
              </span>
            </div>
          </div>

          {/* Gen */}
          <div>
            <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
              Generation (Gen)
            </label>
            <input
              type="number"
              min="1"
              value={gen}
              onChange={(e) => setGen(e.target.value)}
              placeholder="e.g. 8"
              className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all shadow-2xs"
            />
          </div>

          {/* Department Selector */}
          <div>
            <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
              Department
            </label>
            <div className="grid grid-cols-1 gap-2">
              {departmentOptions.map((dept) => (
                <button
                  key={dept.name}
                  type="button"
                  onClick={() => handleDepartmentChange(dept.name)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    department === dept.name
                      ? 'bg-[#FF4F00] border-[#FF4F00] text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-[#FF4F00] hover:text-[#FF4F00]'
                  }`}
                >
                  {dept.name}
                </button>
              ))}
            </div>
          </div>

          {/* Specialization — only shows after department is selected */}
          {department && availableSpecializations.length > 0 && (
            <div>
              <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                Specialization
              </label>
              <div className="grid grid-cols-1 gap-2">
                {availableSpecializations.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => setSpecialization(spec === specialization ? '' : spec)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      specialization === spec
                        ? 'bg-[#FF4F00] border-[#FF4F00] text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-[#FF4F00] hover:text-[#FF4F00]'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          )}

          {submitError && (
            <p className="text-[11px] text-red-600 font-semibold bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={!isFormValid || submitting}
            className={`w-full text-xs font-bold py-3 sm:py-3.5 rounded-xl transition-all shadow-xs mt-2 ${
              isFormValid && !submitting
                ? 'bg-[#FF4F00] hover:bg-[#E64700] text-white cursor-pointer active:scale-98'
                : 'bg-orange-200 text-white/90 cursor-not-allowed'
            }`}
          >
            {submitting ? 'Creating account…' : 'Continue to Verification'}
          </button>
        </form>

        <div className="text-center mt-5 sm:mt-6 pt-5 border-t border-gray-100">
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