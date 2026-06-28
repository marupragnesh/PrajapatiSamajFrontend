import { createContext, useState, useEffect } from 'react';
import { saveToken, saveUser, clearAuth, getToken, getUser } from '../utils/tokenHelper';
import logger from '../utils/logger';

export const AuthContext = createContext(null);

/**
 * Provides global auth state: token, user, isLoggedIn.
 * Restores session from localStorage on app load.
 * Wrap the entire <App /> with this provider.
 */
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  /** Restore auth session from localStorage on first load */
  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      logger.info('Auth session restored from localStorage', { email: storedUser.email });
    }
  }, []);

  /** Save token + user to state and localStorage */
  const login = (newToken, newUser) => {
    saveToken(newToken);
    saveUser(newUser);
    setToken(newToken);
    setUser(newUser);
    logger.info('User logged in', { email: newUser.email });
  };

  /** Clear all auth data and redirect to login */
  const logout = () => {
    clearAuth();
    setToken(null);
    setUser(null);
    logger.info('User logged out — redirecting to /login');
    window.location.href = '/login';
  };

  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider value={{ token, user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
