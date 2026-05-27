import { Language } from '../types';

interface Props {
  language: Language;
}

export function Footer({ language }: Props) {
  const isRtl = language === 'fa';

  return (
    <footer
      className="border-t border-gray-200/60 dark:border-gray-800/60
        bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div
        className={`max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row
          items-center justify-between gap-1.5
          ${isRtl ? 'sm:flex-row-reverse' : ''}`}
      >
        {/* Left: attribution */}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Designed &amp; Developed by{' '}
          <span className="font-semibold text-gray-600 dark:text-gray-400">Emarintel</span>
        </p>

        {/* Right: name + email */}
        <div className={`flex items-center gap-2.5 text-xs text-gray-400 dark:text-gray-500
          ${isRtl ? 'flex-row-reverse' : ''}`}
        >
          <span>Siavash Hashemi</span>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
          <a
            href="mailto:info@emarintel.ae"
            className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
          >
            info@emarintel.ae
          </a>
        </div>
      </div>
    </footer>
  );
}
