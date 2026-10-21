/**
 * Rashi Utility (રાશિ વિગત)
 *
 * Provides the 12 Vedic / Gujarati zodiac rashis with both Gujarati and English
 * formats, and automatically predicts the Rashi based on the person's name (Akshar/Namakshar)
 * for both English romanized names and Gujarati script characters.
 */

export const RASHI_OPTIONS = [
  {
    value: 'Mesh (મેષ) - Aries',
    gujarati: 'મેષ',
    english: 'Mesh',
    zodiac: 'Aries',
    letters: 'અ, લ, ઈ (A, L, E, I)',
  },
  {
    value: 'Vrishabh (વૃષભ) - Taurus',
    gujarati: 'વૃષભ',
    english: 'Vrishabh',
    zodiac: 'Taurus',
    letters: 'બ, વ, ઉ (B, V, U, W)',
  },
  {
    value: 'Mithun (મિથુન) - Gemini',
    gujarati: 'મિથુન',
    english: 'Mithun',
    zodiac: 'Gemini',
    letters: 'ક, છ, ઘ (K, CHH, GH, C, Q)',
  },
  {
    value: 'Kark (કર્ક) - Cancer',
    gujarati: 'કર્ક',
    english: 'Kark',
    zodiac: 'Cancer',
    letters: 'ડ, હ (D, H)',
  },
  {
    value: 'Simha (સિંહ) - Leo',
    gujarati: 'સિંહ',
    english: 'Simha',
    zodiac: 'Leo',
    letters: 'મ, ટ (M, T)',
  },
  {
    value: 'Kanya (કન્યા) - Virgo',
    gujarati: 'કન્યા',
    english: 'Kanya',
    zodiac: 'Virgo',
    letters: 'પ, ઠ, ણ (P, TTH)',
  },
  {
    value: 'Tula (તુલા) - Libra',
    gujarati: 'તુલા',
    english: 'Tula',
    zodiac: 'Libra',
    letters: 'ર, ત (R, T)',
  },
  {
    value: 'Vrishchik (વૃશ્ચિક) - Scorpio',
    gujarati: 'વૃશ્ચિક',
    english: 'Vrishchik',
    zodiac: 'Scorpio',
    letters: 'ન, ય (N, Y)',
  },
  {
    value: 'Dhanu (ધન) - Sagittarius',
    gujarati: 'ધન',
    english: 'Dhanu',
    zodiac: 'Sagittarius',
    letters: 'ભ, ધ, ફ, ઢ (BH, DH, F, PH)',
  },
  {
    value: 'Makar (મકર) - Capricorn',
    gujarati: 'મકર',
    english: 'Makar',
    zodiac: 'Capricorn',
    letters: 'ખ, જ (KH, J)',
  },
  {
    value: 'Kumbh (કુંભ) - Aquarius',
    gujarati: 'કુંભ',
    english: 'Kumbh',
    zodiac: 'Aquarius',
    letters: 'ગ, શ, સ, ષ (G, SH, S)',
  },
  {
    value: 'Meen (મીન) - Pisces',
    gujarati: 'મીન',
    english: 'Meen',
    zodiac: 'Pisces',
    letters: 'દ, ચ, ઝ, થ (D, CH, Z, TH)',
  },
];

/**
 * Predicts Rashi based on the first letter / phonetics of the given name.
 * Supports both Gujarati Unicode characters and English transliterated letters.
 *
 * @param {string} name - First name (e.g., "Pragnesh", "પ્રજ્ઞેશ", "Bhavik", "ભાવિક")
 * @returns {string} The full dual-format Rashi string or empty string if not matched.
 */
export const predictRashiByName = (name) => {
  if (!name || typeof name !== 'string') return '';
  const trimmed = name.trim();
  if (!trimmed) return '';

  const firstChar = trimmed.charAt(0);

  // 1. Check if first character is Gujarati script (\u0A80 to \u0AFF)
  if (/[\u0A80-\u0AFF]/.test(firstChar)) {
    if (['અ', 'આ', 'લ', 'ઈ', 'ઇ', 'એ', 'ઐ'].includes(firstChar)) return 'Mesh (મેષ) - Aries';
    if (['બ', 'વ', 'ઉ', 'ઊ', 'ઓ', 'ઔ'].includes(firstChar)) return 'Vrishabh (વૃષભ) - Taurus';
    if (['ક', 'છ', 'ઘ'].includes(firstChar)) return 'Mithun (મિથુન) - Gemini';
    if (['ડ', 'હ'].includes(firstChar)) return 'Kark (કર્ક) - Cancer';
    if (['મ', 'ટ'].includes(firstChar)) return 'Simha (સિંહ) - Leo';
    if (['પ', 'ઠ', 'ણ'].includes(firstChar)) return 'Kanya (કન્યા) - Virgo';
    if (['ર', 'ત'].includes(firstChar)) return 'Tula (તુલા) - Libra';
    if (['ન', 'ય'].includes(firstChar)) return 'Vrishchik (વૃશ્ચિક) - Scorpio';
    if (['ભ', 'ધ', 'ફ', 'ઢ'].includes(firstChar)) return 'Dhanu (ધન) - Sagittarius';
    if (['ખ', 'જ'].includes(firstChar)) return 'Makar (મકર) - Capricorn';
    if (['ગ', 'શ', 'સ', 'ષ'].includes(firstChar)) return 'Kumbh (કુંભ) - Aquarius';
    if (['દ', 'ચ', 'ઝ', 'થ'].includes(firstChar)) return 'Meen (મીન) - Pisces';
  }

  // 2. English transliterated names
  const lower = trimmed.toLowerCase();

  // Multi-character phonetic checks first
  if (lower.startsWith('chh')) return 'Mithun (મિથુન) - Gemini';
  if (lower.startsWith('bh')) return 'Dhanu (ધન) - Sagittarius';
  if (lower.startsWith('dh')) return 'Dhanu (ધન) - Sagittarius';
  if (lower.startsWith('ph')) return 'Dhanu (ધન) - Sagittarius';
  if (lower.startsWith('gh')) return 'Mithun (મિથુન) - Gemini';
  if (lower.startsWith('kh')) return 'Makar (મકર) - Capricorn';
  if (lower.startsWith('sh')) return 'Kumbh (કુંભ) - Aquarius';
  if (lower.startsWith('ch')) return 'Meen (મીન) - Pisces';
  if (lower.startsWith('th')) return 'Meen (મીન) - Pisces';

  // Single character checks
  const firstLetter = lower.charAt(0);
  switch (firstLetter) {
    case 'a':
    case 'l':
    case 'e':
    case 'i':
      return 'Mesh (મેષ) - Aries';

    case 'b':
    case 'v':
    case 'u':
    case 'w':
      return 'Vrishabh (વૃષભ) - Taurus';

    case 'k':
    case 'c':
    case 'q':
      return 'Mithun (મિથુન) - Gemini';

    case 'h':
      return 'Kark (કર્ક) - Cancer';

    case 'm':
      return 'Simha (સિંહ) - Leo';

    case 'p':
      return 'Kanya (કન્યા) - Virgo';

    case 'r':
    case 't':
      return 'Tula (તુલા) - Libra';

    case 'n':
    case 'y':
      return 'Vrishchik (વૃશ્ચિક) - Scorpio';

    case 'f':
      return 'Dhanu (ધન) - Sagittarius';

    case 'j':
      return 'Makar (મકર) - Capricorn';

    case 'g':
    case 's':
      return 'Kumbh (કુંભ) - Aquarius';

    case 'd':
    case 'z':
      return 'Meen (મીન) - Pisces';

    default:
      return '';
  }
};
