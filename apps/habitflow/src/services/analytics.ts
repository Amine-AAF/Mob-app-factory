import { createAnalytics, createConsoleProvider, type AnalyticsProvider } from '@factory/analytics';

/**
 * Anonymous product events, typed so call sites can't drift from the catalogue
 * documented in apps/habitflow/store/data-safety.md. Never habit names, notes,
 * task titles or per-day details; nothing is sent before consent (enforced by
 * @factory/analytics, which also strips PII-looking parameters).
 */
export type ProductEvent =
  | { name: 'onboarding_completed'; params: { ui_language: string; goals: number; habits_added: number; reminder: boolean } }
  | { name: 'habit_created'; params: { category: string; frequency: string; tracking: string; from_template: boolean } }
  | { name: 'habit_completed'; params: { tracking: string; backfill: boolean } }
  | { name: 'habit_archived'; params: { category: string } }
  | { name: 'planner_task_created'; params: { priority: string; linked: boolean } }
  | { name: 'calendar_opened'; params: { view: string } }
  | { name: 'achievement_unlocked'; params: { achievement_id: string } }
  | { name: 'premium_viewed'; params: { source: string } }
  | { name: 'purchase_started'; params: { plan: string } }
  | { name: 'purchase_completed'; params: { plan: string } };

const providers: AnalyticsProvider[] = [];
if (__DEV__ && process.env.NODE_ENV !== 'test') providers.push(createConsoleProvider());
// Production: register a Firebase provider here once configured (factory/documentation/analytics.md).
// Until then no data leaves the device.

const analytics = createAnalytics({ providers, consent: false });

export function track<E extends ProductEvent>(name: E['name'], params: E['params']): void {
  try {
    analytics.track(name, params as Record<string, string | number | boolean>);
  } catch {
    // Analytics must never break the app.
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
