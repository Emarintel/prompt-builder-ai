import { useMemo } from 'react';
import { DollarSign, TrendingDown } from 'lucide-react';
import { Language } from '../types';
import { isRtlLanguage } from '../utils/languageUtils';
import { Translations } from '../locales/en';
import { estimateCost, formatCost } from '../utils/estimateCost';

interface Props {
  inputText: string;
  shortOptimized?: string;
  language: Language;
  t: Pick<Translations, 'cost'>;
}

export function CostEstimate({ inputText, shortOptimized, language, t }: Props) {
  const isRtl = isRtlLanguage(language);
  const isPersian = language === 'fa';
  const c = useMemo(() => estimateCost(inputText, shortOptimized), [inputText, shortOptimized]);

  const rows: [string, string, string][] = [
    [t.cost.input,  `~${c.inputTokens.toLocaleString()}`,  formatCost(c.inputCostUsd)],
    [t.cost.output, `~${c.outputTokens.toLocaleString()}`, formatCost(c.outputCostUsd)],
  ];

  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200
        dark:border-gray-800 shadow-sm animate-fade-in overflow-hidden"
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-5 pt-4 pb-3
          ${isRtl ? 'flex-row-reverse' : ''}`}
      >
        <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div
            className="w-5 h-5 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600
              flex items-center justify-center shrink-0"
          >
            <DollarSign size={10} className="text-white" strokeWidth={2.5} />
          </div>
          <span
            className={`text-sm font-semibold text-gray-800 dark:text-gray-200
              ${isPersian ? 'font-vazirmatn' : ''}`}
          >
            {t.cost.title}
          </span>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">{t.cost.model}</span>
      </div>

      <div className="h-px bg-gray-100 dark:bg-gray-800 mx-5" />

      {/* Input / Output rows */}
      <div className="px-5 py-3 space-y-2.5">
        {rows.map(([label, tokens, cost]) => (
          <div
            key={label}
            className={`flex items-center text-sm ${isRtl ? 'flex-row-reverse' : ''} ${isPersian ? 'font-vazirmatn' : ''}`}
          >
            <span className="text-gray-500 dark:text-gray-400 w-16 shrink-0">{label}</span>
            <span className="flex-1 text-gray-400 dark:text-gray-500 text-xs tabular-nums
              text-center">
              {tokens} {t.cost.tokensLabel}
            </span>
            <span className="text-gray-700 dark:text-gray-300 font-mono text-xs tabular-nums">
              {cost}
            </span>
          </div>
        ))}
      </div>

      <div className="h-px bg-gray-100 dark:bg-gray-800 mx-5" />

      {/* Total */}
      <div
        className={`flex items-center justify-between px-5 py-2.5
          ${isRtl ? 'flex-row-reverse' : ''} ${isPersian ? 'font-vazirmatn' : ''}`}
      >
        <span
          className={`text-sm font-semibold text-gray-700 dark:text-gray-300
            ${isPersian ? 'font-vazirmatn' : ''}`}
        >
          {t.cost.total}
        </span>
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 font-mono tabular-nums">
          {formatCost(c.totalCostUsd)}
        </span>
      </div>

      {/* Savings — only when shortOptimized is available */}
      {c.savingsTokens > 0 && (
        <>
          <div className="h-px bg-gray-100 dark:bg-gray-800 mx-5" />
          <div
            className={`flex items-center gap-2 px-5 py-2.5
              ${isRtl ? 'flex-row-reverse' : ''} ${isPersian ? 'font-vazirmatn' : ''}`}
          >
            <TrendingDown size={13} className="text-emerald-500 shrink-0" />
            <span
              className={`text-xs text-emerald-600 dark:text-emerald-400
                ${isPersian ? 'font-vazirmatn' : ''}`}
            >
              {t.cost.savings} ~{c.savingsTokens} {t.cost.tokensLabel} · {formatCost(c.savingsCostUsd)}{t.cost.perCall}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
