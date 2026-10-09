import axiosInstance from './axiosInstance';
import logger from '../utils/logger';

/** POST /api/auth/register — initiate registration and send OTP */
export const registerUser = async (email, password) => {
  logger.api('POST', '/api/auth/register', { email });
  const response = await axiosInstance.post('/api/auth/register', { email, password });
  logger.response('/api/auth/register', response.data);
  return response.data;
};

/** POST /api/auth/register/resend-otp — resend registration OTP */
export const resendRegistrationOtp = async (email) => {
  logger.api('POST', '/api/auth/register/resend-otp', { email });
  const response = await axiosInstance.post('/api/auth/register/resend-otp', { email });
  logger.response('/api/auth/register/resend-otp', response.data);
  return response.data;
};

/** POST /api/auth/register/verify-otp — verify OTP, activate user, and return JWT */
export const verifyRegistrationOtp = async (email, otp) => {
  logger.api('POST', '/api/auth/register/verify-otp', { email });
  const response = await axiosInstance.post('/api/auth/register/verify-otp', { email, otpCode: otp });
  logger.response('/api/auth/register/verify-otp', response.data);
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
  const response = await axiosInstance.post('/api/auth/verify-otp', { email, otpCode: otp });
  logger.response('/api/auth/verify-otp', response.data);
  return response.data;
};

/** POST /api/auth/reset-password — set new password after OTP verified */
export const resetPassword = async (email, otp, newPassword) => {
  logger.api('POST', '/api/auth/reset-password', { email });
  const response = await axiosInstance.post('/api/auth/reset-password', { email, otpCode: otp, newPassword });
  logger.response('/api/auth/reset-password', response.data);
  return response.data;
};

/** POST /api/auth/resend-otp — resend OTP to email */
export const resendOtp = async (email) => {
  logger.api('POST', '/api/auth/resend-otp', { email });
  const response = await axiosInstance.post('/api/auth/resend-otp', { email });
  logger.response('/api/auth/resend-otp', response.data);
  return response.data;
};

/** POST /api/auth/google — authenticate or register directly with Google ID token */
export const loginWithGoogle = async (idToken) => {
  logger.api('POST', '/api/auth/google', { idToken: idToken ? idToken.substring(0, 15) + '...' : null });
  const response = await axiosInstance.post('/api/auth/google', { idToken });
  logger.response('/api/auth/google', response.data);
  return response.data;
};

