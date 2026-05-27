import { useRef, useEffect } from 'react';
import { Sparkles, X, Zap } from 'lucide-react';
import { Language, QualityScore, ScoreLevel, PromptMode, PROMPT_MODES } from '../types';
import { Translations } from '../locales/en';

// Compact colour mapping for the mini score badge
const MINI_SCORE_CLASS: Record<ScoreLevel, string> = {
  poor:         'bg-red-50    dark:bg-red-950/50    text-red-500    dark:text-red-400    border-red-200    dark:border-red-800/50',
  'needs-work': 'bg-orange-50 dark:bg-orange-950/50 text-orange-500 dark:text-orange-400 border-orange-200 dark:border-orange-800/50',
  fair:         'bg-yellow-50 dark:bg-yellow-950/50 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50',
  good:         'bg-blue-50   dark:bg-blue-950/50   text-blue-600   dark:text-blue-400   border-blue-200   dark:border-blue-800/50',
  excellent:    'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
};

const MINI_DOT_CLASS: Record<ScoreLevel, string> = {
  poor:         'bg-red-400',
  'needs-work': 'bg-orange-400',
  fair:         'bg-yellow-400',
  good:         'bg-blue-400',
  excellent:    'bg-emerald-400',
};

interface Props {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  detectedLanguage: Language;
  appLanguage: Language;
  liveScore: QualityScore | null;
  mode: PromptMode;
  onModeChange: (mode: PromptMode) => void;
  t: Pick<
    Translations,
    | 'inputLabel'
    | 'inputPlaceholder'
    | 'analyzeButton'
    | 'analyzing'
    | 'clearButton'
    | 'detectedLanguage'
    | 'chars'
    | 'tagline'
    | 'score'
    | 'modes'
  >;
}

export function PromptInput({
  value,
  onChange,
  onAnalyze,
  isLoading,
  detectedLanguage,
  appLanguage,
  liveScore,
  mode,
  onModeChange,
  t,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isRtl = appLanguage === 'fa';
  const inputIsRtl = value.length > 3 ? detectedLanguage === 'fa' : isRtl;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 280)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onAnalyze();
    }
    if (e.key === 'Escape') {
      onChange('');
    }
  };

  const isFocused = value.length > 0;

  return (
    <>
    <div
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800
        shadow-sm overflow-hidden transition-all duration-200"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Card header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div
              className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600
                flex items-center justify-center shrink-0"
            >
              <Sparkles size={10} className="text-white" strokeWidth={2.5} />
            </div>
            <span
              className={`text-sm font-semibold text-gray-800 dark:text-gray-200
                ${isRtl ? 'font-vazirmatn' : ''}`}
            >
              {t.inputLabel}
            </span>
          </div>

          {/* Mode selector */}
          <div className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <span className={`text-xs text-gray-400 dark:text-gray-500 ${isRtl ? 'font-vazirmatn' : ''}`}>
              {t.modes.label}
            </span>
            <select
              value={mode}
              onChange={e => onModeChange(e.target.value as PromptMode)}
              className={`text-xs font-medium rounded-lg px-2 py-1 border
                bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300
                border-gray-200 dark:border-gray-700
                hover:border-indigo-400 dark:hover:border-indigo-600
                focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:focus:ring-indigo-600
                transition-colors cursor-pointer
                ${isRtl ? 'font-vazirmatn' : ''}`}
            >
              {PROMPT_MODES.map(m => (
                <option key={m} value={m}>{t.modes[m]}</option>
              ))}
            </select>
          </div>
        </div>
        <p
          className={`text-xs text-gray-400 dark:text-gray-500 leading-relaxed
            ${isRtl ? 'font-vazirmatn text-right' : 'ms-7'}`}
        >
          {t.tagline}
        </p>
      </div>

      {/* Textarea */}
      <div className="px-4 pb-4">
        <div
          className={`relative rounded-xl transition-all duration-200
            ${isFocused
              ? 'border-2 border-indigo-400 dark:border-indigo-600 bg-white dark:bg-gray-900'
              : 'border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40'
            }`}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.inputPlaceholder}
            aria-label={t.inputLabel}
            dir={inputIsRtl ? 'rtl' : 'ltr'}
            className={`w-full min-h-[130px] bg-transparent px-4 py-3.5 pe-10 text-sm
              text-gray-800 dark:text-gray-200 placeholder:text-gray-400
              dark:placeholder:text-gray-500 resize-none outline-none leading-relaxed
              ${inputIsRtl ? 'font-vazirmatn text-right' : 'font-sans text-left'}`}
          />
          {value && (
            <button
              onClick={() => onChange('')}
              aria-label={t.clearButton}
              className="absolute top-3 end-3 w-5 h-5 rounded-full flex items-center justify-center
                bg-gray-300/70 dark:bg-gray-600/70 text-gray-500 dark:text-gray-400
                hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              <X size={10} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* ── Live score bar ── */}
        {liveScore && (
          <div className="mt-2 h-1 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                liveScore.level === 'excellent' ? 'bg-emerald-400'
                : liveScore.level === 'good'    ? 'bg-blue-400'
                : liveScore.level === 'fair'    ? 'bg-yellow-400'
                : liveScore.level === 'needs-work' ? 'bg-orange-400'
                : 'bg-red-400'
              }`}
              style={{ width: `${liveScore.total}%` }}
            />
          </div>
        )}

        {/* Footer bar */}
        <div
          className={`flex items-center justify-between mt-2.5 gap-2
            ${isRtl ? 'flex-row-reverse' : ''}`}
        >
          {/* Left status group */}
          <div className={`flex items-center gap-2 flex-wrap min-w-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
            {/* Language detected badge */}
            {value.length > 5 && (
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full
                  text-xs font-medium border shrink-0
                  ${detectedLanguage === 'fa'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/50'
                    : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/50'
                  } ${isRtl ? 'font-vazirmatn' : ''}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                {t.detectedLanguage} {detectedLanguage === 'fa' ? 'Persian' : 'English'}
              </span>
            )}

            {/* Live score badge */}
            {liveScore && (
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full
                  text-xs font-semibold border shrink-0 transition-all duration-300
                  ${MINI_SCORE_CLASS[liveScore.level]}
                  ${isRtl ? 'font-vazirmatn flex-row-reverse' : ''}`}
                title={t.score.levels[liveScore.level]}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${MINI_DOT_CLASS[liveScore.level]}`}
                />
                <span>{t.score.liveLabel}: {liveScore.total}</span>
                <span className="opacity-60">—</span>
                <span className={isRtl ? 'font-vazirmatn' : ''}>
                  {t.score.levels[liveScore.level]}
                </span>
              </span>
            )}

            {/* Char count */}
            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
              {value.length} {t.chars}
            </span>
          </div>

          {/* Analyze button */}
          <button
            onClick={onAnalyze}
            disabled={isLoading || !value.trim()}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold
              text-white shadow-lg transition-all duration-200 shrink-0
              ${isLoading || !value.trim()
                ? 'opacity-50 cursor-not-allowed bg-gray-300 dark:bg-gray-700 shadow-none'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]'
              } ${isRtl ? 'font-vazirmatn flex-row-reverse' : ''}`}
          >
            <Zap
              size={13}
              strokeWidth={2.5}
              className={isLoading ? 'animate-spin' : ''}
            />
            {isLoading ? t.analyzing : t.analyzeButton}
          </button>
        </div>
      </div>
    </div>

    {/* Mobile sticky analyze button */}
    <div
      className="fixed bottom-0 inset-x-0 z-40 flex lg:hidden px-4 pt-3
        bg-gradient-to-t from-gray-50/95 dark:from-gray-950/95 to-transparent"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}
    >
      <button
        onClick={onAnalyze}
        disabled={isLoading || !value.trim()}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl
          text-sm font-semibold text-white transition-all duration-200
          ${isLoading || !value.trim()
            ? 'opacity-50 cursor-not-allowed bg-gray-300 dark:bg-gray-700'
            : 'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25'
          } ${isRtl ? 'font-vazirmatn flex-row-reverse' : ''}`}
      >
        <Zap size={13} strokeWidth={2.5} className={isLoading ? 'animate-spin' : ''} />
        {isLoading ? t.analyzing : t.analyzeButton}
      </button>
    </div>
    </>
  );
}
