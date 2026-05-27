import { AIResponse, Language, PromptMode, QualityScore } from '../types';

export interface ShareState {
  v: 1;
  i: string;
  l: Language;
  m: PromptMode;
  r: AIResponse;
}

// ── Format helpers ────────────────────────────────────────

function scoreLabel(score: QualityScore | null) {
  return score ? `${score.total}/100 (${score.level})` : '';
}

function bullets(items: string[]) {
  return items.map(x => `• ${x}`).join('\n');
}

function sep(char = '─', n = 40) {
  return char.repeat(n);
}

// ── TXT ──────────────────────────────────────────────────

export function buildTxt(input: string, response: AIResponse, score: QualityScore | null): string {
  const d = new Date().toLocaleDateString();
  const lines: string[] = [
    'PROMPT BUILDER AI — Analysis Report',
    sep('='),
    `Generated: ${d}`,
    '',
    'ORIGINAL PROMPT',
    sep('-', 20),
    input,
    '',
  ];
  if (score) lines.push('QUALITY SCORE', sep('-', 20), scoreLabel(score), '');

  const add = (heading: string, body: string) =>
    lines.push(heading, sep('-', 20), body, '');

  add('PROBLEMS IDENTIFIED', bullets(response.problems));
  add('PROFESSIONAL PROMPT', response.professionalPrompt);
  add('STRUCTURE BREAKDOWN', response.structureExplanation);
  add('TOKEN SAVING TIPS', bullets(response.tokenSavingTips));
  add('SHORT OPTIMIZED VERSION', response.shortOptimizedPrompt);
  add('DETAILED OPTIMIZED VERSION', response.detailedOptimizedPrompt);
  add('SUGGESTED QUESTIONS', bullets(response.suggestedQuestions));
  if (response.stabilityFix) add('STABILITY QUICK FIX', response.stabilityFix);
  if (response.stablerRewrite) add('SAFER REWRITE', response.stablerRewrite);

  lines.push(sep(), 'Prompt Builder AI');
  return lines.join('\n');
}

// ── Markdown ─────────────────────────────────────────────

export function buildMarkdown(input: string, response: AIResponse, score: QualityScore | null): string {
  const d = new Date().toLocaleDateString();
  const parts: string[] = [
    '# Prompt Analysis Report',
    `> *Prompt Builder AI · ${d}*`,
    '',
    '## Original Prompt',
    '',
    '```',
    input,
    '```',
    '',
  ];
  if (score) parts.push(`**Quality Score:** ${scoreLabel(score)}`, '');

  const addBullets = (h: string, items: string[]) =>
    parts.push(`## ${h}`, '', ...items.map(x => `- ${x}`), '');

  const addBlock = (h: string, body: string) =>
    parts.push(`## ${h}`, '', '```', body, '```', '');

  const addText = (h: string, body: string) =>
    parts.push(`## ${h}`, '', body, '');

  addBullets('Problems Identified', response.problems);
  addBlock('Professional Prompt', response.professionalPrompt);
  addText('Structure Breakdown', response.structureExplanation);
  addBullets('Token Saving Tips', response.tokenSavingTips);
  addBlock('Short Optimized Version', response.shortOptimizedPrompt);
  addBlock('Detailed Optimized Version', response.detailedOptimizedPrompt);
  addBullets('Suggested Questions', response.suggestedQuestions);
  if (response.stabilityFix) addText('Stability Quick Fix', response.stabilityFix);
  if (response.stablerRewrite) addBlock('Safer Rewrite', response.stablerRewrite);

  return parts.join('\n');
}

// ── JSON ─────────────────────────────────────────────────

export function buildJson(input: string, response: AIResponse, score: QualityScore | null): string {
  return JSON.stringify({
    generatedAt: new Date().toISOString(),
    originalPrompt: input,
    qualityScore: score
      ? { total: score.total, level: score.level, breakdown: score.breakdown }
      : null,
    analysis: response,
  }, null, 2);
}

// ── File download ─────────────────────────────────────────

export function triggerDownload(content: string, filename: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

// ── URL share ─────────────────────────────────────────────

export function encodeShareState(state: ShareState): string {
  const bytes = new TextEncoder().encode(JSON.stringify(state));
  let bin = '';
  bytes.forEach(b => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function decodeShareState(encoded: string): ShareState | null {
  try {
    const pad = (4 - (encoded.length % 4)) % 4;
    const b64 = (encoded + '='.repeat(pad)).replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (parsed?.v === 1 && parsed.i && parsed.r) return parsed as ShareState;
    return null;
  } catch {
    return null;
  }
}
