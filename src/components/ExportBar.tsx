import { useState } from 'react';
import { Download, Copy, Link2, Check } from 'lucide-react';
import { AIResponse, Language, PromptMode, QualityScore } from '../types';
import { isRtlLanguage } from '../utils/languageUtils';
import { Translations } from '../locales/en';
import {
  buildTxt, buildMarkdown, buildJson,
  triggerDownload, encodeShareState, ShareState,
} from '../utils/exportUtils';

interface Props {
  input: string;
  response: AIResponse;
  analyzedScore: QualityScore | null;
  language: Language;
  mode: PromptMode;
  t: Pick<Translations, 'export' | 'copy' | 'copied'>;
}

function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) return navigator.clipboard.writeText(text);
  // Fallback for non-HTTPS or older browsers
  const el = document.createElement('textarea');
  el.value = text;
  Object.assign(el.style, { position: 'fixed', opacity: '0', pointerEvents: 'none' });
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  return Promise.resolve();
}

export function ExportBar({ input, response, analyzedScore, language, mode, t }: Props) {
  const [copiedAll, setCopiedAll] = useState(false);
  const [sharedLink, setSharedLink] = useState(false);
  const isRtl = isRtlLanguage(language);
  const isPersian = language === 'fa';

  const baseName = `prompt-analysis-${new Date().toISOString().slice(0, 10)}`;

  const handleExport = (type: 'txt' | 'md' | 'json') => {
    const [content, ext, mime] =
      type === 'txt' ? [buildTxt(input, response, analyzedScore),      'txt',  'text/plain'] :
      type === 'md'  ? [buildMarkdown(input, response, analyzedScore), 'md',   'text/markdown'] :
                       [buildJson(input, response, analyzedScore),     'json', 'application/json'];
    triggerDownload(content, `${baseName}.${ext}`, mime);
  };

  const handleCopyAll = () => {
    const done = () => {
      setCopiedAll(true);
      window.dispatchEvent(new CustomEvent('copy-success', { detail: t.copied }));
      setTimeout(() => setCopiedAll(false), 1800);
    };
    copyToClipboard(buildMarkdown(input, response, analyzedScore)).then(done).catch(done);
  };

  const handleShare = () => {
    const state: ShareState = { v: 1, i: input, l: language, m: mode, r: response };
    const encoded = encodeShareState(state);
    const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
    window.history.replaceState(null, '', `?share=${encoded}`);
    const done = () => {
      setSharedLink(true);
      window.dispatchEvent(new CustomEvent('copy-success', { detail: t.export.linkCopied }));
      setTimeout(() => setSharedLink(false), 1800);
    };
    copyToClipboard(url).then(done).catch(done);
  };

  const btnBase =
    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors';
  const btnNeutral =
    `${btnBase} bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400
     hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200
     border-gray-200 dark:border-gray-700`;

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200
        dark:border-gray-800 shadow-sm px-4 py-3 flex flex-wrap items-center gap-2
        animate-fade-in ${isRtl ? 'flex-row-reverse' : ''} ${isPersian ? 'font-vazirmatn' : ''}`}
    >
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide shrink-0">
        {t.export.title}
      </span>

      <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 shrink-0" />

      {/* Download buttons */}
      <div className={`flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
        {(['txt', 'md', 'json'] as const).map(type => (
          <button
            key={type}
            onClick={() => handleExport(type)}
            title={`Download ${type === 'md' ? 'Markdown (.md)' : `.${type.toUpperCase()}`}`}
            className={btnNeutral}
          >
            <Download size={10} strokeWidth={2} />
            {type === 'txt' ? t.export.txt : type === 'md' ? t.export.markdown : t.export.json}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Copy All + Share */}
      <div className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <button
          onClick={handleCopyAll}
          title={t.export.copyAll}
          className={`${btnBase} ${
            copiedAll
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
              : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200 border-gray-200 dark:border-gray-700'
          }`}
        >
          {copiedAll ? <Check size={10} strokeWidth={2.5} /> : <Copy size={10} strokeWidth={2} />}
          {t.export.copyAll}
        </button>

        <button
          onClick={handleShare}
          title={t.export.shareLink}
          className={`${btnBase} ${
            sharedLink
              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50'
              : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border-indigo-200 dark:border-indigo-800/50'
          }`}
        >
          {sharedLink ? <Check size={10} strokeWidth={2.5} /> : <Link2 size={10} strokeWidth={2} />}
          {sharedLink ? t.export.linkCopied : t.export.shareLink}
        </button>
      </div>
    </div>
  );
}
