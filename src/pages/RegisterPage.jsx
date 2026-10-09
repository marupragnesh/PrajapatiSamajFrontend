import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Heart } from 'lucide-react';
import RegisterForm from '../components/auth/RegisterForm';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import Spinner from '../components/common/Spinner';

import { registerUser, verifyRegistrationOtp, resendRegistrationOtp } from '../api/authApi';
import useAuth from '../hooks/useAuth';
import logger from '../utils/logger';
import LogoIcon from '../components/common/LogoIcon';

const REG_PENDING_KEY = 'matrimonial_pending_registration';

/** Reads persisted pending registration session if within 5-minute OTP window */
const getInitialRegistrationState = () => {
  try {
    const raw = localStorage.getItem(REG_PENDING_KEY);
    if (!raw) return { step: 1, email: '', cooldown: 0 };
    const parsed = JSON.parse(raw);
    if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
      const remainingCooldown = Math.max(0, Math.ceil((parsed.cooldownUntil - Date.now()) / 1000));
      return { step: 2, email: parsed.email || '', cooldown: remainingCooldown };
    }
    localStorage.removeItem(REG_PENDING_KEY);
    return { step: 1, email: '', cooldown: 0 };
  } catch {
    return { step: 1, email: '', cooldown: 0 };
  }
};

/**
 * RegisterPage — Handles 2-step registration:
 *   Step 1: Fill form → submit email & password → backend sends 5-minute OTP
 *   Step 2: Enter 6-digit OTP → backend validates OTP → user account activated & auto-logged in
 *
 * Persists Step 2 state to localStorage so mobile users switching to their email app
 * to copy the OTP code will not lose their OTP verification screen when returning to Chrome.
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [initial] = useState(() => getInitialRegistrationState());
  const [step, setStep]                 = useState(initial.step); // 1 = Form, 2 = OTP Verification
  const [regEmail, setRegEmail]         = useState(initial.email);
  const [otpCode, setOtpCode]           = useState('');

  const [loading, setLoading]           = useState(false);
  const [verifying, setVerifying]       = useState(false);
  const [resending, setResending]       = useState(false);
  const [serverError, setServerError]   = useState('');
  const [cooldown, setCooldown]         = useState(initial.cooldown);

  useEffect(() => { logger.info('RegisterPage loaded'); }, []);

  // Cooldown countdown timer (120s down to 0)
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Format seconds to MM:SS (e.g. 120 → 2:00, 75 → 1:15)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleResetToForm = () => {
    localStorage.removeItem(REG_PENDING_KEY);
    setStep(1);
    setServerError('');
    setOtpCode('');
  };

  // Step 1: Submit Registration Form
  const handleRegisterSubmit = async (email, password) => {
    setLoading(true);
    setServerError('');
    try {
      logger.api('POST', '/api/auth/register', { email });
      await registerUser(email, password);

      // Persist pending registration session for 5 minutes
      const now = Date.now();
      localStorage.setItem(REG_PENDING_KEY, JSON.stringify({
        email,
        expiresAt: now + 5 * 60 * 1000,      // 5-minute OTP validity
        cooldownUntil: now + 120 * 1000,     // 120-second cooldown
      }));

      setRegEmail(email);
      setStep(2);
      setCooldown(120); // 120-second cooldown timer
      toast.success('OTP sent to your email address.');
      logger.info('Registration initiated — switched to OTP verification step');
    } catch (error) {
      logger.error('Registration failed', error.response?.data);
      const msg = error.response?.data?.message || 'Registration failed. Try again.';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Registration OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter the 6-digit OTP.');
      return;
    }
    setVerifying(true);
    setServerError('');
    try {
      logger.api('POST', '/api/auth/register/verify-otp', { email: regEmail, otp: otpCode });
      const data = await verifyRegistrationOtp(regEmail, otpCode);
      toast.success('Email verified successfully!');

      // Clear pending registration state from storage
      localStorage.removeItem(REG_PENDING_KEY);

      // Auto-login user and redirect to Profile Setup
      login(data.token, { userId: data.userId, email: data.email });
      navigate('/profile/setup');
    } catch (error) {
      logger.error('Registration OTP verification failed', error.response?.data);
      const msg = error.response?.data?.message || 'Invalid or expired OTP.';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  // Resend Registration OTP
  const handleResendOtp = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setServerError('');
    try {
      logger.api('POST', '/api/auth/register/resend-otp', { email: regEmail });
      await resendRegistrationOtp(regEmail);

      const now = Date.now();
      localStorage.setItem(REG_PENDING_KEY, JSON.stringify({
        email: regEmail,
        expiresAt: now + 5 * 60 * 1000,
        cooldownUntil: now + 120 * 1000,
      }));

      toast.success('New OTP sent to your email.');
      setCooldown(120); // Reset 120s timer
    } catch (error) {
      logger.error('Resend registration OTP failed', error.response?.data);
      const msg = error.response?.data?.message || 'Could not resend OTP. Please try again.';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center px-4 relative">
      <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-primary mb-1 flex items-center gap-2">
          <LogoIcon className="w-7 h-7 text-primary" />
          <span>PrajapatiSamaj</span>
        </h1>

        {step === 1 ? (
          <>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Create your account</p>

            {/* 1-Click Google Sign-Up */}
            <GoogleLoginButton mode="register" onError={(err) => setServerError(err)} />

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-card-dark px-3 text-gray-500 dark:text-gray-400 font-medium">
                  or register with email
                </span>
              </div>
            </div>

            <RegisterForm initialEmail={regEmail} onSubmit={handleRegisterSubmit} loading={loading} serverError={serverError} />
          </>
        ) : (

          <div className="space-y-4 mt-2">
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Verify Your Email ✉️</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                An OTP valid for <strong className="text-primary">5 minutes</strong> has been sent to your email.
              </p>
            </div>

            {/* Email Verification Banner & Change Email Option */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                  ✉️ {regEmail}
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium mt-0.5">
                  Made a typo in your email?
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetToForm}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition whitespace-nowrap shadow cursor-pointer flex-shrink-0"
              >
                ✏️ Change Email
              </button>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  6-Digit Verification OTP *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value.replace(/\D/g, ''));
                    if (serverError) setServerError('');
                  }}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {serverError && <p className="text-xs text-error font-medium">{serverError}</p>}

              <button
                type="submit"
                disabled={otpCode.length < 6 || verifying}
                className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-light transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {verifying && <Spinner size="sm" />}
                {verifying ? 'Verifying...' : 'Verify & Complete Registration'}
              </button>
            </form>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-border dark:border-gray-700">
              <button
                type="button"
                onClick={handleResetToForm}
                className="text-gray-500 dark:text-gray-400 hover:underline cursor-pointer font-medium"
              >
                ← Back to Edit Form
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || resending}
                className="text-primary font-semibold hover:underline disabled:opacity-50 cursor-pointer"
              >
                {cooldown > 0 ? `Resend OTP in ${formatTime(cooldown)}` : resending ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Public Legal & Compliance Links (Accessible without login) */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
        <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
        <span>•</span>
        <Link to="/terms-conditions" className="hover:text-primary transition-colors">Terms &amp; Conditions</Link>
        <span>•</span>
        <Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link>
      </div>

      {/* Developer credit */}
      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1">
        <span>Developed with</span>
        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        <span>by</span>
        <Link to="/about" className="text-primary hover:underline font-semibold ml-0.5">
          Pragnesh Maru
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
