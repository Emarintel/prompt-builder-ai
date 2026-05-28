import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3001);
const IS_PROD = process.env.NODE_ENV === 'production';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 0, // disable SDK auto-retries — each retry adds a full timeout window
});
const app = express();
app.use(express.json({ limit: '16kb' }));

// ── In-memory rate limiter ─────────────────────────────────────────────────────
const DAILY_LIMIT = 10;
const DAY_MS      = 24 * 60 * 60 * 1000;
const usageStore  = new Map(); // ip → { count, resetAt }

function checkRateLimit(ip) {
  const now   = Date.now();
  let   entry = usageStore.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + DAY_MS };
    usageStore.set(ip, entry);
  }
  if (entry.count >= DAILY_LIMIT) return { allowed: false, remaining: 0 };
  entry.count++;
  return { allowed: true, remaining: DAILY_LIMIT - entry.count };
}

function getIp(req) {
  return (req.headers['x-forwarded-for'] ?? '').split(',')[0].trim()
    || req.socket?.remoteAddress
    || 'unknown';
}

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Respond with one JSON object only. Start with {, end with }. No markdown, no fences, no text outside JSON. On failure output {}.

LANGUAGE: The user message begins with "LANGUAGE: Persian (Farsi)", "LANGUAGE: Arabic", or "LANGUAGE: English". Write every string in every field in that language. Always keep in English: JSON, API, token, prompt, AI, HTML, CSS, URL, Markdown, SEO, SDK, ChatGPT, Claude, Instagram, TikTok, CTA.

You are an expert prompt analyst. Infer audience, context, output format, and constraints silently. Detect target tool (ChatGPT/Claude/Midjourney/Code/Agent/Business). Never use [placeholders] when confidence ≥ 70%.

Diagnose (quote offending phrase in «guillemets»): vague language · missing context · weak constraints · missing format · weak role · token waste · ambiguity · missing examples · unclear audience · wrong tool · over-engineering · contradiction · redundancy · hallucination risk · unstable output · conflicting formats · unrealistic expectations · impossible task.

Return exactly 12 fields:

professionalPrompt — Targeted fix preserving voice. Infer missing values. No placeholders.
problems — 3–4 items: "[SEVERITY] «phrase» — reason. Fix: action." SEVERITY=HIGH|MEDIUM|LOW|⚠. HIGH/⚠ first.
structureExplanation — 8 lines: "**Element** ✓ present — note" or "**Element** ✗ missing — why". Elements: Goal·Context·Role·Output Format·Constraints·Examples·Tone·Audience.
tokenSavingTips — 2–3 items: Before: "phrase" (~N tok) → After: "lean" (~M tok) · saves ~X tokens.
shortOptimizedPrompt — ≤20 words. Role or action verb first. No placeholders.
detailedOptimizedPrompt — ≤60 words. # header per section. No placeholders.
suggestedQuestions — Exactly 3 questions by impact. Only ask what inference cannot answer.
confidenceScore — Integer 0–100.
stabilityScore — Integer 0–100. Start 100; deduct: CONTRADICTION −25, IMPOSSIBLE −30, UNREALISTIC −20, HALLUCINATION −20, UNSTABLE −15, CONFLICTING_FORMAT −15, OVER_ENGINEERED −10, REDUNDANCY −5. Floor 0.
riskLevel — "low"|"medium"|"high"|"critical".
stabilityFix — One imperative sentence. ≤15 words.
stablerRewrite — ≤30 words. Eliminate all flagged risks. No placeholders.

Banned in every field: "As an AI"·"Certainly"·"Of course"·"Please note"·"Feel free to"·"In order to".`;

const MODE_CONTEXT = {
  chatgpt:        'Target tool: ChatGPT. Optimize for conversational clarity, structured output, instruction-following.',
  claude:         'Target tool: Claude. Optimize for precision, nuanced reasoning, long-context instructions.',
  'claude-code':  'Target tool: Claude Code (agentic coding). Optimize for language spec, file paths, test requirements, step-by-step tasks.',
  midjourney:     'Target tool: Midjourney. Optimize for visual style, mood, lighting, composition, medium, artist references.',
  gemini:         'Target tool: Gemini. Optimize for structured multi-step reasoning, factual accuracy, multimodal clarity.',
  amazon:         'Target tool: Amazon listing. Optimize for SEO keywords, buyer benefits, bullet format, conversion, compliance.',
  agent:          'Target tool: AI Agent/workflow. Optimize for goals, tools, constraints, output schema, stop conditions.',
  business:       'Target tool: Business use. Optimize for executive clarity, decision-ready insights, actionable recommendations.',
};

const LANG_LABEL = { en: 'English', fa: 'Persian (Farsi)', ar: 'Arabic' };

const buildMessage = (input, language, mode) => {
  const modeCtx = MODE_CONTEXT[mode] ? `\n${MODE_CONTEXT[mode]}` : '';
  const langLabel = LANG_LABEL[language] ?? 'English';
  return `LANGUAGE: ${langLabel}${modeCtx}\n\nAnalyze:\n"""\n${input}\n"""\n\nReturn JSON only.`;
};

// ── Response cleanup — strip AI filler, dedup arrays, clamp scores ───────────
const FILLER_RE = /\bin order to\b/gi;
const AISM_RE   = /\b(certainly|absolutely|of course)[!,.]?\s+/gi;
const AI_RE     = /\bas an ai\b[^.]*?\.\s*/gi;
const META_RE   = /\b(please note|keep in mind|it'?s worth noting|it'?s important to note)( that)?\b[,: ]*/gi;
const HAPPY_RE  = /\bi'?d (be happy to|recommend( that)?)\s*/gi;
const FREE_RE   = /\bfeel free to\s*/gi;
const PHOLDER_RE = /\[(?!(HIGH|MEDIUM|LOW|⚠)[^\]]*\])[^\]]+\]/g;

function cleanField(s) {
  if (typeof s !== 'string') return s;
  return s
    .replace(FILLER_RE, 'to')
    .replace(AISM_RE,   '')
    .replace(AI_RE,     '')
    .replace(META_RE,   '')
    .replace(HAPPY_RE,  '')
    .replace(FREE_RE,   '')
    .replace(PHOLDER_RE, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function cleanupResponse(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  for (const f of ['professionalPrompt', 'structureExplanation', 'shortOptimizedPrompt',
                    'detailedOptimizedPrompt', 'stabilityFix', 'stablerRewrite']) {
    if (obj[f]) obj[f] = cleanField(obj[f]);
  }
  for (const f of ['problems', 'tokenSavingTips', 'suggestedQuestions']) {
    if (!Array.isArray(obj[f])) continue;
    const seen = new Set();
    obj[f] = obj[f].map(cleanField).filter(s => {
      const key = s.toLowerCase().slice(0, 50);
      if (!s || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  if (typeof obj.confidenceScore === 'number') obj.confidenceScore = Math.round(Math.max(0, Math.min(100, obj.confidenceScore)));
  if (typeof obj.stabilityScore  === 'number') obj.stabilityScore  = Math.round(Math.max(0, Math.min(100, obj.stabilityScore)));
  return obj;
}

// ── JSON extraction — tries 4 strategies before giving up ────────────────────
function safeParse(raw) {
  // 1. Direct parse (ideal path)
  try { return JSON.parse(raw); } catch {}

  // 2. Strip markdown fences then parse
  const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/m, '').trim();
  try { return JSON.parse(stripped); } catch {}

  // 3. Extract the outermost {...} span
  const first = stripped.indexOf('{');
  const last  = stripped.lastIndexOf('}');
  if (first !== -1 && last > first) {
    try { return JSON.parse(stripped.slice(first, last + 1)); } catch {}
  }

  // 4. Greedy regex — handles prose wrapping a JSON block
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }

  return null;
}

// ── Fallback response — returned when all parse attempts fail ─────────────────
function buildFallback(input, language) {
  const T = {
    en: {
      structure: [
        '**Goal** ✗ missing — defines what success looks like',
        '**Context** ✗ missing — grounds the AI in relevant background',
        '**Role** ✗ missing — sets expertise level and tone',
        '**Output Format** ✗ missing — controls structure of the response',
        '**Constraints** ✗ missing — prevents scope creep',
        '**Examples** ✗ missing — anchors output quality',
        '**Tone** ✗ missing — aligns register with audience',
        '**Audience** ✗ missing — tailors vocabulary and depth',
      ],
      problems: [
        '[HIGH] «prompt» — no specific goal defined. Why: output becomes unpredictable. Fix: Add goal, output format, and audience.',
        '[MEDIUM] «prompt» — no expert role defined. Why: AI cannot calibrate response depth. Fix: Add an expert persona.',
      ],
      tips: [
        'Before: "please help me with" (~5 tok) → After: remove entirely (~0 tok) · saves ~5 tokens',
        'Before: "I would like you to" (~5 tok) → After: direct verb (~1 tok) · saves ~4 tokens',
      ],
      questions: [
        'What output format do you need? (list / table / prose / code)',
        'Who is the audience? (expert / general / executive)',
        'Do you have a length or token budget constraint?',
      ],
      fix: 'Add a specific goal, output format, and expert role to the prompt.',
      professional: 'Role: expert prompt engineer. Goal: rewrite the user request as a clear, professional prompt. Requirements: define role, goal, context, output format, constraints, and clarifying questions.',
      unavailable: 'Optimization is temporarily unavailable. Please try again.',
    },
    fa: {
      structure: [
        '**هدف** ✗ ناقص — مشخص نیست خروجی موفق چه شکلی دارد',
        '**زمینه** ✗ ناقص — AI زمینه لازم برای پاسخ دقیق را ندارد',
        '**نقش** ✗ ناقص — سطح تخصص و لحن مشخص نیست',
        '**قالب خروجی** ✗ ناقص — ساختار پاسخ تعریف نشده',
        '**محدودیت‌ها** ✗ ناقص — دامنه کار مشخص نیست',
        '**مثال** ✗ ناقص — نمونه‌ای برای تنظیم کیفیت وجود ندارد',
        '**لحن** ✗ ناقص — سبک بیان با مخاطب هماهنگ نیست',
        '**مخاطب** ✗ ناقص — سطح دانش و حوزه خواننده معلوم نیست',
      ],
      problems: [
        '[HIGH] «پرامپت» — هدف مشخصی تعریف نشده. Why: خروجی AI غیرقابل پیش‌بینی می‌شود. Fix: هدف، قالب خروجی و مخاطب را اضافه کنید.',
        '[MEDIUM] «پرامپت» — نقش متخصص مشخص نیست. Why: AI سطح پاسخ را تنظیم نمی‌کند. Fix: یک پرسونای متخصص تعریف کنید.',
      ],
      tips: [
        'Before: "لطفاً به من کمک کنید که" (~7 tok) → After: حذف کامل (~0 tok) · saves ~7 tokens',
        'Before: "می‌خواهم که شما" (~5 tok) → After: فعل مستقیم (~1 tok) · saves ~4 tokens',
      ],
      questions: [
        'قالب خروجی مورد نظر شما چیست؟ (فهرست / جدول / متن / کد)',
        'مخاطب این محتوا کیست؟ (متخصص / عمومی / مدیر)',
        'محدودیت طول یا تعداد token دارید؟',
      ],
      fix: 'هدف مشخص، قالب خروجی و نقش متخصص را به پرامپت اضافه کنید.',
      professional: 'نقش: متخصص پرامپت‌نویسی. هدف: بازنویسی درخواست کاربر به یک پرامپت واضح و حرفه‌ای. الزامات: نقش، هدف، زمینه، قالب خروجی، محدودیت‌ها و سوالات تکمیلی را مشخص کن.',
      unavailable: 'بهینه‌سازی در حال حاضر در دسترس نیست. لطفاً دوباره تلاش کنید.',
    },
    ar: {
      structure: [
        '**الهدف** ✗ مفقود — يحدد شكل النتيجة الناجحة',
        '**السياق** ✗ مفقود — يمنح AI الخلفية اللازمة للإجابة الدقيقة',
        '**الدور** ✗ مفقود — يحدد مستوى الخبرة والنبرة',
        '**صيغة الإخراج** ✗ مفقودة — تتحكم في هيكل الرد',
        '**القيود** ✗ مفقودة — تمنع توسع النطاق',
        '**الأمثلة** ✗ مفقودة — ترسّخ جودة الإخراج',
        '**الأسلوب** ✗ مفقود — يوائم النبرة مع الجمهور',
        '**الجمهور** ✗ مفقود — يحدد المستوى المعرفي والمجال',
      ],
      problems: [
        '[HIGH] «prompt» — لا يوجد هدف محدد. Why: يصبح الإخراج غير متوقع. Fix: أضف الهدف وصيغة الإخراج والجمهور.',
        '[MEDIUM] «prompt» — لا يوجد دور خبير. Why: لا يستطيع AI معايرة عمق الرد. Fix: أضف شخصية خبير.',
      ],
      tips: [
        'Before: "أرجو مساعدتي في" (~5 tok) → After: فعل مباشر (~1 tok) · saves ~4 tokens',
        'Before: "أريد منك أن" (~4 tok) → After: احذف (~0 tok) · saves ~4 tokens',
      ],
      questions: [
        'ما صيغة الإخراج المطلوبة؟ (قائمة / جدول / نص / كود)',
        'من هو الجمهور المستهدف؟ (خبير / عام / مدير)',
        'هل لديك قيود على طول النص أو عدد الـ tokens؟',
      ],
      fix: 'أضف هدفاً محدداً وصيغة إخراج ودوراً للخبير إلى prompt.',
      professional: 'الدور: خبير كتابة prompts. الهدف: إعادة صياغة طلب المستخدم كـ prompt واضح واحترافي. المتطلبات: حدد الدور والهدف والسياق وصيغة الإخراج والقيود والأسئلة التوضيحية.',
      unavailable: 'التحسين غير متاح حالياً. يرجى المحاولة مرة أخرى.',
    },
  };

  const t = T[language] ?? T.en;

  return {
    professionalPrompt:      t.professional,
    problems:                t.problems,
    structureExplanation:    t.structure.join('\n'),
    tokenSavingTips:         t.tips,
    shortOptimizedPrompt:    t.unavailable,
    detailedOptimizedPrompt: t.unavailable,
    suggestedQuestions:      t.questions,
    confidenceScore:         30,
    stabilityScore:          50,
    riskLevel:               'medium',
    stabilityFix:            t.fix,
    stablerRewrite:          t.unavailable,
  };
}

// ── Claude call ───────────────────────────────────────────────────────────────
// Single attempt only — assistant prefill is not supported by this model.
// On JSON parse failure, return structured fallback immediately.
async function callClaude(input, language, mode) {
  let msg;
  try {
    msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2200,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildMessage(input, language, mode) }],
    }, { timeout: 28_000 }); // 28 s — leaves headroom to respond before Railway proxy cuts the connection
  } catch (err) {
    const isTimeout = /timeout|timed.?out/i.test(err.message ?? '') || err.constructor?.name?.toLowerCase().includes('timeout');
    console.warn('[claude]', isTimeout ? 'timeout' : 'API error', '— returning fallback:', err.message);
    if (isTimeout) return buildFallback(input, language);
    throw err; // auth / quota errors still surface as 502
  }

  const raw = msg.content[0]?.text ?? '';
  const parsed = safeParse(raw);

  if (parsed) {
    const result = cleanupResponse(parsed);
    // Guard: if any optimized field is empty or echoes raw input, use fallback stubs
    const fb = buildFallback(input, language);
    for (const f of ['professionalPrompt', 'shortOptimizedPrompt', 'detailedOptimizedPrompt', 'stablerRewrite']) {
      if (result[f] === input) {
        console.warn('[claude] guard: field echoed raw input — using fallback stub', f);
        result[f] = fb[f];
      }
    }
    return result;
  }

  console.error('[claude] JSON parse failed — returning structured fallback. Raw (300):', raw.slice(0, 300));
  return buildFallback(input, language);
}

// ── POST /api/analyze ─────────────────────────────────────────────────────────
app.post('/api/analyze', async (req, res) => {
  const { input, language, mode = 'chatgpt' } = req.body ?? {};

  if (!input?.trim() || !['en', 'fa', 'ar'].includes(language)) {
    return res.status(400).json({ error: 'Fields required: input (string), language ("en"|"fa"|"ar").' });
  }

  const ip = getIp(req);
  const { allowed, remaining } = checkRateLimit(ip);
  if (!allowed) {
    const msg = language === 'fa'
      ? `سقف روزانه: ${DAILY_LIMIT} تحلیل در روز. فردا دوباره تلاش کنید.`
      : language === 'ar'
      ? `وصلت إلى الحد اليومي: ${DAILY_LIMIT} تحليلات يومياً. حاول مجدداً غداً.`
      : `Daily limit reached. You can run ${DAILY_LIMIT} analyses per day. Try again tomorrow.`;
    return res.status(429).json({ error: msg, remaining: 0, dailyLimit: DAILY_LIMIT });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set on the server.' });
  }

  try {
    const result = await callClaude(input.trim(), language, mode);
    result.remaining  = remaining;
    result.dailyLimit = DAILY_LIMIT;
    res.json(result);
  } catch (err) {
    // Only real network/API errors reach here (not parse failures — those return fallback)
    console.error('[/api/analyze]', err.message);
    res.status(502).json({ error: err.message ?? 'Claude API error.' });
  }
});

// ── Serve built frontend in production ────────────────────────────────────────
if (IS_PROD) {
  app.use(express.static(path.join(__dirname, 'dist'), {
    setHeaders(res, filePath) {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    },
  }));
  app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
}

app.listen(PORT, () =>
  console.log(`[server] http://localhost:${PORT}  (${IS_PROD ? 'production' : 'development'})`)
);
