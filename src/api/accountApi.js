import axiosInstance from './axiosInstance';
import logger from '../utils/logger';

/**
 * DELETE /api/account
 * Permanently deletes the current user's account.
 * Authorization is handled by the JWT token in the request header (via axiosInstance).
 */
export const deleteAccount = async () => {
  logger.api('DELETE', '/api/account');
  const response = await axiosInstance.delete('/api/account');
  logger.response('/api/account', response.data);
  return response.data;
};
