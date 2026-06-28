import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import SkeletonCard from '../components/common/SkeletonCard';
import EmptyState from '../components/common/EmptyState';
import { getMatches } from '../api/interestApi';
import logger from '../utils/logger';

/**
 * MatchesPage — shows all mutual matches (both parties accepted interest).
 *
 * Phase 1 rules:
 * - Show: name, age, city, profession, matched date
 * - Do NOT show: phone number or email (contact reveal is Phase 2 feature)
 */
const MatchesPage = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  /** Load all matches on mount */
  useEffect(() => {
    const fetchMatches = async () => {
      logger.info('MatchesPage loaded');
      setLoading(true);
      try {
        logger.api('GET', '/api/interests/matches');
        const data = await getMatches();
        logger.response('/api/interests/matches', { count: data.length });
        setMatches(data);
      } catch (error) {
        logger.error('Failed to load matches', error);
        toast.error('Could not load matches. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Celebratory banner (only shown when there are matches) ── */}
        {!loading && matches.length > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-2xl px-6 py-4 mb-6 text-center">
            <p className="text-lg font-bold text-primary">
              🎉 You have {matches.length} mutual match{matches.length > 1 ? 'es' : ''}!
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              These people have accepted your interest request
            </p>
          </div>
        )}

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">🎉 Matches</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Your mutual connections — both of you said yes!
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

        {/* Matches grid */}
        {!loading && matches.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {matches.map((match) => (
              <MatchCard
                key={match.interestRequestId}
                match={match}
                onViewProfile={(profileId) => navigate(`/profiles/${profileId}`)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && matches.length === 0 && (
          <EmptyState
            icon="🤝"
            title="No Matches Yet"
            message="No mutual matches yet. Send more interest requests and wait for them to accept!"
          />
        )}
      </div>
    </div>
  );
};

/**
 * MatchCard — displays a mutual match.
 * Phase 1: shows name, age, city, profession, matched date.
 * Contact info is NOT shown — that is a Phase 2 paid feature.
 */
const MatchCard = ({ match, onViewProfile }) => {
  const {
    profileId,
    fullName,
    age,
    city,
    profession,
    primaryPhotoUrl,
    matchedAt,
  } = match;

  /** Format the match date */
  const formattedDate = matchedAt
    ? new Date(matchedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <div
      onClick={() => onViewProfile(profileId)}
      className="cursor-pointer rounded-2xl border border-primary/30 bg-white dark:bg-card-dark overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Photo */}
      <div className="h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
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

        {/* Match badge overlay */}
        <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
          ✓ Match
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{fullName}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {age} yrs · {city}
        </p>
        <p className="text-sm text-primary mt-1 truncate">{profession}</p>
        {formattedDate && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Matched on {formattedDate}
          </p>
        )}
      </div>
    </div>
  );
};

export default MatchesPage;
