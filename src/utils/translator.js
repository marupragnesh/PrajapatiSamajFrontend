import { DICTIONARY, getGujaratiStatic } from './gujaratiDictionary';

// Cache for runtime dynamic translations to prevent redundant lookups/API calls
const translationCache = new Map();

/**
 * Transliteration fallback map for common Gujarati phonetic letter mapping
 */
const ENGLISH_TO_GUJARATI_PHONETIC = [
  ['bh', 'ભ'], ['ch', 'છ'], ['dh', 'ધ'], ['gh', 'ઘ'], ['jh', 'ઝ'],
  ['kh', 'ખ'], ['ph', 'ફ'], ['sh', 'શ'], ['th', 'થ'], ['ck', 'ક'],
  ['a', 'ા'], ['b', 'બ'], ['c', 'ક'], ['d', 'દ'], ['e', 'ે'],
  ['f', 'ફ'], ['g', 'ગ'], ['h', 'હ'], ['i', 'િ'], ['j', 'જ'],
  ['k', 'ક'], ['l', 'લ'], ['m', 'મ'], ['n', 'ન'], ['o', 'ો'],
  ['p', 'પ'], ['q', 'ક'], ['r', 'ર'], ['s', 'સ'], ['t', 'ત'],
  ['u', 'ુ'], ['v', 'વ'], ['w', 'વ'], ['x', 'ક્સ'], ['y', 'ય'], ['z', 'ઝ']
];

/**
 * Basic transliterator for English proper nouns into Gujarati script when offline/no API
 */
export function transliterateToGujarati(text) {
  if (!text) return "";
  let str = String(text);

  // Check dictionary first
  const dictMatch = getGujaratiStatic(str);
  if (dictMatch) return dictMatch;

  // Split into words and check dictionary or transliterate
  return str.split(" ").map(word => {
    const cleanWord = word.trim();
    if (!cleanWord) return "";
    const directMatch = getGujaratiStatic(cleanWord);
    if (directMatch) return directMatch;

    // Transliterate word by word
    let lower = cleanWord.toLowerCase();
    let res = "";
    let i = 0;
    while (i < lower.length) {
      let matched = false;
      for (let [eng, guj] of ENGLISH_TO_GUJARATI_PHONETIC) {
        if (lower.startsWith(eng, i)) {
          res += guj;
          i += eng.length;
          matched = true;
          break;
        }
      }
      if (!matched) {
        res += lower[i];
        i++;
      }
    }
    return res.charAt(0).toUpperCase() + res.slice(1);
  }).join(" ");
}

/**
 * Translate dynamic free-text input (like bio, address, work details) at runtime
 */
export function translateValue(text, langMode = 'en') {
  if (!text || langMode === 'en') return text;
  
  const textStr = String(text).trim();
  if (!textStr) return "";

  // 1. Check static dictionary
  const staticMatch = getGujaratiStatic(textStr);
  if (staticMatch) return staticMatch;

  // 2. Check cache
  if (translationCache.has(textStr)) {
    return translationCache.get(textStr);
  }

  // 3. Fallback to intelligent transliteration/translation
  const transliterated = transliterateToGujarati(textStr);
  translationCache.set(textStr, transliterated);
  return transliterated;
}

/**
 * Translate field title/label based on language mode
 * langMode: 'en' (English), 'gu' (Gujarati), 'semi' (Semi-English)
 */
export function translateTitle(title, langMode = 'en') {
  if (!title) return "";
  if (langMode === 'en' || langMode === 'semi') {
    // In English & Semi-English modes, titles remain in English!
    return title;
  }
  // In Gujarati mode, titles are in Gujarati!
  return getGujaratiStatic(title) || title;
}

/**
 * Formats a title-value pair based on selected language mode
 */
export function formatTitleValue(title, value, langMode = 'en') {
  const formattedTitle = translateTitle(title, langMode);
  const formattedValue = translateValue(value, langMode);
  return { title: formattedTitle, value: formattedValue };
}
