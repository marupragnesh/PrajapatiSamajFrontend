import axiosInstance from './axiosInstance';
import logger from '../utils/logger';

/**
 * GET /api/discover?page=&size=
 * Returns paginated list of ProfileResponse objects.
 * Empty array [] means no more profiles — stop pagination.
 */
export const discoverProfiles = async (page = 0, size = 10) => {
  logger.api('GET', '/api/discover', { page, size });
  const response = await axiosInstance.get('/api/discover', { params: { page, size } });
  logger.response('/api/discover', { count: response.data.length, page });
  return response.data;
};
