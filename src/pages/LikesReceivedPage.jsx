import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Heart, User } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SkeletonCard from '../components/common/SkeletonCard';
import EmptyState from '../components/common/EmptyState';
import { getLikesReceived } from '../api/likeApi';
import { resolveImageUrl } from '../utils/imageHelper';
import logger from '../utils/logger';

/**
 * LikesReceivedPage — shows all profiles that liked the current user.
 * Features clean line icons and universal footer.
 */
const LikesReceivedPage = () => {
  const navigate = useNavigate();
  const [likers, setLikers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleCardClick = (profileId) => {
    logger.info('User clicked on liker profile', { profileId });
    navigate(`/profiles/${profileId}`);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2.5">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            <span>Likes Received</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            These people have liked your profile
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && likers.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {likers.map((liker) => (
              <LikerCard key={liker.profileId} liker={liker} onClick={handleCardClick} />
            ))}
          </div>
        )}

        {!loading && likers.length === 0 && (
          <EmptyState
            icon={<Heart className="w-10 h-10 text-gray-400 stroke-1" />}
            title="No Likes Yet"
            message="No one has liked your profile yet. Complete your profile and add photos to get more visibility!"
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

const LikerCard = ({ liker, onClick }) => {
  const { profileId, fullName, age, city, profession, primaryPhotoUrl } = liker;

  return (
    <div
      onClick={() => onClick(profileId)}
      className="cursor-pointer rounded-2xl border border-border bg-white dark:bg-card-dark overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
    >
      <div className="h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {primaryPhotoUrl ? (
          <img
            src={resolveImageUrl(primaryPhotoUrl)}
            alt={fullName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <User className="w-12 h-12 text-gray-300 dark:text-gray-600 stroke-1" />
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{fullName}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{age} yrs · {city}</p>
        </div>
        <p className="text-sm text-primary mt-1 truncate">{profession}</p>
      </div>
    </div>
  );
};

export default LikesReceivedPage;
