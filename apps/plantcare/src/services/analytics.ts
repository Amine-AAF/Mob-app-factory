import { createAnalytics, createConsoleProvider, type AnalyticsProvider } from '@factory/analytics';

/**
 * Anonymous product events, opt-in only (consent defaults to false). No plant names,
 * notes or photos are ever sent: parameters are ids of enums and counts only.
 * No production provider is registered yet, so nothing leaves the device.
 */
export type ProductEvent =
  | { name: 'onboarding_completed'; params: { ui_language: string; climate: string } }
  | { name: 'plant_added'; params: { category: string; from_library: boolean } }
  | { name: 'task_completed'; params: { type: string } }
  | { name: 'premium_paywall_viewed'; params: { source: string } }
  | { name: 'subscription_started'; params: { plan: string } }
  | { name: 'export_created'; params: { kind: string } };

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
