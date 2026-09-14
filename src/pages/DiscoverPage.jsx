import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import ProfileCard from '../components/common/ProfileCard';
import ProfileListCard from '../components/common/ProfileListCard';
import SkeletonCard from '../components/common/SkeletonCard';
import EmptyState from '../components/common/EmptyState';
import Footer from '../components/common/Footer';
import FilterPopup from '../components/discover/FilterPopup';
import { discoverProfiles, searchProfiles } from '../api/discoverApi';
import { getPaymentStatus } from '../api/paymentApi';
import { getTodayRegistrationsCount } from '../api/profileApi';
import { resolveImageUrl } from '../utils/imageHelper';
import logger from '../utils/logger';

/**
 * DiscoverPage — /discover
 *
 * Features:
 *   - Search bar at top: search by name/surname with debounce
 *   - Filter popup: Level 2 & 3 members can filter by Age, Marital Status, Height, Diet, Surname
 *   - Higher Visibility Ranking: Profiles are ranked by Level 3 -> Level 2 -> Level 1 -> Free, then popularity
 *   - 10-Profile Cap for Free users: Free users can view top 10 profiles; prompt to upgrade to Level 1/2/3 to unlock all
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

  const [filters, setFilters]         = useState(() => {
    try {
      const saved = localStorage.getItem('prajapati_discover_filters');
      return saved ? JSON.parse(saved) : DEFAULT_FILTERS;
    } catch {
      return DEFAULT_FILTERS;
    }
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState({
    membershipTier: 'FREE',
    allProfilesUnlocked: false,
    filtersUnlocked: false,
    contactUnlocked: false,
    biodataUnlocked: false,
  });

  // ── View Mode state (Grid / List) ──
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem('prajapati_profile_view_mode') || 'grid';
    } catch {
      return 'grid';
    }
  });

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('prajapati_profile_view_mode', mode);
    } catch (e) {
      logger.error('Failed to save view mode to localStorage', e);
    }
  };

  // ── Community Stats state ──
  const [stats, setStats] = useState({ total: null, today: null, loading: false });

  const loadCommunityStats = async (isManual = false) => {
    setStats((prev) => ({ ...prev, loading: true }));
    try {
      const res = await getTodayRegistrationsCount();
      setStats({
        total: res?.totalUsersCount ?? res?.data?.totalUsersCount ?? 0,
        today: res?.todayRegistrationsCount ?? res?.data?.todayRegistrationsCount ?? 0,
        loading: false,
      });
      if (isManual) toast.success('Stats updated!');
    } catch (err) {
      logger.error('Failed to load stats on discover page', err);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadCommunityStats();
  }, []);

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
        setPaymentStatus(data);
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

        // If user is Free and received 10 profiles, cap pagination
        if (paymentStatus.membershipTier === 'FREE' && data.length >= 10) {
          setHasMore(false);
        } else {
          setHasMore(data.length === PAGE_SIZE);
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
  }, [filters, paymentStatus.membershipTier]);

  // Initial load — uses restored persistent filters
  useEffect(() => {
    fetchProfiles(0, true, filters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter change handler — saves to localStorage & re-fetches from page 0
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    try {
      localStorage.setItem('prajapati_discover_filters', JSON.stringify(newFilters));
    } catch (err) {
      logger.error('Failed to persist discover filters', err);
    }
    setProfiles([]);
    setPage(0);
    setHasMore(true);
    fetchProfiles(0, true, newFilters);
  };

  const handleClearAllFilters = () => {
    try {
      localStorage.removeItem('prajapati_discover_filters');
    } catch (err) {
      logger.error('Failed to remove persistent discover filters', err);
    }
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
    if (paymentStatus.membershipTier === 'FREE') {
      navigate('/payment');
      return;
    }
    logger.info('User clicked Load More', { nextPage: page });
    fetchProfiles(page, false, filters);
  };

  const handleCardClick = (profileId) => {
    logger.info('User clicked profile card', { profileId });
    navigate(`/profiles/${profileId}`);
  };

  const isFreeTier = paymentStatus.membershipTier === 'FREE';

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Community Live Growth Stats Banner ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 sm:px-4 sm:py-2.5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-white dark:to-card-dark border border-primary/20 text-xs shadow-sm">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              Community Growth:
            </span>
            <span className="text-gray-600 dark:text-gray-300">
              Total <strong className="text-gray-900 dark:text-white font-bold">{stats.total !== null ? stats.total : '...'}</strong> Profiles
            </span>
            <span className="text-gray-400 hidden sm:inline">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              +{stats.today !== null ? stats.today : '...'} Joined Today
            </span>
          </div>
          <button
            onClick={() => loadCommunityStats(true)}
            disabled={stats.loading}
            title="Refresh community registration stats"
            className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer ml-auto disabled:opacity-50"
          >
            <span className={stats.loading ? 'animate-spin' : ''}>🔄</span>
            <span>{stats.loading ? 'Refreshing...' : 'Refresh Stats'}</span>
          </button>
        </div>

        {/* ── Search Bar, View Mode Toggle & Filter Button ── */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 mb-6">
          <div ref={searchContainerRef} className="relative flex-1 min-w-[220px]">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none text-base">
                🔍
              </span>
              <input
                type="text"
                value={keyword}
                onChange={handleSearchChange}
                placeholder="Search profiles by name, surname, username or ID..."
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-border
                           bg-white dark:bg-card-dark text-gray-900 dark:text-gray-100
                           text-sm placeholder-gray-400 focus:outline-none focus:ring-2
                           focus:ring-primary focus:border-transparent transition shadow-sm"
              />
              {searching && (
                <span className="absolute inset-y-0 right-3 flex items-center">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </span>
              )}
            </div>

            {/* Live Search Dropdown */}
            {showDropdown && (
              <div className="absolute z-30 w-full mt-1.5 bg-white dark:bg-card-dark rounded-xl shadow-xl border border-border overflow-hidden max-h-72 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400">
                    No matching profiles found
                  </div>
                ) : (
                  searchResults.map((res) => (
                    <div
                      key={res.profileId}
                      onClick={() => handleSearchResultClick(res.profileId)}
                      className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer border-b border-border/40 last:border-0 transition"
                    >
                      <img
                        src={resolveImageUrl(res.primaryPhotoUrl)}
                        alt={res.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-primary/20"
                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100?text=Photo'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {res.fullName}
                        </p>
                        {res.username && (
                          <p className="text-[11px] text-gray-400 truncate">@{res.username}</p>
                        )}
                      </div>
                      <span className="text-xs text-primary font-medium">View &rarr;</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* View Mode Toggle (Grid Section 1 vs List Section 2) */}
          <div className="flex items-center bg-white dark:bg-card-dark rounded-xl p-1 border border-border shrink-0 shadow-sm">
            <button
              type="button"
              onClick={() => handleViewModeChange('grid')}
              title="Grid View (Section 1)"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-primary'
              }`}
            >
              <span>⊞</span>
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('list')}
              title="List View (Section 2)"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-primary'
              }`}
            >
              <span>☰</span>
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className={`px-3.5 py-2.5 rounded-xl border font-semibold text-xs transition
                       flex items-center gap-2 cursor-pointer shadow-sm shrink-0 ${
                         activeFilterCount > 0
                           ? 'bg-primary text-white border-primary'
                           : 'bg-white dark:bg-card-dark text-gray-700 dark:text-gray-200 border-border hover:border-primary'
                       }`}
          >
            <span>🎛️</span>
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-primary text-[11px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-gray-50 dark:bg-card-dark/60 rounded-xl border border-border/60">
            <span className="text-xs font-semibold text-gray-500">Active Filters:</span>

            {filters.gender && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary dark:text-primary-light">
                Gender: {filters.gender}
                <button onClick={() => handleFilterChange({ ...filters, gender: '' })} className="hover:text-red-500 ml-1">✕</button>
              </span>
            )}

            {(filters.minAge || filters.maxAge) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary dark:text-primary-light">
                Age: {filters.minAge || 'Any'} - {filters.maxAge || 'Any'}
                <button onClick={() => handleFilterChange({ ...filters, minAge: '', maxAge: '' })} className="hover:text-red-500 ml-1">✕</button>
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

        {/* ── Browse Grid ── */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Profile Grid */}
        {/* Profile Grid or List Mode */}
        {!loading && profiles.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {profiles.map((profile) => (
                  <div key={profile.profileId} onClick={() => handleCardClick(profile.profileId)}>
                    <ProfileCard profile={profile} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {profiles.map((profile) => (
                  <div key={profile.profileId} onClick={() => handleCardClick(profile.profileId)}>
                    <ProfileListCard profile={profile} />
                  </div>
                ))}
              </div>
            )}

            {/* Free User 10-Profile Limit Upgrade Banner */}
            {isFreeTier && profiles.length >= 10 && (
              <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 via-amber-500/10 to-primary/10 border border-primary/30 rounded-3xl text-center space-y-3 max-w-2xl mx-auto shadow-md">
                <div className="text-3xl">🔒</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Showing Top 10 Profiles (Free Plan)
                </h3>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                  Upgrade to Level 1, 2, or 3 to unlock unlimited profile browsing, higher visibility, and direct contact details!
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => navigate('/payment')}
                    className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white font-bold text-xs transition shadow cursor-pointer"
                  >
                    💎 Upgrade to Unlock All Profiles
                  </button>
                </div>
              </div>
            )}

            {/* Load More Button for Paid Users */}
            {!isFreeTier && hasMore && (
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

            {!isFreeTier && !hasMore && (
              <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-8">
                You have seen all available profiles matching your criteria.
              </p>
            )}
          </>
        )}

        {/* Website & Tech Project Proposal Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary/20 via-white dark:via-card-dark to-primary/10 border border-primary/30 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary text-white">
              Tech Collaboration
            </span>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
              💡 Have a Website Idea or Need a Custom Platform?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-xl">
              Whether you want to build a custom matrimonial portal, community directory, business website, or have a startup idea, connect directly with me to build it.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
            <a
              href="https://wa.me/919998000000?text=Hello%20Pragnesh,%20I%20have%20a%20website%20idea!"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow flex items-center gap-1.5 cursor-pointer"
            >
              <span>💬</span> WhatsApp
            </a>
            <a
              href="mailto:pragneshmaru12112001@gmail.com?subject=Custom%20Website%20Idea%20Inquiry"
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-xs transition shadow flex items-center gap-1.5 cursor-pointer"
            >
              <span>✉️</span> Connect
            </a>
          </div>
        </div>

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
        isUnlocked={paymentStatus.filtersUnlocked}
        onUpgrade={() => navigate('/payment')}
      />

      {/* Global Universal Footer */}
      <Footer />
    </div>
  );
};

export default DiscoverPage;
