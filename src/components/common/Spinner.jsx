/**
 * Inline button spinner — shown while an API call is in progress.
 * Use inside buttons: <button disabled={loading}>{loading ? <Spinner /> : 'Submit'}</button>
 */
const Spinner = ({ size = 'sm' }) => {
  const sizeClass = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
  return (
    <span
      className={`inline-block ${sizeClass} animate-spin rounded-full border-2 border-white border-t-transparent`}
      role="status"
      aria-label="Loading"
    />
  );
};

export default Spinner;
