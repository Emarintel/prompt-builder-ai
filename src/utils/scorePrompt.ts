import { Language, QualityScore, ScoreCriteria, ScoreLevel, SCORE_MAX } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// SCORING ENGINE
// Each criterion is scored independently then summed to 100.
// Thresholds are tuned so a typical vague prompt scores 25–45,
// a decent prompt 55–70, and a professional prompt 80+.
// ─────────────────────────────────────────────────────────────────────────────

export function scorePrompt(input: string, language: Language): QualityScore {
  const text = input.trim();
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const isFa = language === 'fa';

  // ── 1. CLARITY (0–15) ─────────────────────────────────────────────────────
  // Does the prompt use a clear action verb and form a recognisable request?
  let clarity = 0;

  const actionVerbsEn =
    /\b(write|create|analyze|analyse|explain|list|build|design|generate|review|summarize|describe|compare|evaluate|define|translate|convert|fix|debug|improve|optimize|suggest|recommend|find|identify|calculate|implement|develop|produce|draft|compose|plan|outline|research|code|test|document|refactor|deploy|configure|setup|audit|validate|estimate|extract|transform|classify|predict|detect)\b/i;
  const actionVerbsFa =
    /بنویس|بساز|تحلیل|توضیح|لیست|طراح|تولید|بررسی|خلاصه|مقایسه|ارزیاب|ترجم|تبدیل|رفع|بهبود|پیشنهاد|پیدا|شناسایی|محاسب|پیاده|توسعه|برنامه|تهیه|ایجاد|کدنویسی|تست|مستند|بازنویسی|تنظیم|راه‌اندازی|پیاده‌سازی/;

  if (isFa ? actionVerbsFa.test(text) : actionVerbsEn.test(lower)) clarity += 5;
  if (wordCount >= 5) clarity += 2;
  if (wordCount >= 12) clarity += 3;

  const vagueEn = /\b(something|anything|stuff|things|whatever|somehow|better|good|nice|cool|awesome)\b/i;
  const vagueFa = /چیزی|یه چیز|یک چیز|هر چیزی|یه جوری|خوب تر|بهتر/;
  if (!(isFa ? vagueFa.test(text) : vagueEn.test(lower))) clarity += 3;

  if (wordCount >= 18) clarity += 2;
  clarity = Math.min(clarity, SCORE_MAX.clarity);

  // ── 2. CONTEXT (0–15) ─────────────────────────────────────────────────────
  // Does the prompt explain WHO needs this, WHAT for, or provide background?
  let context = 0;

  const contextPatternsEn = [
    /\bfor\s+(my|our|the|a|an)\b/i,
    /\bas\s+a\b/i,
    /\b(i\s+am|i'm|i\s+have|i\s+work|i\s+run|i\s+own|i\s+need|we\s+are|we\s+have)\b/i,
    /\b(our|my)\s+(company|team|project|business|app|product|website|blog|clients|customers|audience|users|startup|brand)\b/i,
    /\b(background|context|situation|scenario|currently|existing|based on|given that|assuming)\b/i,
    /\btarget\s+(audience|user|customer|reader|market|demographic)\b/i,
    /\bwho\s+(are|is|want|need|have|will)\b/i,
  ];
  const contextPatternsFa = [
    /برای\s+\w/,
    /به عنوان\s+\w/,
    /من\s+(یک|دارم|هستم|کار|می‌خواهم|می‌خوام)/,
    /\b(شرکت|تیم|پروژه|کسب‌وکار|اپ|وب‌سایت|مشتری|کاربر|مخاطب|استارتاپ|برند)\s*(ما|من)\b/,
    /زمینه|پس‌زمینه|وضعیت|فعلاً|بر اساس|با فرض اینکه/,
    /مخاطب هدف|کاربر هدف/,
  ];

  const pats = isFa ? contextPatternsFa : contextPatternsEn;
  const ctxMatches = pats.filter(p => p.test(text)).length;
  context = Math.min(ctxMatches * 5, SCORE_MAX.context);

  // ── 3. SPECIFIC GOAL (0–20) ───────────────────────────────────────────────
  // Is there a concrete, measurable desired outcome?
  let specificGoal = 0;

  if (/\d+/.test(text)) specificGoal += 6;

  const deliverablesEn =
    /\b(\d+\s*(word|page|sentence|option|example|item|section|point|step|tip|idea|question|bullet|paragraph|chapter|version|part|feature|use.?case)s?|(a|one)\s+(complete|full|detailed|comprehensive|short|brief|professional|clear|concise|simple|advanced)\b)/i;
  const deliverablesFa =
    /\d+\s*(کلمه|صفحه|جمله|گزینه|مثال|مورد|بخش|نکته|قدم|سوال|پاراگراف|فیچر)|کامل|جامع|مختصر|حرفه‌ای|واضح|مشخص|دقیق|پیشرفته|ساده/;
  if (isFa ? deliverablesFa.test(text) : deliverablesEn.test(lower)) specificGoal += 5;

  const thatClauseEn = /\bthat\s+(will|can|should|must|helps?|allows?|enables?|makes?|shows?|explains?)\b/i;
  const thatClauseFa = /که\s+(باید|می‌تواند|کمک|امکان|نشان|توضیح)/;
  if (isFa ? thatClauseFa.test(text) : thatClauseEn.test(lower)) specificGoal += 4;

  if (wordCount >= 20) specificGoal += 3;
  if (wordCount >= 40) specificGoal += 2;
  specificGoal = Math.min(specificGoal, SCORE_MAX.specificGoal);

  // ── 4. OUTPUT FORMAT (0–15) ───────────────────────────────────────────────
  // Does the prompt specify how the response should be structured?
  let outputFormat = 0;

  const formatKeywordsEn =
    /\b(list|bullet|table|json|markdown|html|csv|code|essay|paragraph|article|blog|email|report|summary|outline|template|script|tweet|post|format|structure|heading|section|step.?by.?step|numbered|sequence|flow|diagram|chart|presentation|slide|spreadsheet|database|api|schema)\b/i;
  const formatKeywordsFa =
    /لیست|جدول|کد|مقاله|پاراگراف|ایمیل|گزارش|خلاصه|قالب|ساختار|بخش|گام.به.گام|شماره.گذاری|بلاگ|پست|فرمت|نمودار|دیاگرام|ارائه|اسلاید|صفحه.گسترده|پایگاه.داده|اسکیما/;
  if (isFa ? formatKeywordsFa.test(text) : formatKeywordsEn.test(lower)) outputFormat += 8;

  const lengthSpecEn =
    /\b(\d+\s*(word|character|line|sentence|paragraph)s?|(short|brief|concise|detailed|comprehensive|long|extended|succinct)\b)/i;
  const lengthSpecFa =
    /\d+\s*(کلمه|کاراکتر|جمله|پاراگراف)|کوتاه|مختصر|جامع|کامل|طولانی|موجز/;
  if (isFa ? lengthSpecFa.test(text) : lengthSpecEn.test(lower)) outputFormat += 4;

  const structureEn =
    /\b(include|with\s+\w|having|contains?|broken?.?down|organized|sections?|parts?|divided|structured)\b/i;
  const structureFa = /شامل|دارا|سازمان|بخش|قسمت|تقسیم|ساختارمند/;
  if (isFa ? structureFa.test(text) : structureEn.test(lower)) outputFormat += 3;

  outputFormat = Math.min(outputFormat, SCORE_MAX.outputFormat);

  // ── 5. CONSTRAINTS (0–10) ─────────────────────────────────────────────────
  // Does the prompt define boundaries, exclusions, or requirements?
  let constraints = 0;

  const constraintEn =
    /\b(don'?t|do not|avoid|without|never|must|should|need to|only|maximum|minimum|max|min|limit|within|under|less than|more than|at most|at least|exclude|except|focus|prioritize|ensure|require|restrict|no\s+\w+ing|not\s+to\s+\w)\b/i;
  const constraintFa =
    /نباید|نکن|اجتناب|بدون|هرگز|باید|نیاز|فقط|حداکثر|حداقل|محدودیت|درون|زیر|بیشتر از|کمتر از|تمرکز|اولویت|اطمینان|شامل نشود|به جز|مستثنی|منحصراً/;

  const allConstraintMatches = isFa
    ? (text.match(new RegExp(constraintFa.source, 'g')) ?? []).length
    : (lower.match(new RegExp(constraintEn.source, 'gi')) ?? []).length;
  constraints = Math.min(allConstraintMatches * 3, SCORE_MAX.constraints);

  // ── 6. LANGUAGE QUALITY (0–15) ────────────────────────────────────────────
  // Is the writing grammatically structured and readable?
  let languageQuality = 0;

  if (wordCount >= 5 && wordCount <= 600) languageQuality += 4;
  if (wordCount >= 10) languageQuality += 3;
  if (text !== text.toUpperCase() || isFa) languageQuality += 3;
  if (/[.!?,;:؟،؛]/.test(text)) languageQuality += 2;
  if (!(wordCount <= 5 && /\?|؟/.test(text))) languageQuality += 3;
  languageQuality = Math.min(languageQuality, SCORE_MAX.languageQuality);

  // ── 7. TOKEN EFFICIENCY (0–10) ────────────────────────────────────────────
  // Is the prompt an appropriate length? Penalise filler phrases.
  let tokenEfficiency = 0;

  if (wordCount < 3) tokenEfficiency = 0;
  else if (wordCount < 6) tokenEfficiency = 2;
  else if (wordCount <= 60) tokenEfficiency = 10;
  else if (wordCount <= 120) tokenEfficiency = 7;
  else if (wordCount <= 250) tokenEfficiency = 4;
  else tokenEfficiency = 2;

  const fillerEn =
    /\b(as an ai|as a language model|please kindly|i was wondering if|would you be able|could you possibly|feel free to|i hope you|just wanted to)\b/i;
  const fillerFa = /ممنون می‌شم که|خواستم بگم که|یه سوال داشتم که|اگر وقت داشتید|لطفاً اگر امکانش هست/;
  if ((isFa ? fillerFa : fillerEn).test(isFa ? text : lower)) {
    tokenEfficiency = Math.max(0, tokenEfficiency - 3);
  }
  tokenEfficiency = Math.min(tokenEfficiency, SCORE_MAX.tokenEfficiency);

  // ── TOTAL ─────────────────────────────────────────────────────────────────
  const total = clarity + context + specificGoal + outputFormat + constraints + languageQuality + tokenEfficiency;

  const breakdown: ScoreCriteria = {
    clarity,
    context,
    specificGoal,
    outputFormat,
    constraints,
    languageQuality,
    tokenEfficiency,
  };

  const level: ScoreLevel =
    total <= 28 ? 'poor'
    : total <= 48 ? 'needs-work'
    : total <= 65 ? 'fair'
    : total <= 82 ? 'good'
    : 'excellent';

  const improvements = buildImprovements(breakdown, isFa);
  return { total, breakdown, level, improvements };
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPROVEMENT TIPS
// Finds the biggest-gap criteria and returns targeted, actionable tips.
// ─────────────────────────────────────────────────────────────────────────────
function buildImprovements(breakdown: ScoreCriteria, isFa: boolean): string[] {
  interface Tip { gap: number; tip: string }
  const tips: Tip[] = [];

  const consider = (
    value: number,
    max: number,
    threshold: number,
    tipEn: string,
    tipFa: string,
  ) => {
    if (value / max < threshold) {
      tips.push({ gap: max - value, tip: isFa ? tipFa : tipEn });
    }
  };

  consider(
    breakdown.outputFormat, 15, 0.55,
    'Specify output format: list, table, JSON, markdown, step-by-step, essay, code block...',
    'قالب خروجی مشخص کنید: لیست، جدول، JSON، گام‌به‌گام، مقاله، بلوک کد...',
  );
  consider(
    breakdown.context, 15, 0.55,
    'Add context: "for [audience]", "as a [role]", "I need this for my [project/company]"',
    'زمینه اضافه کنید: «برای [مخاطب]»، «به عنوان یک [نقش]»، «برای پروژه / شرکت من»',
  );
  consider(
    breakdown.specificGoal, 20, 0.5,
    'Be more specific: add numbers, word count, exact deliverables, or a success criterion',
    'مشخص‌تر باشید: اعداد، تعداد کلمه، نتیجه دقیق یا معیار موفقیت اضافه کنید',
  );
  consider(
    breakdown.constraints, 10, 0.35,
    'Add constraints: "avoid X", "max 500 words", "don\'t include Y", "focus only on Z"',
    'محدودیت اضافه کنید: «از X اجتناب کن»، «حداکثر ۵۰۰ کلمه»، «فقط روی Y تمرکز کن»',
  );
  consider(
    breakdown.clarity, 15, 0.5,
    'Use a clear action verb to open: write, create, analyze, explain, compare, build...',
    'با فعل اقدام واضحی شروع کنید: بنویس، بساز، تحلیل کن، توضیح بده، مقایسه کن...',
  );
  consider(
    breakdown.tokenEfficiency, 10, 0.45,
    'Optimize prompt length: 15–60 words is ideal — remove filler and politeness phrases',
    'طول پرامپت را بهینه کنید: ۱۵ تا ۶۰ کلمه ایده‌آل است — عبارات زاید را حذف کنید',
  );
  consider(
    breakdown.languageQuality, 15, 0.45,
    'Write complete sentences with clear structure — avoid single words or run-on sentences',
    'جملات کامل با ساختار واضح بنویسید — از پرامپت‌های تک‌کلمه‌ای یا جملات بسیار طولانی پرهیز کنید',
  );

  tips.sort((a, b) => b.gap - a.gap);
  return tips.slice(0, 4).map(t => t.tip);
}
