import { useNavigate } from 'react-router-dom';
import { resolveImageUrl } from '../../utils/imageHelper';
import logger from '../../utils/logger';

/**
 * ProfileListCard — Horizontal full-width list card for Discover & Browse views.
 * Corresponds to Section 2 (wide horizontal row) in the layout design.
 * Clicking navigates to /profiles/{profileId}.
 */
const ProfileListCard = ({ profile }) => {
  const navigate = useNavigate();
  const {
    profileId,
    fullName,
    username,
    age,
    gender,
    maritalStatus,
    city,
    state,
    profession,
    education,
    primaryPhotoUrl,
    lastActiveText,
    gotra,
    diet,
  } = profile;

  const handleClick = () => {
    logger.info('User clicked profile list card', { profileId });
    navigate(`/profiles/${profileId}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer w-full rounded-2xl border border-border bg-white dark:bg-card-dark p-3.5 sm:p-4 shadow-sm hover:shadow-md transition duration-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
    >
      {/* Photo Column */}
      <div className="relative w-full sm:w-36 md:w-44 h-48 sm:h-36 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
        {primaryPhotoUrl ? (
          <img
            src={resolveImageUrl(primaryPhotoUrl)}
            alt={fullName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
            👤
          </div>
        )}

        {/* Day-wise Last Active Badge */}
        {lastActiveText && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-white backdrop-blur-md flex items-center gap-1 border border-white/10 shadow-sm">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                lastActiveText.includes('today') ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{lastActiveText}</span>
          </div>
        )}
      </div>

      {/* Info Column */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 truncate group-hover:text-primary transition-colors">
              {fullName}
            </h3>
            {username && (
              <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                @{username}
              </span>
            )}
          </div>
        </div>

        {/* Basic Stats: Age, Gender, Location */}
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex items-center flex-wrap gap-x-2 gap-y-1">
          <span>{age ? `${age} Yrs` : ''}</span>
          {gender && <span>• {gender}</span>}
          {maritalStatus && <span>• {maritalStatus}</span>}
          {(city || state) && (
            <span className="text-gray-500 dark:text-gray-400">
              • 📍 {[city, state].filter(Boolean).join(', ')}
            </span>
          )}
        </p>

        {/* Career & Education */}
        <div className="text-xs sm:text-sm space-y-0.5">
          {profession && (
            <p className="font-medium text-primary dark:text-primary-light truncate">
              💼 {profession}
            </p>
          )}
          {education && (
            <p className="text-gray-500 dark:text-gray-400 truncate">
              🎓 {education}
            </p>
          )}
        </div>

        {/* Detail Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {gotra && (
            <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[11px] text-gray-600 dark:text-gray-300 font-medium">
              Gotra: {gotra}
            </span>
          )}
          {diet && (
            <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[11px] text-gray-600 dark:text-gray-300 font-medium">
              Diet: {diet}
            </span>
          )}
        </div>
      </div>

      {/* Action / View Profile button */}
      <div className="sm:pl-4 sm:border-l border-border/60 shrink-0 flex sm:flex-col justify-end items-center sm:items-end gap-2 pt-2 sm:pt-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-semibold text-xs transition duration-200 flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>View Profile</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileListCard;
