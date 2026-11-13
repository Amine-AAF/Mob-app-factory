import { dayIndex, type DayKey } from '@factory/app-core';

import { generateChallenge, type DailyGenerator } from './generators';
import { hashString } from './rng';
import type { Challenge, Difficulty } from './types';

/**
 * Daily challenge: one per local calendar day, identical on every device for
 * that date, generated offline. The template rotates with the day index; the
 * puzzle itself is generated from a seed derived from the date.
 */
export interface DailyTemplate {
  id: string;
  difficulty: Difficulty;
  generator: DailyGenerator;
}

export const DAILY_EPOCH: DayKey = '2026-01-01';

export function dailyChallengeId(day: DayKey): string {
  return `daily-${day}`;
}

export function dailyTemplateFor(day: DayKey, templates: readonly DailyTemplate[]): DailyTemplate {
  if (templates.length === 0) throw new Error('No daily templates');
  const idx = ((dayIndex(day, DAILY_EPOCH) % templates.length) + templates.length) % templates.length;
  return templates[idx] as DailyTemplate;
}

export interface DailyChallenge {
  day: DayKey;
  template: DailyTemplate;
  challenge: Challenge;
  /** True when generation failed and a library challenge was used instead. */
  fallback: boolean;
}

/**
 * Deterministic for a given (day, templates, library). `library` provides a
 * fallback so the daily challenge always exists, even in the (tested-against)
 * case where generation fails.
 */
export function dailyChallengeFor(day: DayKey, templates: readonly DailyTemplate[], library: readonly Challenge[]): DailyChallenge {
  const template = dailyTemplateFor(day, templates);
  const id = dailyChallengeId(day);
  const generated = generateChallenge(id, template.generator, template.difficulty, hashString(`logic-quest:${day}`));
  if (generated) return { day, template, challenge: generated, fallback: false };
  const free = library.filter((c) => !c.premium && c.category !== 'memory');
  const pick = free[hashString(day) % Math.max(1, free.length)];
  if (!pick) throw new Error('Empty library');
  return { day, template, challenge: { ...pick, id, premium: false }, fallback: true };
}
