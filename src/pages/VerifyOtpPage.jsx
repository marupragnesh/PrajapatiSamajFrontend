import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { verifyOtp } from '../api/authApi';
import Spinner from '../components/common/Spinner';
import logger from '../utils/logger';

/** Step 2 of password reset — enter 6-digit OTP received via email */
const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const email = sessionStorage.getItem('reset_email');

  useEffect(() => {
    logger.info('VerifyOtpPage loaded');
    logger.info('Email from sessionStorage', email);
    // If no email in sessionStorage, redirect back
    if (!email) {
      toast.error('Session expired. Please start again.');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) { setError('Enter the 6-digit OTP'); return; }
    setError('');
    setLoading(true);
    try {
      logger.api('POST', '/api/auth/verify-otp', { email });
      await verifyOtp(email, otp);
      sessionStorage.setItem('reset_otp', otp);
      logger.info('OTP verified — redirecting to /reset-password');
      toast.success('OTP verified!');
      navigate('/reset-password');
    } catch (err) {
      logger.error('OTP verification failed', err.response?.data);
      const msg = err.response?.data?.message || 'Invalid or expired OTP.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Enter OTP</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          A 6-digit OTP was sent to <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              className="w-full px-4 py-2 rounded-lg border border-border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary text-center tracking-widest text-lg"
            />
            {error && <p className="text-error text-xs mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-light transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Spinner />}
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
