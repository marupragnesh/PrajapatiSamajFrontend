import axiosInstance from './axiosInstance';
import logger from '../utils/logger';

/** GET /api/discover?page=&size= — browse profiles by gender preference */
export const discoverProfiles = async (page = 0, size = 10) => {
  logger.api('GET', '/api/discover', { page, size });
  const response = await axiosInstance.get('/api/discover', { params: { page, size } });
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
