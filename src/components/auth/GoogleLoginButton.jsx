import { useEffect, useRef, useState } from 'react';
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
 * If VITE_GOOGLE_CLIENT_ID is configured, renders Google's secure GIS button.
 * If client ID is missing or pending, displays a polished button with helpful guidance.
 *
 * @param {string} mode - 'login' | 'register'
 * @param {Function} onError - Optional error callback
 */
const GoogleLoginButton = ({ mode = 'login', onError }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const buttonRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const clientId = import.meta.env.GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Handle successful Google authentication credential response
  const handleCredentialResponse = async (response) => {
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
  };

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

  // Initialize and render Google button once script and client ID are available
  useEffect(() => {
    if (!scriptLoaded || !clientId || !window.google?.accounts?.id || !buttonRef.current) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render official Google button inside ref container
      buttonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: mode === 'register' ? 'signup_with' : 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 380,
      });
    } catch (err) {
      logger.error('Error initializing Google GIS button', err);
    }
  }, [scriptLoaded, clientId, mode]);

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
          // If One Tap is skipped/dismissed, trigger normal button flow
        }
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center my-1">
      {loading ? (
        <div className="w-full py-2.5 px-4 rounded-lg border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          <Spinner />
          <span>Connecting to Google...</span>
        </div>
      ) : (
        <>
          {/* Target container for Google's GIS iframe button when Client ID is configured */}
          {clientId && (
            <div
              ref={buttonRef}
              className="w-full flex justify-center min-h-[44px]"
            />
          )}

          {/* Fallback button if Client ID is missing or pending configuration */}
          {!clientId && (
            <button
              type="button"
              onClick={handleCustomButtonClick}
              className="w-full py-2.5 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium text-sm transition-colors flex items-center justify-center gap-3 shadow-sm hover:shadow"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
