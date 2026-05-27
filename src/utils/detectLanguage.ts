import { Language } from '../types';

export function detectLanguage(text: string): Language {
  const persianChars = (text.match(/[؀-ۿ]/g) ?? []).length;
  const totalSignificantChars = text.replace(/[\s\d\W]/g, '').length;
  if (totalSignificantChars === 0) return 'en';
  return persianChars / totalSignificantChars > 0.25 ? 'fa' : 'en';
}
