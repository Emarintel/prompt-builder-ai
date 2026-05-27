import { Sun, Moon, History, Languages } from 'lucide-react';
import { Theme, Language } from '../types';
import { Translations } from '../locales/en';

interface Props {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  toggleLanguage: () => void;
  onHistoryToggle: () => void;
  historyCount: number;
  t: Pick<Translations, 'language' | 'historyTitle' | 'appName' | 'lightMode' | 'darkMode'>;
}

export function Header({
  theme,
  toggleTheme,
  language,
  toggleLanguage,
  onHistoryToggle,
  historyCount,
  t,
}: Props) {
  const isRtl = language === 'fa';

  return (
    <header
      className="sticky top-0 z-40 border-b border-gray-200/60 dark:border-gray-800/60
        bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">

        {/* ── Branding ── */}
        <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <img
            src="/emarintel-logo.svg"
            alt="Emarintel"
            className="h-12 sm:h-16 w-auto max-w-[260px] object-contain shrink-0"
          />
          <div className={isRtl ? 'text-right' : ''}>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
              PromptBuilder{' '}
              <span className="text-violet-600 dark:text-violet-400">AI</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              by Emarintel
            </p>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
              bg-indigo-50 hover:bg-indigo-100 text-indigo-600
              dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 dark:text-indigo-400
              transition-all duration-150 border border-indigo-200/50 dark:border-indigo-800/50"
          >
            <Languages size={12} strokeWidth={2.5} />
            <span>{t.language}</span>
          </button>

          {/* History button */}
          <button
            onClick={onHistoryToggle}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
              bg-gray-100 hover:bg-gray-200 text-gray-600
              dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400
              transition-all duration-150"
          >
            <History size={12} strokeWidth={2} />
            <span className={isRtl ? 'font-vazirmatn' : ''}>{t.historyTitle}</span>
            {historyCount > 0 && (
              <span
                className="absolute -top-1.5 -end-1.5 w-4 h-4 rounded-full
                  bg-indigo-500 text-white text-[9px] flex items-center justify-center font-bold"
              >
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t.lightMode : t.darkMode}
            title={theme === 'dark' ? t.lightMode : t.darkMode}
            className="w-8 h-8 rounded-xl flex items-center justify-center
              bg-gray-100 hover:bg-gray-200 text-gray-500 dark:text-gray-400
              dark:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-150"
          >
            {theme === 'dark'
              ? <Sun size={14} strokeWidth={2} />
              : <Moon size={14} strokeWidth={2} />}
          </button>
        </div>
      </div>
    </header>
  );
}
