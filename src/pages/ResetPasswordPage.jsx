import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetPassword } from '../api/authApi';
import Spinner from '../components/common/Spinner';
import logger from '../utils/logger';

/** Step 3 of password reset — set new password using verified OTP */
const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const email = sessionStorage.getItem('reset_email');
  const otp = sessionStorage.getItem('reset_otp');

  useEffect(() => {
    logger.info('ResetPasswordPage loaded');
    if (!email || !otp) {
      toast.error('Session expired. Please start again.');
      navigate('/forgot-password');
    }
  }, [email, otp, navigate]);

  const validate = () => {
    const newErrors = {};
    if (newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (confirmPassword !== newPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setErrors({});
    setLoading(true);
    try {
      logger.api('POST', '/api/auth/reset-password', { email });
      await resetPassword(email, otp, newPassword);
      sessionStorage.removeItem('reset_email');
      sessionStorage.removeItem('reset_otp');
      logger.info('Password reset successful — redirecting to /login');
      toast.success('Password reset! Please login with your new password.');
      navigate('/login');
    } catch (err) {
      logger.error('Password reset failed', err.response?.data);
      toast.error(err.response?.data?.message || 'Reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-2 rounded-lg border border-border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Reset Password</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter your new password</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className={`${inputClass} pr-12`}
              />
              <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.newPassword && <p className="text-error text-xs mt-1">{errors.newPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className={inputClass}
            />
            {errors.confirmPassword && <p className="text-error text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-light transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Spinner />}
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
