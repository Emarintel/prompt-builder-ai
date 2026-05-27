import { AIResponse, Language, PromptMode } from '../types';

const TIMEOUT_MS = 50_000; // 50 s — server hard-stops at 45 s, so client always gets a clean error

export async function analyzePrompt(
  input: string,
  language: Language,
  mode: PromptMode = 'chatgpt'
): Promise<AIResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // Single outer try/finally so the abort timer stays active through res.json() too.
  // The previous structure cleared the timer after fetch() resolved but before
  // res.json() completed, leaving the body-read phase with no timeout.
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, language, mode }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null) as { error?: string } | null;
      throw new Error(body?.error ?? `Server error: HTTP ${res.status}`);
    }

    const data = await res.json() as AIResponse;

    if (import.meta.env.DEV) {
      console.log('[analyzePrompt] response:', data);
    }

    return data;
  } finally {
    clearTimeout(timer);
  }
}
