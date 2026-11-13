import { createAnalytics, createConsoleProvider, type AnalyticsProvider } from '@factory/analytics';

/**
 * Anonymous product events, typed so call sites can't drift from the catalogue
 * documented in apps/fittrack/store/data-safety.md. NEVER body measurements, weights,
 * photos, notes, exercise loads or any health-related value; nothing is sent before
 * consent (enforced by @factory/analytics, which also strips PII-looking parameters).
 */
export type ProductEvent =
  | { name: 'onboarding_completed'; params: { ui_language: string; level: string; goal: string } }
  | { name: 'program_created'; params: { origin: string; type: string } }
  | { name: 'workout_started'; params: { from_program: boolean } }
  | { name: 'workout_completed'; params: { exercises: number; resumed: boolean } }
  | { name: 'cardio_logged'; params: { type: string } }
  | { name: 'timer_used'; params: { kind: string } }
  | { name: 'challenge_started'; params: { challenge_id: string } }
  | { name: 'achievement_unlocked'; params: { achievement_id: string } }
  | { name: 'premium_viewed'; params: { source: string } }
  | { name: 'purchase_started'; params: { plan: string } }
  | { name: 'purchase_completed'; params: { plan: string } };

const providers: AnalyticsProvider[] = [];
if (__DEV__ && process.env.NODE_ENV !== 'test') providers.push(createConsoleProvider());
// Production: register a provider here once configured (factory/documentation/analytics.md).
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
