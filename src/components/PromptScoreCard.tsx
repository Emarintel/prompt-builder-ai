import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { QualityScore, ScoreLevel, Language, SCORE_MAX } from '../types';
import { Translations } from '../locales/en';

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
const LEVEL_CONFIG: Record<
  ScoreLevel,
  { stroke: string; trackStroke: string; textClass: string; badgeClass: string; barClass: string }
> = {
  poor: {
    stroke: '#ef4444',
    trackStroke: '#fecaca',
    textClass: 'text-red-500 dark:text-red-400',
    badgeClass: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/60',
    barClass: 'bg-red-400 dark:bg-red-500',
  },
  'needs-work': {
    stroke: '#f97316',
    trackStroke: '#fed7aa',
    textClass: 'text-orange-500 dark:text-orange-400',
    badgeClass: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/60',
    barClass: 'bg-orange-400 dark:bg-orange-500',
  },
  fair: {
    stroke: '#eab308',
    trackStroke: '#fef08a',
    textClass: 'text-yellow-500 dark:text-yellow-400',
    badgeClass: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/60',
    barClass: 'bg-yellow-400 dark:bg-yellow-500',
  },
  good: {
    stroke: '#3b82f6',
    trackStroke: '#bfdbfe',
    textClass: 'text-blue-500 dark:text-blue-400',
    badgeClass: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60',
    barClass: 'bg-blue-400 dark:bg-blue-500',
  },
  excellent: {
    stroke: '#22c55e',
    trackStroke: '#bbf7d0',
    textClass: 'text-emerald-500 dark:text-emerald-400',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
    barClass: 'bg-emerald-400 dark:bg-emerald-500',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SCORE RING (SVG)
// ─────────────────────────────────────────────────────────────────────────────
const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ScoreRing({
  score,
  level,
  animated,
}: {
  score: number;
  level: ScoreLevel;
  animated: boolean;
}) {
  const cfg = LEVEL_CONFIG[level];
  const offset = animated
    ? CIRCUMFERENCE * (1 - score / 100)
    : CIRCUMFERENCE;

  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      className="shrink-0"
      aria-label={`Score: ${score} out of 100`}
    >
      {/* Background glow */}
      <circle cx="60" cy="60" r="52" fill="currentColor" className="text-gray-50 dark:text-gray-800/40" />

      {/* Track — uses currentColor so dark mode works via className */}
      <circle
        cx="60"
        cy="60"
        r={RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth="9"
        className="text-gray-200 dark:text-gray-700"
      />

      {/* Progress arc */}
      <circle
        cx="60"
        cy="60"
        r={RADIUS}
        fill="none"
        stroke={cfg.stroke}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
        strokeDashoffset={offset}
        transform="rotate(-90 60 60)"
        style={{
          transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
          filter: `drop-shadow(0 0 6px ${cfg.stroke}55)`,
        }}
      />

      {/* Score number */}
      <text
        x="60"
        y="55"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="24"
        fontWeight="700"
        fontFamily="Inter, system-ui, sans-serif"
        fill={cfg.stroke}
      >
        {animated ? score : 0}
      </text>

      {/* /100 label */}
      <text
        x="60"
        y="72"
        textAnchor="middle"
        fontSize="10"
        fontWeight="500"
        fontFamily="Inter, system-ui, sans-serif"
        fill="#9ca3af"
      >
        / 100
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CRITERION BAR
// ─────────────────────────────────────────────────────────────────────────────
function CriterionBar({
  label,
  value,
  max,
  barClass,
  animated,
  delay,
  isRtl,
}: {
  label: string;
  value: number;
  max: number;
  barClass: string;
  animated: boolean;
  delay: number;
  isRtl: boolean;
}) {
  const pct = (value / max) * 100;
  const isLow = pct < 40;

  return (
    <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
      {/* Label */}
      <span
        className={`text-xs text-gray-600 dark:text-gray-400 shrink-0 w-[108px]
          ${isRtl ? 'text-right font-vazirmatn' : 'text-left'}`}
      >
        {label}
      </span>

      {/* Bar track */}
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700/60 overflow-hidden">
        <div
          className={`h-full rounded-full ${barClass}`}
          style={{
            width: animated ? `${pct}%` : '0%',
            transition: `width 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
          }}
        />
      </div>

      {/* Score */}
      <div className={`flex items-center gap-1.5 shrink-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <span
          className={`text-xs font-semibold tabular-nums ${isLow ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}
        >
          {value}
          <span className="text-gray-400 dark:text-gray-500 font-normal">/{max}</span>
        </span>
        {isLow && (
          <span className="text-[9px] font-semibold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 px-1 py-0.5 rounded">
            {isRtl ? '↑' : '↑'}
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  score: QualityScore;
  language: Language;
  t: Pick<Translations, 'score'>;
}

export function PromptScoreCard({ score, language, t }: Props) {
  const [animated, setAnimated] = useState(false);
  const isRtl = language === 'fa';
  const cfg = LEVEL_CONFIG[score.level];

  // Trigger entry animation after paint
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimated(true));
    });
    return () => cancelAnimationFrame(id);
  }, [score.total]);

  const criteriaOrder: (keyof typeof score.breakdown)[] = [
    'specificGoal',
    'outputFormat',
    'context',
    'clarity',
    'constraints',
    'languageQuality',
    'tokenEfficiency',
  ];

  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800
        shadow-sm overflow-hidden animate-slide-up"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* ── HEADER ── */}
      <div
        className={`flex items-center justify-between px-5 pt-5 pb-0
          ${isRtl ? 'flex-row-reverse' : ''}`}
      >
        <div className={`flex items-center gap-2.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow shadow-violet-500/20">
            <TrendingUp size={13} className="text-white" strokeWidth={2.5} />
          </div>
          <div className={isRtl ? 'text-right' : ''}>
            <h3
              className={`text-sm font-semibold text-gray-900 dark:text-white
                ${isRtl ? 'font-vazirmatn' : ''}`}
            >
              {t.score.title}
            </h3>
            <p className={`text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 ${isRtl ? 'font-vazirmatn' : ''}`}>
              {t.score.subtitle}
            </p>
          </div>
        </div>

        {/* Level badge */}
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border
            ${cfg.badgeClass} ${isRtl ? 'font-vazirmatn' : ''}`}
        >
          {t.score.levels[score.level]}
        </span>
      </div>

      {/* ── HERO: ring + summary ── */}
      <div className={`flex items-center gap-5 px-5 pt-4 pb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <ScoreRing score={score.total} level={score.level} animated={animated} />

        <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : ''}`}>
          <p
            className={`text-3xl font-bold leading-none mb-1 ${cfg.textClass}
              ${isRtl ? 'font-vazirmatn' : ''}`}
          >
            {score.total}
            <span className="text-base font-medium text-gray-400 dark:text-gray-500">/100</span>
          </p>
          <p
            className={`text-sm font-semibold ${cfg.textClass} mb-2
              ${isRtl ? 'font-vazirmatn' : ''}`}
          >
            {t.score.levels[score.level]}
          </p>
          <p
            className={`text-xs text-gray-500 dark:text-gray-400 leading-relaxed
              ${isRtl ? 'font-vazirmatn' : ''}`}
          >
            {t.score.levelDesc[score.level]}
          </p>
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div className="h-px bg-gray-100 dark:bg-gray-800 mx-5" />

      {/* ── CRITERIA BREAKDOWN ── */}
      <div className="px-5 py-4 space-y-3">
        {criteriaOrder.map((key, idx) => (
          <CriterionBar
            key={key}
            label={t.score.criteria[key]}
            value={score.breakdown[key]}
            max={SCORE_MAX[key]}
            barClass={cfg.barClass}
            animated={animated}
            delay={idx * 70}
            isRtl={isRtl}
          />
        ))}
      </div>

      {/* ── IMPROVEMENT TIPS ── */}
      {score.improvements.length > 0 && (
        <>
          <div className="h-px bg-gray-100 dark:bg-gray-800 mx-5" />
          <div className="px-5 py-4">
            <p
              className={`text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase
                tracking-wide mb-3 ${isRtl ? 'font-vazirmatn text-right' : ''}`}
            >
              {t.score.howToImprove}
            </p>
            <ul className="space-y-2">
              {score.improvements.map((tip, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-300
                    leading-relaxed ${isRtl ? 'flex-row-reverse text-right font-vazirmatn' : ''}`}
                >
                  <span
                    className={`mt-1 shrink-0 w-1.5 h-1.5 rounded-full ${cfg.barClass}
                      opacity-70`}
                  />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
