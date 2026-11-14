import { createAnalytics, createConsoleProvider, type AnalyticsProvider } from '@factory/analytics';

/**
 * Anonymous product events. No item names, brands, photos, prices or destinations are
 * ever sent: only counts and enum values. Disabled until the user opts in.
 */
export type ProductEvent =
  | { name: 'onboarding_completed'; params: { ui_language: string } }
  | { name: 'item_added'; params: { category: string; with_photo: boolean } }
  | { name: 'outfit_saved'; params: { items: number; source: string } }
  | { name: 'suggestion_generated'; params: { preset: string; results: number } }
  | { name: 'outfit_planned'; params: { days_ahead: number } }
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
  try {
    analytics.recordError(error, context);
  } catch {
    // ignore
  }
  if (__DEV__ && process.env.NODE_ENV !== 'test') console.warn(`[error] ${context ?? ''}`, error);
}
