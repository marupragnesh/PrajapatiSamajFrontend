import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { getMyProfile } from '../../api/profileApi';
import { resolveImageUrl } from '../../utils/imageHelper';
import LogoIcon from './LogoIcon';
import logger from '../../utils/logger';

/**
 * Navbar — sticky top bar and mobile bottom navigation tab bar.
 * Optimized for mobile-first responsive experience.
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
   */
  useEffect(() => {
    const loadProfileForNavbar = async () => {
      try {
        const profile = await getMyProfile();
        setPrimaryPhotoUrl(profile.primaryPhotoUrl || null);

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

  const mobileTabClass = ({ isActive }) =>
    `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition text-[11px] font-semibold ${
      isActive
        ? 'text-primary bg-primary/10 dark:bg-primary/20'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
    }`;

  return (
    <>
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white dark:bg-card-dark border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between">

          {/* Brand Link — Royal Heritage Emblem */}
          <NavLink
            to="/discover"
            className="flex items-center gap-2 font-bold text-lg hover:opacity-90 transition cursor-pointer"
          >
            <LogoIcon className="w-7 h-7" />
            <span className="font-serif font-extrabold tracking-wide text-amber-700 dark:text-amber-400 drop-shadow-sm">PrajapatiSamaj</span>
          </NavLink>

          {/* Desktop Nav links (hidden on mobile, visible md+) */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/discover" className={linkClass}>🔍 Discover</NavLink>
            <NavLink to="/biodata" className={linkClass}>📜 Biodata</NavLink>
            <NavLink to="/likes" className={linkClass}>❤️ Likes</NavLink>
            <NavLink to="/interests" className={linkClass}>💌 Interests</NavLink>
            <NavLink to="/matches" className={linkClass}>🎉 Matches</NavLink>
            <NavLink to="/payment" className={linkClass}>💎 Premium</NavLink>
          </div>

          {/* User actions (Profile Avatar, Theme Toggle, Logout) */}
          <div className="flex items-center gap-2">
            {/* Profile Avatar Button */}
            <button
              onClick={() => navigate('/profile/edit')}
              title="My Profile"
              className="relative flex items-center justify-center w-9 h-9 rounded-full
                         border-2 border-primary overflow-visible focus:outline-none
                         hover:ring-2 hover:ring-primary-light transition cursor-pointer"
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

              {/* ❗ badge */}
              {showExclamation && (
                <span
                  title="Your partner expectations are empty — tap to fill them in"
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500
                             flex items-center justify-center text-white text-[10px] font-bold
                             shadow pointer-events-none select-none z-10"
                >
                  !
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDark}
              title="Toggle dark mode"
              className="text-sm p-2 rounded-lg text-gray-700 dark:text-gray-300
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Logout (Desktop only) */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="hidden md:block text-sm px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sticky Bottom Navigation Tab Bar (visible on screens < md) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-card-dark/95 backdrop-blur border-t border-border px-1 py-1 flex items-center justify-around shadow-2xl">
        <NavLink to="/discover" className={mobileTabClass}>
          <span className="text-base leading-tight">🔍</span>
          <span>Discover</span>
        </NavLink>
        <NavLink to="/biodata" className={mobileTabClass}>
          <span className="text-base leading-tight">📜</span>
          <span>Biodata</span>
        </NavLink>
        <NavLink to="/likes" className={mobileTabClass}>
          <span className="text-base leading-tight">❤️</span>
          <span>Likes</span>
        </NavLink>
        <NavLink to="/interests" className={mobileTabClass}>
          <span className="text-base leading-tight">💌</span>
          <span>Interests</span>
        </NavLink>
        <NavLink to="/matches" className={mobileTabClass}>
          <span className="text-base leading-tight">🎉</span>
          <span>Matches</span>
        </NavLink>
        <NavLink to="/payment" className={mobileTabClass}>
          <span className="text-base leading-tight">💎</span>
          <span>Premium</span>
        </NavLink>
      </div>
    </>
  );
};

export default Navbar;
