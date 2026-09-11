import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function OtpVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const userEmail = location.state?.email || 'your-cadt-email@student.cadt.edu.kh';
  const flowType = location.state?.from || 'signup';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const handleOtpChange = (index, val) => {
    if (isNaN(Number(val))) return;

    const updated = [...otp];
    updated[index] = val.slice(-1);
    setOtp(updated);

    // Auto-advance cursor to next input box
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

    // Direct user according to their flow:
    if (flowType === 'signup') {
      navigate('/auth/tech-interests');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
        
        <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 text-[#FF4F00] flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-gray-900">Check Your Email</h1>
        <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
          We sent a 6-digit confirmation code to: <br />
          <strong className="text-gray-900 font-semibold">{userEmail}</strong>
        </p>

        <form onSubmit={handleVerify} className="mt-8 space-y-6">
          {/* 6-box OTP Input */}
          <div className="flex justify-center gap-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-11 h-12 text-center text-lg font-black text-gray-900 bg-[#FAFAFA] border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={otp.join('').length < 6}
            className={`w-full text-white text-xs font-bold py-3 rounded-xl transition-all shadow-sm ${
              otp.join('').length === 6
                ? 'bg-[#FF4F00] hover:bg-[#E64700] cursor-pointer'
                : 'bg-orange-200 cursor-not-allowed'
            }`}
          >
            Verify & Continue
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-400">Didn't receive a code?</span>
          <button
            type="button"
            onClick={() => alert('New OTP code sent to your email.')}
            className="font-bold text-[#FF4F00] hover:underline"
          >
            Resend Code
          </button>
        </div>

      </div>
    </div>
  );
}