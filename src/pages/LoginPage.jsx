import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoginForm from '../components/auth/LoginForm';
import { loginUser } from '../api/authApi';
import { getMyProfile } from '../api/profileApi';
import useAuth from '../hooks/useAuth';
import logger from '../utils/logger';

/**
 * LoginPage — after login, checks if profile exists.
 * Redirects to /discover (profile complete) or /profile/setup (no profile).
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading]         = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => { logger.info('LoginPage loaded'); }, []);

  const handleLogin = async (email, password) => {
    setLoading(true);
    setServerError('');
    try {
      const data = await loginUser(email, password);
      login(data.token, { userId: data.userId, email: data.email });
      logger.info('Login successful', { userId: data.userId, email: data.email });

      try {
        await getMyProfile();
        navigate('/discover');
      } catch (profileError) {
        if (profileError.response?.status === 404) {
          navigate('/profile/setup');
        } else {
          throw profileError;
        }
      }
    } catch (error) {
      logger.error('Login failed', error.response?.data);
      const msg = error.response?.data?.message || 'Invalid email or password.';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col
                    items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-primary mb-1">🪷 PrajapatiSamaj</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Welcome back</p>
        <LoginForm onSubmit={handleLogin} loading={loading} serverError={serverError} />
      </div>

      {/* Developer credit */}
      <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
        Developed by Pragnesh Maru <span className="text-red-500">❤️</span>
      </p>
    </div>
  );
};

export default LoginPage;
