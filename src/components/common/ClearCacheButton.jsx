import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { clearSiteCacheAndReload } from '../../utils/cacheHelper';

/**
 * ClearCacheButton
 *
 * A reusable, clean button that triggers instant browser cache & cookie clearance.
 * Can be rendered in standard button mode or minimal inline link mode.
 * Accessible without login or registration.
 */
const ClearCacheButton = ({ variant = 'button', className = '' }) => {
  const [clearing, setClearing] = useState(false);

  const handleClick = async () => {
    if (clearing) return;
    setClearing(true);
    await clearSiteCacheAndReload();
  };

  if (variant === 'link') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={clearing}
        title="Clear cached files, cookies and reload freshly"
        className={`inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-500 transition-colors cursor-pointer disabled:opacity-50 ${className}`}
      >
        <RotateCcw className={`w-3.5 h-3.5 ${clearing ? 'animate-spin' : ''}`} />
        <span>{clearing ? 'Clearing cache...' : 'Clear Cache & Reload'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={clearing}
      title="Clear cached files, cookies and reload freshly"
      className={`px-3 py-1.5 rounded-xl border border-border dark:border-gray-700 bg-white dark:bg-card-dark text-gray-600 dark:text-gray-300 hover:text-primary hover:border-primary/50 text-xs font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${className}`}
    >
      <RotateCcw className={`w-3.5 h-3.5 text-amber-500 ${clearing ? 'animate-spin' : ''}`} />
      <span>{clearing ? 'Resetting...' : 'Clear Cache'}</span>
    </button>
  );
};

export default ClearCacheButton;
