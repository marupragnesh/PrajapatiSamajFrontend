import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Heart } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import { loginUser } from '../api/authApi';
import { getMyProfile } from '../api/profileApi';
import useAuth from '../hooks/useAuth';
import logger from '../utils/logger';
import LogoIcon from '../components/common/LogoIcon';

/**
 * LoginPage — after login, checks if profile exists.
 * Provides direct public access to legal & compliance documents.
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, login } = useAuth();
  const [loading, setLoading]         = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    logger.info('LoginPage loaded');
    if (isLoggedIn) {
      navigate('/discover', { replace: true });
    }
  }, [isLoggedIn, navigate]);

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
                    items-center justify-center px-4 py-8 relative">
      <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-2xl shadow-lg p-8 border border-border">
        <h1 className="text-2xl font-bold text-primary mb-1 flex items-center gap-2">
          <LogoIcon className="w-8 h-8" />
          <span className="font-serif font-extrabold tracking-wide text-amber-700 dark:text-amber-400">PrajapatiSamaj</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Welcome back</p>
        <LoginForm onSubmit={handleLogin} loading={loading} serverError={serverError} />
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

export default LoginPage;
