import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import ProfileForm from '../components/profile/ProfileForm';
import ExpectationsForm from '../components/profile/ExpectationsForm';
import PhotoUpload from '../components/profile/PhotoUpload';
import Spinner from '../components/common/Spinner';
import {
  getMyProfile,
  updateProfile,
  getPreference,
  updatePreference,
  getMyExpectations,
  saveExpectations,
  getNotificationSettings,
  updateNotificationSettings,
} from '../api/profileApi';
import { requestDeleteAccountOtp } from '../api/accountApi';
import useAuth from '../hooks/useAuth';
import { resolveImageUrl } from '../utils/imageHelper';
import logger from '../utils/logger';

/**
 * EditProfilePage — /profile/edit
 *
 * Instagram-style profile header layout with account deletion requiring email OTP verification.
 */
const EditProfilePage = () => {
  const { user, deleteAccount } = useAuth();

  const [activeTab, setActiveTab]         = useState('profile'); // 'profile' | 'expectations'
  const [profile, setProfile]             = useState(null);
  const [expectations, setExpectations]   = useState(null);
  const [preference, setPreference]       = useState(null);
  const [photos, setPhotos]               = useState([]);
  const [pageLoading, setPageLoading]     = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [expLoading, setExpLoading]       = useState(false);
  const [prefLoading, setPrefLoading]     = useState(false);
  const [profileError, setProfileError]   = useState('');
  const [expError, setExpError]           = useState('');

  const [notifSettings, setNotifSettings] = useState({
    emailOnLike: true,
    emailOnInterest: true,
    emailOnAcceptInterest: true,
  });
  const [notifUpdating, setNotifUpdating] = useState(false);

  // Account Deletion OTP Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal]   = useState(false);
  const [otpCode, setOtpCode]                 = useState('');
  const [otpSending, setOtpSending]           = useState(false);
  const [deleteLoading, setDeleteLoading]     = useState(false);
  const [deleteError, setDeleteError]         = useState('');
  const [cooldown, setCooldown]               = useState(0);

  // Cooldown timer effect for Resend OTP
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const mapPhotos = (backendPhotos = []) =>
    backendPhotos.map((p) => ({
      id: p.photoId,
      url: p.photoUrl,
      isPrimary: p.isPrimary,
    }));

  const loadData = useCallback(async () => {
    logger.info('EditProfilePage — loading profile, expectations, preferences, and notification settings');
    setPageLoading(true);
    try {
      const [profileData, prefData, expData, notifData] = await Promise.all([
        getMyProfile(),
        getPreference().catch(() => null),
        getMyExpectations().catch(() => null),
        getNotificationSettings().catch(() => null),
      ]);

      logger.response('/api/profile/me', profileData);
      setProfile(profileData);
      setPhotos(mapPhotos(profileData?.photos));
      setPreference(prefData?.preferredGender || 'ANY');
      setExpectations(expData || {});
      if (notifData) {
        setNotifSettings(notifData);
      }
    } catch (error) {
      logger.error('Failed to load profile data', error);
      toast.error('Could not load your profile. Please refresh.');
    } finally {
      setPageLoading(false);
    }
  }, []);

  const handleToggleNotification = async (field, currentValue) => {
    const updated = { ...notifSettings, [field]: !currentValue };
    setNotifSettings(updated);
    setNotifUpdating(true);
    try {
      const res = await updateNotificationSettings(updated);
      setNotifSettings(res);
      toast.success('Email preferences updated!');
    } catch (error) {
      logger.error('Failed to update notification settings', error);
      toast.error('Could not save email preference.');
      setNotifSettings(notifSettings);
    } finally {
      setNotifUpdating(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleProfileUpdate = async (profileData) => {
    setProfileLoading(true);
    setProfileError('');
    try {
      logger.api('PUT', '/api/profile', profileData);
      const updated = await updateProfile(profileData);
      setProfile(updated);
      setPhotos(mapPhotos(updated.photos));
      toast.success('Profile updated successfully!');
    } catch (error) {
      logger.error('Profile update failed', error);
      const msg = error.response?.data?.message || 'Update failed. Please try again.';
      setProfileError(msg);
      toast.error(msg);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleExpectationsUpdate = async (expPayload) => {
    setExpLoading(true);
    setExpError('');
    try {
      logger.api('POST', '/api/profile/expectations', expPayload);
      const updatedExp = await saveExpectations(expPayload);
      setExpectations(updatedExp);
      toast.success('Partner expectations saved successfully!');
    } catch (error) {
      logger.error('Expectations update failed', error);
      const msg = error.response?.data?.message || 'Could not save expectations. Please try again.';
      setExpError(msg);
      toast.error(msg);
    } finally {
      setExpLoading(false);
    }
  };

  const handlePrefUpdate = async () => {
    setPrefLoading(true);
    try {
      logger.api('PUT', '/api/preferences', { preferredGender: preference });
      await updatePreference(preference);
      toast.success('Preference saved!');
    } catch (error) {
      logger.error('Preference update failed', error);
      toast.error('Could not save preference. Please try again.');
    } finally {
      setPrefLoading(false);
    }
  };

  const handlePhotosChange = async (updatedProfile) => {
    if (updatedProfile) {
      setProfile(updatedProfile);
      setPhotos(mapPhotos(updatedProfile.photos));
    } else {
      await loadData();
    }
  };

  // Step 1: Open Are You Sure confirmation modal
  const handleOpenConfirmDelete = () => {
    setShowConfirmModal(true);
  };

  // Step 2: User confirms deletion in popup → send OTP email and open OTP modal
  const handleConfirmInitiateDelete = async () => {
    setShowConfirmModal(false);
    await handleInitiateDelete();
  };

  // Send Delete OTP via backend
  const handleInitiateDelete = async () => {
    setOtpSending(true);
    setDeleteError('');
    setOtpCode('');
    try {
      logger.api('POST', '/api/account/delete-otp');
      await requestDeleteAccountOtp();
      toast.success('OTP sent to your registered email address.');
      setShowDeleteModal(true);
      setCooldown(30);
    } catch (error) {
      logger.error('Failed to send delete OTP', error);
      toast.error(error.response?.data?.message || 'Could not send OTP. Please try again.');
    } finally {
      setOtpSending(false);
    }
  };

  // Resend Delete Account OTP
  const handleResendDeleteOtp = async () => {
    if (cooldown > 0 || otpSending) return;
    setOtpSending(true);
    setDeleteError('');
    try {
      logger.api('POST', '/api/account/delete-otp');
      await requestDeleteAccountOtp();
      toast.success('New OTP sent to your email address.');
      setCooldown(30);
    } catch (error) {
      logger.error('Failed to resend delete OTP', error);
      toast.error(error.response?.data?.message || 'Could not resend OTP. Please try again.');
    } finally {
      setOtpSending(false);
    }
  };

  // Step 3: Confirm Account Deletion with OTP
  const handleConfirmDeleteAccount = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 6) {
      setDeleteError('Please enter the complete 6-digit OTP code.');
      return;
    }
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteAccount(otpCode.trim());
    } catch (error) {
      logger.error('Account deletion failed', error.response?.data);
      const msg = error.response?.data?.message || 'Invalid or expired OTP. Please try again.';
      setDeleteError(msg);
      toast.error(msg);
      setDeleteLoading(false);
    }
  };

  const selectClass =
    'px-4 py-2 rounded-lg border border-border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary';

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Header Card */}
        <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-primary/20 overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-inner">
              {profile?.primaryPhotoUrl ? (
                <img
                  src={resolveImageUrl(profile.primaryPhotoUrl)}
                  alt={profile?.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl text-gray-400">👤</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                  {profile?.fullName || user?.fullName || 'User Profile'}
                </h1>
                {(profile?.username || user?.username) && (
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-orange-300 text-xs font-bold border border-primary/20">
                    @{profile?.username || user?.username}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                {user?.email}
              </p>
              {profile?.city && (
                <p className="text-xs text-primary font-medium mt-1">📍 {profile.city}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-border/60 dark:border-gray-700/60">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${
                activeTab === 'profile'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              ✏️ Edit Profile
            </button>
            <button
              onClick={() => setActiveTab('expectations')}
              className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${
                activeTab === 'expectations'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              💍 Edit Expectation
            </button>
          </div>
        </div>

        {/* Tab Content: Edit Profile */}
        {activeTab === 'profile' && (
          <section className="bg-white dark:bg-card-dark rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
              Profile Information
            </h2>
            {profile && (
              <ProfileForm
                initialData={profile}
                onSubmit={handleProfileUpdate}
                loading={profileLoading}
                serverError={profileError}
                submitLabel="Update Profile"
              />
            )}
          </section>
        )}

        {/* Tab Content: Edit Expectations */}
        {activeTab === 'expectations' && (
          <section className="bg-white dark:bg-card-dark rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
              Partner Expectations
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Tell others what you are looking for in a partner. All fields are optional.
            </p>
            <ExpectationsForm
              initialData={expectations || {}}
              onSubmit={handleExpectationsUpdate}
              loading={expLoading}
              serverError={expError}
              submitLabel="Save Expectations"
            />
          </section>
        )}

        {/* Independent Sections (Visible under both tabs when scrolling down) */}
        <section className="bg-white dark:bg-card-dark rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
            Profile Photos (Max 10)
          </h2>
          <PhotoUpload photos={photos} onPhotosChange={handlePhotosChange} />
        </section>

        {/* Email Notification Preferences Section */}
        <section className="bg-white dark:bg-card-dark rounded-2xl shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <span>🔔</span> Email Notification Preferences
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Control which automated email notifications you receive from Prajapati Samaj.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {/* Email on Like */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-border/50">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Profile Like Emails
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Receive an email when someone likes your profile.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(notifSettings.emailOnLike)}
                  onChange={() => handleToggleNotification('emailOnLike', notifSettings.emailOnLike)}
                  disabled={notifUpdating}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Email on Interest */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-border/50">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Interest Request Emails
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Receive an email when someone sends you an interest request.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(notifSettings.emailOnInterest)}
                  onChange={() => handleToggleNotification('emailOnInterest', notifSettings.emailOnInterest)}
                  disabled={notifUpdating}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Email on Accept Interest */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-border/50">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Interest Acceptance Emails
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Receive an email when your sent interest is accepted.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(notifSettings.emailOnAcceptInterest)}
                  onChange={() => handleToggleNotification('emailOnAcceptInterest', notifSettings.emailOnAcceptInterest)}
                  disabled={notifUpdating}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </section>

        <section className="bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/50 p-6">
          <h2 className="text-lg font-bold text-error mb-2">Danger Zone</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Permanently delete your account and all associated data. Requiring OTP verification sent to your email.
          </p>
          <button
            onClick={handleOpenConfirmDelete}
            disabled={otpSending}
            className="px-5 py-2.5 rounded-xl bg-error text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-60 flex items-center gap-2 cursor-pointer"
          >
            {otpSending && <Spinner size="sm" />}
            {otpSending ? 'Sending OTP...' : '🗑️ Delete My Account'}
          </button>
        </section>

      </div>

      {/* Are You Sure? Confirmation Modal before sending email OTP */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-2xl shadow-2xl border border-border dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-gray-700 bg-red-50/50 dark:bg-red-950/20">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <h2 className="text-lg font-bold text-error">Are you sure?</h2>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Are you sure you want to delete your account? This action cannot be undone and will permanently erase all your profile information, photos, and match history.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                When you click <strong className="text-error">&quot;Yes, Delete Account&quot;</strong>, a 6-digit verification code will be sent to your email (<strong className="text-gray-800 dark:text-gray-200">{user?.email}</strong>) to confirm account deletion.
              </p>

              <div className="flex gap-3 pt-4 border-t border-border dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                >
                  No, Keep Account
                </button>
                <button
                  type="button"
                  onClick={handleConfirmInitiateDelete}
                  disabled={otpSending}
                  className="flex-1 py-2.5 rounded-xl bg-error text-white font-semibold text-sm hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {otpSending ? 'Sending OTP...' : 'Yes, Delete Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account OTP Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-2xl shadow-2xl border border-border dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-gray-700 bg-red-50/50 dark:bg-red-950/20">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <h2 className="text-lg font-bold text-error">Confirm Account Deletion</h2>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmDeleteAccount} className="p-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                An OTP has been sent to your login email: <strong className="text-gray-900 dark:text-gray-100">{user?.email}</strong>.
                Enter the 6-digit code below to confirm deletion.
              </p>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  6-Digit Verification OTP *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value.replace(/\D/g, ''));
                    if (deleteError) setDeleteError('');
                  }}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-error"
                />
              </div>

              {deleteError && (
                <p className="text-xs text-error font-medium">{deleteError}</p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1">
                <span>Didn&apos;t receive code?</span>
                <button
                  type="button"
                  onClick={handleResendDeleteOtp}
                  disabled={cooldown > 0 || otpSending}
                  className="text-primary font-semibold hover:underline disabled:opacity-50 cursor-pointer"
                >
                  {cooldown > 0 ? `Resend OTP in ${cooldown}s` : otpSending ? 'Sending...' : 'Resend OTP'}
                </button>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={otpCode.length < 6 || deleteLoading}
                  className="flex-1 py-2.5 rounded-xl bg-error text-white font-semibold text-sm hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {deleteLoading && <Spinner size="sm" />}
                  {deleteLoading ? 'Deleting...' : 'Permanently Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfilePage;
