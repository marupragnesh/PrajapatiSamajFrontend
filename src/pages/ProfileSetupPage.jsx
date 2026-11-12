import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileWizard from '../components/profile/ProfileWizard';
import { createProfile } from '../api/profileApi';
import useAuth from '../hooks/useAuth';
import logger from '../utils/logger';

/**
 * ProfileSetupPage — Step-by-step 5-card wizard shown after registration or first-time login.
 * Replaces the old flat single-page form with an intuitive guided experience:
 * Card 1: Personal Details
 * Card 2: Birth, Age & Horoscope (strict 18+ check)
 * Card 3: Contact & Cascading Location (India -> State -> City)
 * Card 4: Education, Profession & Hobby Chips
 * Card 5: Mandatory Photo Upload & Auto-Generated Expectations
 */
const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    logger.info('ProfileSetupPage loaded with 5-Card Wizard');
  }, []);

  /** Called by ProfileWizard to persist profile before uploading photos */
  const handleCreateProfile = async (profileData) => {
    logger.api('POST', '/api/profile', profileData);
    const data = await createProfile(profileData);
    logger.response('/api/profile', data);
    return data;
  };

  /** Called by ProfileWizard only after photos and expectations finish */
  const handleWizardComplete = () => {
    logger.info('Profile, photos & expectations created — redirecting to /discover');
    navigate('/discover');
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark px-4 py-8 sm:py-12 flex flex-col justify-center">
      <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
          Create Your Matrimonial Profile
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Fill in your details across 5 quick steps to find your ideal life partner in Prajapati Samaj.
        </p>
      </div>

      <ProfileWizard
        initialData={user || {}}
        onCreateProfile={handleCreateProfile}
        onComplete={handleWizardComplete}
      />
    </div>
  );
};

export default ProfileSetupPage;
