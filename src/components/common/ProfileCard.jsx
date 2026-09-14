import { useNavigate } from 'react-router-dom';
import { resolveImageUrl } from '../../utils/imageHelper';
import logger from '../../utils/logger';

/**
 * Reusable profile card for Discover, Likes, and Matches pages.
 * Clicking navigates to /profiles/{profileId}.
 */
const ProfileCard = ({ profile }) => {
  const navigate = useNavigate();
  const { profileId, fullName, age, city, profession, primaryPhotoUrl, lastActiveText } = profile;

  const handleClick = () => {
    logger.info('User clicked profile card', { profileId });
    navigate(`/profiles/${profileId}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer rounded-2xl border border-border bg-white dark:bg-card-dark overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col h-full"
    >
      {/* Profile photo — resolveImageUrl strips backend host so Vite proxy handles it */}
      <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
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
            <span className={`w-1.5 h-1.5 rounded-full ${lastActiveText.includes('today') ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{lastActiveText}</span>
          </div>
        )}
      </div>

      {/* Profile info */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-1 truncate">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{fullName}</h3>
          {profile.username && (
            <span className="text-[11px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
              @{profile.username}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {age} yrs · {city}
        </p>
        <p className="text-sm text-primary mt-1 truncate">{profession}</p>
      </div>
    </div>
  );
};

export default ProfileCard;
