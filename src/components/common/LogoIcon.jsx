/**
 * LogoIcon — Royal Heritage Brand SVG Emblem for PrajapatiSamaj Matrimonial.
 * Features an authentic Royal Heritage Crown & Traditional Lotus Blossom emblem.
 */
const LogoIcon = ({ className = "w-7 h-7", color = "#D97706" }) => (
  <svg
    className={`inline-block shrink-0 ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="royalGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="50%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#92400E" />
      </linearGradient>
    </defs>
    {/* Royal Crown Crest */}
    <path
      d="M3 18h18v2H3v-2zm1.2-12l3.5 5 4.3-7 4.3 7 3.5-5L21 16H3L4.2 6z"
      fill="url(#royalGoldGrad)"
    />
    <circle cx="12" cy="4" r="1.5" fill="#FBBF24" />
    <circle cx="4.2" cy="6" r="1.2" fill="#FBBF24" />
    <circle cx="19.8" cy="6" r="1.2" fill="#FBBF24" />
    {/* Sacred Lotus Blossom Centerpiece */}
    <path
      d="M12 11c-1.5 2-3 2.5-4 2.5 1 1 2.5 1.5 4 1.5s3-.5 4-1.5c-1 0-2.5-.5-4-2.5z"
      fill="#FFFBEB"
    />
  </svg>
);

export default LogoIcon;
