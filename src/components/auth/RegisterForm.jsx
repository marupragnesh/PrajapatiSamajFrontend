import { useState } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../common/Spinner';

/**
 * Registration form — email, password, confirm password.
 * Props: onSubmit(email, password), loading, serverError
 */
const RegisterForm = ({ initialEmail = '', onSubmit, loading, serverError }) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeConsent, setAgreeConsent] = useState(false);
  const [errors, setErrors] = useState({});

  /** Frontend validation before calling API */
  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email address';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (confirmPassword !== password) newErrors.confirmPassword = 'Passwords do not match';
    if (!agreeConsent) newErrors.agreeConsent = 'You must agree to the mobile number & address consent to register.';
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
    onSubmit(email, password);
  };

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
          className="w-full px-4 py-2 rounded-lg border border-border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
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
            placeholder="Min 6 characters"
            className="w-full px-4 py-2 rounded-lg border border-border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary pr-12"
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

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Confirm Password
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter password"
          className="w-full px-4 py-2 rounded-lg border border-border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.confirmPassword && (
          <p className="text-error text-xs mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Mandatory Contact & Address Sharing Consent Checkbox */}
      <div className="p-3 bg-amber-500/5 dark:bg-amber-500/10 rounded-xl border border-amber-500/20 space-y-1.5">
        <div className="flex items-start gap-2.5">
          <input
            type="checkbox"
            id="agreeConsent"
            checked={agreeConsent}
            onChange={(e) => {
              setAgreeConsent(e.target.checked);
              if (errors.agreeConsent) setErrors((prev) => ({ ...prev, agreeConsent: '' }));
            }}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer flex-shrink-0"
          />
          <label htmlFor="agreeConsent" className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed cursor-pointer font-medium">
            I agree my mobile number and address will be shown to other verified paying members of Prajapati Samaj Matrimonial as specified in our{' '}
            <Link to="/privacy-policy" target="_blank" className="text-primary font-bold underline hover:text-primary-light">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link to="/terms-conditions" target="_blank" className="text-primary font-bold underline hover:text-primary-light">
              Terms &amp; Conditions
            </Link>.
          </label>
        </div>
        {errors.agreeConsent && (
          <p className="text-error text-xs font-semibold pl-6">{errors.agreeConsent}</p>
        )}
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
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Login
        </Link>
      </p>
    </form>

  );
};

export default RegisterForm;
