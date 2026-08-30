import logger from './logger';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/**
 * Check if a JWT token has expired based on its payload exp timestamp.
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return false;
    // exp is in seconds, convert to milliseconds
    return payload.exp * 1000 < Date.now();
  } catch (e) {
    logger.warn('Error parsing JWT token payload:', e);
    return true;
  }
};

/** Save JWT token to localStorage */
export const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  logger.info('Token saved to localStorage');
};

/**
 * Get JWT token from localStorage.
 * If the token is expired, automatically clears auth data and returns null.
 */
export const getToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  if (isTokenExpired(token)) {
    logger.warn('Found expired JWT token in localStorage — clearing auth session');
    clearAuth();
    return null;
  }
  return token;
};

/** Remove JWT token from localStorage */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  logger.info('Token removed from localStorage');
};

/** Save user info (userId + email) to localStorage */
export const saveUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  logger.info('User saved to localStorage', { email: user.email });
};

/** Get user info from localStorage */
export const getUser = () => {
  const token = getToken(); // ensures expired token check clears user as well
  if (!token) return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

/** Remove user info from localStorage */
export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
  logger.info('User removed from localStorage');
};

/** Clear all auth data (token + user) */
export const clearAuth = () => {
  removeToken();
  removeUser();
};
