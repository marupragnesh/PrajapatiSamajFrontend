import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import ProfileCard from '../components/common/ProfileCard';
import SkeletonCard from '../components/common/SkeletonCard';
import EmptyState from '../components/common/EmptyState';
import { discoverProfiles, searchProfiles } from '../api/discoverApi';
import { resolveImageUrl } from '../utils/imageHelper';
import logger from '../utils/logger';

/**
 * DiscoverPage — /discover
 *
 * Features:
 *   - Search bar at the top: type a name → dropdown shows matching profiles
 *     (name + DP). Click a result to navigate to that profile.
 *     Search fires 400ms after the user stops typing (debounce) to avoid
 *     hammering the backend on every keystroke.
 *   - Browse grid below: paginated card list filtered by partner preference.
 *
 * Duplicate-fix:
 *   React 18 Strict Mode runs effects twice in dev. fetchedRef prevents the
 *   initial page-0 fetch from running twice. profileId deduplication acts as
 *   a safety net for any remaining edge cases.
 */
const DiscoverPage = () => {
  const navigate = useNavigate();

  // ── Browse state ──
  const [profiles, setProfiles]       = useState([]);
  const [page, setPage]               = useState(0);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]         = useState(true);
  const fetchedRef                    = useRef(false);

  // ── Search state ──
  const [keyword, setKeyword]             = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching]         = useState(false);
  const [showDropdown, setShowDropdown]   = useState(false);
  const searchDebounceRef                 = useRef(null);
  const searchContainerRef               = useRef(null);

  const PAGE_SIZE = 10;

  // ── Browse helpers ──

  const appendProfiles = (newProfiles) => {
    setProfiles((prev) => {
      const existingIds = new Set(prev.map((p) => p.profileId));
      const unique = newProfiles.filter((p) => !existingIds.has(p.profileId));
      return [...prev, ...unique];
    });
  };

  const fetchProfiles = async (pageToLoad, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);
    try {
      logger.api('GET', '/api/discover', { page: pageToLoad, size: PAGE_SIZE });
      const data = await discoverProfiles(pageToLoad, PAGE_SIZE);
      logger.response('/api/discover', { count: data.length, page: pageToLoad });
      if (data.length === 0) {
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

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchProfiles(0, true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Search helpers ──

  /** Fire search 400ms after user stops typing */
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setKeyword(value);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!value.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        logger.api('GET', '/api/discover/search', { keyword: value });
        const results = await searchProfiles(value.trim());
        logger.response('/api/discover/search', { count: results.length });
        setSearchResults(results);
        setShowDropdown(true);
      } catch (error) {
        logger.error('Search failed', error);
        toast.error('Search failed. Please try again.');
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  /** Close dropdown when clicking outside the search container */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchResultClick = (profileId) => {
    setShowDropdown(false);
    setKeyword('');
    setSearchResults([]);
    navigate(`/profiles/${profileId}`);
  };

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

        {/* ── Header + Search Bar ── */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">🔍 Discover</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Showing profiles based on your partner preference
            </p>
          </div>

          {/* Search input with dropdown */}
          <div ref={searchContainerRef} className="relative w-full sm:w-72">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                🔎
              </span>
              <input
                type="text"
                value={keyword}
                onChange={handleSearchChange}
                placeholder="Search by name..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-border dark:border-gray-600
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {searching && (
                <span className="absolute inset-y-0 right-3 flex items-center">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </span>
              )}
            </div>

            {/* Search results dropdown */}
            {showDropdown && (
              <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-gray-800 rounded-xl
                              shadow-lg border border-border dark:border-gray-600 overflow-hidden">
                {searchResults.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 px-4 py-3 text-center">
                    No profiles found for &quot;{keyword}&quot;
                  </p>
                ) : (
                  <ul>
                    {searchResults.map((result) => (
                      <li
                        key={result.profileId}
                        onClick={() => handleSearchResultClick(result.profileId)}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer
                                   hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      >
                        {/* DP avatar — circular, fallback to initials */}
                        {result.primaryPhotoUrl ? (
                          <img
                            src={resolveImageUrl(result.primaryPhotoUrl)}
                            alt={result.fullName}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-border"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center
                                          flex-shrink-0 text-primary font-semibold text-sm">
                            {result.fullName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {result.fullName}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Browse grid — skeleton on initial load ── */}
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

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 rounded-xl bg-primary text-white font-semibold
                             hover:bg-primary-light transition disabled:opacity-60
                             flex items-center gap-2"
                >
                  {loadingMore && (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full
                                     border-2 border-white border-t-transparent" />
                  )}
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}

            {!hasMore && (
              <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-8">
                You have seen all available profiles. Check back later!
              </p>
            )}
          </>
        )}

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
