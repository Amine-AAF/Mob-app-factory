import { createAnalytics, createConsoleProvider, type AnalyticsProvider } from '@factory/analytics';

/**
 * Anonymous product events, typed so call sites can't drift from the catalogue
 * documented in apps/logic-quest/store/data-safety.md. No identifiers, no free
 * text, nothing sent before consent (enforced by @factory/analytics).
 */
export type ProductEvent =
  | { name: 'onboarding_completed'; params: { ui_language: string; starting_difficulty: string } }
  | { name: 'game_started'; params: { mode: string; category: string; difficulty: string; timer: number } }
  | { name: 'game_completed'; params: { mode: string; category: string; answered: number; correct: number; perfect: boolean; end_reason: string } }
  | { name: 'challenge_completed'; params: { challenge_id: string; category: string; difficulty: string; correct: boolean; attempts: number; hint_used: boolean; xp: number } }
  | { name: 'hint_used'; params: { challenge_id: string; category: string; source: string } }
  | { name: 'daily_challenge_completed'; params: { template_id: string; difficulty: string; correct: boolean } }
  | { name: 'achievement_unlocked'; params: { achievement_id: string } }
  | { name: 'premium_paywall_viewed'; params: { source: string } }
  | { name: 'subscription_started'; params: { plan: string } };

const providers: AnalyticsProvider[] = [];
if (__DEV__ && process.env.NODE_ENV !== 'test') providers.push(createConsoleProvider());
// Production: register a Firebase provider here once configured (factory/documentation/analytics.md).
// Until then no data leaves the device.

const analytics = createAnalytics({ providers, consent: false });

export function track<E extends ProductEvent>(name: E['name'], params: E['params']): void {
  try {
    analytics.track(name, params as Record<string, string | number | boolean>);
  } catch {
    // Analytics must never break the game.
  }
}

export function setAnalyticsConsent(granted: boolean): void {
  analytics.setConsent(granted);
}

export function recordError(error: unknown, context?: string): void {
  analytics.recordError(error, context);
  if (__DEV__ && process.env.NODE_ENV !== 'test') console.warn(`[error] ${context ?? ''}`, error);
}

export function registerAnalyticsProvider(provider: AnalyticsProvider): void {
  providers.push(provider);
}
