/**
 * imageHelper.js
 *
 * Resolves a backend image URL to an absolute URL using the API base.
 *
 * In production (Vercel → Render), images must use the full backend URL
 * since there's no proxy. VITE_API_URL provides the correct backend origin.
 */

const BACKEND_ORIGIN = import.meta.env.VITE_API_URL || '';

/**
 * Converts a backend or cloud image URL to a fully resolved URL.
 * - If it's a Cloudinary or cloud HTTPS URL, returns directly.
 * - If it's a relative path ("/uploads/..."), prepends BACKEND_ORIGIN.
 * - Returns null/undefined as-is (no photo case).
 *
 * @param {string|null|undefined} url - Full or relative URL from backend
 * @returns {string|null} - Fully resolved image URL
 */
export const resolveImageUrl = (url) => {
  if (!url) return null;

  // Cloudinary or external cloud URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Return external cloud storage URLs (e.g. res.cloudinary.com) directly
    if (!url.includes('/uploads/')) {
      return url;
    }
    // If it has a hardcoded local origin pointing to /uploads/, normalize to current backend origin
    try {
      const parsed = new URL(url);
      const path = parsed.pathname;
      if (path.startsWith('/uploads')) {
        return `${BACKEND_ORIGIN}${path}`;
      }
    } catch {
      return url;
    }
  }

  // If it's a relative path like "/uploads/photos/..."
  if (url.startsWith('/uploads')) {
    return `${BACKEND_ORIGIN}${url}`;
  }

  return url;
};
