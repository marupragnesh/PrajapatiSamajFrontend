/**
 * imageHelper.js
 *
 * Resolves a backend image URL to an absolute URL using the API base.
 *
 * In production (Vercel → Render), images must use the full backend URL
 * since there's no proxy. VITE_API_URL provides the correct backend origin.
 */

const BACKEND_ORIGIN = import.meta.env.VITE_API_URL;

/**
 * Converts a backend image URL to a fully resolved URL.
 * - Strips any hardcoded origin and prepends the correct backend URL.
 * - Returns null/undefined as-is (no photo case).
 *
 * @param {string|null|undefined} url - Full or relative URL from backend
 * @returns {string|null} - Fully resolved image URL
 */
export const resolveImageUrl = (url) => {
  if (!url) return null;

  // If it's already a relative path like "/uploads/photos/..."
  if (url.startsWith('/uploads')) {
    return `${BACKEND_ORIGIN}${url}`;
  }

  // If it contains a hardcoded origin, strip it and prepend correct one
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;
    if (path.startsWith('/uploads')) {
      return `${BACKEND_ORIGIN}${path}`;
    }
  } catch {
    // Not a valid URL — return as-is
  }

  return url;
};
