import { AIResponse, Language, PromptMode } from '../types';

export async function analyzePrompt(
  input: string,
  language: Language,
  mode: PromptMode = 'chatgpt'
): Promise<AIResponse> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, language, mode }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error ?? `Server error: HTTP ${res.status}`);
  }

  return res.json() as Promise<AIResponse>;
}
