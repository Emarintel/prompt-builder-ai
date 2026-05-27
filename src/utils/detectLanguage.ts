import { Language } from '../types';

// Persian and Arabic share U+0600–U+06FF.
// Persian-specific letters not found in standard Arabic: پ چ ژ گ + Persian ک (U+06A9) and ی (U+06CC).
const PERSIAN_SPECIFIC = /[پچژگکی]/;

export function detectLanguage(text: string): Language {
  const rtlChars = (text.match(/[؀-ۿ]/g) ?? []).length;
  const totalSignificantChars = text.replace(/[\s\d\W]/g, '').length;
  if (totalSignificantChars === 0 || rtlChars / totalSignificantChars <= 0.25) return 'en';
  return PERSIAN_SPECIFIC.test(text) ? 'fa' : 'ar';
}
