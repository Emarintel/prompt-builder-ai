import { AIResponse, Language, PromptMode } from '../types';

const TIMEOUT_MS = 60_000; // 60 s — server has 55 s, so client always gets a clean error first

export async function analyzePrompt(
  input: string,
  language: Language,
  mode: PromptMode = 'chatgpt'
): Promise<AIResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, language, mode }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error ?? `Server error: HTTP ${res.status}`);
  }

  const data = await res.json() as AIResponse;

  if (import.meta.env.DEV) {
    console.log('[analyzePrompt] response:', data);
  }

  return data;
}
