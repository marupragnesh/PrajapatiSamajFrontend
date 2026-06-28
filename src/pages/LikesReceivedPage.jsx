import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import SkeletonCard from '../components/common/SkeletonCard';
import EmptyState from '../components/common/EmptyState';
import { getLikesReceived } from '../api/likeApi';
import logger from '../utils/logger';

/**
 * LikesReceivedPage — shows all profiles that liked the current user.
 * Clicking a card navigates to /profiles/{profileId}.
 * No contact info shown — Phase 1 only.
 */
const LikesReceivedPage = () => {
  const navigate = useNavigate();
  const [likers, setLikers] = useState([]);
  const [loading, setLoading] = useState(true);

  /** Load all received likes on mount */
  useEffect(() => {
    const fetchLikes = async () => {
      logger.info('LikesReceivedPage loaded');
      setLoading(true);
      try {
        logger.api('GET', '/api/likes/received');
        const data = await getLikesReceived();
        logger.response('/api/likes/received', { count: data.length });
        setLikers(data);
      } catch (error) {
        logger.error('Failed to load likes', error);
        toast.error('Could not load likes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLikes();
  }, []);

  /** Navigate to profile detail page */
  const handleCardClick = (profileId) => {
    logger.info('User clicked on liker profile', { profileId });
    navigate(`/profiles/${profileId}`);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">❤️ Likes Received</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            These people have liked your profile
          </p>
        </div>

        {/* Skeleton loading grid */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Likers grid */}
        {!loading && likers.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {likers.map((liker) => (
              <LikerCard key={liker.profileId} liker={liker} onClick={handleCardClick} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && likers.length === 0 && (
          <EmptyState
            icon="💔"
            title="No Likes Yet"
            message="No one has liked your profile yet. Complete your profile and add photos to get more visibility!"
          />
        )}
      </div>
    </div>
  );
};

/**
 * LikerCard — display card for someone who liked you.
 * Shows: photo, name, age, city, profession.
 * Clicking opens their full profile.
 */
const LikerCard = ({ liker, onClick }) => {
  const {
    profileId,
    fullName,
    age,
    city,
    profession,
    primaryPhotoUrl,
  } = liker;

  return (
    <div
      onClick={() => onClick(profileId)}
      className="cursor-pointer rounded-2xl border border-border bg-white dark:bg-card-dark overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Photo */}
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

      {/* Info */}
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

export default LikesReceivedPage;
