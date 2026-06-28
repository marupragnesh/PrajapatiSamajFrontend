/**
 * imageHelper.js
 *
 * Resolves a backend image URL to a path the Vite dev proxy can forward.
 *
 * Problem:
 *   Backend stores and returns absolute URLs like:
 *   "http://localhost:8080/uploads/photos/4/uuid.jpg"
 *
 *   If used directly in <img src>, the browser sends the request straight to
 *   localhost:8080, bypassing the Vite proxy — which works in dev but breaks
 *   if the backend host ever changes, and causes CORS issues in some setups.
 *
 * Solution:
 *   Strip the origin (http://localhost:8080) so the src becomes:
 *   "/uploads/photos/4/uuid.jpg"
 *
 *   Vite proxy rule in vite.config.js then forwards /uploads/* → localhost:8080.
 *   This keeps image loading consistent and host-agnostic.
 */

const BACKEND_ORIGIN = 'http://localhost:8080';

/**
 * Converts a full backend image URL to a proxy-friendly path.
 * Returns null/undefined as-is (no photo case).
 *
 * @param {string|null|undefined} url - Full URL from backend
 * @returns {string|null} - Path only, e.g. "/uploads/photos/4/uuid.jpg"
 */
export const resolveImageUrl = (url) => {
  if (!url) return null;
  // If it starts with our backend origin, strip it
  if (url.startsWith(BACKEND_ORIGIN)) {
    return url.slice(BACKEND_ORIGIN.length);
  }
  // Already a relative path or different host — return as-is
  return url;
};
