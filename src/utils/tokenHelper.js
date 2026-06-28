import logger from './logger';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/** Save JWT token to localStorage */
export const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  logger.info('Token saved to localStorage');
};

/** Get JWT token from localStorage */
export const getToken = () => localStorage.getItem(TOKEN_KEY);

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
