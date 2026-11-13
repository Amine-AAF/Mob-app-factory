import { createAnalytics, createConsoleProvider, type AnalyticsProvider } from '@factory/analytics';

/**
 * Anonymous product events only. Never send note text, card content, subject names,
 * quiz answers or any learning content: parameters are ids, counts and enums.
 * No provider is registered in production builds, so nothing leaves the device by default.
 */
export type ProductEvent =
  | { name: 'onboarding_completed'; params: { ui_language: string; daily_minutes: number } }
  | { name: 'template_applied'; params: { template_id: string } }
  | { name: 'quiz_completed'; params: { bank: string; mode: string; score: number } }
  | { name: 'flashcards_reviewed'; params: { count: number } }
  | { name: 'focus_completed'; params: { preset: string; minutes: number } }
  | { name: 'premium_paywall_viewed'; params: { source: string } }
  | { name: 'subscription_started'; params: { plan: string } };

const providers: AnalyticsProvider[] = [];
if (__DEV__ && process.env.NODE_ENV !== 'test') providers.push(createConsoleProvider());

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
