import { Language } from '../types';

interface Props {
  language: Language;
}

export function Footer({ language }: Props) {
  const isRtl = language === 'fa';

  return (
    <footer dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Gradient separator line */}
      <div className="h-px bg-gradient-to-r from-transparent via-indigo-400/40 dark:via-indigo-500/30 to-transparent" />

      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div
            className={`flex flex-col sm:flex-row items-center justify-between gap-4
              ${isRtl ? 'sm:flex-row-reverse' : ''}`}
          >

            {/* Left — attribution */}
            <div className={`flex flex-col gap-0.5 ${isRtl ? 'items-end' : 'items-start'}`}>
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500
                uppercase tracking-widest">
                Designed &amp; Developed by
              </p>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-tight">
                Emarintel
              </p>
            </div>

            {/* Right — contact */}
            <div
              className={`flex flex-col gap-1 ${isRtl ? 'items-start' : 'items-end'}
                text-center sm:text-end`}
            >
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Siavash Hashemi
              </p>
              <a
                href="mailto:info@emarintel.ae"
                className="text-sm font-semibold text-indigo-500 dark:text-indigo-400
                  hover:text-indigo-600 dark:hover:text-indigo-300
                  transition-colors duration-150 tracking-tight"
              >
                info@emarintel.ae
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
