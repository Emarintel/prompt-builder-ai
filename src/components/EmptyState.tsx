import { Sparkles } from 'lucide-react';
import { Language } from '../types';
import { isRtlLanguage } from '../utils/languageUtils';
import { Translations } from '../locales/en';

interface Props {
  language: Language;
  t: Pick<Translations, 'emptyTitle' | 'emptyDescription' | 'emptyHints'>;
}

export function EmptyState({ language, t }: Props) {
  const isRtl = isRtlLanguage(language);
  const isPersian = language === 'fa';

  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center
        animate-fade-in ${isPersian ? 'font-vazirmatn' : ''}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600
          flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-5"
      >
        <Sparkles size={24} className="text-white" />
      </div>

      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
        {t.emptyTitle}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed mb-6">
        {t.emptyDescription}
      </p>

      <div className="flex flex-col gap-2 w-full max-w-xs">
        {t.emptyHints.map((hint, i) => (
          <div
            key={i}
            className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200
              dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400"
          >
            {hint}
          </div>
        ))}
      </div>
    </div>
  );
}
