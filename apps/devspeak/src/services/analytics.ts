import { createAnalytics, createConsoleProvider, type AnalyticsProvider } from '@factory/analytics';

/**
 * Product events (anonymous). Typed so call sites can't drift from the
 * documented event catalogue in factory/documentation/analytics.md.
 */
export type ProductEvent =
  | { name: 'onboarding_completed'; params: { level: string; role: string; ui_language: string } }
  | { name: 'lesson_started'; params: { lesson_id: string; module: string } }
  | { name: 'lesson_completed'; params: { lesson_id: string; module: string; score: number; first_time: boolean } }
  | { name: 'quiz_completed'; params: { owner: string; score: number } }
  | { name: 'vocabulary_saved'; params: { word_id: string } }
  | { name: 'daily_challenge_completed'; params: { challenge_id: string } }
  | { name: 'premium_paywall_viewed'; params: { source: string } }
  | { name: 'subscription_started'; params: { plan: string } };

const providers: AnalyticsProvider[] = [];
if (__DEV__ && process.env.NODE_ENV !== 'test') providers.push(createConsoleProvider());
// Production: register the Firebase provider here once google-services.json is configured
// (see factory/documentation/firebase.md). Until then no data leaves the device.

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
  if (__DEV__) console.warn(`[error] ${context ?? ''}`, error);
}

export function registerAnalyticsProvider(provider: AnalyticsProvider): void {
  providers.push(provider);
}
