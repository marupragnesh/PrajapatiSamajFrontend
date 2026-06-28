/**
 * Centralized logger — use [LOG] prefix for easy DevTools filtering.
 * Never use raw console.log anywhere else in the app.
 */
const logger = {
  /** General info logs — page loads, auth events, user actions */
  info: (message, data) => {
    console.log(`[LOG INFO] ${message}`, data || '');
  },

  /** Error logs — API failures, unexpected states */
  error: (message, error) => {
    console.error(`[LOG ERROR] ${message}`, error || '');
  },

  /** Outgoing API call logs — method + URL + optional payload */
  api: (method, url, payload) => {
    console.log(`[LOG API] ${method.toUpperCase()} ${url}`, payload || '');
  },

  /** Incoming API response logs */
  response: (url, data) => {
    console.log(`[LOG RESPONSE] ${url}`, data);
  },
};

export default logger;
