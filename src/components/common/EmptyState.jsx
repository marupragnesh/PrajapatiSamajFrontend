/**
 * Shown when a list/grid has no data.
 * Every page must show this — no blank screens allowed per spec.
 */
const EmptyState = ({ icon = '🔍', title, message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
      {message && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">{message}</p>
      )}
    </div>
  );
};

export default EmptyState;
