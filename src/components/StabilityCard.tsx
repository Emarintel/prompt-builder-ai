import { useState } from 'react';
import { ShieldCheck, ShieldAlert, Copy, Check } from 'lucide-react';
import { Language } from '../types';
import { isRtlLanguage } from '../utils/languageUtils';
import { Translations } from '../locales/en';

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

const RISK_CONFIG: Record<RiskLevel, { score: string; badge: string; bar: string; icon: string }> = {
  low:      { score: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50', bar: 'bg-emerald-400', icon: 'text-emerald-500' },
  medium:   { score: 'text-amber-600   dark:text-amber-400',   badge: 'bg-amber-50   dark:bg-amber-950/50   text-amber-600   dark:text-amber-400   border-amber-200   dark:border-amber-800/50',   bar: 'bg-amber-400',   icon: 'text-amber-500'   },
  high:     { score: 'text-orange-600  dark:text-orange-400',  badge: 'bg-orange-50  dark:bg-orange-950/50  text-orange-600  dark:text-orange-400  border-orange-200  dark:border-orange-800/50',  bar: 'bg-orange-400',  icon: 'text-orange-500'  },
  critical: { score: 'text-red-600     dark:text-red-400',     badge: 'bg-red-50     dark:bg-red-950/50     text-red-600     dark:text-red-400     border-red-200     dark:border-red-800/50',     bar: 'bg-red-400',     icon: 'text-red-500'     },
};

interface Props {
  stabilityScore: number;
  riskLevel: RiskLevel;
  stabilityFix: string;
  stablerRewrite: string;
  language: Language;
  t: Pick<Translations, 'stability' | 'copy' | 'copied'>;
}

export function StabilityCard({
  stabilityScore,
  riskLevel,
  stabilityFix,
  stablerRewrite,
  language,
  t,
}: Props) {
  const [copied, setCopied] = useState(false);
  const isRtl = isRtlLanguage(language);
  const isPersian = language === 'fa';
  const cfg = RISK_CONFIG[riskLevel];
  const Icon = riskLevel === 'low' ? ShieldCheck : ShieldAlert;

  const handleCopy = () => {
    navigator.clipboard.writeText(stablerRewrite).then(() => {
      setCopied(true);
      window.dispatchEvent(new CustomEvent('copy-success', { detail: t.copied }));
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200
        dark:border-gray-800 shadow-sm animate-fade-in overflow-hidden"
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-5 pt-4 pb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0
            ${riskLevel === 'low' ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
            : riskLevel === 'medium' ? 'bg-gradient-to-br from-amber-400 to-orange-500'
            : riskLevel === 'high' ? 'bg-gradient-to-br from-orange-500 to-red-500'
            : 'bg-gradient-to-br from-red-500 to-rose-700'}`}
          >
            <Icon size={10} className="text-white" strokeWidth={2.5} />
          </div>
          <span className={`text-sm font-semibold text-gray-800 dark:text-gray-200 ${isPersian ? 'font-vazirmatn' : ''}`}>
            {t.stability.title}
          </span>
        </div>

        {/* Score + risk badge */}
        <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <span className={`text-base font-bold tabular-nums ${cfg.score}`}>
            {stabilityScore}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.badge} ${isPersian ? 'font-vazirmatn' : ''}`}>
            {t.stability.levels[riskLevel]}
          </span>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-1 bg-gray-100 dark:bg-gray-800 mx-5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
          style={{ width: `${stabilityScore}%` }}
        />
      </div>

      {/* Quick Fix */}
      <div className="px-5 pt-3 pb-3">
        <p className={`text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1
          ${isRtl ? 'text-right' : ''} ${isPersian ? 'font-vazirmatn' : ''}`}>
          {t.stability.quickFix}
        </p>
        <p className={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed
          ${isRtl ? 'text-right' : ''} ${isPersian ? 'font-vazirmatn' : ''}`}>
          {stabilityFix}
        </p>
      </div>

      <div className="h-px bg-gray-100 dark:bg-gray-800 mx-5" />

      {/* Safer Rewrite */}
      <div className="px-5 pt-3 pb-4">
        <div className={`flex items-center justify-between mb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <p className={`text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide
            ${isPersian ? 'font-vazirmatn' : ''}`}>
            {t.stability.saferRewrite}
          </p>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
              text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
              hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {copied ? <Check size={11} strokeWidth={2.5} /> : <Copy size={11} strokeWidth={2} />}
            {copied ? t.copied : t.copy}
          </button>
        </div>
        <p className={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap
          ${isRtl ? 'text-right' : ''} ${isPersian ? 'font-vazirmatn' : ''}`}>
          {stablerRewrite}
        </p>
      </div>
    </div>
  );
}
