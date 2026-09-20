import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '@/config/msalConfig';
import { BackHomeArrow } from '@/components/shared/BackHomeArrow';
import { authApi } from '@/lib/api';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signupMicrosoft } = useAuth();
  const { instance, inProgress } = useMsal();

  const [msEmail, setMsEmail] = useState('');
  const [msName, setMsName] = useState('');
  const [microsoftVerified, setMicrosoftVerified] = useState(false);
  const [account, setAccount] = useState(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [gen, setGen] = useState('');
  const [department, setDepartment] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    instance.handleRedirectPromise().then(async (res) => {
      if (res?.account) {
        instance.setActiveAccount(res.account);
        setAccount(res.account);
        setMsEmail(res.account.username);
        setMsName(res.account.name || '');
        setUsername(res.account.name || '');
        try {
          let idToken = res.idToken;
          if (!idToken) {
            const tokenRes = await instance.acquireTokenSilent(loginRequest);
            idToken = tokenRes.idToken;
          }
          const check = await authApi.microsoftCheck(idToken);
          if (check.exists) {
            navigate('/auth/login');
          } else {
            setMicrosoftVerified(true);
          }
        } catch {
          setMicrosoftVerified(true);
        }
      }
    }).catch(() => {});
  }, [instance]);

  const handleMicrosoftLogin = async () => {
    await instance.loginRedirect(loginRequest);
  };

  const departmentOptions = [
    { name: 'Computer Science', specializations: ['Software Engineering', 'Data Science'] },
    { name: 'Telecommunications and Networking', specializations: ['Telecommunications and Networking Engineering', 'Cybersecurity'] },
    { name: 'Digital Business', specializations: ['E-commerce'] },
  ];

  const availableSpecializations = departmentOptions.find((d) => d.name === department)?.specializations || [];

  const handleDepartmentChange = (deptName) => {
    setDepartment(deptName);
    setSpecialization('');
  };

  const passwordCriteria = useMemo(() => ({
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  }), [password]);

  const maxGen = new Date().getFullYear() - 2014 + 1;

  const isPasswordStrong = Object.values(passwordCriteria).every(Boolean);
  const genNum = Number(gen);
  const isGenValid = gen && genNum >= 1 && genNum <= maxGen;
  const isFormValid = isPasswordStrong && Boolean(username.trim()) && isGenValid && Boolean(department) && Boolean(specialization);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!isFormValid || !account) return;
    if (!microsoftVerified) return;
    setSubmitError('');
    setSubmitting(true);
    try {
      const tokenResult = await instance.acquireTokenSilent(loginRequest).catch(() => null);
      const idToken = tokenResult?.idToken || '';
      await signupMicrosoft({
        idToken,
        displayName: username.trim(),
        password,
        role: 'STUDENT',
        gen: genNum,
        department: department.trim(),
        specialization: specialization.trim(),
      });
      navigate('/');
    } catch (err) {
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('already exists') || msg.includes('409')) {
        navigate('/auth/login');
      } else {
        setSubmitError(msg || 'We could not create your account. Please try again.');
      }
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
        <div className="text-center mb-5 sm:mb-6">
          <Link to="/" className="inline-block group">
            <img src="/jorjek_logo.jpg" alt="JorJek" className="h-9 sm:h-11 w-auto mx-auto object-contain transition-transform group-hover:scale-105" />
          </Link>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mt-2.5 sm:mt-3 leading-tight">
            {account ? 'Complete Your Profile' : 'Create CADT Account'}
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
            {account ? 'Fill in your details to finish signing up' : 'Sign in with your Microsoft school account to begin'}
          </p>
        </div>

        {!microsoftVerified ? (
          <div className="space-y-4">
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
              {inProgress !== 'none' ? 'Redirecting…' : 'Sign up with Microsoft'}
            </button>
            <div className="text-center mt-5 sm:mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Already have an account?{' '}
                <Link to="/auth/login" className="text-[#FF4F00] font-bold hover:underline">Sign in</Link>
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-3.5 sm:space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">University Email</label>
              <input type="email" disabled value={msEmail} className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs text-gray-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">Full Name / Username</label>
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. Srun Vireak" className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all shadow-2xs" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create strong password" className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all shadow-2xs pr-14" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs font-bold p-1 cursor-pointer">
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 mt-2.5 bg-[#FAFAFA] p-2.5 sm:p-3 rounded-xl border border-gray-100 text-[10px] sm:text-[11px]">
                <span className={`flex items-center gap-1.5 ${passwordCriteria.minLength ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}><span>{passwordCriteria.minLength ? '✓' : '○'}</span> Min 8 characters</span>
                <span className={`flex items-center gap-1.5 ${passwordCriteria.hasUpper ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}><span>{passwordCriteria.hasUpper ? '✓' : '○'}</span> Uppercase letter</span>
                <span className={`flex items-center gap-1.5 ${passwordCriteria.hasNumber ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}><span>{passwordCriteria.hasNumber ? '✓' : '○'}</span> At least 1 number</span>
                <span className={`flex items-center gap-1.5 ${passwordCriteria.hasSpecial ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}><span>{passwordCriteria.hasSpecial ? '✓' : '○'}</span> Special character</span>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">Generation (Gen)</label>
              <input type="number" min="1" max={maxGen} value={gen} onChange={(e) => { const val = e.target.value; if (val === '' || (Number(val) >= 1 && Number(val) <= maxGen)) setGen(val); }} placeholder={maxGen <= 1 ? "1" : `1 - ${maxGen}`} className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all shadow-2xs" />
              <p className="text-[10px] text-gray-400 mt-1">CADT started in 2014. Max: Gen {maxGen}</p>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">Department</label>
              <div className="grid grid-cols-1 gap-2">
                {departmentOptions.map((dept) => (
                  <button key={dept.name} type="button" onClick={() => handleDepartmentChange(dept.name)} className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${department === dept.name ? 'bg-[#FF4F00] border-[#FF4F00] text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-[#FF4F00] hover:text-[#FF4F00]'}`}>
                    {dept.name}
                  </button>
                ))}
              </div>
            </div>
            {department && availableSpecializations.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">Specialization</label>
                <div className="grid grid-cols-1 gap-2">
                  {availableSpecializations.map((spec) => (
                    <button key={spec} type="button" onClick={() => setSpecialization(spec === specialization ? '' : spec)} className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${specialization === spec ? 'bg-[#FF4F00] border-[#FF4F00] text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-[#FF4F00] hover:text-[#FF4F00]'}`}>
                      {spec}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {submitError && (
              <p className="text-[11px] text-red-600 font-semibold bg-red-50 border border-red-100 rounded-lg px-3 py-2">{submitError}</p>
            )}
            <button type="submit" disabled={!isFormValid || submitting} className={`w-full text-xs font-bold py-3 sm:py-3.5 rounded-xl transition-all shadow-xs mt-2 ${isFormValid && !submitting ? 'bg-[#FF4F00] hover:bg-[#E64700] text-white cursor-pointer active:scale-98' : 'bg-orange-200 text-white/90 cursor-not-allowed'}`}>
              {submitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
