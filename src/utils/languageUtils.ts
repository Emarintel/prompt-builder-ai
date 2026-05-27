import { Language } from '../types';

/** True for languages that read right-to-left (Persian and Arabic). */
export function isRtlLanguage(lang: Language): boolean {
  return lang === 'fa' || lang === 'ar';
}

/** Human-readable label for display in the UI. */
export function languageLabel(lang: Language): string {
  if (lang === 'fa') return 'Persian';
  if (lang === 'ar') return 'Arabic';
  return 'English';
}

/** BCP-47 locale string for date/number formatting. */
export function languageLocale(lang: Language): string {
  if (lang === 'fa') return 'fa-IR';
  if (lang === 'ar') return 'ar-SA';
  return 'en-US';
}

/** Full label sent to the AI API (used in buildMessage). */
export function languageApiLabel(lang: Language): string {
  if (lang === 'fa') return 'Persian (Farsi)';
  if (lang === 'ar') return 'Arabic';
  return 'English';
}
