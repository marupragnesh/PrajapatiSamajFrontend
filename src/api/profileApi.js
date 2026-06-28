import axiosInstance from './axiosInstance';
import logger from '../utils/logger';

/** GET /api/profile/me — fetch current user's own profile */
export const getMyProfile = async () => {
  logger.api('GET', '/api/profile/me');
  const response = await axiosInstance.get('/api/profile/me');
  logger.response('/api/profile/me', response.data);
  return response.data;
};

/** POST /api/profile — create profile (first time only) */
export const createProfile = async (profileData) => {
  logger.api('POST', '/api/profile', profileData);
  const response = await axiosInstance.post('/api/profile', profileData);
  logger.response('/api/profile', response.data);
  return response.data;
};

/** PUT /api/profile — update existing profile */
export const updateProfile = async (profileData) => {
  logger.api('PUT', '/api/profile', profileData);
  const response = await axiosInstance.put('/api/profile', profileData);
  logger.response('/api/profile', response.data);
  return response.data;
};

/** POST /api/profile/photos — upload a photo (multipart/form-data) */
export const uploadPhoto = async (formData) => {
  logger.api('POST', '/api/profile/photos');
  const response = await axiosInstance.post('/api/profile/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  logger.response('/api/profile/photos', response.data);
  return response.data;
};

/** DELETE /api/profile/photos/{photoId} — delete a specific photo */
export const deletePhoto = async (photoId) => {
  logger.api('DELETE', `/api/profile/photos/${photoId}`);
  const response = await axiosInstance.delete(`/api/profile/photos/${photoId}`);
  logger.response(`/api/profile/photos/${photoId}`, response.data);
  return response.data;
};

/** GET /api/profiles/{profileId} — view another user's profile */
export const getProfileById = async (profileId) => {
  logger.api('GET', `/api/profiles/${profileId}`);
  const response = await axiosInstance.get(`/api/profiles/${profileId}`);
  logger.response(`/api/profiles/${profileId}`, response.data);
  return response.data;
};

/** GET /api/preferences — get partner preference */
export const getPreference = async () => {
  logger.api('GET', '/api/preferences');
  const response = await axiosInstance.get('/api/preferences');
  logger.response('/api/preferences', response.data);
  return response.data;
};

/** PUT /api/preferences — update partner preference */
export const updatePreference = async (preferredGender) => {
  logger.api('PUT', '/api/preferences', { preferredGender });
  const response = await axiosInstance.put('/api/preferences', { preferredGender });
  logger.response('/api/preferences', response.data);
  return response.data;
};
