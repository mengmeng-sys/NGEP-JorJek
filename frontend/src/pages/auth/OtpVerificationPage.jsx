import React, { useState, useRef, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { BackHomeArrow } from '@/components/shared/BackHomeArrow';

export default function OtpVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail, resendOtp, resetPassword, forgotPassword } = useAuth();

  const userEmail = location.state?.email || 'srun.vireak@student.cadt.edu.kh';
  const flowType = location.state?.from || 'signup';
  // The reset flow may already have sent the OTP from ForgotPasswordPage.
  const isResetFlow = flowType === 'reset' || flowType === 'forgot-password';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const inputRefs = useRef([]);

  // Strong password checks — mirrors SignupPage
  const passwordCriteria = useMemo(() => ({
    minLength: newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecial: /[^A-Za-z0-9]/.test(newPassword),
  }), [newPassword]);

  const isPasswordStrong = Object.values(passwordCriteria).every(Boolean);

  // If we landed here directly for a reset, trigger the forgot-password OTP once.
  React.useEffect(() => {
    if (isResetFlow && !location.state?.otpSent) {
      forgotPassword(userEmail)
        .then(() => setInfo('We sent a 6-digit code to your email.'))
        .catch((err) => setError(err?.message || 'Could not send the reset code.'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullCode = otp.join('');
    if (fullCode.length < 6) return;
    setError('');
    setVerifying(true);

    try {
      if (isResetFlow) {
        if (!isPasswordStrong) {
          setError('Password does not meet the requirements below.');
          setVerifying(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setError('Passwords do not match.');
          setVerifying(false);
          return;
        }
        await resetPassword(userEmail, fullCode, newPassword);
        navigate('/auth/login', { state: { resetDone: true } });
      } else {
        await verifyEmail(userEmail, fullCode);
        navigate('/auth/tech-interests');
      }
    } catch (err) {
      setError(err?.message || 'That code did not work. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setSending(true);
    setError('');
    setInfo('');
    try {
      if (isResetFlow) {
        await forgotPassword(userEmail);
      } else {
        await resendOtp(userEmail);
      }
      setInfo('New code sent. Check your student inbox.');
    } catch (err) {
      setError(err?.message || 'Could not resend the code.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FBFBFB] flex flex-col justify-center items-center px-4 sm:px-6 py-8 sm:py-12 relative">
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
        <BackHomeArrow />
      </div>
      <div className="w-full max-w-sm sm:max-w-md bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-xs p-5 sm:p-8 text-center">

        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-50 border border-orange-100 text-[#FF4F00] flex items-center justify-center mx-auto mb-3.5 sm:mb-4">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
          {isResetFlow ? 'Reset Your Password' : 'Check Your Email'}
        </h1>

        <p className="text-[11px] sm:text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed break-words">
          {isResetFlow
            ? 'Enter the 6-digit code we sent to:  '
            : 'We sent a 6-digit confirmation code to: <br/>'}
          <strong className="text-gray-900 font-semibold">{userEmail}</strong>
        </p>

        {(error || info) && (
          <p className={`text-[11px] sm:text-xs mt-3 rounded-lg px-3 py-2 border ${
            error
              ? 'text-red-600 bg-red-50 border-red-100'
              : 'text-emerald-700 bg-emerald-50 border-emerald-100'
          }`}>
            {error || info}
          </p>
        )}

        <form onSubmit={handleVerify} className="mt-5 sm:mt-6 space-y-5 sm:space-y-6">
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

          {isResetFlow && (
            <div className="space-y-3 text-left">
              <div>
                <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
              <div>
                <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all shadow-2xs"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={otp.join('').length < 6 || verifying || (isResetFlow && (!isPasswordStrong || newPassword !== confirmPassword))}
            className={`w-full text-xs font-bold py-3 sm:py-3.5 rounded-xl transition-all shadow-xs ${
              otp.join('').length === 6 && !verifying && (!isResetFlow || (isPasswordStrong && newPassword === confirmPassword))
                ? 'bg-[#FF4F00] hover:bg-[#E64700] text-white cursor-pointer active:scale-98'
                : 'bg-orange-200 text-white/90 cursor-not-allowed'
            }`}
          >
            {verifying ? 'Verifying…' : isResetFlow ? 'Reset Password' : 'Verify & Continue'}
          </button>
        </form>

        <div className="mt-5 sm:mt-6 pt-5 border-t border-gray-100 flex flex-col xs:flex-row items-center justify-between gap-2 text-[11px] sm:text-xs">
          <span className="text-gray-400">Didn't receive a code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={sending}
            className="font-bold text-[#FF4F00] hover:underline cursor-pointer disabled:opacity-60"
          >
            {sending ? 'Sending…' : 'Resend Code'}
          </button>
        </div>

      </div>

      <div className="mt-4 text-center">
        <Link
          to={isResetFlow ? '/auth/forgot-password' : '/auth/signup'}
          className="text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors"
        >
          ← Back to {isResetFlow ? 'request' : 'registration'}
        </Link>
      </div>
    </div>
  );
}