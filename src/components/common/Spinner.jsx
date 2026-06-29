/**
 * Inline spinner — shown during loading states.
 *
 * Props:
 *   size  — 'sm' (default) | 'lg'
 *   color — 'white' (default) | 'primary'
 *
 * Use 'white' inside dark buttons/overlays.
 * Use 'primary' inside light backgrounds (e.g. label buttons).
 */
const Spinner = ({ size = 'sm', color = 'white' }) => {
  const sizeClass = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
  const colorClass =
    color === 'primary'
      ? 'border-primary border-t-transparent'
      : 'border-white border-t-transparent';

  return (
    <span
      className={`inline-block ${sizeClass} animate-spin rounded-full border-2 ${colorClass}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export default Spinner;
