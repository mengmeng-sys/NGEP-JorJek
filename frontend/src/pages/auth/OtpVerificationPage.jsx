import React, { useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext'; // 👈 1. Import useAuth

export default function OtpVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth(); // 👈 2. Get login function

  const userEmail = location.state?.email || 'srun.vireak@student.cadt.edu.kh';
  const flowType = location.state?.from || 'signup';
  const userMeta = location.state?.userMeta || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const handleOtpChange = (index, val) => {
    if (val.length > 1) {
      const pastedDigits = val.replace(/\D/g, '').slice(0, 6).split('');
      if (pastedDigits.length > 0) {
        const updated = [...otp];
        pastedDigits.forEach((digit, i) => {
          if (i < 6) updated[i] = digit;
        });
        setOtp(updated);
        const nextIndex = Math.min(pastedDigits.length, 5);
        inputRefs.current[nextIndex]?.focus();
      }
      return;
    }

    if (isNaN(Number(val))) return;

    const updated = [...otp];
    updated[index] = val.slice(-1);
    setOtp(updated);

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const fullCode = otp.join('');
    if (fullCode.length < 6) return;

    // 👈 3. THIS IS THE MISSING PIECE: Register the user session in AuthContext!
    const activeUser = {
      id: 'user_srun_vireak',
      displayName: userMeta.username || 'Srun Vireak',
      handle: (userMeta.username || 'srunvireak').toLowerCase().replace(/\s+/g, ''),
      email: userEmail,
      initials: 'SV',
      role: 'STUDENT',
    };

    if (login) {
      login(activeUser);
    }

    if (flowType === 'signup') {
      navigate('/auth/tech-interests');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FBFBFB] flex flex-col justify-center items-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-sm sm:max-w-md bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-xs p-5 sm:p-8 text-center">
        
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-50 border border-orange-100 text-[#FF4F00] flex items-center justify-center mx-auto mb-3.5 sm:mb-4">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
          Check Your Email
        </h1>
        
        <p className="text-[11px] sm:text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed break-words">
          We sent a 6-digit confirmation code to: <br />
          <strong className="text-gray-900 font-semibold">{userEmail}</strong>
        </p>

        <form onSubmit={handleVerify} className="mt-6 sm:mt-8 space-y-5 sm:space-y-6">
          <div className="flex justify-center items-center gap-1.5 xs:gap-2 sm:gap-2.5">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-10 h-12 xs:w-11 xs:h-13 sm:w-12 sm:h-14 text-center text-base sm:text-lg font-black text-gray-900 bg-[#FAFAFA] border border-gray-200 rounded-lg sm:rounded-xl outline-none focus:bg-white focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all shadow-2xs"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={otp.join('').length < 6}
            className={`w-full text-xs font-bold py-3 sm:py-3.5 rounded-xl transition-all shadow-xs ${
              otp.join('').length === 6
                ? 'bg-[#FF4F00] hover:bg-[#E64700] text-white cursor-pointer active:scale-98'
                : 'bg-orange-200 text-white/90 cursor-not-allowed'
            }`}
          >
            Verify & Continue
          </button>
        </form>

        <div className="mt-5 sm:mt-6 pt-5 border-t border-gray-100 flex flex-col xs:flex-row items-center justify-between gap-2 text-[11px] sm:text-xs">
          <span className="text-gray-400">Didn't receive a code?</span>
          <button
            type="button"
            onClick={() => alert('New OTP code sent to your email.')}
            className="font-bold text-[#FF4F00] hover:underline cursor-pointer"
          >
            Resend Code
          </button>
        </div>

      </div>

      <div className="mt-4 text-center">
        <Link
          to={flowType === 'signup' ? '/auth/signup' : '/auth/login'}
          className="text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors"
        >
          ← Back to {flowType === 'signup' ? 'registration' : 'sign in'}
        </Link>
      </div>
    </div>
  );
}