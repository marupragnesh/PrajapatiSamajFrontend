import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import logger from '../../utils/logger';

/**
 * Top navigation bar — shown on all protected pages.
 * Handles: navigation links, dark mode toggle, logout.
 */
const Navbar = () => {
  const { logout } = useAuth();
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );

  /** Apply/remove dark class on <html> and save preference */
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

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
          <NavLink to="/discover" className={linkClass}>🔍 Discover</NavLink>
          <NavLink to="/likes" className={linkClass}>❤️ Likes</NavLink>
          <NavLink to="/interests" className={linkClass}>💌 Interests</NavLink>
          <NavLink to="/matches" className={linkClass}>🎉 Matches</NavLink>
          <NavLink to="/profile/edit" className={linkClass}>👤 Profile</NavLink>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            title="Toggle dark mode"
            className="text-sm px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
