import axiosInstance from './axiosInstance';
import logger from '../utils/logger';

/** GET /api/discover?page=&size=&minAge=... — browse profiles by preference and optional filters */
export const discoverProfiles = async (page = 0, size = 10, filters = {}) => {
  const params = { page, size };

  if (filters.minAge) filters.minAge = Number(filters.minAge);
  if (filters.maxAge) filters.maxAge = Number(filters.maxAge);

  // Strip empty/null filter values
  Object.keys(filters).forEach((key) => {
    if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
      params[key] = filters[key];
    }
  });

  logger.api('GET', '/api/discover', params);
  const response = await axiosInstance.get('/api/discover', { params });
  logger.response('/api/discover', { count: response.data.length, page });
  return response.data;
};

/** GET /api/discover/search?keyword= — search profiles by full name */
export const searchProfiles = async (keyword) => {
  logger.api('GET', '/api/discover/search', { keyword });
  const response = await axiosInstance.get('/api/discover/search', { params: { keyword } });
  logger.response('/api/discover/search', { count: response.data.length });
  return response.data;
};
