import axiosInstance from './axiosInstance';
import logger from '../utils/logger';

/** POST /api/likes/{profileId} — like a profile */
export const likeProfile = async (profileId) => {
  logger.api('POST', `/api/likes/${profileId}`);
  const response = await axiosInstance.post(`/api/likes/${profileId}`);
  logger.response(`/api/likes/${profileId}`, response.data);
  return response.data;
};

/** GET /api/likes/received — get list of profiles that liked the current user */
export const getLikesReceived = async () => {
  logger.api('GET', '/api/likes/received');
  const response = await axiosInstance.get('/api/likes/received');
  logger.response('/api/likes/received', { count: response.data.length });
  return response.data;
};
