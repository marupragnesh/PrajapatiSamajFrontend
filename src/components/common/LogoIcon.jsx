/**
 * LogoIcon — Brand SVG emblem for PrajapatiSamaj Matrimonial.
 * Guaranteed crisp rendering on all operating systems, browsers, and mobile devices.
 */
const LogoIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg
    className={`inline-block shrink-0 ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Elegant Heart & Blossom Emblem */}
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill={color}
    />
    <circle cx="12" cy="9.5" r="2.5" fill="#ffffff" opacity="0.9" />
  </svg>
);

export default LogoIcon;
