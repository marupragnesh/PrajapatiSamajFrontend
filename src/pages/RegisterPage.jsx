import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import RegisterForm from '../components/auth/RegisterForm';
import { registerUser } from '../api/authApi';
import useAuth from '../hooks/useAuth';
import logger from '../utils/logger';

/** RegisterPage — handles API call and redirects to /profile/setup on success */
const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading]         = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => { logger.info('RegisterPage loaded'); }, []);

  const handleRegister = async (email, password) => {
    setLoading(true);
    setServerError('');
    try {
      const data = await registerUser(email, password);
      login(data.token, { userId: data.userId, email: data.email });
      logger.info('Registration successful — redirecting to /profile/setup');
      toast.success('Account created! Set up your profile.');
      navigate('/profile/setup');
    } catch (error) {
      logger.error('Registration failed', error.response?.data);
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
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
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Create your account</p>
        <RegisterForm onSubmit={handleRegister} loading={loading} serverError={serverError} />
      </div>

      {/* Developer credit */}
      <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
        Developed by Pragnesh Maru <span className="text-red-500">❤️</span>
      </p>
    </div>
  );
};

export default RegisterPage;
