import { OutputCard } from './OutputCard';
import { AIResponse, Language } from '../types';
import { Translations } from '../locales/en';

interface Props {
  response: AIResponse;
  language: Language;
  t: Pick<Translations, 'sections' | 'descriptions' | 'copy' | 'copied'>;
}

interface CardConfig {
  key: keyof AIResponse;
  icon: string;
  accentClass: string;
  delay: string;
}

const CARD_CONFIG: CardConfig[] = [
  {
    key: 'professionalPrompt',
    icon: '✨',
    accentClass: 'bg-indigo-100 dark:bg-indigo-900/30',
    delay: '0ms',
  },
  {
    key: 'problems',
    icon: '⚠️',
    accentClass: 'bg-red-100 dark:bg-red-900/30',
    delay: '60ms',
  },
  {
    key: 'structureExplanation',
    icon: '🏗️',
    accentClass: 'bg-blue-100 dark:bg-blue-900/30',
    delay: '100ms',
  },
  {
    key: 'tokenSavingTips',
    icon: '⚡',
    accentClass: 'bg-amber-100 dark:bg-amber-900/30',
    delay: '140ms',
  },
  {
    key: 'shortOptimizedPrompt',
    icon: '✂️',
    accentClass: 'bg-green-100 dark:bg-green-900/30',
    delay: '180ms',
  },
  {
    key: 'detailedOptimizedPrompt',
    icon: '📋',
    accentClass: 'bg-purple-100 dark:bg-purple-900/30',
    delay: '220ms',
  },
  {
    key: 'suggestedQuestions',
    icon: '💬',
    accentClass: 'bg-pink-100 dark:bg-pink-900/30',
    delay: '260ms',
  },
];

const SECTION_TITLE_MAP: Record<string, keyof Translations['sections']> = {
  professionalPrompt: 'professionalPrompt',
  problems: 'problems',
  structureExplanation: 'structure',
  tokenSavingTips: 'tokenSaving',
  shortOptimizedPrompt: 'shortVersion',
  detailedOptimizedPrompt: 'detailedVersion',
  suggestedQuestions: 'suggestedQuestions',
};

const SECTION_DESC_MAP: Record<string, keyof Translations['descriptions']> = {
  professionalPrompt: 'professionalPrompt',
  problems: 'problems',
  structureExplanation: 'structure',
  tokenSavingTips: 'tokenSaving',
  shortOptimizedPrompt: 'shortVersion',
  detailedOptimizedPrompt: 'detailedVersion',
  suggestedQuestions: 'suggestedQuestions',
};

export function OutputPanel({ response, language, t }: Props) {
  return (
    <div className="space-y-3">
      {/* Professional Prompt — full width */}
      <OutputCard
        title={t.sections[SECTION_TITLE_MAP['professionalPrompt']]}
        description={t.descriptions[SECTION_DESC_MAP['professionalPrompt']]}
        icon={CARD_CONFIG[0].icon}
        content={response.professionalPrompt}
        language={language}
        accentClass={CARD_CONFIG[0].accentClass}
        t={t}
        animationDelay={CARD_CONFIG[0].delay}
      />

      {/* Problems + Structure — 2 col on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <OutputCard
          title={t.sections[SECTION_TITLE_MAP['problems']]}
          description={t.descriptions[SECTION_DESC_MAP['problems']]}
          icon={CARD_CONFIG[1].icon}
          content={response.problems}
          language={language}
          accentClass={CARD_CONFIG[1].accentClass}
          t={t}
          animationDelay={CARD_CONFIG[1].delay}
        />
        <OutputCard
          title={t.sections[SECTION_TITLE_MAP['structureExplanation']]}
          description={t.descriptions[SECTION_DESC_MAP['structureExplanation']]}
          icon={CARD_CONFIG[2].icon}
          content={response.structureExplanation}
          language={language}
          accentClass={CARD_CONFIG[2].accentClass}
          t={t}
          animationDelay={CARD_CONFIG[2].delay}
        />
      </div>

      {/* Token Saving — full width */}
      <OutputCard
        title={t.sections[SECTION_TITLE_MAP['tokenSavingTips']]}
        description={t.descriptions[SECTION_DESC_MAP['tokenSavingTips']]}
        icon={CARD_CONFIG[3].icon}
        content={response.tokenSavingTips}
        language={language}
        accentClass={CARD_CONFIG[3].accentClass}
        t={t}
        animationDelay={CARD_CONFIG[3].delay}
      />

      {/* Short + Detailed — 2 col on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <OutputCard
          title={t.sections[SECTION_TITLE_MAP['shortOptimizedPrompt']]}
          description={t.descriptions[SECTION_DESC_MAP['shortOptimizedPrompt']]}
          icon={CARD_CONFIG[4].icon}
          content={response.shortOptimizedPrompt}
          language={language}
          accentClass={CARD_CONFIG[4].accentClass}
          t={t}
          animationDelay={CARD_CONFIG[4].delay}
        />
        <OutputCard
          title={t.sections[SECTION_TITLE_MAP['detailedOptimizedPrompt']]}
          description={t.descriptions[SECTION_DESC_MAP['detailedOptimizedPrompt']]}
          icon={CARD_CONFIG[5].icon}
          content={response.detailedOptimizedPrompt}
          language={language}
          accentClass={CARD_CONFIG[5].accentClass}
          t={t}
          animationDelay={CARD_CONFIG[5].delay}
        />
      </div>

      {/* Suggested Questions — full width */}
      <OutputCard
        title={t.sections[SECTION_TITLE_MAP['suggestedQuestions']]}
        description={t.descriptions[SECTION_DESC_MAP['suggestedQuestions']]}
        icon={CARD_CONFIG[6].icon}
        content={response.suggestedQuestions}
        language={language}
        accentClass={CARD_CONFIG[6].accentClass}
        t={t}
        animationDelay={CARD_CONFIG[6].delay}
      />
    </div>
  );
}
