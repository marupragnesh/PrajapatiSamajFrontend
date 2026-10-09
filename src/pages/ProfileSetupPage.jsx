import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProfileForm from '../components/profile/ProfileForm';
import { createProfile } from '../api/profileApi';
import useAuth from '../hooks/useAuth';
import logger from '../utils/logger';

/** Relationship choices for profile creator / manager */
const MANAGED_BY_OPTIONS = [
  { value: 'Self', label: 'Self', sub: 'Creating for myself', icon: '👤' },
  { value: 'Father', label: 'Father', sub: 'Creating for daughter / son', icon: '👨‍👧' },
  { value: 'Mother', label: 'Mother', sub: 'Creating for daughter / son', icon: '👩‍👧' },
  { value: 'Brother', label: 'Brother', sub: 'Creating for brother / sister', icon: '👦' },
  { value: 'Sister', label: 'Sister', sub: 'Creating for brother / sister', icon: '👧' },
  { value: 'Relative', label: 'Relative', sub: 'Creating for relative / family', icon: '👥' },
  { value: 'Friend', label: 'Friend', sub: 'Creating for a friend', icon: '🤝' },
];

/**
 * ProfileSetupPage — shown after registration or first-time login without profile.
 * Displays dedicated initial popup asking "Who is creating this profile?"
 * before opening the rest of the profile setup form.
 */
const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [managedBy, setManagedBy] = useState('Self');
  const [showManagedByModal, setShowManagedByModal] = useState(true);

  useEffect(() => {
    logger.info('ProfileSetupPage loaded');
  }, []);

  /** Called by ProfileForm with validated form data */
  const handleCreateProfile = async (profileData) => {
    setLoading(true);
    setServerError('');
    try {
      const payload = {
        ...profileData,
        managedBy: profileData.managedBy || managedBy || 'Self',
      };
      logger.api('POST', '/api/profile', payload);
      const data = await createProfile(payload);
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

  const handleSelectManager = (val) => {
    setManagedBy(val);
    setShowManagedByModal(false);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark px-4 py-10 relative">
      {/* ── Initial Modal: Who is creating this profile? ── */}
      {showManagedByModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-card-dark border border-border dark:border-gray-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl">
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 inline-block">👨‍👩‍👧</span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Who is creating this profile?
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                આ પ્રોફાઇલ કોણ બનાવી રહ્યું છે? Please select your relationship:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {MANAGED_BY_OPTIONS.map((opt) => {
                const isSelected = managedBy === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectManager(opt.value)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary dark:text-primary-light font-semibold shadow-sm'
                        : 'border-border dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/60 hover:border-primary/50 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm leading-tight">{opt.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{opt.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <button
                type="button"
                onClick={() => setShowManagedByModal(false)}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
              >
                Skip / Continue with Self
              </button>
              <button
                type="button"
                onClick={() => setShowManagedByModal(false)}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs sm:text-sm hover:bg-primary-light transition shadow"
              >
                Continue &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto bg-white dark:bg-card-dark rounded-2xl shadow-lg p-6 sm:p-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-primary">Complete Your Profile</h1>
          <button
            type="button"
            onClick={() => setShowManagedByModal(true)}
            className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-medium transition"
            title="Change who is managing this profile"
          >
            Managed By: <strong>{managedBy}</strong> ✏️
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Tell us about yourself so we can find the right match for you.
        </p>

        {/* Shared profile form */}
        <ProfileForm
          key={managedBy}
          onSubmit={handleCreateProfile}
          initialData={{ ...(user || {}), managedBy }}
          loading={loading}
          serverError={serverError}
          submitLabel="Save & Continue"
        />
      </div>
    </div>
  );
};

export default ProfileSetupPage;
