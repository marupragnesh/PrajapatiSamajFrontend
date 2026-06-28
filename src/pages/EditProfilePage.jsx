import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import ProfileForm from '../components/profile/ProfileForm';
import PhotoUpload from '../components/profile/PhotoUpload';
import Spinner from '../components/common/Spinner';
import { getMyProfile, updateProfile, getPreference, updatePreference } from '../api/profileApi';
import logger from '../utils/logger';

/**
 * EditProfilePage — update profile info, partner preference, and manage photos.
 *
 * Sections:
 * 1. Profile info form (pre-filled)
 * 2. Partner preference selector
 * 3. Photo management (via PhotoUpload component)
 *
 * KNOWN LIMITATION (from spec):
 * Backend returns photoUrls as List<String> (only URLs, no IDs).
 * PhotoUpload needs {id, url} objects to delete photos.
 * Workaround: we extract the filename from the URL and use it as a proxy ID.
 * Real fix: ask backend to return List<PhotoDto> with {id, url}.
 */
const EditProfilePage = () => {
  const [profile, setProfile] = useState(null);         // full profile from API
  const [preference, setPreference] = useState(null);   // partner gender preference
  const [photos, setPhotos] = useState([]);              // array of { id, url }
  const [pageLoading, setPageLoading] = useState(true);  // initial load spinner
  const [profileLoading, setProfileLoading] = useState(false);
  const [prefLoading, setPrefLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  /** Load profile + preference in parallel on mount */
  const loadData = useCallback(async () => {
    logger.info('EditProfilePage loaded');
    setPageLoading(true);
    try {
      logger.api('GET', '/api/profile/me');
      logger.api('GET', '/api/preferences');

      const [profileData, prefData] = await Promise.all([
        getMyProfile(),
        getPreference().catch(() => null), // preference may not exist yet
      ]);

      logger.response('/api/profile/me', profileData);
      setProfile(profileData);

      // Convert URL strings to {id, url} objects for PhotoUpload.
      // We use the filename portion as the "id" — this is the workaround
      // described in the spec until backend returns proper PhotoDto.
      const photoObjects = (profileData.photoUrls || []).map((url) => ({
        id: extractPhotoId(url), // extract filename from URL as proxy ID
        url,
      }));
      setPhotos(photoObjects);

      if (prefData) {
        setPreference(prefData.preferredGender || 'ANY');
      } else {
        setPreference('ANY'); // default if preference not set yet
      }
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
   * Extract filename from photo URL to use as a proxy ID.
   * e.g. "http://localhost:8080/uploads/photos/abc123_photo.jpg" → "abc123_photo.jpg"
   * This is the workaround for the missing photoId in backend response.
   */
  const extractPhotoId = (url) => {
    return url.split('/').pop();
  };

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

  /** Save updated partner preference */
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
   * If updatedProfile is provided (from upload), use it directly.
   * Otherwise reload from API (after delete).
   */
  const handlePhotosChange = async (updatedProfile) => {
    if (updatedProfile) {
      // Upload returns fresh profile — update photos directly
      const photoObjects = (updatedProfile.photoUrls || []).map((url) => ({
        id: extractPhotoId(url),
        url,
      }));
      setPhotos(photoObjects);
    } else {
      // Delete doesn't return profile — reload from API
      await loadData();
    }
  };

  const selectClass =
    'px-4 py-2 rounded-lg border border-border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary';

  // Show full-page spinner on initial load
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
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
            Partner Preference
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
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

      </div>
    </div>
  );
};

export default EditProfilePage;
