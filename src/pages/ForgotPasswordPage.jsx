import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { forgotPassword } from '../api/authApi';
import Spinner from '../components/common/Spinner';
import logger from '../utils/logger';

/** Step 1 of password reset — enter email to receive OTP */
const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    logger.info('ForgotPasswordPage loaded');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    setError('');
    setLoading(true);
    try {
      logger.api('POST', '/api/auth/forgot-password', { email });
      await forgotPassword(email);
      // Always show success — backend returns 200 even if email doesn't exist (security)
      sessionStorage.setItem('reset_email', email);
      logger.info('OTP request sent — redirecting to /verify-otp');
      toast.success('If this email is registered, an OTP has been sent.');
      navigate('/verify-otp');
    } catch (err) {
      logger.error('Forgot password error', err.response?.data);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Forgot Password</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter your email to receive an OTP</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 rounded-lg border border-border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {error && <p className="text-error text-xs mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-light transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Spinner />}
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          <Link to="/login" className="text-primary hover:underline">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
