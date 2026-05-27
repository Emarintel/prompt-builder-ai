import { BarChart2, TrendingUp, TrendingDown, Minus, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Language } from '../types';
import { isRtlLanguage } from '../utils/languageUtils';
import { Translations } from '../locales/en';
import { BenchmarkResult } from '../utils/benchmarkPrompt';

interface Props {
  result: BenchmarkResult;
  language: Language;
  t: Pick<Translations, 'benchmark'>;
}

interface BarRowProps {
  label: string;
  before: number;
  after: number;
  max: number;
  unit: string;
  lowerIsBetter?: boolean;
  isRtl: boolean;
  isPersian: boolean;
}

function BarRow({ label, before, after, max, unit, lowerIsBetter, isRtl, isPersian }: BarRowProps) {
  const delta       = lowerIsBetter ? before - after : after - before;
  const improved    = delta > 0;
  const neutral     = delta === 0;
  const afterPct    = Math.round((Math.min(after, max) / max) * 100);
  const beforePct   = Math.round((Math.min(before, max) / max) * 100);

  const deltaColor  = neutral ? 'text-gray-400' : improved ? 'text-emerald-500 dark:text-emerald-400' : 'text-orange-500 dark:text-orange-400';
  const barAfter    = improved ? 'bg-emerald-400' : neutral ? 'bg-gray-300 dark:bg-gray-600' : 'bg-orange-400';
  const DeltaIcon   = neutral ? Minus : improved ? TrendingUp : TrendingDown;
  const sign        = delta > 0 ? '+' : '';

  return (
    <div className={`space-y-1.5 ${isRtl ? 'text-right' : ''}`}>
      <div className={`flex items-center justify-between text-sm ${isRtl ? 'flex-row-reverse' : ''}`}>
        <span className={`text-gray-600 dark:text-gray-400 font-medium ${isPersian ? 'font-vazirmatn' : ''}`}>
          {label}
        </span>
        <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <span className="hidden sm:inline text-gray-400 dark:text-gray-500 text-xs tabular-nums">
            {before}{unit}
          </span>
          <span className="hidden sm:inline text-gray-300 dark:text-gray-600 text-xs">→</span>
          <span className="text-gray-700 dark:text-gray-300 text-xs font-semibold tabular-nums">
            {after}{unit}
          </span>
          <span className={`flex items-center gap-0.5 text-xs font-semibold tabular-nums ${deltaColor}`}>
            <DeltaIcon size={11} strokeWidth={2.5} />
            {sign}{Math.abs(delta)}{unit}
          </span>
        </div>
      </div>
      {/* Before / After bars */}
      <div className="space-y-1">
        <div className="hidden sm:block h-1 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div className="h-full rounded-full bg-gray-300 dark:bg-gray-600 transition-all duration-500"
            style={{ width: `${beforePct}%` }} />
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${barAfter}`}
            style={{ width: `${afterPct}%` }} />
        </div>
      </div>
    </div>
  );
}

export function BenchmarkPanel({ result, language, t }: Props) {
  const isRtl = isRtlLanguage(language);
  const isPersian = language === 'fa';
  const b = result;

  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200
        dark:border-gray-800 shadow-sm animate-fade-in overflow-hidden"
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-5 pt-4 pb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600
            flex items-center justify-center shrink-0">
            <BarChart2 size={10} className="text-white" strokeWidth={2.5} />
          </div>
          <span className={`text-sm font-semibold text-gray-800 dark:text-gray-200 ${isPersian ? 'font-vazirmatn' : ''}`}>
            {t.benchmark.title}
          </span>
        </div>
        <span className={`text-xs text-gray-400 dark:text-gray-500 ${isPersian ? 'font-vazirmatn' : ''}`}>
          {t.benchmark.subtitle}
        </span>
      </div>

      <div className="h-px bg-gray-100 dark:bg-gray-800 mx-5" />

      <div className="px-5 py-4 space-y-4">
        {/* Clarity */}
        <BarRow
          label={t.benchmark.clarity}
          before={b.clarityBefore} after={b.clarityAfter}
          max={100} unit="%" isRtl={isRtl} isPersian={isPersian}
        />

        {/* Tokens */}
        <BarRow
          label={t.benchmark.tokens}
          before={b.tokensBefore} after={b.tokensAfter}
          max={Math.max(b.tokensBefore, b.tokensAfter, 1)}
          unit=" tok" lowerIsBetter isRtl={isRtl} isPersian={isPersian}
        />

        {/* Stability */}
        <BarRow
          label={t.benchmark.stability}
          before={b.stabilityBefore} after={b.stabilityAfter}
          max={100} unit="" isRtl={isRtl} isPersian={isPersian}
        />

        {/* Hallucination — boolean row */}
        <div className={`flex items-center justify-between text-sm ${isRtl ? 'flex-row-reverse' : ''} ${isPersian ? 'font-vazirmatn' : ''}`}>
          <span className={`text-gray-600 dark:text-gray-400 font-medium ${isPersian ? 'font-vazirmatn' : ''}`}>
            {t.benchmark.hallucination}
          </span>
          <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <span className={`hidden sm:flex items-center gap-1 text-xs font-medium
              ${b.hallucinationBefore ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {b.hallucinationBefore
                ? <><ShieldAlert size={11} strokeWidth={2} /> {t.benchmark.atRisk}</>
                : <><ShieldCheck size={11} strokeWidth={2} /> {t.benchmark.clear}</>}
            </span>
            <span className="hidden sm:inline text-gray-300 dark:text-gray-600 text-xs">→</span>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={11} strokeWidth={2} />
              {b.hallucinationBefore ? t.benchmark.mitigated : t.benchmark.clear}
            </span>
          </div>
        </div>

        {/* Structure */}
        <BarRow
          label={t.benchmark.structure}
          before={b.structureBefore} after={b.structureAfter}
          max={8} unit={`/${t.benchmark.elements}`} isRtl={isRtl} isPersian={isPersian}
        />
      </div>

      {/* Legend */}
      <div className="h-px bg-gray-100 dark:bg-gray-800 mx-5" />
      <div className={`hidden sm:flex items-center gap-4 px-5 py-2.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 ${isRtl ? 'flex-row-reverse' : ''} ${isPersian ? 'font-vazirmatn' : ''}`}>
          <div className="h-1 w-8 rounded-full bg-gray-300 dark:bg-gray-600" />
          {t.benchmark.before}
        </div>
        <div className={`flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 ${isRtl ? 'flex-row-reverse' : ''} ${isPersian ? 'font-vazirmatn' : ''}`}>
          <div className="h-1.5 w-8 rounded-full bg-emerald-400" />
          {t.benchmark.after}
        </div>
      </div>
    </div>
  );
}
