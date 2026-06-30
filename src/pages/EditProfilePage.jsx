import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
 * EditProfilePage — /profile/edit
 *
 * Sections:
 *   1. Profile Information  — update name, age, gender, maritalStatus, etc.
 *   2. Partner Expectations — button navigates to /profile/expectations
 *   3. Partner Preference   — which gender to show in discovery
 *   4. Photos               — upload, delete, set primary
 *   5. Danger Zone          — delete account
 *
 * Backend PhotoDto shape (confirmed):
 *   { photoId: 6, photoUrl: "/uploads/photos/5/uuid.jpg", isPrimary: true }
 */
const EditProfilePage = () => {
  const navigate = useNavigate();
  const { deleteAccount } = useAuth();

  const [profile, setProfile]             = useState(null);
  const [preference, setPreference]       = useState(null);
  const [photos, setPhotos]               = useState([]);
  const [pageLoading, setPageLoading]     = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [prefLoading, setPrefLoading]     = useState(false);
  const [profileError, setProfileError]   = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /**
   * Maps backend photos[] → { id, url, isPrimary } for PhotoUpload component.
   * Backend: photo.photoId → id, photo.photoUrl → url
   */
  const mapPhotos = (backendPhotos = []) =>
    backendPhotos.map((p) => ({
      id: p.photoId,
      url: p.photoUrl,
      isPrimary: p.isPrimary,
    }));

  /** Load profile + preference in parallel on mount */
  const loadData = useCallback(async () => {
    logger.info('EditProfilePage — loading profile and preferences');
    setPageLoading(true);
    try {
      const [profileData, prefData] = await Promise.all([
        getMyProfile(),
        getPreference().catch(() => null),
      ]);

      logger.response('/api/profile/me', profileData);
      setProfile(profileData);
      setPhotos(mapPhotos(profileData.photos));
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

  /** Save partner preference (which gender to show in discovery) */
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
   * If backend returns updated profile → use it directly.
   * If no arg (delete path) → reload from API.
   */
  const handlePhotosChange = async (updatedProfile) => {
    if (updatedProfile) {
      setPhotos(mapPhotos(updatedProfile.photos));
    } else {
      await loadData();
    }
  };

  /** Permanently delete account — called after confirm dialog */
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

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* ── Section 1: Profile Information ── */}
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

        {/* ── Section 2: Partner Expectations ── */}
        <section className="bg-white dark:bg-card-dark rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
            Partner Expectations
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Tell others what you are looking for in a partner. All fields are optional.
          </p>
          <button
            onClick={() => navigate('/profile/expectations')}
            className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-light transition"
          >
            ✏️ Edit Expectations
          </button>
        </section>

        {/* ── Section 3: Partner Preference ── */}
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

        {/* ── Section 4: Photos ── */}
        <section className="bg-white dark:bg-card-dark rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
            Photos
          </h2>
          <PhotoUpload photos={photos} onPhotosChange={handlePhotosChange} />
        </section>

        {/* ── Section 5: Danger Zone ── */}
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
