import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { getMyProfile } from '../../api/profileApi';
import { resolveImageUrl } from '../../utils/imageHelper';
import logger from '../../utils/logger';

/**
 * Navbar — sticky top bar shown on all protected pages.
 *
 * Profile avatar behaviour:
 *   - Shows user's primary photo as a circular DP once loaded
 *   - Falls back to 👤 icon if no photo uploaded yet
 *   - Shows a red ❗ badge on the avatar when expectations are completely
 *     empty (zero fields filled) — hints the user to fill them in
 *   - Badge disappears as soon as at least 1 expectation field is filled
 *   - Clicking the avatar navigates to /profile/edit
 *
 * Profile data is fetched once on mount and cached in local state.
 * Only fetches once per Navbar mount — no polling.
 */
const Navbar = () => {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );
  const [primaryPhotoUrl, setPrimaryPhotoUrl] = useState(null);
  const [showExclamation, setShowExclamation] = useState(false);

  /** Apply / remove dark class on <html> and save preference */
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  /**
   * Load profile once on mount to get:
   *   - primaryPhotoUrl → display as avatar
   *   - expectations    → decide whether to show ❗ badge
   *
   * Silently ignores errors (e.g. profile not created yet).
   */
  useEffect(() => {
    const loadProfileForNavbar = async () => {
      try {
        const profile = await getMyProfile();
        setPrimaryPhotoUrl(profile.primaryPhotoUrl || null);

        // Show ❗ only when ZERO expectation fields are filled
        const exp = profile.expectations;
        const hasAnyExpectation = exp && Object.values(exp).some(
          (v) => v !== null && v !== undefined && v !== ''
        );
        setShowExclamation(!hasAnyExpectation);
      } catch {
        // Profile may not exist yet — silently skip
      }
    };

    loadProfileForNavbar();
  }, []);

  const toggleDark = () => {
    setDarkMode((prev) => !prev);
    logger.info('Dark mode toggled', { darkMode: !darkMode });
  };

  const handleLogout = () => {
    logger.info('User clicked Logout');
    logout();
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium px-3 py-2 rounded-lg transition ${
      isActive
        ? 'bg-primary text-white'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;

  return (
    <nav className="sticky top-0 z-40 bg-white dark:bg-card-dark border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Brand */}
        <span className="text-primary font-bold text-lg">🪷 PrajapatiSamaj</span>

        {/* Nav links */}
        <div className="flex items-center gap-1 flex-wrap">
          <NavLink to="/discover"  className={linkClass}>🔍 Discover</NavLink>
          <NavLink to="/likes"     className={linkClass}>❤️ Likes</NavLink>
          <NavLink to="/interests" className={linkClass}>💌 Interests</NavLink>
          <NavLink to="/matches"   className={linkClass}>🎉 Matches</NavLink>

          {/* ── Profile avatar button ── */}
          <button
            onClick={() => navigate('/profile/edit')}
            title="My Profile"
            className="relative ml-1 flex items-center justify-center w-9 h-9 rounded-full
                       border-2 border-primary overflow-visible focus:outline-none
                       hover:ring-2 hover:ring-primary-light transition"
          >
            {primaryPhotoUrl ? (
              <img
                src={resolveImageUrl(primaryPhotoUrl)}
                alt="My profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-lg leading-none">👤</span>
            )}

            {/* ❗ badge — shown only when expectations are completely empty */}
            {showExclamation && (
              <span
                title="Your partner expectations are empty — tap to fill them in"
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500
                           flex items-center justify-center text-white text-xs font-bold
                           shadow pointer-events-none select-none z-10"
              >
                !
              </span>
            )}
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            title="Toggle dark mode"
            className="text-sm px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
