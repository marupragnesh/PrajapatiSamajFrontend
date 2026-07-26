import { useEffect, useState } from 'react';
import logger from '../../utils/logger';

/**
 * ThemeToggle — reusable dark / light mode toggle button.
 * Controls the 'dark' class on document.documentElement and persists to localStorage.
 */
const ThemeToggle = ({ className = '' }) => {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );

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
    logger.info('Theme toggled', { darkMode: !darkMode });
  };

  return (
    <button
      type="button"
      onClick={toggleDark}
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`p-2 rounded-xl border border-border/60 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition shadow-sm cursor-pointer flex items-center justify-center text-lg ${className}`}
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  );
};

export default ThemeToggle;
