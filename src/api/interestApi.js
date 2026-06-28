import axiosInstance from './axiosInstance';
import logger from '../utils/logger';

/** POST /api/interests/{profileId} — send an interest request */
export const sendInterest = async (profileId) => {
  logger.api('POST', `/api/interests/${profileId}`);
  const response = await axiosInstance.post(`/api/interests/${profileId}`);
  logger.response(`/api/interests/${profileId}`, response.data);
  return response.data;
};

/** GET /api/interests/received — get all PENDING interest requests received */
export const getInterestsReceived = async () => {
  logger.api('GET', '/api/interests/received');
  const response = await axiosInstance.get('/api/interests/received');
  logger.response('/api/interests/received', { count: response.data.length });
  return response.data;
};

/** PUT /api/interests/{interestId}/accept — accept an interest request */
export const acceptInterest = async (interestId) => {
  logger.api('PUT', `/api/interests/${interestId}/accept`);
  const response = await axiosInstance.put(`/api/interests/${interestId}/accept`);
  logger.response(`/api/interests/${interestId}/accept`, response.data);
  return response.data;
};

/** PUT /api/interests/{interestId}/decline — decline an interest request */
export const declineInterest = async (interestId) => {
  logger.api('PUT', `/api/interests/${interestId}/decline`);
  const response = await axiosInstance.put(`/api/interests/${interestId}/decline`);
  logger.response(`/api/interests/${interestId}/decline`, response.data);
  return response.data;
};

/** GET /api/interests/matches — get all mutual matches */
export const getMatches = async () => {
  logger.api('GET', '/api/interests/matches');
  const response = await axiosInstance.get('/api/interests/matches');
  logger.response('/api/interests/matches', { count: response.data.length });
  return response.data;
};
