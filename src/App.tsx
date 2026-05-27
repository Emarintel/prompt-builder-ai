import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { OutputPanel } from './components/OutputPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { LoadingState } from './components/LoadingState';
import { EmptyState } from './components/EmptyState';
import { PromptScoreCard } from './components/PromptScoreCard';
import { CostEstimate } from './components/CostEstimate';
import { StabilityCard } from './components/StabilityCard';
import { BenchmarkPanel } from './components/BenchmarkPanel';
import { Toast } from './components/Toast';
import { ExportBar } from './components/ExportBar';
import { Footer } from './components/Footer';
import { decodeShareState } from './utils/exportUtils';
import { computeBenchmark } from './utils/benchmarkPrompt';
import { useTheme } from './hooks/useTheme';
import { useHistory } from './hooks/useHistory';
import { analyzePrompt } from './services/aiService';
import { detectLanguage } from './utils/detectLanguage';
import { scorePrompt } from './utils/scorePrompt';
import { isRtlLanguage } from './utils/languageUtils';
import { en } from './locales/en';
import { fa } from './locales/fa';
import { AlertCircle } from 'lucide-react';
import { AIResponse, Language, HistoryItem, QualityScore, PromptMode } from './types';

function parseErrorMessage(err: unknown, lang: Language = 'en'): string {
  if (!(err instanceof Error)) {
    if (lang === 'ar') return 'حدث خطأ ما. يرجى المحاولة مرة أخرى.';
    if (lang === 'fa') return 'مشکلی پیش آمد. لطفاً دوباره تلاش کنید.';
    return 'Something went wrong. Please try again.';
  }
  if (err.name === 'AbortError') {
    if (lang === 'ar') return 'انتهت مهلة الطلب (أكثر من 60 ث). يرجى المحاولة مرة أخرى.';
    if (lang === 'fa') return 'درخواست زمان‌بر بود (بیش از ۶۰ ثانیه). لطفاً دوباره تلاش کنید.';
    return 'Request timed out (>60 s). Please try again.';
  }
  const msg = err.message.toLowerCase();
  if (msg.includes('api key') || msg.includes('authentication')) {
    if (lang === 'ar') return 'مفتاح API غير صالح أو مفقود. يرجى التحقق من إعدادات الخادم.';
    if (lang === 'fa') return 'کلید API نامعتبر یا مفقود است. لطفاً تنظیمات سرور را بررسی کنید.';
    return 'API key is invalid or missing. Please check server configuration.';
  }
  if (msg.includes('rate limit') || msg.includes('429') || msg.includes('overloaded')) {
    if (lang === 'ar') return 'الخادم مشغول. يرجى الانتظار لحظة والمحاولة مرة أخرى.';
    if (lang === 'fa') return 'سرور مشغول است. لطفاً لحظه‌ای صبر کنید و دوباره تلاش کنید.';
    return 'Server is busy. Please wait a moment and try again.';
  }
  if (msg.includes('timed out') || msg.includes('timeout')) {
    if (lang === 'ar') return 'استغرق الذكاء الاصطناعي وقتاً طويلاً. يرجى المحاولة مرة أخرى.';
    if (lang === 'fa') return 'هوش مصنوعی دیر پاسخ داد. لطفاً دوباره تلاش کنید.';
    return 'The AI took too long to respond. Please try again.';
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
    if (lang === 'ar') return 'خطأ في الشبكة. يرجى التحقق من اتصالك والمحاولة مرة أخرى.';
    if (lang === 'fa') return 'خطای شبکه. لطفاً اتصال اینترنت خود را بررسی کنید.';
    return 'Network error. Please check your connection and try again.';
  }
  return err.message;
}

// Parse share param once at module load — safe since this only runs in browser
const _share = (() => {
  try {
    const p = new URLSearchParams(window.location.search).get('share');
    return p ? decodeShareState(p) : null;
  } catch { return null; }
})();

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { history, addItem, removeItem, clearHistory } = useHistory();

  const [input, setInput] = useState(_share?.i ?? '');
  const [response, setResponse] = useState<AIResponse | null>(_share?.r ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [appLanguage, setAppLanguage] = useState<Language>('en');
  const [detectedLanguage, setDetectedLanguage] = useState<Language>(_share?.l ?? 'en');
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<PromptMode>(_share?.m ?? 'chatgpt');
  const [analyzedInput, setAnalyzedInput] = useState(_share?.i ?? '');
  const [analyzedScore, setAnalyzedScore] = useState<QualityScore | null>(() =>
    _share ? scorePrompt(_share.i, _share.l) : null
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [usageRemaining, setUsageRemaining] = useState<number | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      setToastMsg((e as CustomEvent<string>).detail);
      setTimeout(() => setToastMsg(null), 2200);
    };
    window.addEventListener('copy-success', handler);
    return () => window.removeEventListener('copy-success', handler);
  }, []);

  useEffect(() => {
    if (response !== null && !isLoading && resultsRef.current && window.innerWidth < 1024) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [response, isLoading]);

  const t = appLanguage === 'fa' ? fa : en;
  const isRtl = appLanguage === 'fa';
  const isRtlOutput = isRtlLanguage(detectedLanguage);

  // Live score computed while user types (updates every keystroke, no API)
  const liveScore = useMemo<QualityScore | null>(() => {
    const trimmed = input.trim();
    if (trimmed.length < 6) return null;
    const lang = detectLanguage(trimmed);
    return scorePrompt(trimmed, lang);
  }, [input]);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    if (value.length > 4) {
      setDetectedLanguage(detectLanguage(value));
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const lang = detectLanguage(trimmed);
    setDetectedLanguage(lang);

    setAnalyzedInput(trimmed);
    // Score the prompt client-side immediately — no API wait
    const score = scorePrompt(trimmed, lang);
    setAnalyzedScore(score);

    setIsLoading(true);
    setError(null);
    setResponse(null);
    if (window.location.search) {
      window.history.replaceState(null, '', window.location.pathname);
    }

    try {
      const result = await analyzePrompt(trimmed, lang, mode);
      setResponse(result);
      if (typeof result.remaining === 'number') setUsageRemaining(result.remaining);
      addItem({ input: trimmed, response: result, language: lang });
    } catch (err) {
      setError(parseErrorMessage(err, lang));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, mode, addItem]);

  const handleHistorySelect = useCallback((item: HistoryItem) => {
    setInput(item.input);
    setAnalyzedInput(item.input);
    setResponse(item.response);
    setDetectedLanguage(item.language);
    // Recompute score for the restored prompt
    setAnalyzedScore(scorePrompt(item.input, item.language));
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleLanguage = useCallback(() => {
    setAppLanguage(l => (l === 'en' ? 'fa' : 'en'));
  }, []);

  const showOutput = response !== null && !isLoading;
  const showEmpty = !isLoading && response === null && !error && analyzedScore === null;

  return (
    <div
      className={`min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300
        ${isRtl ? 'font-vazirmatn' : 'font-sans'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        language={appLanguage}
        toggleLanguage={toggleLanguage}
        onHistoryToggle={() => setShowHistory(s => !s)}
        historyCount={history.length}
        t={t}
      />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 pb-24 lg:pb-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* ── LEFT: Input (sticky on desktop) ── */}
          <div className="lg:col-span-2 lg:sticky lg:top-20 lg:self-start space-y-3">
            <PromptInput
              value={input}
              onChange={handleInputChange}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              detectedLanguage={detectedLanguage}
              appLanguage={appLanguage}
              liveScore={liveScore}
              mode={mode}
              onModeChange={setMode}
              usageRemaining={usageRemaining}
              t={t}
            />

            <div
              className={`px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border
                border-gray-200 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500
                ${isRtl ? 'text-right font-vazirmatn' : ''}`}
            >
              {appLanguage === 'fa'
                ? 'پشتیبانی از ChatGPT · Claude · Gemini · Midjourney · تولید کد · کسب‌وکار'
                : 'Optimized for ChatGPT · Claude · Gemini · Midjourney · Code agents · Business'
              }
            </div>
          </div>

          {/* ── RIGHT: Score + Output ── */}
          <div ref={resultsRef} className="lg:col-span-3 space-y-4">

            {/* Score card — appears immediately on Analyze click */}
            {analyzedScore && (
              <PromptScoreCard
                score={analyzedScore}
                language={detectedLanguage}
                t={t}
              />
            )}

            {/* Cost estimate — appears alongside score card */}
            {analyzedScore && analyzedInput && (
              <CostEstimate
                inputText={analyzedInput}
                shortOptimized={response?.shortOptimizedPrompt}
                language={detectedLanguage}
                t={t}
              />
            )}

            {/* Loading skeletons */}
            {isLoading && <LoadingState language={appLanguage} t={t} />}

            {/* Error state */}
            {error && !isLoading && (
              <div
                role="alert"
                className={`rounded-2xl border border-red-200 dark:border-red-800/60
                  bg-red-50 dark:bg-red-950/40 p-4 animate-fade-in
                  ${detectedLanguage === 'fa' ? 'font-vazirmatn' : ''}`}
                dir={isRtlOutput ? 'rtl' : 'ltr'}
              >
                <div className={`flex items-start gap-2.5 ${isRtlOutput ? 'flex-row-reverse' : ''}`}>
                  <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" strokeWidth={2} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm text-red-600 dark:text-red-400 leading-relaxed
                      ${isRtlOutput ? 'text-right' : ''}`}>
                      {error}
                    </p>
                    {analyzedInput && (
                      <button
                        onClick={handleAnalyze}
                        className={`mt-2 text-xs font-semibold text-red-600 dark:text-red-400
                          hover:text-red-700 dark:hover:text-red-300 underline underline-offset-2
                          transition-colors`}
                      >
                        {detectedLanguage === 'ar' ? '← حاول مجدداً' : detectedLanguage === 'fa' ? '← دوباره تلاش کنید' : 'Try again →'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Benchmark — computed locally, zero API cost */}
            {showOutput && analyzedInput && (
              <BenchmarkPanel
                result={computeBenchmark(analyzedInput, response, detectedLanguage)}
                language={detectedLanguage}
                t={t}
              />
            )}

            {/* Stability analysis — only when response has stability data */}
            {showOutput && response.stabilityScore !== undefined && response.riskLevel && response.stabilityFix && response.stablerRewrite && (
              <StabilityCard
                stabilityScore={response.stabilityScore}
                riskLevel={response.riskLevel}
                stabilityFix={response.stabilityFix}
                stablerRewrite={response.stablerRewrite}
                language={detectedLanguage}
                t={t}
              />
            )}

            {/* Export / Share bar */}
            {showOutput && (
              <ExportBar
                input={analyzedInput}
                response={response}
                analyzedScore={analyzedScore}
                language={detectedLanguage}
                mode={mode}
                t={t}
              />
            )}

            {/* AI Output */}
            {showOutput && (
              <OutputPanel
                response={response}
                language={detectedLanguage}
                t={t}
              />
            )}

            {/* Initial empty state */}
            {showEmpty && (
              <div
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200
                  dark:border-gray-800 shadow-sm min-h-[300px] flex items-center justify-center"
              >
                <EmptyState language={appLanguage} t={t} />
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer language={appLanguage} />

      <Toast message={toastMsg} />

      <HistoryPanel
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        onSelect={handleHistorySelect}
        onRemove={removeItem}
        onClear={clearHistory}
        language={appLanguage}
        t={t}
      />
    </div>
  );
}
