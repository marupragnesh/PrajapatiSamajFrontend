import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import ProfileForm from '../components/profile/ProfileForm';
import ExpectationsForm from '../components/profile/ExpectationsForm';
import PhotoUpload from '../components/profile/PhotoUpload';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Spinner from '../components/common/Spinner';
import {
  getMyProfile,
  updateProfile,
  getPreference,
  updatePreference,
  getMyExpectations,
  saveExpectations,
} from '../api/profileApi';
import useAuth from '../hooks/useAuth';
import { resolveImageUrl } from '../utils/imageHelper';
import logger from '../utils/logger';

/**
 * EditProfilePage — /profile/edit
 *
 * Instagram-style profile header layout:
 *   - DP Avatar on left
 *   - User Full Name & Email on right
 *   - Edit Profile & Edit Expectation buttons
 *   - Tab toggle: Profile Information form vs Expectations form
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /** Maps backend photos[] → { id, url, isPrimary } */
  const mapPhotos = (backendPhotos = []) =>
    backendPhotos.map((p) => ({
      id: p.photoId,
      url: p.photoUrl,
      isPrimary: p.isPrimary,
    }));

  /** Load profile, expectations, and preference in parallel */
  const loadData = useCallback(async () => {
    logger.info('EditProfilePage — loading profile, expectations, and preferences');
    setPageLoading(true);
    try {
      const [profileData, prefData, expData] = await Promise.all([
        getMyProfile(),
        getPreference().catch(() => null),
        getMyExpectations().catch(() => null),
      ]);

      logger.response('/api/profile/me', profileData);
      setProfile(profileData);
      setPhotos(mapPhotos(profileData?.photos));
      setPreference(prefData?.preferredGender || 'ANY');
      setExpectations(expData || {});
    } catch (error) {
      logger.error('Failed to load profile data', error);
      toast.error('Could not load your profile. Please refresh.');
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /** Save updated profile info */
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

  /** Save updated expectations info */
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

  /** Save partner preference */
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

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await deleteAccount();
    } catch (error) {
      logger.error('Account deletion failed', error.response?.data);
      toast.error(error.response?.data?.message || 'Could not delete account. Please try again.');
      setDeleteLoading(false);
      setShowDeleteDialog(false);
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

        {/* ── Instagram-Style Header Card ── */}
        <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-6">

            {/* Circular DP Avatar */}
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

            {/* User Full Name & Login Email */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                {profile?.fullName || user?.fullName || 'User Profile'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                {user?.email}
              </p>
              {profile?.city && (
                <p className="text-xs text-primary font-medium mt-1">📍 {profile.city}</p>
              )}
            </div>
          </div>

          {/* Action Buttons — Edit Profile & Edit Expectation */}
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

        {/* ── Tab Content: Edit Profile ── */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Form */}
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

            {/* Photos Upload */}
            <section className="bg-white dark:bg-card-dark rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
                Photos
              </h2>
              <PhotoUpload photos={photos} onPhotosChange={handlePhotosChange} />
            </section>

            {/* Partner Preference */}
            <section className="bg-white dark:bg-card-dark rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
                Partner Preference
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Discover page will show profiles matching your preference.
              </p>
              <div className="flex items-center gap-4">
                <select
                  value={preference || 'ANY'}
                  onChange={(e) => setPreference(e.target.value)}
                  className={selectClass}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="ANY">Any</option>
                </select>
                <button
                  onClick={handlePrefUpdate}
                  disabled={prefLoading}
                  className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-light transition disabled:opacity-60 flex items-center gap-2"
                >
                  {prefLoading && <Spinner />}
                  {prefLoading ? 'Saving...' : 'Save Preference'}
                </button>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="bg-white dark:bg-card-dark rounded-2xl shadow-sm p-6 border border-error/30">
              <h2 className="text-lg font-bold text-error mb-1">Danger Zone</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Deleting your account is permanent. All your data, photos, likes, and matches
                will be removed and cannot be recovered.
              </p>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="px-5 py-2 rounded-lg border border-error text-error text-sm font-semibold hover:bg-error hover:text-white transition"
              >
                🗑️ Delete My Account
              </button>
            </section>
          </div>
        )}

        {/* ── Tab Content: Edit Expectations ── */}
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

      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Account"
        message="This will permanently delete your account, photos, and all your data. This action cannot be undone. Are you sure?"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteDialog(false)}
        loading={deleteLoading}
      />
    </div>
  );
};

export default EditProfilePage;
