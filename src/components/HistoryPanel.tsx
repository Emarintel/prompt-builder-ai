import { X, Trash2, Clock } from 'lucide-react';
import { HistoryItem, Language } from '../types';
import { isRtlLanguage, languageLabel, languageLocale } from '../utils/languageUtils';
import { Translations } from '../locales/en';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  language: Language;
  t: Pick<Translations, 'historyTitle' | 'noHistory' | 'clearHistory'>;
}

function formatDate(timestamp: number, language: Language): string {
  return new Date(timestamp).toLocaleString(
    languageLocale(language),
    { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  );
}

export function HistoryPanel({
  isOpen,
  onClose,
  history,
  onSelect,
  onRemove,
  onClear,
  language,
  t,
}: Props) {
  const isRtl = isRtlLanguage(language);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 dark:bg-black/50 backdrop-blur-sm
          transition-opacity duration-300
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div
        className={`fixed top-0 bottom-0 z-50 w-[300px] sm:w-80 flex flex-col
          bg-white dark:bg-gray-900 shadow-2xl
          border-gray-200 dark:border-gray-800
          transition-transform duration-300 ease-in-out
          ${isRtl ? 'right-0 border-l' : 'left-0 border-r'}
          ${isOpen
            ? 'translate-x-0'
            : isRtl
              ? 'translate-x-full'
              : '-translate-x-full'
          }`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-4 py-3.5 border-b
            border-gray-100 dark:border-gray-800 shrink-0"
        >
          <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <Clock size={14} className="text-indigo-500" strokeWidth={2} />
            <h2
              className={`font-semibold text-gray-900 dark:text-white text-sm
                ${language === 'fa' ? 'font-vazirmatn' : ''}`}
            >
              {t.historyTitle}
            </h2>
            {history.length > 0 && (
              <span
                className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold
                  bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"
              >
                {history.length}
              </span>
            )}
          </div>

          <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            {history.length > 0 && (
              <button
                onClick={onClear}
                className={`text-xs font-medium text-red-500 hover:text-red-600
                  dark:text-red-400 dark:hover:text-red-300 transition-colors
                  ${language === 'fa' ? 'font-vazirmatn' : ''}`}
              >
                {t.clearHistory}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center
                bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
                text-gray-500 dark:text-gray-400 transition-colors"
            >
              <X size={13} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
              <Clock size={22} className="text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
              <p
                className={`text-sm text-gray-400 dark:text-gray-500
                  ${language === 'fa' ? 'font-vazirmatn' : ''}`}
              >
                {t.noHistory}
              </p>
            </div>
          ) : (
            history.map(item => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                className="group relative p-3 rounded-xl border border-gray-100 dark:border-gray-800
                  hover:border-indigo-200 dark:hover:border-indigo-800
                  bg-gray-50/50 dark:bg-gray-800/30 hover:bg-white dark:hover:bg-gray-800
                  cursor-pointer transition-all duration-150"
                onClick={() => onSelect(item)}
                onKeyDown={e => e.key === 'Enter' && onSelect(item)}
              >
                <div className={`flex items-start gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <p
                    className={`text-xs text-gray-700 dark:text-gray-300 line-clamp-2 flex-1
                      leading-relaxed
                      ${isRtlLanguage(item.language) ? 'text-right' : 'text-left'} ${item.language === 'fa' ? 'font-vazirmatn' : ''}`}
                    dir={isRtlLanguage(item.language) ? 'rtl' : 'ltr'}
                  >
                    {item.input}
                  </p>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onRemove(item.id);
                    }}
                    className="shrink-0 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg
                      flex items-center justify-center bg-red-100 dark:bg-red-900/40
                      text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/70
                      transition-all"
                  >
                    <Trash2 size={10} strokeWidth={2} />
                  </button>
                </div>

                <div
                  className={`flex items-center justify-between mt-2
                    ${isRtl ? 'flex-row-reverse' : ''}`}
                >
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium
                      ${item.language === 'fa'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                        : item.language === 'ar'
                        ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}
                  >
                    {languageLabel(item.language)}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {formatDate(item.timestamp, language)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
