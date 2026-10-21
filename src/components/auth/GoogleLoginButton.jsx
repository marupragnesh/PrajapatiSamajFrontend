import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginWithGoogle } from '../../api/authApi';
import { getMyProfile } from '../../api/profileApi';
import useAuth from '../../hooks/useAuth';
import logger from '../../utils/logger';
import Spinner from '../common/Spinner';

/**
 * GoogleLoginButton — Provides 1-click Google OAuth authentication & registration.
 *
 * Uses official Google Identity Services (GIS).
 * Responsive on all mobile devices (prevents horizontal overflow).
 * Automatically detects and synchronizes with application dark / light theme.
 *
 * @param {string} mode - 'login' | 'register'
 * @param {Function} onError - Optional error callback
 */
const GoogleLoginButton = ({ mode = 'login', onError }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Synchronize button theme with application dark mode
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  const clientId = import.meta.env.GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Handle successful Google authentication credential response
  const handleCredentialResponse = useCallback(async (response) => {
    if (!response || !response.credential) {
      logger.warn('Google credential response empty');
      toast.error('Google sign-in was cancelled or failed.');
      return;
    }

    setLoading(true);
    try {
      logger.info('Authenticating with backend using Google ID token');
      const data = await loginWithGoogle(response.credential);

      // Save token and user details to AuthContext & localStorage
      login(data.token, {
        userId: data.userId,
        email: data.email,
        name: data.name,
        surname: data.surname,
      });

      toast.success(data.message || (mode === 'register' ? 'Registration with Google successful!' : 'Welcome back!'));

      // Check whether user already has an active profile
      try {
        await getMyProfile();
        navigate('/discover');
      } catch (profileError) {
        if (profileError.response?.status === 404) {
          navigate('/profile/setup');
        } else {
          // If profile fetch fails with any other error, redirect to discover as fallback
          navigate('/discover');
        }
      }
    } catch (error) {
      logger.error('Google authentication failed', error.response?.data || error.message);
      const msg = error.response?.data?.message || 'Google sign-in failed. Please try again.';
      toast.error(msg);
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  }, [login, mode, navigate, onError]);

  // Listen for dark/light mode class changes on <html>
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkTheme();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          checkTheme();
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Load Google Identity Services script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const existingScript = document.getElementById('google-gsi-client');
    if (existingScript) {
      existingScript.addEventListener('load', () => setScriptLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      logger.warn('Failed to load Google Identity Services SDK');
    };
    document.body.appendChild(script);
  }, []);

  // Function to render Google button with responsive width and dynamic theme
  const renderGoogleButton = useCallback(() => {
    if (!window.google?.accounts?.id || !buttonRef.current || !clientId) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Calculate width to fit container exactly, clamped within Google's allowed bounds (200px - 400px)
      const containerWidth = containerRef.current?.clientWidth || buttonRef.current?.parentElement?.clientWidth || 320;
      const computedWidth = Math.max(200, Math.min(Math.floor(containerWidth), 400));

      // Clear previous button DOM nodes
      buttonRef.current.innerHTML = '';

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: mode === 'register' ? 'signup_with' : 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: computedWidth,
      });
    } catch (err) {
      logger.error('Error rendering Google GIS button', err);
    }
  }, [clientId, handleCredentialResponse, isDark, mode]);

  // Render button when ready and re-render on resize or theme change
  useEffect(() => {
    if (!scriptLoaded || !clientId) return;

    renderGoogleButton();

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        renderGoogleButton();
      }, 150);
    };

    window.addEventListener('resize', handleResize);

    let resizeObserver;
    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          renderGoogleButton();
        }, 150);
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
      clearTimeout(resizeTimer);
    };
  }, [scriptLoaded, clientId, renderGoogleButton]);

  // Click handler for when client ID is not configured or custom click
  const handleCustomButtonClick = () => {
    if (!clientId) {
      toast.error('Google Client ID is not configured. Please add GOOGLE_CLIENT_ID to your .env file.', {
        duration: 5000,
      });
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If One Tap is skipped/dismissed
        }
      });
    }
  };

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center justify-center my-1">
      {loading ? (
        <div className="w-full py-2.5 px-4 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-card-dark flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          <Spinner />
          <span>Connecting to Google...</span>
        </div>
      ) : (
        <>
          {/* Target container for Google's GIS iframe button when Client ID is configured */}
          {clientId && (
            <div
              ref={buttonRef}
              className="w-full flex justify-center items-center min-h-[44px] overflow-hidden rounded-lg [&>div]:!w-full [&>div]:flex [&>div]:justify-center [&_iframe]:!max-w-full"
            />
          )}

          {/* Fallback button if Client ID is missing or pending configuration */}
          {!clientId && (
            <button
              type="button"
              onClick={handleCustomButtonClick}
              className="w-full py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-card-dark hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium text-sm transition-colors flex items-center justify-center gap-3 shadow-sm hover:shadow"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{mode === 'register' ? 'Sign up with Google' : 'Sign in with Google'}</span>
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default GoogleLoginButton;
