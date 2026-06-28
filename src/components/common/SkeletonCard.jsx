/**
 * Skeleton placeholder shown while profile cards are loading.
 * Prevents blank screen — per spec performance rules.
 */
const SkeletonCard = () => {
  return (
    <div className="rounded-2xl border border-border bg-white dark:bg-card-dark animate-pulse overflow-hidden">
      {/* Photo placeholder */}
      <div className="h-48 bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-3">
        {/* Name */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        {/* Age + City */}
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        {/* Profession */}
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>
    </div>
  );
};

export default SkeletonCard;
