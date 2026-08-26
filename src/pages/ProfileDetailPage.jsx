import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Spinner from '../components/common/Spinner';
import UnlockContactButton from '../components/payment/UnlockContactButton';
import { getProfileById } from '../api/profileApi';
import { likeProfile } from '../api/likeApi';
import { sendInterest, cancelInterest } from '../api/interestApi';
import { resolveImageUrl } from '../utils/imageHelper';
import logger from '../utils/logger';

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
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showContactInfoModal, setShowContactInfoModal] = useState(false);

  const fetchProfile = async (isRefetch = false) => {
    logger.info('ProfileDetailPage loaded', { profileId, isRefetch });
    if (!isRefetch) setLoading(true);
    try {
      logger.api('GET', `/api/profiles/${profileId}`);
      const data = await getProfileById(profileId);
      logger.response(`/api/profiles/${profileId}`, data);
      setProfile(data);

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
      setProfile((prev) => (prev ? { ...prev, isLikedByMe: true } : prev));
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
      setProfile((prev) => (prev ? { ...prev, interestStatus: 'PENDING_SENT' } : prev));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not send interest.');
    } finally {
      setInterestLoading(false);
    }
  };

  const handleCancelInterest = async () => {
    setCancelLoading(true);
    try {
      const data = await cancelInterest(profileId);
      toast.success(data.message || 'Interest request withdrawn.');
      setProfile((prev) => (prev ? { ...prev, interestStatus: 'NONE' } : prev));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not withdraw interest.');
    } finally {
      setCancelLoading(false);
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
  const exp = profile.expectations;

  const hasExpectations = exp && Object.values(exp).some(
    (v) => v !== null && v !== undefined && v !== ''
  );

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">

        {/* ── Card: Photo + Profile Info + Actions ── */}
        <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm overflow-hidden border border-border/60">

          {/* Large selected photo */}
          <div className="w-full bg-gray-950 flex items-center justify-center min-h-[300px] max-h-[500px] sm:max-h-[550px] overflow-hidden">
            {selectedPhotoUrl ? (
              <img
                src={resolveImageUrl(selectedPhotoUrl)}
                alt={profile.fullName}
                className="max-h-[500px] sm:max-h-[550px] w-auto max-w-full object-contain mx-auto transition-transform"
              />
            ) : (
              <div className="w-full h-72 flex items-center justify-center text-6xl text-gray-400">
                👤
              </div>
            )}
          </div>

          {/* Thumbnail gallery */}
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

            {/* Name + Instagram Handle Badge + City & Primary Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {profile.fullName}, {profile.age}
                  </h1>
                  {profile.username && (
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-orange-300 text-xs font-bold tracking-wide border border-primary/20">
                      @{profile.username}
                    </span>
                  )}
                </div>
                <p className="text-primary font-medium mt-1">📍 {profile.city}</p>
              </div>

              {/* Action Buttons: Like & Interest */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Like Button */}
                <button
                  onClick={handleLike}
                  disabled={likeLoading || profile.isLikedByMe}
                  className={`px-3 py-2 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    profile.isLikedByMe
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600'
                  }`}
                >
                  <span>{profile.isLikedByMe ? '❤️' : '🤍'}</span>
                  <span>{profile.isLikedByMe ? 'Liked' : 'Like'}</span>
                </button>

                {/* Interest Status / Action Button */}
                {profile.interestStatus === 'MATCHED' && (
                  <div className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5">
                    <span>🎉</span>
                    <span>Mutual Match</span>
                  </div>
                )}

                {profile.interestStatus === 'PENDING_SENT' && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs sm:text-sm font-bold flex items-center gap-1.5">
                      <span>⏳</span>
                      <span>Interest Sent</span>
                    </div>
                    <button
                      onClick={handleCancelInterest}
                      disabled={cancelLoading}
                      title="Withdraw sent interest request"
                      className="px-2.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold border border-border dark:border-gray-700 transition cursor-pointer flex items-center gap-1"
                    >
                      {cancelLoading ? <Spinner size="xs" /> : <span>✕</span>}
                      <span>Withdraw</span>
                    </button>
                  </div>
                )}

                {profile.interestStatus === 'ACCEPTED_SENT' && (
                  <div className="px-3 py-2 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 text-xs sm:text-sm font-bold flex items-center gap-1.5">
                    <span>✅</span>
                    <span>Accepted by Them</span>
                  </div>
                )}

                {profile.interestStatus === 'PENDING_RECEIVED' && (
                  <button
                    onClick={() => navigate('/interests')}
                    className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold hover:bg-primary-light transition flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <span>💌</span>
                    <span>Respond</span>
                  </button>
                )}

                {(profile.interestStatus === 'NONE' || profile.interestStatus === 'ACCEPTED_RECEIVED' || profile.interestStatus === 'DECLINED' || !profile.interestStatus) && (
                  <button
                    onClick={handleSendInterest}
                    disabled={interestLoading}
                    className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold hover:bg-primary-light transition flex items-center gap-1.5 shadow disabled:opacity-60 cursor-pointer"
                  >
                    <span>💌</span>
                    <span>{interestLoading ? 'Sending...' : 'Send Interest'}</span>
                  </button>
                )}
              </div>
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
                  📞 Contact Details
                </a>
              )}
              {hasExpectations && (
                <a href="#sec-expectations" className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition cursor-pointer">
                  💑 Expectations
                </a>
              )}
            </div>

            {/* ── Personal Info ── */}
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
                  <DetailRow label="City" value={`${profile.city}${profile.state ? ', ' + profile.state : ''}`} />
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

            {/* ── Education, Job & Salary ── */}
            <Section title="Education & Job" icon="🎓" id="sec-education">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <DetailRow label="Education" value={profile.education || 'Not specified'} />
                <DetailRow label="Profession" value={profile.profession || 'Not specified'} />
                {profile.income && (
                  <DetailRow label="Annual Income" value={profile.income} />
                )}
              </div>
            </Section>

            {/* ── Family Details ── */}
            <Section title="Family Background" icon="👨‍👩‍👧" id="sec-family">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <DetailRow label="Father's Name" value={profile.fatherName || 'Not specified'} />
                <DetailRow label="Father's Occupation" value={profile.fatherOccupation || 'Not specified'} />
                <DetailRow label="Mother's Name" value={profile.motherName || 'Not specified'} />
                <DetailRow label="Mother's Occupation" value={profile.motherOccupation || 'Not specified'} />
              </div>
            </Section>

            {/* ── Birth & Horoscope Details ── */}
            {(profile.dateOfBirth || profile.birthTime || profile.birthPlace || profile.hasMangal !== undefined || profile.hasSani !== undefined) && (
              <Section title="Birth & Horoscope Details" icon="📜" id="sec-birth">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {profile.dateOfBirth && (
                    <DetailRow label="Date of Birth" value={profile.dateOfBirth} />
                  )}
                  {profile.birthTime && (
                    <DetailRow label="Birth Time" value={profile.birthTime} />
                  )}
                  {profile.birthPlace && (
                    <DetailRow label="Birth Place" value={profile.birthPlace} />
                  )}
                  {profile.hasMangal !== undefined && (
                    <DetailRow
                      label="Mangal (મંગળ)"
                      value={profile.hasMangal === true ? 'Yes (હા)' : profile.hasMangal === false ? 'No (ના)' : 'Prefer not to say'}
                    />
                  )}
                  {profile.hasSani !== undefined && (
                    <DetailRow
                      label="Shani (શનિ)"
                      value={profile.hasSani === true ? 'Yes (હા)' : profile.hasSani === false ? 'No (ના)' : 'Prefer not to say'}
                    />
                  )}
                </div>
              </Section>
            )}

            {/* ── Contact Info Collapsible Wrap ── */}
            {profile.mobileNo && (
              <Section title="Contact Details" icon="📞" id="sec-contact">
                <div className="space-y-4">
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
                            title="Click for info"
                          >
                            i
                          </button>
                        </div>
                      )}
                    </div>
                    {profile.alternateMobileNo && (
                      <div>
                        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-0.5">
                          Alternate Mobile
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

                  {/* Residential Address Subsection */}
                  <div className="pt-2 border-t border-border/50 dark:border-gray-700/50">
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1">
                      Residential Address
                    </span>
                    {profile.isMobileUnlocked ? (
                      <div className="text-sm text-gray-800 dark:text-gray-100 space-y-0.5">
                        <p className="font-semibold">{profile.addressLine || 'Address details not specified'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {[profile.city, profile.state, profile.pincode].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-wider">
                          🏠 ****************** ({[profile.city, profile.state].filter(Boolean).join(', ')})
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                          🔒 Locked
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ₹9 Single Profile Unlock Action Button directly on contact section */}
                  {!profile.isMobileUnlocked && (
                    <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 mt-3">
                      <div>
                        <p className="text-xs font-bold text-amber-900 dark:text-amber-200">🔓 Unlock Contact &amp; Address for ₹9</p>
                        <p className="text-[11px] text-amber-700 dark:text-amber-400">Pay only ₹9 to instantly reveal this user's mobile number and full address!</p>
                      </div>
                      <UnlockContactButton 
                        targetProfileId={profile.profileId} 
                        feature="SINGLE_PROFILE_UNLOCK" 
                        label="Unlock for ₹9" 
                        onUnlocked={() => fetchProfile(true)}
                      />
                    </div>
                  )}
                </div>
              </Section>
            )}

          </div>
        </div>

        {/* ── Partner Expectations Collapsible Wrap ── */}
        {hasExpectations && (
          <Section title="Partner Expectations" icon="💍" id="sec-expectations" defaultOpen={true}>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
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

              {(exp.preferredMinHeight || exp.preferredMaxHeight) && (
                <DetailRow
                  label="Preferred Height"
                  value={
                    exp.preferredMinHeight && exp.preferredMaxHeight
                      ? `${exp.preferredMinHeight} – ${exp.preferredMaxHeight}`
                      : exp.preferredMinHeight || exp.preferredMaxHeight
                  }
                />
              )}

              {exp.preferredMaritalStatus && (
                <DetailRow
                  label="Preferred Marital Status"
                  value={MARITAL_STATUS_LABELS[exp.preferredMaritalStatus] || exp.preferredMaritalStatus}
                />
              )}

              {exp.preferredDiet && (
                <DetailRow
                  label="Preferred Diet"
                  value={DIET_LABELS[exp.preferredDiet] || exp.preferredDiet}
                />
              )}

              {exp.preferredGotra && (
                <DetailRow label="Preferred Gotra" value={exp.preferredGotra} />
              )}

              {exp.preferredReligion && (
                <DetailRow label="Religion" value={exp.preferredReligion} />
              )}

              {exp.preferredEducation && (
                <DetailRow label="Preferred Education" value={exp.preferredEducation} />
              )}

              {exp.preferredProfession && (
                <DetailRow label="Preferred Profession" value={exp.preferredProfession} />
              )}

              {exp.preferredIncome && (
                <DetailRow label="Annual Income" value={exp.preferredIncome} />
              )}

              {exp.preferredCity && (
                <DetailRow label="Preferred City" value={exp.preferredCity} />
              )}

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
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Unlock Mobile Number</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Choose options below: Unlock this single profile contact for ₹9 (Incl. GST), or get full unlimited contact access with our 2-Month Membership plans.
              </p>
            </div>
            <div className="space-y-2 pt-1">
              <UnlockContactButton 
                targetProfileId={profile.profileId} 
                feature="SINGLE_PROFILE_UNLOCK" 
                label="Unlock This Profile (₹9 Incl. GST)" 
                onUnlocked={() => { setShowContactInfoModal(false); fetchProfile(true); }}
                customClass="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow transition cursor-pointer"
              />
              <button
                onClick={() => { setShowContactInfoModal(false); navigate('/payment'); }}
                className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-light transition cursor-pointer shadow"
              >
                View Premium Membership Plans
              </button>
              <button
                onClick={() => setShowContactInfoModal(false)}
                className="w-full py-2 rounded-xl border border-border dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, icon, defaultOpen = false, id, children }) => {
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

const DetailRow = ({ label, value }) => {
  return (
    <div>
      <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{value}</p>
    </div>
  );
};

export default ProfileDetailPage;
