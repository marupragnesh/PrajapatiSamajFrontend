import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import ProfileCard from '../components/common/ProfileCard';
import SkeletonCard from '../components/common/SkeletonCard';
import EmptyState from '../components/common/EmptyState';
import FilterPopup from '../components/discover/FilterPopup';
import { discoverProfiles, searchProfiles } from '../api/discoverApi';
import { getPaymentStatus } from '../api/paymentApi';
import { resolveImageUrl } from '../utils/imageHelper';
import logger from '../utils/logger';

/**
 * DiscoverPage — /discover
 *
 * Features:
 *   - Search bar at the top: type a name → dropdown shows matching profiles
 *     (name + DP). Search fires 400ms after user stops typing (debounce).
 *   - Filter popup: Filter button opens modal to filter profiles live by
 *     Age Range, Marital Status, Height Range, Diet, and Surname.
 *   - Premium check: Discover filters require DISCOVER_FILTERS payment unlock.
 *   - Browse grid below: paginated card list filtered by partner preference + active filters.
 */
const DEFAULT_FILTERS = {
  gender: '',
  minAge: '',
  maxAge: '',
  maritalStatus: '',
  minHeight: '',
  maxHeight: '',
  diet: '',
  surname: '',
};

const DiscoverPage = () => {
  const navigate = useNavigate();

  // ── Browse & Filter state ──
  const [profiles, setProfiles]       = useState([]);
  const [page, setPage]               = useState(0);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]         = useState(true);

  const [filters, setFilters]         = useState(DEFAULT_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filtersUnlocked, setFiltersUnlocked] = useState(true);

  // ── Search state ──
  const [keyword, setKeyword]             = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching]         = useState(false);
  const [showDropdown, setShowDropdown]   = useState(false);
  const searchDebounceRef                 = useRef(null);
  const searchContainerRef                = useRef(null);

  const PAGE_SIZE = 10;

  // Load payment status on mount
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const data = await getPaymentStatus();
        setFiltersUnlocked(data.filtersUnlocked);
      } catch (err) {
        logger.error('Failed to load payment status on discover page', err);
      }
    };
    loadStatus();
  }, []);

  // Active filter count logic
  const activeFilterCount = [
    filters.gender,
    filters.minAge || filters.maxAge,
    filters.maritalStatus,
    filters.minHeight || filters.maxHeight,
    filters.diet,
    filters.surname,
  ].filter(Boolean).length;

  // ── Browse helpers ──

  const appendProfiles = (newProfiles) => {
    setProfiles((prev) => {
      const existingIds = new Set(prev.map((p) => p.profileId));
      const unique = newProfiles.filter((p) => !existingIds.has(p.profileId));
      return [...prev, ...unique];
    });
  };

  const fetchProfiles = useCallback(async (pageToLoad, isInitial = false, currentFilters = filters) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);
    try {
      logger.api('GET', '/api/discover', { page: pageToLoad, size: PAGE_SIZE, ...currentFilters });
      const data = await discoverProfiles(pageToLoad, PAGE_SIZE, currentFilters);
      logger.response('/api/discover', { count: data.length, page: pageToLoad });
      if (data.length === 0) {
        setHasMore(false);
        if (!isInitial && pageToLoad > 0) {
          toast('You have seen all available profiles.', { icon: '🔍' });
        }
      } else {
        if (pageToLoad === 0) {
          setProfiles(data);
        } else {
          appendProfiles(data);
        }
        setPage(pageToLoad + 1);
      }
    } catch (error) {
      logger.error('Discover failed', error);
      toast.error('Could not load profiles. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    fetchProfiles(0, true, DEFAULT_FILTERS);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter change handler — re-fetches from page 0
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setProfiles([]);
    setPage(0);
    setHasMore(true);
    fetchProfiles(0, true, newFilters);
  };

  const handleClearAllFilters = () => {
    handleFilterChange(DEFAULT_FILTERS);
  };

  // ── Search helpers ──

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
    fetchProfiles(page, false, filters);
  };

  const handleCardClick = (profileId) => {
    logger.info('User clicked profile card', { profileId });
    navigate(`/profiles/${profileId}`);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Header + Filter + Search Bar ── */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">🧭 Discover</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Showing profiles based on your partner preference
              {activeFilterCount > 0 && ` • ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} applied`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border font-medium text-sm transition cursor-pointer ${
                activeFilterCount > 0
                  ? 'bg-primary text-white border-primary shadow-sm hover:bg-primary-light'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span>{filtersUnlocked ? '⚙️ Filter' : '🔒 Filter (Premium)'}</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-primary font-bold text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

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
                  placeholder="Search name, @username, or ID..."
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
                          className="flex items-center justify-between gap-3 px-4 py-2.5 cursor-pointer
                                     hover:bg-gray-50 dark:hover:bg-gray-700 transition border-b border-border/40 last:border-0"
                        >
                          <div className="flex items-center gap-3 min-w-0">
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
                            <div className="min-w-0">
                              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 block truncate">
                                {result.fullName}
                              </span>
                              {result.username && (
                                <span className="text-xs text-primary font-medium block truncate">
                                  @{result.username}
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Active Filter Bar (Chips) ── */}
        {activeFilterCount > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-border dark:border-gray-700">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Active Filters:</span>

            {filters.minAge && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary dark:text-primary-light">
                Min Age: {filters.minAge}
                <button onClick={() => handleFilterChange({ ...filters, minAge: '' })} className="hover:text-red-500 ml-1">✕</button>
              </span>
            )}

            {filters.maxAge && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary dark:text-primary-light">
                Max Age: {filters.maxAge}
                <button onClick={() => handleFilterChange({ ...filters, maxAge: '' })} className="hover:text-red-500 ml-1">✕</button>
              </span>
            )}

            {filters.maritalStatus && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary dark:text-primary-light">
                Status: {filters.maritalStatus}
                <button onClick={() => handleFilterChange({ ...filters, maritalStatus: '' })} className="hover:text-red-500 ml-1">✕</button>
              </span>
            )}

            {filters.diet && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary dark:text-primary-light">
                Diet: {filters.diet}
                <button onClick={() => handleFilterChange({ ...filters, diet: '' })} className="hover:text-red-500 ml-1">✕</button>
              </span>
            )}

            {filters.surname && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary dark:text-primary-light">
                Surname: {filters.surname}
                <button onClick={() => handleFilterChange({ ...filters, surname: '' })} className="hover:text-red-500 ml-1">✕</button>
              </span>
            )}

            <button
              onClick={handleClearAllFilters}
              className="text-xs font-semibold text-error hover:underline ml-auto cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}

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
                             flex items-center gap-2 cursor-pointer"
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
                You have seen all available profiles matching your criteria.
              </p>
            )}
          </>
        )}

        {!loading && profiles.length === 0 && (
          <EmptyState
            icon="🔍"
            title="No Profiles Match Your Filters"
            message={
              activeFilterCount > 0
                ? "No profiles found matching your active filter criteria. Try broadening or clearing your filters."
                : "There are no profiles matching your partner preference yet. Check back later!"
            }
          />
        )}
      </div>

      {/* Filter Modal Popup */}
      <FilterPopup
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        appliedFilters={filters}
        onApply={handleFilterChange}
        onClearAll={handleClearAllFilters}
        isUnlocked={filtersUnlocked}
        onUpgrade={() => navigate('/payment')}
      />
    </div>
  );
};

export default DiscoverPage;
