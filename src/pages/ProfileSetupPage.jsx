import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProfileForm from '../components/profile/ProfileForm';
import { createProfile } from '../api/profileApi';
import logger from '../utils/logger';

/**
 * ProfileSetupPage — shown after registration (first-time profile creation).
 * Uses the shared ProfileForm component.
 * On success → redirects to /discover.
 */
const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    logger.info('ProfileSetupPage loaded');
  }, []);

  /** Called by ProfileForm with validated form data */
  const handleCreateProfile = async (profileData) => {
    setLoading(true);
    setServerError('');
    try {
      logger.api('POST', '/api/profile', profileData);
      const data = await createProfile(profileData);
      logger.response('/api/profile', data);
      logger.info('Profile created — redirecting to /discover');
      toast.success('Profile created! Welcome to PrajapatiSamaj 🎉');
      navigate('/discover');
    } catch (error) {
      logger.error('Profile creation failed', error.response?.data);
      const msg = error.response?.data?.message || 'Failed to create profile. Please try again.';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark px-4 py-10">
      <div className="max-w-lg mx-auto bg-white dark:bg-card-dark rounded-2xl shadow-lg p-8">
        {/* Page header */}
        <h1 className="text-2xl font-bold text-primary mb-1">Complete Your Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Tell us about yourself so we can find the right match for you.
        </p>

        {/* Shared profile form — no initial data (new profile) */}
        <ProfileForm
          onSubmit={handleCreateProfile}
          loading={loading}
          serverError={serverError}
          submitLabel="Save & Continue"
        />
      </div>
    </div>
  );
};

export default ProfileSetupPage;
