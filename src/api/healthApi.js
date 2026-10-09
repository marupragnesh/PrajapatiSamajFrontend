import axiosInstance from './axiosInstance';
import logger from '../utils/logger';

/**
 * API: healthApi
 *
 * Provides a lightweight keep-alive ping function to prevent Render free instance
 * from shutting down after 15 minutes of inactivity.
 */
export const pingBackend = async () => {
  try {
    const response = await axiosInstance.get('/api/health');
    logger.info('Keep-alive ping succeeded', response.data);
    return response.data;
  } catch (err) {
    // Silently capture error during background ping (e.g. while server is spinning up)
    logger.warn('Keep-alive ping notice (backend waking up):', err.message);
    return null;
  }
};
