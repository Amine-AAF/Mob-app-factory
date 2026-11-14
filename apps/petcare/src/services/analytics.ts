import { createAnalytics, createConsoleProvider, type AnalyticsProvider } from '@factory/analytics';

/**
 * Anonymous product events only. Event parameters are restricted to enums and counts:
 * never pet names, notes, diagnoses, treatments, documents or amounts.
 * Consent is off by default; without a registered provider nothing leaves the device.
 */
export type ProductEvent =
  | { name: 'onboarding_completed'; params: { species: string; ui_language: string } }
  | { name: 'pet_created'; params: { species: string } }
  | { name: 'record_added'; params: { kind: string } }
  | { name: 'template_used'; params: { template_id: string } }
  | { name: 'export_created'; params: { format: string } }
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

/** Records only the error type and a code-defined context: never user data. */
export function recordError(error: unknown, context?: string): void {
  const safe = error instanceof Error ? new Error(error.name) : new Error('unknown');
  analytics.recordError(safe, context);
  if (__DEV__ && process.env.NODE_ENV !== 'test') console.warn(`[error] ${context ?? ''}`, error instanceof Error ? error.message : error);
}
