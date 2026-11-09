import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { clearSiteCacheAndReload } from '../../utils/cacheHelper';

/**
 * ErrorBoundary
 *
 * Catches JavaScript runtime crashes and dynamic import chunk load failures
 * (which cause the dreaded "black / blank screen" when a new build is deployed
 * while a user's browser still holds stale cached chunk hashes).
 *
 * Automatically detects chunk failure and reloads once cleanly.
 * If errors persist, renders a recovery screen with a 1-click "Clear Cache & Reset App" button.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Auto-recover from stale dynamic chunk hash failures after a new deployment
    const isChunkLoadFailed =
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Loading chunk') ||
      error?.name === 'ChunkLoadError';

    const hasReloadedForChunk = sessionStorage.getItem('chunk_reload_attempted');
    if (isChunkLoadFailed && !hasReloadedForChunk) {
      sessionStorage.setItem('chunk_reload_attempted', 'true');
      clearSiteCacheAndReload();
    }
  }

  handleReset = () => {
    clearSiteCacheAndReload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-3xl p-6 sm:p-8 border border-border dark:border-gray-800 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                Something went wrong
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                A temporary browser caching or session issue occurred. Resetting your cache will fix this instantly.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-light text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear Cache &amp; Reset App</span>
              </button>
            </div>

            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              No account data or photos will be lost. Only local temporary files are cleared.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
