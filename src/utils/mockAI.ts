import { AIResponse, Language } from '../types';

const mockEn: AIResponse = {
  professionalPrompt: `Act as a senior content strategist with 10+ years of experience in digital marketing and SEO.

Your task is to write a compelling, well-researched blog post on the topic provided below.

**Target audience:** Business owners and marketers with intermediate knowledge of the subject.

**Requirements:**
- Include a strong hook in the opening paragraph
- Use data-backed claims with cited statistics
- Structure with H2/H3 subheadings for scanability
- Include a practical takeaway in each section
- End with a clear call-to-action

**Output format:**
Provide the blog post in Markdown format with:
1. Title (H1)
2. Introduction (2–3 paragraphs)
3. 4–5 main sections with subheadings
4. Conclusion with CTA

**Constraints:**
- Length: 1,200–1,500 words
- Tone: Professional yet conversational
- Avoid fluff and passive voice
- No AI-sounding filler phrases

**Topic:** [INSERT YOUR TOPIC HERE]`,

  problems: [
    'No role defined — the AI doesn\'t know what expert voice to use, leading to generic output',
    'Vague action verb — words like "write", "help", "make" without specifics give the AI no direction',
    'Missing audience — content for a CEO differs completely from content for a beginner',
    'No output format specified — should the result be markdown? Plain text? Bullet list? Essay?',
    'No length or word count — the AI may give you 3 sentences or 3,000 words with equal confidence',
    'No tone guidelines — "professional", "casual", "technical", "persuasive" all produce different results',
    'Missing success criteria — the AI has no standard to measure quality against',
  ],

  structureExplanation: `**Goal** — The single specific outcome you want. Not "write a blog post" but "write a 1,200-word blog post that ranks for the keyword X and converts readers to sign up."

**Role** — Who the AI should be. "You are a senior copywriter who has written for Fortune 500 brands" is far more powerful than leaving it blank.

**Context** — What background does the AI need? Target audience, industry, tone, existing constraints, what to avoid.

**Output Format** — Exact structure: Markdown? JSON? Numbered list? Table? Code block? Specifying this avoids the AI making formatting decisions for you.

**Constraints** — Hard limits that must not be crossed: max word count, specific phrases to avoid, brand guidelines, reading level.

**Examples** — Even one example of good output raises quality by 40–60%. Show the AI what "correct" looks like.

**Tone** — Professional, casual, empathetic, assertive, technical? Each word choice changes with tone.

**Language** — Which language? What formality register? (British English vs American English vs Persian formal vs Persian casual)`,

  tokenSavingTips: [
    'Cut opener phrases: "I would like you to please help me with..." → "Write:" (saves 12+ tokens per request)',
    'Use imperative mood: "Can you explain X?" → "Explain X" (saves ~4 tokens and signals directness)',
    'Bullet requirements instead of prose: each bullet uses ~60% fewer tokens for the same information',
    'Remove AI-aware phrases: "As an AI language model..." context is wasted — just give the constraint',
    'Use shorthand for formats: "5x bullet points", "3-column table", "JSON array" instead of long descriptions',
    'Skip politeness tokens: "please", "thank you", "if you don\'t mind" add 0 value to AI responses',
  ],

  shortOptimizedPrompt: `Act as [ROLE]. Write [SPECIFIC OUTPUT] for [AUDIENCE]. Format: [FORMAT]. Max [WORD COUNT]. Tone: [TONE]. Avoid: [EXCLUSIONS]. Topic: [TOPIC].`,

  detailedOptimizedPrompt: `# Role
You are a world-class [ROLE] with deep expertise in [DOMAIN]. You have [RELEVANT EXPERIENCE/ACHIEVEMENT].

# Task
[Clear, specific description of what to produce — measurable and unambiguous]

# Context
- Target audience: [WHO — their knowledge level, goals, pain points]
- Purpose: [WHY this content is being created]
- Platform/medium: [WHERE it will be published or used]

# Output Specification
- Format: [EXACT FORMAT — markdown, JSON, plain text, HTML]
- Length: [SPECIFIC WORD/CHARACTER COUNT OR RANGE]
- Structure: [EXACT SECTIONS REQUIRED]
- Language: [LANGUAGE + FORMALITY LEVEL]

# Quality Standards
Your output must:
✓ [Specific quality criterion 1]
✓ [Specific quality criterion 2]
✓ [Specific quality criterion 3]

# Constraints
DO: [Positive constraints — what to include/do]
AVOID: [Negative constraints — what to exclude/not do]

# Reference Example
Style/tone sample: "[Brief 2-3 sentence example of the desired voice]"`,

  suggestedQuestions: [
    'What is the single most important outcome you want from this content? (Be specific — who reads it and what action should they take?)',
    'Who is the exact target audience, and what do they already know about this topic?',
    'What format do you need? (Markdown article, social post, email, JSON data, code, table...)',
    'Is there a word count, character limit, or time constraint on the output?',
    'Can you provide one example of content you\'d rate 9/10 or higher so I can match that style?',
  ],
};

const mockFa: AIResponse = {
  professionalPrompt: `به عنوان یک استراتژیست محتوای ارشد با بیش از ۱۰ سال تجربه در بازاریابی دیجیتال و سئو عمل کنید.

وظیفه شما نوشتن یک مقاله بلاگ جذاب و کاملاً تحقیق‌شده درباره موضوع زیر است.

**مخاطب هدف:** صاحبان کسب‌وکار و بازاریابانی با دانش متوسط از موضوع.

**الزامات:**
- شروع با یک قلاب قوی در پاراگراف ابتدایی
- استفاده از ادعاهای مبتنی بر داده با آمار مستند
- ساختاربندی با زیرعنوان‌های H2/H3 برای خوانایی
- یک نکته عملی در هر بخش
- پایان‌بندی با فراخوان به اقدام واضح

**قالب خروجی:**
مقاله را در قالب Markdown ارائه دهید با:
۱. عنوان (H1)
۲. مقدمه (۲ تا ۳ پاراگراف)
۳. ۴ تا ۵ بخش اصلی با زیرعنوان
۴. نتیجه‌گیری با فراخوان به اقدام

**محدودیت‌ها:**
- طول: ۱۲۰۰ تا ۱۵۰۰ کلمه
- لحن: حرفه‌ای اما قابل درک
- از کلمات زائد و صدای مجهول پرهیز کنید
- بدون عبارات کلیشه‌ای هوش مصنوعی

**موضوع:** [موضوع خود را اینجا وارد کنید]`,

  problems: [
    'نقشی تعریف نشده — AI نمی‌داند از چه صدای متخصصانه‌ای استفاده کند و خروجی عمومی می‌شود',
    'فعل اقدام مبهم — کلماتی مثل «بنویس»، «کمک کن»، «بساز» بدون جزئیات، AI را سردرگم می‌کنند',
    'مخاطب مشخص نشده — محتوا برای یک مدیر ارشد کاملاً با محتوا برای یک مبتدی متفاوت است',
    'قالب خروجی تعریف نشده — آیا نتیجه باید markdown باشد؟ متن ساده؟ لیست گلوله‌ای؟ مقاله؟',
    'تعداد کلمه تعیین نشده — AI ممکن است ۳ جمله یا ۳۰۰۰ کلمه بنویسد با اطمینان یکسان',
    'راهنمای لحن وجود ندارد — «حرفه‌ای»، «غیررسمی»، «فنی»، «متقاعدکننده» خروجی‌های کاملاً متفاوتی تولید می‌کنند',
    'معیار موفقیت مشخص نشده — AI استانداردی برای سنجش کیفیت ندارد',
  ],

  structureExplanation: `**هدف** — نتیجه مشخص و یگانه‌ای که می‌خواهید. نه «یک مقاله بنویس» بلکه «یک مقاله ۱۲۰۰ کلمه‌ای بنویس که برای کلمه کلیدی X رتبه بگیرد و خوانندگان را ثبت‌نام کند.»

**نقش** — AI باید چه کسی باشد. «شما یک کپی‌رایتر ارشد هستید که برای برندهای Fortune 500 نوشته‌اید» بسیار قدرتمندتر از خالی گذاشتن این بخش است.

**زمینه** — AI به چه پیش‌زمینه‌ای نیاز دارد؟ مخاطب هدف، صنعت، لحن، محدودیت‌های موجود، چه چیزی نباید گفته شود.

**قالب خروجی** — ساختار دقیق: Markdown؟ JSON؟ لیست شماره‌دار؟ جدول؟ کد؟ تعیین این موضوع از تصمیم‌گیری AI جلوگیری می‌کند.

**محدودیت‌ها** — سقف‌های سختی که نباید از آن‌ها عبور کرد: حداکثر تعداد کلمه، عبارات خاصی که باید از آن‌ها اجتناب شود، راهنمای برند، سطح خوانایی.

**مثال‌ها** — حتی یک مثال از خروجی خوب کیفیت را ۴۰ تا ۶۰ درصد بهبود می‌دهد. به AI نشان دهید «درست» چه شکلی است.

**لحن** — حرفه‌ای، غیررسمی، همدلانه، قاطع، فنی؟ با هر لحن، انتخاب کلمات کاملاً تغییر می‌کند.

**زبان** — کدام زبان؟ چه سطح رسمیتی؟ (فارسی رسمی در مقابل فارسی محاوره‌ای)`,

  tokenSavingTips: [
    'عبارات شروع را حذف کنید: «می‌خواستم از شما بخواهم که لطفاً...» → «بنویس:» (بیش از ۱۲ توکن صرفه‌جویی)',
    'از مود دستوری استفاده کنید: «می‌توانید X را توضیح دهید؟» → «X را توضیح بده» (حدود ۴ توکن کمتر)',
    'الزامات را به جای نثر، با نقاط گلوله‌ای بنویسید — ۶۰٪ توکن کمتر برای همان اطلاعات',
    'از اختصاراتی که AI می‌شناسد استفاده کنید: «SEO»، «CTA»، «B2B»، «API» به جای عبارات کامل',
    'برای قالب‌ها از مخفف‌ها استفاده کنید: «۵x گلوله»، «جدول ۳ ستونه»، «آرایه JSON» به جای توضیحات طولانی',
    'توکن‌های ادب را حذف کنید: «لطفاً»، «ممنون»، «اگر وقت داشتید» هیچ ارزشی به پاسخ AI اضافه نمی‌کنند',
  ],

  shortOptimizedPrompt: `به عنوان [نقش] عمل کن. [خروجی مشخص] برای [مخاطب] بنویس. قالب: [قالب]. حداکثر [تعداد کلمه]. لحن: [لحن]. از [موارد استثنا] اجتناب کن. موضوع: [موضوع].`,

  detailedOptimizedPrompt: `# نقش
شما یک [نقش] سطح جهانی با تخصص عمیق در [حوزه] هستید. شما [تجربه/دستاورد مرتبط] دارید.

# وظیفه
[توضیح واضح و مشخص از آنچه باید تولید شود — قابل اندازه‌گیری و بدون ابهام]

# زمینه
- مخاطب هدف: [چه کسی — سطح دانش، اهداف، نقاط درد آن‌ها]
- هدف: [چرا این محتوا ایجاد می‌شود]
- پلتفرم/رسانه: [کجا منتشر یا استفاده می‌شود]

# مشخصات خروجی
- قالب: [قالب دقیق — markdown، JSON، متن ساده، HTML]
- طول: [تعداد کلمه/کاراکتر دقیق یا بازه]
- ساختار: [بخش‌های دقیق مورد نیاز]
- زبان: [زبان + سطح رسمیت]

# معیارهای کیفیت
خروجی شما باید:
✓ [معیار کیفیت مشخص ۱]
✓ [معیار کیفیت مشخص ۲]
✓ [معیار کیفیت مشخص ۳]

# محدودیت‌ها
انجام بده: [محدودیت‌های مثبت — چه چیزی را باید شامل شود]
اجتناب کن از: [محدودیت‌های منفی — چه چیزی را نباید شامل شود]

# مثال مرجع
نمونه سبک/لحن: "[یک مثال ۲ تا ۳ جمله‌ای از صدای مطلوب]"`,

  suggestedQuestions: [
    'مهم‌ترین نتیجه‌ای که از این محتوا می‌خواهید چیست؟ (مشخص باشید — چه کسی آن را می‌خواند و چه اقدامی باید انجام دهد؟)',
    'مخاطب هدف دقیق شما کیست و چقدر درباره این موضوع می‌داند؟',
    'به چه قالبی نیاز دارید؟ (مقاله markdown، پست شبکه اجتماعی، ایمیل، داده JSON، کد، جدول...)',
    'آیا محدودیت تعداد کلمه، طول کاراکتر یا محدودیت زمانی برای خروجی وجود دارد؟',
    'می‌توانید یک مثال از محتوایی که آن را ۹ از ۱۰ امتیاز می‌دهید ارائه دهید تا من آن سبک را دنبال کنم؟',
  ],
};

export async function getMockAIResponse(
  _input: string,
  language: Language
): Promise<AIResponse> {
  await new Promise(resolve => setTimeout(resolve, 1400 + Math.random() * 600));
  return language === 'fa' ? mockFa : mockEn;
}
