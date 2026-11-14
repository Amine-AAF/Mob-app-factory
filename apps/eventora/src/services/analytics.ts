import { createAnalytics, createConsoleProvider, type AnalyticsProvider } from '@factory/analytics';

/**
 * Anonymous product events. Typed so call sites can't drift. Params never
 * contain names, contacts, amounts or free text: only ids of bundled content,
 * counts and enums. No provider is registered in production until the factory
 * analytics setup is done, so by default nothing leaves the device.
 */
export type ProductEvent =
  | { name: 'onboarding_completed'; params: { ui_language: string } }
  | { name: 'event_created'; params: { type: string; template: string } }
  | { name: 'event_duplicated'; params: { type: string } }
  | { name: 'guests_imported'; params: { count: number } }
  | { name: 'invitation_shared'; params: { template: string; format: string } }
  | { name: 'report_exported'; params: { report: string; format: string } }
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
