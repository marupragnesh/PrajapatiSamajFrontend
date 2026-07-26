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
 *   photos[]           — [{ photoId, photoUrl, isPrimary }]
 *   expectations       — null if user has not filled them in, else ExpectationResponse object
 *   mobileNo           — masked ("98********") unless isMobileUnlocked is true
 *   isMobileUnlocked   — true if viewer is the owner OR has paid to unlock
 *                        CONTACT_UNLOCK; controls whether the real number or
 *                        the UnlockContactButton is shown
 */

/** Human-readable labels for enum values */
const MARITAL_STATUS_LABELS = {
  SINGLE: 'Single',
  DIVORCED: 'Divorced',
  WIDOWED: 'Widowed',
};

const DIET_LABELS = {
  VEG: 'Vegetarian',
  VEG_EGG: 'Veg + Egg Only',
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
  const [showContactInfoModal, setShowContactInfoModal] = useState(false);

  /**
   * Fetch the profile being viewed. Pulled out of useEffect so it can also
   * be called from UnlockContactButton's onUnlocked callback — after a
   * successful contact unlock, this re-fetches so isMobileUnlocked flips to
   * true and the real mobile number appears without a full page reload.
   *
   * @param isRefetch - true when called after unlock (skips the full-page
   *                    spinner so the unlock button doesn't flicker/disappear
   *                    mid-toast; false on initial mount)
   */
  const fetchProfile = async (isRefetch = false) => {
    logger.info('ProfileDetailPage loaded', { profileId, isRefetch });
    if (!isRefetch) setLoading(true);
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
      if (!isRefetch) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

          {/* Thumbnail gallery — click to switch large photo (wrapped, no scrollbar) */}
          {photos.length > 1 && (
            <div className="flex flex-wrap gap-2.5 px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-b border-border/50">
              {photos.map((photo) => (
                <img
                  key={photo.photoId}
                  src={resolveImageUrl(photo.photoUrl)}
                  alt={`Photo ${photo.photoId}`}
                  onClick={() => setSelectedPhotoUrl(photo.photoUrl)}
                  className={`h-14 w-14 object-cover rounded-lg cursor-pointer border-2 transition ${
                    selectedPhotoUrl === photo.photoUrl
                      ? 'border-primary ring-2 ring-primary/30'
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

            {/* ── Quick Navigation Pills ── */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
              <a href="#sec-personal" className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition cursor-pointer">
                👤 Personal Details
              </a>
              <a href="#sec-education" className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition cursor-pointer">
                🎓 Education &amp; Job
              </a>
              <a href="#sec-family" className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition cursor-pointer">
                👨‍👩‍👧 Family Details
              </a>
              {(profile.dateOfBirth || profile.birthTime || profile.birthPlace || profile.hasMangal !== undefined || profile.hasSani !== undefined) && (
                <a href="#sec-birth" className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition cursor-pointer">
                  📜 Birth &amp; Horoscope
                </a>
              )}
              {profile.mobileNo && (
                <a href="#sec-contact" className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition cursor-pointer">
                  📞 Contact Info
                </a>
              )}
              {hasExpectations && (
                <a href="#sec-expectations" className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition cursor-pointer">
                  💑 Expectations
                </a>
              )}
            </div>

            {/* ── Personal Info Collapsible Wrap ── */}
            <Section title="Personal Information" icon="👤" id="sec-personal">
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
                {profile.weight && (
                  <DetailRow label="Weight" value={`${profile.weight} kg`} />
                )}
                {profile.bloodGroup && (
                  <DetailRow label="Blood Group" value={profile.bloodGroup} />
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
                {profile.city && (
                  <DetailRow label="City / Location" value={`${profile.city}${profile.state ? ', ' + profile.state : ''}`} />
                )}
                {profile.addressLine && (
                  <DetailRow label="Address" value={profile.addressLine} />
                )}
                {profile.hobbies && (
                  <div className="col-span-2">
                    <DetailRow label="Hobbies" value={profile.hobbies} />
                  </div>
                )}
                {profile.description && (
                  <div className="col-span-2 pt-1 border-t border-border/40">
                    <DetailRow label="About Me" value={profile.description} />
                  </div>
                )}
              </div>
            </Section>

            {/* ── Education, Job & Salary Collapsible Wrap ── */}
            <Section title="Education, Job &amp; Salary" icon="🎓" id="sec-education">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <DetailRow label="Education"  value={profile.education || 'Not specified'} />
                <DetailRow label="Profession / Occupation" value={profile.profession || 'Not specified'} />
                {profile.income && (
                  <DetailRow label="Annual Income / Salary" value={profile.income} />
                )}
              </div>
            </Section>

            {/* ── Family Details Collapsible Wrap ── */}
            <Section title="Family Details" icon="👨‍👩‍👧" id="sec-family">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <DetailRow label="Father's Name" value={profile.fatherName || 'Not specified'} />
                <DetailRow label="Father's Occupation" value={profile.fatherOccupation || 'Not specified'} />
                <DetailRow label="Mother's Name" value={profile.motherName || 'Not specified'} />
                <DetailRow label="Mother's Occupation" value={profile.motherOccupation || 'Not specified'} />
              </div>
            </Section>

            {/* ── Birth & Horoscope Details Collapsible Wrap ── */}
            {(profile.dateOfBirth || profile.birthTime || profile.birthPlace || profile.hasMangal !== undefined || profile.hasSani !== undefined) && (
              <Section title="Birth &amp; Horoscope Details" icon="📜" id="sec-birth">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {profile.dateOfBirth && (
                    <DetailRow label="Date of Birth" value={profile.dateOfBirth} />
                  )}
                  {profile.birthTime && (
                    <DetailRow label="Birth Time" value={profile.birthTime} />
                  )}
                  {profile.birthPlace && (
                    <DetailRow label="Place of Birth" value={profile.birthPlace} />
                  )}
                  {profile.hasMangal !== undefined && profile.hasMangal !== null && (
                    <DetailRow label="મંગળ (Mangal)" value={profile.hasMangal ? 'હા (Yes)' : 'ના (No)'} />
                  )}
                  {profile.hasSani !== undefined && profile.hasSani !== null && (
                    <DetailRow label="શનિ (Shani)" value={profile.hasSani ? 'હા (Yes)' : 'ના (No)'} />
                  )}
                </div>
              </Section>
            )}

            {/* ── Contact Info Collapsible Wrap ── */}
            {profile.mobileNo && (
              <Section title="Contact Information" icon="📞" id="sec-contact">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 items-center">
                  <div>
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-0.5">
                      Mobile Number
                    </span>
                    {profile.isMobileUnlocked ? (
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {profile.mobileNo}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-wider">
                          {profile.mobileNo ? profile.mobileNo.substring(0, 2) + '********' : '99********'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowContactInfoModal(true)}
                          className="w-5 h-5 rounded-full bg-primary/10 text-primary dark:bg-primary/20 text-xs font-bold flex items-center justify-center hover:bg-primary hover:text-white transition cursor-pointer"
                          title="Click for information"
                        >
                          i
                        </button>
                      </div>
                    )}
                  </div>
                  {profile.alternateMobileNo && (
                    <div>
                      <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-0.5">
                        Alternate Number
                      </span>
                      {profile.isMobileUnlocked ? (
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                          {profile.alternateMobileNo}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-wider">
                          {profile.alternateMobileNo.substring(0, 2) + '********'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* ── Action Buttons ── */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className="flex-1 py-3 rounded-xl bg-error text-white font-semibold hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {likeLoading ? <Spinner /> : '❤️'}
                {likeLoading ? 'Liking...' : 'Like'}
              </button>
              <button
                onClick={handleSendInterest}
                disabled={interestLoading}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {interestLoading ? <Spinner /> : '💌'}
                {interestLoading ? 'Sending...' : 'Send Interest'}
              </button>
            </div>

          </div>
        </div>

        {/* ── Partner Expectations Collapsible Wrap ── */}
        {hasExpectations && (
          <Section title="Partner Expectations" icon="💍" id="sec-expectations" defaultOpen={true}>
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

              {/* Weight range */}
              {(exp.preferredMinWeight || exp.preferredMaxWeight) && (
                <DetailRow
                  label="Weight Range"
                  value={
                    exp.preferredMinWeight && exp.preferredMaxWeight
                      ? `${exp.preferredMinWeight} – ${exp.preferredMaxWeight} kg`
                      : exp.preferredMinWeight
                      ? `${exp.preferredMinWeight}+ kg`
                      : `Up to ${exp.preferredMaxWeight} kg`
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

              {exp.preferredState && (
                <DetailRow label="Preferred State" value={exp.preferredState} />
              )}

              {exp.preferredHasMangal !== undefined && exp.preferredHasMangal !== null && (
                <DetailRow label="મંગળ (Mangal) Preference" value={exp.preferredHasMangal ? 'મંગળ હોવું જોઈએ (Mangal Only)' : 'કોઈ વાંધો નથી / સાદું (Non-Mangal / Any)'} />
              )}

              {exp.preferredHasSani !== undefined && exp.preferredHasSani !== null && (
                <DetailRow label="શનિ (Shani) Preference" value={exp.preferredHasSani ? 'શનિ હોવું જોઈએ (Shani Only)' : 'કોઈ વાંધો નથી (Any)'} />
              )}

              {/* About expectations — full width */}
              {exp.aboutExpectations && (
                <div className="col-span-2">
                  <DetailRow label="About Expectations" value={exp.aboutExpectations} />
                </div>
              )}

            </div>
          </Section>
        )}

        <button
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
        >
          ← Go Back
        </button>

      </div>
      {/* Contact Info Modal */}
      {showContactInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-card-dark rounded-2xl shadow-2xl border border-border dark:border-gray-700 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary text-2xl flex items-center justify-center mx-auto">
              🔒
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Premium Contact Access</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Full mobile numbers are visible to Premium members only. Upgrade to unlock contact details for all profiles!
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowContactInfoModal(false)}
                className="flex-1 py-2 rounded-xl border border-border dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => { setShowContactInfoModal(false); navigate('/payment'); }}
                className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-light transition cursor-pointer shadow"
              >
                Upgrade (₹99)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/** Section wrapper with collapsible accordion toggle (dropdown chevron icon) */
const Section = ({ title, icon, defaultOpen = true, id, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div id={id} className="border border-border/80 dark:border-gray-700/80 rounded-2xl overflow-hidden bg-white dark:bg-card-dark shadow-sm transition">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 bg-gray-50/80 dark:bg-gray-800/60 flex items-center justify-between font-bold text-gray-900 dark:text-gray-100 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer select-none border-b border-border/50 dark:border-gray-700/50"
      >
        <span className="flex items-center gap-2.5">
          {icon && <span className="text-base">{icon}</span>}
          <span className="tracking-wide">{title}</span>
        </span>
        <span className={`text-xs text-gray-500 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="p-5">
          {children}
        </div>
      )}
    </div>
  );
};

/** Single label + value row */
const DetailRow = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium">{label}</p>
    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{value}</p>
  </div>
);

export default ProfileDetailPage;
