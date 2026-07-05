import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import RegisterForm from '../components/auth/RegisterForm';
import Spinner from '../components/common/Spinner';
import { registerUser, verifyRegistrationOtp, resendRegistrationOtp } from '../api/authApi';
import useAuth from '../hooks/useAuth';
import logger from '../utils/logger';

/**
 * RegisterPage — Handles 2-step registration:
 *   Step 1: Fill form → submit email & password → backend sends 5-minute OTP
 *   Step 2: Enter 6-digit OTP → backend validates OTP → user account activated & auto-logged in
 *
 * Resend OTP has a 120-second (2-minute) cooldown timer.
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep]                 = useState(1); // 1 = Form, 2 = OTP Verification
  const [regEmail, setRegEmail]         = useState('');
  const [otpCode, setOtpCode]           = useState('');

  const [loading, setLoading]           = useState(false);
  const [verifying, setVerifying]       = useState(false);
  const [resending, setResending]       = useState(false);
  const [serverError, setServerError]   = useState('');
  const [cooldown, setCooldown]         = useState(0);

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

  // Step 1: Submit Registration Form
  const handleRegisterSubmit = async (email, password) => {
    setLoading(true);
    setServerError('');
    try {
      logger.api('POST', '/api/auth/register', { email });
      await registerUser(email, password);
      setRegEmail(email);
      setStep(2);
      setCooldown(120); // 120-second cooldown timer
      toast.success('OTP sent to your email address.');
      logger.info('Registration initiated — switched to OTP verification step');
    } catch (error) {
      logger.error('Registration initiation failed', error.response?.data);
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Registration OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 6) {
      setServerError('Please enter the complete 6-digit OTP code.');
      return;
    }
    setVerifying(true);
    setServerError('');
    try {
      logger.api('POST', '/api/auth/register/verify-otp', { email: regEmail });
      const data = await verifyRegistrationOtp(regEmail, otpCode.trim());
      login(data.token, { userId: data.userId, email: data.email });
      logger.info('Registration verified & completed — redirecting to /profile/setup');
      toast.success('Email verified! Set up your profile.');
      navigate('/profile/setup');
    } catch (error) {
      logger.error('Registration OTP verification failed', error.response?.data);
      const msg = error.response?.data?.message || 'Invalid or expired OTP. Please try again.';
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
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-primary mb-1">🪷 PrajapatiSamaj</h1>

        {step === 1 ? (
          <>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Create your account</p>
            <RegisterForm onSubmit={handleRegisterSubmit} loading={loading} serverError={serverError} />
          </>
        ) : (
          <div className="space-y-4 mt-2">
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Verify Your Email ✉️</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                An OTP valid for <strong className="text-primary">5 minutes</strong> has been sent to:
                <br />
                <strong className="text-gray-800 dark:text-gray-200">{regEmail}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
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
                onClick={() => { setStep(1); setServerError(''); }}
                className="text-gray-500 dark:text-gray-400 hover:underline cursor-pointer"
              >
                ← Edit Email
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

      {/* Developer credit */}
      <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
        Developed by Pragnesh Maru <span className="text-red-500">❤️</span>
      </p>
    </div>
  );
};

export default RegisterPage;
