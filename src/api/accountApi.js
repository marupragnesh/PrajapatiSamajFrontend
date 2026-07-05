import axiosInstance from './axiosInstance';
import logger from '../utils/logger';

/**
 * POST /api/account/delete-otp
 * Requests OTP to be sent to logged-in user's email for account deletion.
 */
export const requestDeleteAccountOtp = async () => {
  logger.api('POST', '/api/account/delete-otp');
  const response = await axiosInstance.post('/api/account/delete-otp');
  logger.response('/api/account/delete-otp', response.data);
  return response.data;
};

/**
 * DELETE /api/account?otpCode=
 * Permanently deletes the current user's account after verifying OTP.
 */
export const deleteAccount = async (otpCode) => {
  logger.api('DELETE', '/api/account', { otpCode });
  const response = await axiosInstance.delete('/api/account', { params: { otpCode } });
  logger.response('/api/account', response.data);
  return response.data;
};
