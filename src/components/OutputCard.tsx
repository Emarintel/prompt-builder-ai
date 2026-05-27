import { Language } from '../types';
import { CopyButton } from './CopyButton';
import { Translations } from '../locales/en';

interface Props {
  title: string;
  description: string;
  icon: string;
  content: string | string[];
  language: Language;
  accentClass: string;
  t: Pick<Translations, 'copy' | 'copied'>;
  animationDelay?: string;
}

function renderBoldMarkdown(line: string) {
  const parts = line.split(/(\*\*[^*]+\*\*|«[^»]+»)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
    if (part.startsWith('«') && part.endsWith('»'))
      return <span key={i} className="font-medium text-indigo-600 dark:text-indigo-400">{part}</span>;
    return <span key={i}>{part}</span>;
  });
}

function getItemDot(text: string): string {
  const t = text.toLowerCase();
  if (/\b(missing|no |critical|fatal|absent|never|undefined)\b/.test(t))
    return 'bg-red-400 dark:bg-red-500';
  if (/\b(vague|weak|ambiguous|lacks?|insufficient|unclear|limited)\b/.test(t))
    return 'bg-amber-400 dark:bg-amber-500';
  return 'bg-indigo-400 dark:bg-indigo-500';
}

function PromptBlock({
  text,
  isRtl,
}: {
  text: string;
  isRtl: boolean;
}) {
  const lines = text.split('\n');
  return (
    <div
      className={`rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-100
        dark:border-gray-700/60 p-4 text-sm leading-relaxed space-y-0.5
        ${isRtl ? 'font-vazirmatn text-right' : 'font-mono'}`}
    >
      {lines.map((line, i) => {
        if (line.startsWith('# ')) {
          return (
            <p
              key={i}
              className="font-bold text-indigo-600 dark:text-indigo-400 text-xs uppercase tracking-wider mt-3 mb-1 first:mt-0"
            >
              {line.slice(2)}
            </p>
          );
        }
        if (line === '') return <div key={i} className="h-1.5" />;
        return (
          <p key={i} className="text-gray-700 dark:text-gray-300">
            {renderBoldMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}

function StructureBlock({
  text,
  isRtl,
}: {
  text: string;
  isRtl: boolean;
}) {
  const lines = text.split('\n');
  return (
    <div className={`space-y-2 ${isRtl ? 'font-vazirmatn text-right' : ''}`}>
      {lines.map((line, i) => {
        if (line === '') return <div key={i} className="h-1" />;
        return (
          <p key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {renderBoldMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}

function BulletList({
  items,
  isRtl,
}: {
  items: string[];
  isRtl: boolean;
}) {
  return (
    <ul className={`space-y-2.5 ${isRtl ? 'font-vazirmatn' : ''}`}>
      {items.map((item, i) => (
        <li
          key={i}
          className={`flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300
            ${isRtl ? 'flex-row-reverse text-right' : ''}`}
        >
          <span className={`mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full ${getItemDot(item)}`} />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function OutputCard({
  title,
  description,
  icon,
  content,
  language,
  accentClass,
  t,
  animationDelay,
}: Props) {
  const isRtl = language === 'fa';
  const copyText = Array.isArray(content) ? content.join('\n') : content;
  const isMultiline =
    typeof content === 'string' && (content.includes('\n') || content.includes('**'));

  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800
        overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 transition-all
        duration-200 animate-slide-up shadow-sm hover:shadow-md"
      style={{ animationDelay }}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="flex items-start justify-between p-4 pb-3 gap-3">
        <div className={`flex items-start gap-3 min-w-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-base
              shrink-0 ${accentClass}`}
          >
            {icon}
          </div>
          <div className={`min-w-0 ${isRtl ? 'text-right' : ''}`}>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">
              {title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        <CopyButton text={copyText} t={t} />
      </div>

      <div className="px-4 pb-4">
        {Array.isArray(content) ? (
          <BulletList items={content} isRtl={isRtl} />
        ) : isMultiline ? (
          title.toLowerCase().includes('structure') ||
          title.includes('ساختار') ? (
            <StructureBlock text={content} isRtl={isRtl} />
          ) : (
            <PromptBlock text={content} isRtl={isRtl} />
          )
        ) : (
          <PromptBlock text={content} isRtl={isRtl} />
        )}
      </div>
    </div>
  );
}
