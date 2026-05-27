export interface CostBreakdown {
  inputTokens: number;
  outputTokens: number;
  inputCostUsd: number;
  outputCostUsd: number;
  totalCostUsd: number;
  savingsTokens: number;
  savingsCostUsd: number;
}

// System prompt + message template overhead (approximate)
const SYSTEM_OVERHEAD = 750;
const INPUT_RATE  = 3  / 1_000_000; // $3  per 1M input tokens  (Claude Sonnet)
const OUTPUT_RATE = 15 / 1_000_000; // $15 per 1M output tokens (Claude Sonnet)

// Persian/Arabic chars tokenize at ~0.6 tok/char; Latin ~0.27 tok/char
export function estimateTokens(text: string): number {
  if (!text.trim()) return 0;
  const persian = (text.match(/[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/g) ?? []).length;
  return Math.max(1, Math.round(persian * 0.6 + (text.length - persian) * 0.27));
}

export function formatCost(usd: number): string {
  if (usd < 0.0001) return '<$0.0001';
  if (usd < 0.01)   return `$${usd.toFixed(4)}`;
  if (usd < 1)      return `$${usd.toFixed(3)}`;
  return `$${usd.toFixed(2)}`;
}

export function estimateCost(inputText: string, shortOptimized?: string): CostBreakdown {
  const userTokens   = estimateTokens(inputText);
  const inputTokens  = userTokens + SYSTEM_OVERHEAD;
  const outputTokens = Math.min(Math.round(userTokens * 1.2 + 600), 2500);
  const inputCostUsd  = inputTokens  * INPUT_RATE;
  const outputCostUsd = outputTokens * OUTPUT_RATE;
  const totalCostUsd  = inputCostUsd + outputCostUsd;

  const savingsTokens  = shortOptimized ? Math.max(0, userTokens - estimateTokens(shortOptimized)) : 0;
  const savingsCostUsd = savingsTokens * INPUT_RATE;

  return { inputTokens, outputTokens, inputCostUsd, outputCostUsd, totalCostUsd, savingsTokens, savingsCostUsd };
}
