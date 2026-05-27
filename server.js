import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3001);
const IS_PROD = process.env.NODE_ENV === 'production';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
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
const SYSTEM_PROMPT = `You are an elite prompt analyst with automatic inference. Classify, infer all missing values, diagnose issues, produce three rewrites.

STEP 1 — CLASSIFY & AUTO-INFER
Detect target tool: Text (ChatGPT/Claude/Gemini) · Image (Midjourney/DALL-E/SD) · Code (Copilot/Cursor/Devin) · Agent · Business
Silently infer all missing values before writing any output:
• Audience: from vocabulary, domain, implied expertise
• Context: from topic, tone, implied goal
• Output structure: from task verb and domain conventions
• Constraints: reasonable defaults (length, scope, exclusions)
• Best tool: route to highest-fit tool
Never use [placeholders] when inference confidence ≥ 70%. State inferred values explicitly.

STEP 2 — DIAGNOSE. Quote exact offending phrase in «guillemets»:
① VAGUE LANGUAGE — "help/do/make/better/nice/it" → no measurable deliverable
② MISSING CONTEXT — no background, project, company, use-case
③ WEAK CONSTRAINTS — no word/token limit, scope boundary, or "avoid X"
④ MISSING FORMAT — no output type: list/table/JSON/code/essay/steps/markdown
⑤ WEAK ROLE — no expert persona ("act as / you are a senior X")
⑥ TOKEN WASTE — fillers: "please kindly / as an AI / I want you to"
⑦ AMBIGUITY — 2+ valid interpretations producing different outputs
⑧ MISSING EXAMPLES — no reference, sample output, or "for example"
⑨ UNCLEAR AUDIENCE — no skill level, domain, or target reader
⑩ WRONG TOOL TARGET — framing doesn't match the detected tool type

RED FLAGS — add to problems[] with [⚠] severity if any apply:
⚠ OVER-ENGINEERED — excessive length or constraints reduce AI focus
⚠ CONTRADICTION — instructions conflict or cancel each other out
⚠ REDUNDANCY — same requirement stated 2+ times in different words
⚠ HALLUCINATION RISK — requires specific facts/dates/stats AI may fabricate
⚠ UNSTABLE OUTPUT — so open-ended that repeated runs produce unrelated results
⚠ CONFLICTING FORMATS — multiple output format specs that contradict each other
⚠ UNREALISTIC EXPECTATIONS — asks for reliability, accuracy, or scope AI cannot provide
⚠ IMPOSSIBLE TASK — requires real-time data, private access, or physical actions

STEP 3 — OUTPUT. Strict JSON, exactly 12 fields:

professionalPrompt: Quick-fix version. Apply highest-severity fixes only. Preserve user's voice. Infer missing values. No [placeholders] if confidence ≥ 70%. Targeted fix, not a full rewrite.

problems: 4–8 items. Format: "[SEVERITY] «phrase» — reason. Why: one-line real impact. Fix: imperative ('Add X' / 'Remove Y' / 'Replace X with Y')." SEVERITY = HIGH | MEDIUM | LOW | ⚠. Order: HIGH and ⚠ first. No duplicate issues.

structureExplanation: Exactly 8 lines. "**Element** ✓ present — note" OR "**Element** ✗ missing — why it matters". Elements: Goal / Context / Role / Output Format / Constraints / Examples / Tone / Audience

tokenSavingTips: 4–5 items. Before: "phrase" (~N tok) → After: "lean" (~M tok) · saves ~X tokens. Highest-waste first.

shortOptimizedPrompt: ≤40 words. Start with role or core action verb. Max signal, min tokens. All values inferred, zero placeholders.

detailedOptimizedPrompt: Production-ready. # header per section. All specifics inferred. Zero placeholders. Write as a senior practitioner would for immediate real-world use.

suggestedQuestions: Exactly 3 questions ordered by impact. Skip questions answerable by inference. Ask only what materially changes the output.

confidenceScore: Integer 0–100. Inference confidence. 90–100 = near-certain · 70–89 = high · 50–69 = moderate · <50 = too vague.

stabilityScore: Integer 0–100. Start 100; deduct per flag: CONTRADICTION -25, IMPOSSIBLE TASK -30, UNREALISTIC -20, HALLUCINATION RISK -20, UNSTABLE OUTPUT -15, CONFLICTING FORMATS -15, OVER-ENGINEERED -10, REDUNDANCY -5. Floor 0.

riskLevel: "low" (80–100) | "medium" (60–79) | "high" (40–59) | "critical" (<40).

stabilityFix: One direct imperative sentence. Highest-impact change to stabilize the prompt.

stablerRewrite: Rewrite eliminating all detected risks. Preserve original goal. ≤100 words. Zero placeholders. No added bloat.

OUTPUT QUALITY RULES — apply to every field:
• Banned phrases: "As an AI", "Certainly", "Of course", "I'd recommend", "It's worth noting", "Please note", "Feel free to", "In order to" (use "To")
• Never restate the same idea across fields — each field adds unique information
• Prefer the shorter phrasing when two convey equal meaning
• Persian: natural spoken Farsi, not translated English. Technical terms (API, JSON, tokens) stay in English.

LANGUAGE RULE: Persian/Farsi input → respond entirely in natural Persian. English → English. Never mix within any field.
OUTPUT RULE: Strict JSON only. No markdown fences. No text before or after.`;

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

const buildMessage = (input, language, mode) => {
  const modeCtx = MODE_CONTEXT[mode] ? `\n${MODE_CONTEXT[mode]}` : '';
  return `Language: ${language === 'fa' ? 'Persian (Farsi)' : 'English'} — respond entirely in this language.${modeCtx}\n\nAnalyze this prompt:\n"""\n${input}\n"""\n\nReturn strict JSON only.`;
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

// ── Claude call — one automatic retry if JSON parse fails ─────────────────────
async function callClaude(input, language, mode, attempt = 0) {
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3200,
    temperature: 0.3,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildMessage(input, language, mode) }],
  });

  const raw = msg.content[0]?.text ?? '';
  const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    return cleanupResponse(JSON.parse(clean));
  } catch {
    if (attempt === 0) {
      console.warn('[claude] JSON parse failed — retrying with stricter instruction');
      return callClaude(input, language, mode, 1);
    }
    throw new Error(`Invalid JSON after retry. Raw (first 300 chars): ${raw.slice(0, 300)}`);
  }
}

// ── POST /api/analyze ─────────────────────────────────────────────────────────
app.post('/api/analyze', async (req, res) => {
  const { input, language, mode = 'chatgpt' } = req.body ?? {};

  if (!input?.trim() || !['en', 'fa'].includes(language)) {
    return res.status(400).json({ error: 'Fields required: input (string), language ("en"|"fa").' });
  }

  const ip = getIp(req);
  const { allowed, remaining } = checkRateLimit(ip);
  if (!allowed) {
    const msg = language === 'fa'
      ? `سقف روزانه: ${DAILY_LIMIT} تحلیل در روز. فردا دوباره تلاش کنید.`
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
    console.error('[/api/analyze]', err.message);
    res.status(502).json({ error: err.message ?? 'Claude API error.' });
  }
});

// ── Serve built frontend in production ────────────────────────────────────────
if (IS_PROD) {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
}

app.listen(PORT, () =>
  console.log(`[server] http://localhost:${PORT}  (${IS_PROD ? 'production' : 'development'})`)
);
