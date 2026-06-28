import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../common/Spinner';
import logger from '../../utils/logger';

const REMEMBER_KEY = 'rememberMe';
const REMEMBER_DAYS = 7;

/**
 * Login form — email + password with show/hide toggle and Remember Me.
 *
 * Remember Me behaviour:
 * - Checked at submit → saves { email, password, expiresAt } to localStorage (7 days).
 * - On form load → reads saved creds, checks expiry, pre-fills if still valid.
 * - After 7 days without a new login → entry expires silently, fields are empty.
 * - Unchecked at submit → clears any saved creds immediately.
 *
 * Props: onSubmit(email, password), loading, serverError
 */
const LoginForm = ({ onSubmit, loading, serverError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});

  /** On mount — restore saved credentials if they are still within 7-day window */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(REMEMBER_KEY);
      if (!raw) return;

      const saved = JSON.parse(raw);
      const isExpired = Date.now() > saved.expiresAt;

      if (isExpired) {
        // Silently clear stale entry
        localStorage.removeItem(REMEMBER_KEY);
        logger.info('Remember Me entry expired — cleared');
        return;
      }

      // Pre-fill fields and check the checkbox
      setEmail(saved.email || '');
      setPassword(saved.password || '');
      setRememberMe(true);
      logger.info('Remember Me credentials restored', { email: saved.email });
    } catch {
      // Corrupt data — just remove it
      localStorage.removeItem(REMEMBER_KEY);
    }
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    if (rememberMe) {
      // Save credentials with a 7-day expiry timestamp
      const expiresAt = Date.now() + REMEMBER_DAYS * 24 * 60 * 60 * 1000;
      localStorage.setItem(REMEMBER_KEY, JSON.stringify({ email, password, expiresAt }));
      logger.info('Remember Me credentials saved (7 days)', { email });
    } else {
      // User unchecked — clear any previously saved creds
      localStorage.removeItem(REMEMBER_KEY);
      logger.info('Remember Me cleared by user');
    }

    onSubmit(email, password);
  };

  const inputClass =
    'w-full px-4 py-2 rounded-lg border border-border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
        {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {errors.password && <p className="text-error text-xs mt-1">{errors.password}</p>}
      </div>

      {/* Remember Me + Forgot Password row */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Remember me for 7 days
          </span>
        </label>
        <Link to="/forgot-password" className="text-sm text-primary hover:underline">
          Forgot Password?
        </Link>
      </div>

      {/* Server error */}
      {serverError && <p className="text-error text-sm">{serverError}</p>}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-light transition disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading && <Spinner />}
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-primary font-medium hover:underline">
          Register
        </Link>
      </p>

    </form>
  );
};

export default LoginForm;
