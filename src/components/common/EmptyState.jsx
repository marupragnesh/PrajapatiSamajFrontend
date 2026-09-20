import { Search } from 'lucide-react';

/**
 * Shown when a list/grid has no data.
 * Features a minimalist line icon container with professional typography.
 */
const EmptyState = ({ icon, title, message }) => {
  // Render icon: if React element or Lucide icon, render directly. If undefined or emoji fallback, render Search line icon.
  const renderIcon = () => {
    if (icon && typeof icon !== 'string') {
      return icon;
    }
    return <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />;
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-card-dark border border-border flex items-center justify-center mb-4 shadow-sm text-primary">
        {renderIcon()}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 mb-1.5">
        {title}
      </h3>
      {message && (
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
          {message}
        </p>
      )}
    </div>
  );
};

export default EmptyState;
