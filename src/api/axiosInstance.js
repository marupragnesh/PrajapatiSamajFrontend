import axios from 'axios';
import logger from '../utils/logger';

/**
 * Shared Axios instance — single source of truth for API base URL.
 * All HTTP calls must go through this instance (never write raw fetch()).
 */
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

/** Request interceptor — attach JWT token automatically to every request */
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    logger.info('JWT token attached to request', config.url);
  }
  return config;
});

/** Response interceptor — handle 401 globally (token expired or invalid) */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logger.error('401 Unauthorized — clearing token and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
