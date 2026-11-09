/**
 * cacheHelper.js
 *
 * Provides a nuclear clean-up utility to reset all client-side stored state:
 * 1. Clears localStorage (stale tokens, corrupt JSON, outdated filters)
 * 2. Clears sessionStorage
 * 3. Clears CacheStorage API caches (stored by browsers or service workers)
 * 4. Unregisters any registered Service Workers
 * 5. Deletes all cookies accessible via JavaScript
 * 6. Hard-reloads the window from the network (bypassing browser cache)
 */
export const clearSiteCacheAndReload = async () => {
  try {
    // 1. Clear LocalStorage and SessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // 2. Clear CacheStorage API caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }

    // 3. Unregister any Service Workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
    }

    // 4. Delete client cookies
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    }
  } catch (err) {
    console.error('Error during site cache clearance:', err);
  } finally {
    // 5. Hard reload to root URL, bypassing cached resources
    window.location.href = window.location.origin + '/login?cleared=' + Date.now();
  }
};
