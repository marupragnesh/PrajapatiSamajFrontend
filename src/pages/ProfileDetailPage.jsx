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
 * Displays:
 *   - Photo gallery (large view + thumbnails)
 *   - Personal info: name, age, city, gender, maritalStatus, height, diet, gotra, religion, income, hobbies
 *   - Professional info: education, profession
 *   - Partner Expectations section (shown only if the user has filled them in)
 *   - Like + Send Interest action buttons
 *
 * Backend contract:
 *   photos[]     — [{ photoId, photoUrl, isPrimary }]
 *   expectations — null if user has not filled them in, else ExpectationResponse object
 *
 * Phase 1 — no contact info shown.
 */

/** Human-readable labels for enum values */
const MARITAL_STATUS_LABELS = {
  SINGLE: 'Single',
  DIVORCED: 'Divorced',
  WIDOWED: 'Widowed',
};

const DIET_LABELS = {
  VEG: 'Vegetarian',
  NON_VEG: 'Non-Vegetarian',
  VEGAN: 'Vegan',
};

const GENDER_LABELS = {
  MALE: 'Male',
  FEMALE: 'Female',
  PREFER_NOT_TO_SAY: 'Prefer not to say',
};

const ProfileDetailPage = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState(null);
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

        // Start with primaryPhotoUrl; fall back to first photo in array
        const primary = data.primaryPhotoUrl || (data.photos?.[0]?.photoUrl ?? null);
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
    setLikeLoading(true);
    try {
      const data = await likeProfile(profileId);
      toast.success(data.message || 'Profile liked!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not like profile.');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleSendInterest = async () => {
    setInterestLoading(true);
    try {
      const data = await sendInterest(profileId);
      toast.success(data.message || 'Interest request sent!');
    } catch (error) {
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

  const photos = profile.photos || [];
  const exp = profile.expectations; // null if not filled in

  // Check if expectations has at least one non-null field worth showing
  const hasExpectations = exp && Object.values(exp).some(
    (v) => v !== null && v !== undefined && v !== ''
  );

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">

        {/* ── Card: Photo + Profile Info + Actions ── */}
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

          <div className="p-6 space-y-5">

            {/* Name + City */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {profile.fullName}, {profile.age}
              </h1>
              <p className="text-primary font-medium mt-1">📍 {profile.city}</p>
            </div>

            {/* ── Personal Info ── */}
            <Section title="Personal Information">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {profile.gender && (
                  <DetailRow label="Gender" value={GENDER_LABELS[profile.gender] || profile.gender} />
                )}
                {profile.maritalStatus && (
                  <DetailRow label="Marital Status" value={MARITAL_STATUS_LABELS[profile.maritalStatus] || profile.maritalStatus} />
                )}
                {profile.height && (
                  <DetailRow label="Height" value={profile.height} />
                )}
                {profile.diet && (
                  <DetailRow label="Diet" value={DIET_LABELS[profile.diet] || profile.diet} />
                )}
                {profile.gotra && (
                  <DetailRow label="Gotra" value={profile.gotra} />
                )}
                {profile.religion && (
                  <DetailRow label="Religion" value={profile.religion} />
                )}
                {profile.income && (
                  <DetailRow label="Income" value={profile.income} />
                )}
                {profile.hobbies && (
                  <div className="col-span-2">
                    <DetailRow label="Hobbies" value={profile.hobbies} />
                  </div>
                )}
              </div>
            </Section>

            {/* ── Professional Info ── */}
            <Section title="Professional Information">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <DetailRow label="Education"  value={profile.education} />
                <DetailRow label="Profession" value={profile.profession} />
              </div>
            </Section>

            {/* ── Action Buttons ── */}
            <div className="flex gap-3 pt-1">
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

        {/* ── Card: Partner Expectations (only if filled in) ── */}
        {hasExpectations && (
          <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
              💍 Partner Expectations
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">

              {/* Age range */}
              {(exp.minAge || exp.maxAge) && (
                <DetailRow
                  label="Age Range"
                  value={
                    exp.minAge && exp.maxAge
                      ? `${exp.minAge} – ${exp.maxAge} years`
                      : exp.minAge
                      ? `${exp.minAge}+ years`
                      : `Up to ${exp.maxAge} years`
                  }
                />
              )}

              {/* Height range */}
              {(exp.preferredMinHeight || exp.preferredMaxHeight) && (
                <DetailRow
                  label="Height Range"
                  value={
                    exp.preferredMinHeight && exp.preferredMaxHeight
                      ? `${exp.preferredMinHeight} – ${exp.preferredMaxHeight}`
                      : exp.preferredMinHeight || exp.preferredMaxHeight
                  }
                />
              )}

              {exp.preferredMaritalStatus && (
                <DetailRow
                  label="Marital Status"
                  value={MARITAL_STATUS_LABELS[exp.preferredMaritalStatus] || exp.preferredMaritalStatus}
                />
              )}

              {exp.preferredDiet && (
                <DetailRow
                  label="Diet"
                  value={DIET_LABELS[exp.preferredDiet] || exp.preferredDiet}
                />
              )}

              {exp.preferredGotra && (
                <DetailRow label="Gotra" value={exp.preferredGotra} />
              )}

              {exp.preferredReligion && (
                <DetailRow label="Religion" value={exp.preferredReligion} />
              )}

              {exp.preferredEducation && (
                <DetailRow label="Education" value={exp.preferredEducation} />
              )}

              {exp.preferredProfession && (
                <DetailRow label="Profession" value={exp.preferredProfession} />
              )}

              {exp.preferredIncome && (
                <DetailRow label="Income" value={exp.preferredIncome} />
              )}

              {exp.preferredCity && (
                <DetailRow label="Preferred City" value={exp.preferredCity} />
              )}

              {/* About expectations — full width */}
              {exp.aboutExpectations && (
                <div className="col-span-2">
                  <DetailRow label="About Expectations" value={exp.aboutExpectations} />
                </div>
              )}

            </div>
          </div>
        )}

        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
        >
          ← Go Back
        </button>

      </div>
    </div>
  );
};

/** Section wrapper with a title */
const Section = ({ title, children }) => (
  <div>
    <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
      {title}
    </h2>
    {children}
  </div>
);

/** Single label + value row */
const DetailRow = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</p>
    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">{value}</p>
  </div>
);

export default ProfileDetailPage;
