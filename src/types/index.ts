export interface AIResponse {
  professionalPrompt: string;
  problems: string[];
  structureExplanation: string;
  tokenSavingTips: string[];
  shortOptimizedPrompt: string;
  detailedOptimizedPrompt: string;
  suggestedQuestions: string[];
  confidenceScore?: number;
  stabilityScore?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  stabilityFix?: string;
  stablerRewrite?: string;
  remaining?: number;
  dailyLimit?: number;
}

export interface ScoreCriteria {
  clarity: number;          // 0–15
  context: number;          // 0–15
  specificGoal: number;     // 0–20
  outputFormat: number;     // 0–15
  constraints: number;      // 0–10
  languageQuality: number;  // 0–15
  tokenEfficiency: number;  // 0–10
}

export const SCORE_MAX: ScoreCriteria = {
  clarity: 15,
  context: 15,
  specificGoal: 20,
  outputFormat: 15,
  constraints: 10,
  languageQuality: 15,
  tokenEfficiency: 10,
};

export type ScoreLevel = 'poor' | 'needs-work' | 'fair' | 'good' | 'excellent';

export interface QualityScore {
  total: number;           // 0–100
  breakdown: ScoreCriteria;
  level: ScoreLevel;
  improvements: string[];  // Language-specific actionable tips
}

export interface HistoryItem {
  id: string;
  input: string;
  response: AIResponse;
  language: Language;
  timestamp: number;
}

export type Language = 'en' | 'fa' | 'ar';
export type Theme = 'light' | 'dark';
export type PromptMode = 'chatgpt' | 'claude' | 'claude-code' | 'midjourney' | 'gemini' | 'amazon' | 'agent' | 'business';
export const PROMPT_MODES: PromptMode[] = ['chatgpt', 'claude', 'claude-code', 'midjourney', 'gemini', 'amazon', 'agent', 'business'];
