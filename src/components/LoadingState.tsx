import { Language } from '../types';
import { Translations } from '../locales/en';

interface Props {
  language: Language;
  t: Pick<Translations, 'analyzing'>;
}

function SkeletonCard({ lines = 4, showBadge = false }: { lines?: number; showBadge?: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
          <div className="w-28 h-3 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
        {showBadge && <div className="w-14 h-5 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />}
      </div>
      <div className="h-0.5 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse mb-3" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-2.5 rounded-full bg-gray-50 dark:bg-gray-800/60 animate-pulse"
            style={{ width: `${[100, 88, 76, 64, 82, 70][i % 6]}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function LoadingState({ language, t }: Props) {
  const isRtl = language === 'fa';

  return (
    <div className="space-y-4 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      <div
        className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-2xl
          border border-indigo-200 dark:border-indigo-800/60 shadow-sm"
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-indigo-500"
              style={{
                animation: 'bounceDot 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.16}s`,
              }}
            />
          ))}
        </div>
        <p className={`text-sm text-gray-500 dark:text-gray-400 ${isRtl ? 'font-vazirmatn' : ''}`}>
          {t.analyzing}
        </p>
      </div>

      <SkeletonCard lines={5} showBadge />
      <SkeletonCard lines={3} />
      <SkeletonCard lines={4} showBadge />
      <SkeletonCard lines={3} />
    </div>
  );
}
