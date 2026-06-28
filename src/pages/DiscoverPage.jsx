import { useEffect, useState } from 'react';
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
 * Shows skeleton cards while loading, empty state when no profiles remain.
 */
const DiscoverPage = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);    // accumulated profiles across pages
  const [page, setPage] = useState(0);              // current page index (0-based)
  const [loading, setLoading] = useState(true);     // true during any fetch
  const [loadingMore, setLoadingMore] = useState(false); // true only for "Load More"
  const [hasMore, setHasMore] = useState(true);     // false when API returns empty array

  const PAGE_SIZE = 10;

  /** Fetch a page of profiles and append to existing list */
  const fetchProfiles = async (pageToLoad, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      logger.info('DiscoverPage loaded');
      logger.api('GET', '/api/discover', { page: pageToLoad, size: PAGE_SIZE });

      const data = await discoverProfiles(pageToLoad, PAGE_SIZE);
      logger.response('/api/discover', { count: data.length, page: pageToLoad });

      if (data.length === 0) {
        // Empty array means no more profiles — hide "Load More"
        logger.info('No more profiles to load');
        setHasMore(false);
        toast('No more profiles to show.', { icon: '🔍' });
      } else {
        // Append new profiles to existing list
        setProfiles((prev) => [...prev, ...data]);
        setPage(pageToLoad + 1); // prepare next page number
      }
    } catch (error) {
      logger.error('Discover failed', error);
      toast.error('Could not load profiles. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  /** Load first page on mount */
  useEffect(() => {
    fetchProfiles(0, true);
  }, []);

  /** Called when user clicks "Load More" */
  const handleLoadMore = () => {
    logger.info('User clicked Load More', { nextPage: page });
    fetchProfiles(page);
  };

  /** Navigate to profile detail on card click */
  const handleCardClick = (profileId) => {
    logger.info('User clicked profile card', { profileId });
    navigate(`/profiles/${profileId}`);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Discover</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Showing profiles based on your partner preference
          </p>
        </div>

        {/* ── Initial skeleton loading grid ── */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Profile grid (shown after load) ── */}
        {!loading && profiles.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {profiles.map((profile) => (
                <div key={profile.profileId} onClick={() => handleCardClick(profile.profileId)}>
                  <ProfileCard profile={profile} />
                </div>
              ))}
            </div>

            {/* Load More button — hidden when no more pages */}
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

            {/* "No more profiles" message at bottom */}
            {!hasMore && (
              <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-8">
                You've seen all available profiles. Check back later!
              </p>
            )}
          </>
        )}

        {/* ── Empty state — no profiles at all ── */}
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
