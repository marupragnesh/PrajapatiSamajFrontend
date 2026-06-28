import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import ProfileCard from '../components/common/ProfileCard';
import SkeletonCard from '../components/common/SkeletonCard';
import EmptyState from '../components/common/EmptyState';
import { discoverProfiles } from '../api/discoverApi';
import logger from '../utils/logger';

/**
 * DiscoverPage — browse profiles filtered by user's partner preference.
 * Uses "Load More" pagination (not infinite scroll — better performance per spec).
 *
 * Duplicate fix:
 *   React 18 Strict Mode runs effects twice in development. To prevent the
 *   initial page-0 fetch from running twice and appending the same profiles
 *   twice, we use a ref guard (fetchedRef) that blocks the second execution.
 *   We also deduplicate by profileId as a safety net for any edge cases.
 */
const DiscoverPage = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Guard: prevents React 18 Strict Mode double-invocation from fetching page 0 twice
  const fetchedRef = useRef(false);

  const PAGE_SIZE = 10;

  /** Append profiles to state, deduplicating by profileId */
  const appendProfiles = (newProfiles) => {
    setProfiles((prev) => {
      const existingIds = new Set(prev.map((p) => p.profileId));
      const unique = newProfiles.filter((p) => !existingIds.has(p.profileId));
      return [...prev, ...unique];
    });
  };

  /** Fetch a specific page and append results */
  const fetchProfiles = async (pageToLoad, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      logger.info('DiscoverPage loaded');
      logger.api('GET', '/api/discover', { page: pageToLoad, size: PAGE_SIZE });

      const data = await discoverProfiles(pageToLoad, PAGE_SIZE);
      logger.response('/api/discover', { count: data.length, page: pageToLoad });

      if (data.length === 0) {
        logger.info('No more profiles to load');
        setHasMore(false);
        if (!isInitial) toast('You have seen all available profiles.', { icon: '🔍' });
      } else {
        appendProfiles(data);
        setPage(pageToLoad + 1);
      }
    } catch (error) {
      logger.error('Discover failed', error);
      toast.error('Could not load profiles. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  /** Load first page on mount — ref guard prevents Strict Mode double-run */
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchProfiles(0, true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    logger.info('User clicked Load More', { nextPage: page });
    fetchProfiles(page);
  };

  const handleCardClick = (profileId) => {
    logger.info('User clicked profile card', { profileId });
    navigate(`/profiles/${profileId}`);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">🔍 Discover</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Showing profiles based on your partner preference
          </p>
        </div>

        {/* Skeleton grid on initial load */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Profile grid */}
        {!loading && profiles.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {profiles.map((profile) => (
                <div key={profile.profileId} onClick={() => handleCardClick(profile.profileId)}>
                  <ProfileCard profile={profile} />
                </div>
              ))}
            </div>

            {/* Load More button */}
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition disabled:opacity-60 flex items-center gap-2"
                >
                  {loadingMore && (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}

            {/* End of results */}
            {!hasMore && (
              <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-8">
                You have seen all available profiles. Check back later!
              </p>
            )}
          </>
        )}

        {/* Empty state — no profiles at all */}
        {!loading && profiles.length === 0 && (
          <EmptyState
            icon="👥"
            title="No Profiles Found"
            message="There are no profiles matching your preference yet. Try updating your partner preference in your profile settings."
          />
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;
