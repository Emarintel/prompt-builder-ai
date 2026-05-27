import { Language } from '../types';

// Persian-specific letters not found in standard Arabic: پ چ ژ گ + Persian ک (U+06A9) and ی (U+06CC)
const PERSIAN_SPECIFIC = /[پچژگکی]/;

export function detectLanguage(text: string): Language {
  // Arabic/Persian (U+0600-U+06FF) + Arabic Supplement (U+0750-U+077F) + Arabic Extended-A (U+08A0-U+08FF)
  const rtlChars = (text.match(/[؀-ۿݐ-ݿࢠ-ࣿ]/g) ?? []).length;
  if (rtlChars >= 2) {
    return PERSIAN_SPECIFIC.test(text) ? 'fa' : 'ar';
  }
  const latinChars = (text.match(/[A-Za-z]/g) ?? []).length;
  if (latinChars > 0) return 'en';
  return 'en';
}
