import { useNavigate } from 'react-router-dom';
import logger from '../../utils/logger';

/**
 * Reusable profile card for Discover, Likes, and Matches pages.
 * Clicking navigates to /profiles/{profileId}.
 */
const ProfileCard = ({ profile }) => {
  const navigate = useNavigate();

  const { profileId, fullName, age, city, profession, primaryPhotoUrl } = profile;

  const handleClick = () => {
    logger.info('User clicked profile card', { profileId });
    navigate(`/profiles/${profileId}`);
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer rounded-2xl border border-border bg-white dark:bg-card-dark overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Profile photo */}
      <div className="h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {primaryPhotoUrl ? (
          <img
            src={primaryPhotoUrl}
            alt={fullName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
            👤
          </div>
        )}
      </div>

      {/* Profile info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{fullName}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {age} yrs · {city}
        </p>
        <p className="text-sm text-primary mt-1 truncate">{profession}</p>
      </div>
    </div>
  );
};

export default ProfileCard;
