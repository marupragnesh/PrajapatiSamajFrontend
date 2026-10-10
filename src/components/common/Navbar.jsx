import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import {
  Compass,
  FileText,
  Heart,
  Send,
  Sparkles,
  CreditCard,
  User,
  Camera,
  Settings,
  LogOut,
  LogIn
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { getMyProfile } from '../../api/profileApi';
import { resolveImageUrl } from '../../utils/imageHelper';
import LogoIcon from './LogoIcon';
import logger from '../../utils/logger';

/**
 * Navbar — sticky top bar and mobile bottom navigation tab bar.
 * Unified with consistent Lucide line icons across desktop and mobile.
 */
const Navbar = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate   = useNavigate();

  const [primaryPhotoUrl, setPrimaryPhotoUrl] = useState(null);
  const [showExclamation, setShowExclamation] = useState(false);

  // Enforce permanent Dark Mode across entire platform
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  /**
   * Load profile once on mount if logged in to get:
   *   - primaryPhotoUrl -> display as avatar
   *   - expectations    -> decide whether to show exclamation badge
   */
  useEffect(() => {
    if (!isLoggedIn) return;

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
  }, [isLoggedIn]);

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowMenu(false);
    logger.info('User clicked Logout');
    logout();
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition ${
      isActive
        ? 'bg-primary text-white shadow-sm'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;

  const mobileTabClass = ({ isActive }) =>
    `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition text-[10px] font-semibold ${
      isActive
        ? 'text-primary bg-primary/10 dark:bg-primary/20'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
    }`;

  return (
    <>
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 dark:bg-card-dark/95 backdrop-blur border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between">

          {/* Brand Link — Matrimonial Union Mark */}
          <NavLink
            to={isLoggedIn ? "/discover" : "/"}
            className="flex items-center gap-2 font-bold text-lg hover:opacity-95 transition cursor-pointer"
          >
            <LogoIcon className="w-8 h-8" />
            <span className="font-serif font-extrabold tracking-wide text-amber-700 dark:text-amber-400 drop-shadow-sm">
              PrajapatiSamaj
            </span>
          </NavLink>

          {/* Desktop Nav links (Logged In only, hidden on mobile, visible md+) */}
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/discover" className={linkClass}>
                <Compass className="w-3.5 h-3.5" />
                <span>Discover</span>
              </NavLink>
              <NavLink to="/biodata" className={linkClass}>
                <FileText className="w-3.5 h-3.5" />
                <span>Biodata</span>
              </NavLink>
              <NavLink to="/likes" className={linkClass}>
                <Heart className="w-3.5 h-3.5" />
                <span>Likes</span>
              </NavLink>
              <NavLink to="/interests" className={linkClass}>
                <Send className="w-3.5 h-3.5" />
                <span>Interests</span>
              </NavLink>
              <NavLink to="/matches" className={linkClass}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Matches</span>
              </NavLink>
              <NavLink to="/payment" className={linkClass}>
                <CreditCard className="w-3.5 h-3.5" />
                <span>Premium</span>
              </NavLink>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-primary transition py-1.5 px-3 rounded-lg"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-light text-white font-semibold text-xs transition shadow-sm"
              >
                Register Free
              </Link>
            </div>
          )}

          {/* User Profile Avatar Popover Menu (Logged in only) */}
          {isLoggedIn && (
            <div className="flex items-center gap-2">
              <div className="relative group" ref={menuRef}>
                <button
                  onClick={() => setShowMenu((prev) => !prev)}
                  title={showExclamation ? "Add partner expectation" : "My Profile & Settings"}
                  className="relative flex items-center justify-center w-9 h-9 rounded-full
                             border-2 border-primary overflow-visible focus:outline-none
                             hover:ring-2 hover:ring-primary-light transition cursor-pointer shadow-sm"
                >
                  {primaryPhotoUrl ? (
                    <img
                      src={resolveImageUrl(primaryPhotoUrl)}
                      alt="My profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-primary" />
                  )}

                  {/* Uncompleted expectations indicator */}
                  {showExclamation && (
                    <span
                      title="Add partner expectation"
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500
                                 flex items-center justify-center text-white text-[10px] font-bold
                                 shadow pointer-events-none select-none z-10"
                    >
                      !
                    </span>
                  )}
                </button>

                {/* Hover suggestion tooltip when expectations are empty */}
                {showExclamation && !showMenu && (
                  <div className="absolute top-full right-0 mt-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-95 group-hover:scale-100 z-50 whitespace-nowrap">
                    <div className="bg-amber-600 dark:bg-amber-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-1.5 border border-amber-300/40">
                      <span>💍</span>
                      <span>Add partner expectation</span>
                    </div>
                  </div>
                )}

                {/* Avatar Popover Dropdown Menu */}
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-card-dark rounded-2xl shadow-2xl border border-border dark:border-gray-700 py-2 z-50 animate-fade-in space-y-1">
                    <button
                      onClick={() => { setShowMenu(false); navigate('/profile/edit'); }}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <User className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>My Profile &amp; Settings</span>
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); navigate('/profile/edit#photos-upload-section'); }}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-sky-500 shrink-0" />
                      <span>Upload &amp; Manage Photos</span>
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); navigate('/biodata'); }}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>Marriage Biodata Studio</span>
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); navigate('/profile/expectations'); }}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{showExclamation ? 'Add Partner Expectation' : 'Edit Partner Expectation'}</span>
                    </button>
                    <div className="border-t border-border dark:border-gray-700 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500 shrink-0" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Sticky Bottom Navigation Tab Bar (visible on screens < md when logged in) */}
      {isLoggedIn && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-card-dark/95 backdrop-blur border-t border-border px-1 py-1.5 flex items-center justify-around shadow-2xl">
          <NavLink to="/discover" className={mobileTabClass}>
            <Compass className="w-4 h-4 shrink-0" />
            <span className="mt-0.5">Discover</span>
          </NavLink>
          <NavLink to="/biodata" className={mobileTabClass}>
            <FileText className="w-4 h-4 shrink-0" />
            <span className="mt-0.5">Biodata</span>
          </NavLink>
          <NavLink to="/likes" className={mobileTabClass}>
            <Heart className="w-4 h-4 shrink-0" />
            <span className="mt-0.5">Likes</span>
          </NavLink>
          <NavLink to="/interests" className={mobileTabClass}>
            <Send className="w-4 h-4 shrink-0" />
            <span className="mt-0.5">Interests</span>
          </NavLink>
          <NavLink to="/matches" className={mobileTabClass}>
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="mt-0.5">Matches</span>
          </NavLink>
          <NavLink to="/payment" className={mobileTabClass}>
            <CreditCard className="w-4 h-4 shrink-0" />
            <span className="mt-0.5">Premium</span>
          </NavLink>
        </div>
      )}
    </>
  );
};

export default Navbar;
