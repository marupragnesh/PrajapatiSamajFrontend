import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import ProfileForm from '../components/profile/ProfileForm';
import PhotoUpload from '../components/profile/PhotoUpload';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Spinner from '../components/common/Spinner';
import { getMyProfile, updateProfile, getPreference, updatePreference } from '../api/profileApi';
import useAuth from '../hooks/useAuth';
import logger from '../utils/logger';

/**
 * EditProfilePage — update profile info, partner preference, photos, and delete account.
 *
 * Sections:
 * 1. Profile info form (pre-filled)
 * 2. Partner preference selector
 * 3. Photo management
 * 4. Danger zone — delete account
 *
 * KNOWN LIMITATION (from spec):
 * Backend returns photoUrls as List<String> (only URLs, no IDs).
 * Workaround: filename from URL is used as proxy delete ID.
 */
const EditProfilePage = () => {
  const { deleteAccount } = useAuth();

  const [profile, setProfile] = useState(null);
  const [preference, setPreference] = useState(null);
  const [photos, setPhotos] = useState([]);              // { id, url }[]
  const [pageLoading, setPageLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [prefLoading, setPrefLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Delete account dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /** Load profile + preference in parallel */
  const loadData = useCallback(async () => {
    logger.info('EditProfilePage loaded');
    setPageLoading(true);
    try {
      logger.api('GET', '/api/profile/me');
      logger.api('GET', '/api/preferences');

      const [profileData, prefData] = await Promise.all([
        getMyProfile(),
        getPreference().catch(() => null),
      ]);

      logger.response('/api/profile/me', profileData);
      setProfile(profileData);

      // Convert URL strings → { id, url } objects for PhotoUpload
      const photoObjects = (profileData.photoUrls || []).map((url) => ({
        id: extractPhotoId(url),
        url,
      }));
      setPhotos(photoObjects);

      setPreference(prefData?.preferredGender || 'ANY');
    } catch (error) {
      logger.error('Failed to load profile/preferences', error);
      toast.error('Could not load your profile. Please refresh.');
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Extracts filename from a photo URL to use as proxy delete ID.
   * e.g. "/uploads/photos/4/uuid.jpg" → "uuid.jpg"
   * Workaround until backend returns List<PhotoDto> with real IDs.
   */
  const extractPhotoId = (url) => url.split('/').pop();

  /** Save updated profile info */
  const handleProfileUpdate = async (profileData) => {
    setProfileLoading(true);
    setProfileError('');
    try {
      logger.info('User clicked update profile');
      logger.api('PUT', '/api/profile', profileData);
      const updated = await updateProfile(profileData);
      logger.response('/api/profile', updated);
      setProfile(updated);
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

  /**
   * Called by PhotoUpload after upload or delete.
   * Upload → updatedProfile provided, use directly.
   * Delete → no arg, reload from API.
   */
  const handlePhotosChange = async (updatedProfile) => {
    if (updatedProfile) {
      const photoObjects = (updatedProfile.photoUrls || []).map((url) => ({
        id: extractPhotoId(url),
        url,
      }));
      setPhotos(photoObjects);
    } else {
      await loadData();
    }
  };

  /** Permanently delete account — called after user confirms dialog */
  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await deleteAccount(); // clears auth + redirects to /account-deleted
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

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* ── Section 1: Profile Info ── */}
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

        {/* ── Section 2: Partner Preference ── */}
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

        {/* ── Section 3: Photo Management ── */}
        <section className="bg-white dark:bg-card-dark rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
            Photos
          </h2>
          <PhotoUpload photos={photos} onPhotosChange={handlePhotosChange} />
        </section>

        {/* ── Section 4: Danger Zone ── */}
        <section className="bg-white dark:bg-card-dark rounded-2xl shadow-sm p-6 border border-error/30">
          <h2 className="text-lg font-bold text-error mb-1">Danger Zone</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Deleting your account is permanent. All your data, photos, likes, and matches will
            be removed and cannot be recovered.
          </p>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="px-5 py-2 rounded-lg border border-error text-error text-sm font-semibold hover:bg-error hover:text-white transition"
          >
            🗑️ Delete My Account
          </button>
        </section>

      </div>

      {/* Delete account confirmation dialog */}
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
