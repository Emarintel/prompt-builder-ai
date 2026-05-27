import { Sun, Moon, History, Languages, Zap } from 'lucide-react';
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
        bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600
              flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0"
          >
            <Zap size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-none">
            <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
              Prompt
            </span>
            <span
              className="text-sm font-bold bg-gradient-to-r from-indigo-500 to-violet-500
                bg-clip-text text-transparent ms-1"
            >
              Builder
            </span>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 ms-1">
              AI
            </span>
          </div>
        </div>

        {/* Controls */}
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

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t.lightMode : t.darkMode}
            title={theme === 'dark' ? t.lightMode : t.darkMode}
            className="w-8 h-8 rounded-xl flex items-center justify-center
              bg-gray-100 hover:bg-gray-200 text-gray-500 dark:text-gray-400
              dark:bg-gray-800 dark:hover:bg-gray-700
              transition-all duration-150"
          >
            {theme === 'dark' ? (
              <Sun size={14} strokeWidth={2} />
            ) : (
              <Moon size={14} strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
