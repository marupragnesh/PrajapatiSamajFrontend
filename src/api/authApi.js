import axiosInstance from './axiosInstance';
import logger from '../utils/logger';

/** POST /api/auth/register — register a new user */
export const registerUser = async (email, password) => {
  logger.api('POST', '/api/auth/register', { email });
  const response = await axiosInstance.post('/api/auth/register', { email, password });
  logger.response('/api/auth/register', response.data);
  return response.data;
};

/** POST /api/auth/login — login with email + password */
export const loginUser = async (email, password) => {
  logger.api('POST', '/api/auth/login', { email });
  const response = await axiosInstance.post('/api/auth/login', { email, password });
  logger.response('/api/auth/login', response.data);
  return response.data;
};

/** POST /api/auth/forgot-password — send OTP to email */
export const forgotPassword = async (email) => {
  logger.api('POST', '/api/auth/forgot-password', { email });
  const response = await axiosInstance.post('/api/auth/forgot-password', { email });
  logger.response('/api/auth/forgot-password', response.data);
  return response.data;
};

/** POST /api/auth/verify-otp — verify the 6-digit OTP */
export const verifyOtp = async (email, otp) => {
  logger.api('POST', '/api/auth/verify-otp', { email });
  const response = await axiosInstance.post('/api/auth/verify-otp', { email, otp });
  logger.response('/api/auth/verify-otp', response.data);
  return response.data;
};

/** POST /api/auth/reset-password — set new password after OTP verified */
export const resetPassword = async (email, otp, newPassword) => {
  logger.api('POST', '/api/auth/reset-password', { email });
  const response = await axiosInstance.post('/api/auth/reset-password', { email, otp, newPassword });
  logger.response('/api/auth/reset-password', response.data);
  return response.data;
};
