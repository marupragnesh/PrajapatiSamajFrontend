/**
 * LogoIcon — Custom Matrimonial Union Brand Mark for PrajapatiSamaj.
 * 
 * Represents marriage, family, trust, and lifelong relationship:
 * - Two interlocking wedding bands forming an eternal union (infinity)
 * - Harmonious knot uniting two individuals and families
 * - Warm royal heritage gold gradient (#F59E0B -> #D97706 -> #92400E)
 * - Clean, minimalist, and vector-precise at any scale
 */
const LogoIcon = ({ className = "w-7 h-7", color = "#D97706" }) => (
  <svg
    className={`inline-block shrink-0 ${className}`}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="PrajapatiSamaj Matrimonial Mark"
  >
    <defs>
      <linearGradient id="matrimonialGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="50%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="innerGlow" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>

    {/* Left Union Ring (Family / Partner 1) */}
    <circle
      cx="12"
      cy="16"
      r="7.5"
      stroke="url(#matrimonialGoldGrad)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Right Union Ring (Family / Partner 2) */}
    <circle
      cx="20"
      cy="16"
      r="7.5"
      stroke="url(#matrimonialGoldGrad)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Interlocking Bond Overlay Arc (Ensures seamless interweave) */}
    <path
      d="M16 11.5 A7.5 7.5 0 0 1 18.5 16 A7.5 7.5 0 0 1 16 20.5"
      stroke="url(#innerGlow)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Center Sacred Knot / Auspicious Diamond Bond */}
    <path
      d="M16 13.2L17.8 16L16 18.8L14.2 16Z"
      fill="url(#matrimonialGoldGrad)"
    />
  </svg>
);

export default LogoIcon;
