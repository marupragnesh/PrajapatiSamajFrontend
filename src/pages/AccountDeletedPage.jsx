import { Link } from 'react-router-dom';
import logger from '../utils/logger';
import { useEffect } from 'react';

/**
 * AccountDeletedPage — shown after successful account deletion.
 * Public route — no auth required (user is already logged out).
 */
const AccountDeletedPage = () => {
  useEffect(() => {
    logger.info('AccountDeletedPage loaded');
  }, []);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-2xl shadow-lg p-10 text-center">

        {/* Icon */}
        <div className="text-6xl mb-4">🙏</div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
          Goodbye, and thank you
        </h1>

        {/* Message */}
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-2">
          Your account has been permanently deleted.
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
          We hope you found what you were looking for. The Prajapati Samaj community
          wishes you all the best on your journey ahead. 🪷
        </p>

        {/* Back to register */}
        <Link
          to="/register"
          className="inline-block px-6 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-light transition"
        >
          Create a new account
        </Link>

        <p className="mt-4 text-sm text-gray-400 dark:text-gray-500">
          or{' '}
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
};

export default AccountDeletedPage;
