import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Spinner from '../components/common/Spinner';
import { getProfileById } from '../api/profileApi';
import { likeProfile } from '../api/likeApi';
import { sendInterest } from '../api/interestApi';
import { resolveImageUrl } from '../utils/imageHelper';
import logger from '../utils/logger';

/**
 * ProfileDetailPage — full profile view of another user.
 *
 * Backend PhotoDto shape: { photoId, photoUrl, isPrimary }
 * primaryPhotoUrl is a separate top-level field (relative path).
 * photos[] is used for the thumbnail gallery.
 *
 * Phase 1 — no contact info shown.
 */
const ProfileDetailPage = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState(null); // currently shown large photo
  const [likeLoading, setLikeLoading] = useState(false);
  const [interestLoading, setInterestLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      logger.info('ProfileDetailPage loaded', { profileId });
      setLoading(true);
      try {
        logger.api('GET', `/api/profiles/${profileId}`);
        const data = await getProfileById(profileId);
        logger.response(`/api/profiles/${profileId}`, data);
        setProfile(data);

        // Start with primaryPhotoUrl; fall back to first photo in array if missing
        const primary = data.primaryPhotoUrl
          || (data.photos?.[0]?.photoUrl ?? null);
        setSelectedPhotoUrl(primary);
      } catch (error) {
        logger.error('Failed to load profile', error.response?.data);
        if (error.response?.status === 404) {
          toast.error('Profile not found.');
          navigate('/discover');
        } else {
          toast.error('Could not load profile. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId, navigate]);

  const handleLike = async () => {
    logger.info('User clicked Like', { profileId });
    setLikeLoading(true);
    try {
      logger.api('POST', `/api/likes/${profileId}`);
      const data = await likeProfile(profileId);
      toast.success(data.message || 'Profile liked!');
    } catch (error) {
      logger.error('Like failed', error.response?.data);
      toast.error(error.response?.data?.message || 'Could not like profile.');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleSendInterest = async () => {
    logger.info('User clicked Send Interest', { profileId });
    setInterestLoading(true);
    try {
      logger.api('POST', `/api/interests/${profileId}`);
      const data = await sendInterest(profileId);
      toast.success(data.message || 'Interest request sent!');
    } catch (error) {
      logger.error('Send interest failed', error.response?.data);
      toast.error(error.response?.data?.message || 'Could not send interest.');
    } finally {
      setInterestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  // photos[] from backend: [{ photoId, photoUrl, isPrimary }]
  const photos = profile.photos || [];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm overflow-hidden">

          {/* Large selected photo */}
          <div className="h-80 bg-gray-100 dark:bg-gray-800">
            {selectedPhotoUrl ? (
              <img
                src={resolveImageUrl(selectedPhotoUrl)}
                alt={profile.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">
                👤
              </div>
            )}
          </div>

          {/* Thumbnail gallery — click to switch large photo */}
          {photos.length > 1 && (
            <div className="flex gap-2 px-4 py-3 overflow-x-auto">
              {photos.map((photo) => (
                <img
                  key={photo.photoId}
                  src={resolveImageUrl(photo.photoUrl)}
                  alt={`Photo ${photo.photoId}`}
                  onClick={() => setSelectedPhotoUrl(photo.photoUrl)}
                  className={`h-14 w-14 object-cover rounded-lg cursor-pointer border-2 flex-shrink-0 transition ${
                    selectedPhotoUrl === photo.photoUrl
                      ? 'border-primary'
                      : 'border-transparent hover:border-primary-light'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Profile details */}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.fullName}, {profile.age}
            </h1>
            <p className="text-primary font-medium mt-1">{profile.city}</p>

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
              <DetailRow label="Education"  value={profile.education} />
              <DetailRow label="Profession" value={profile.profession} />
              {profile.religion && <DetailRow label="Religion" value={profile.religion} />}
              {profile.hobbies && (
                <div className="col-span-2">
                  <DetailRow label="Hobbies" value={profile.hobbies} />
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className="flex-1 py-3 rounded-xl bg-error text-white font-semibold hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {likeLoading ? <Spinner /> : '❤️'}
                {likeLoading ? 'Liking...' : 'Like'}
              </button>
              <button
                onClick={handleSendInterest}
                disabled={interestLoading}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {interestLoading ? <Spinner /> : '💌'}
                {interestLoading ? 'Sending...' : 'Send Interest'}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-sm text-gray-500 dark:text-gray-400 hover:underline"
        >
          ← Go Back
        </button>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</p>
    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">{value}</p>
  </div>
);

export default ProfileDetailPage;
