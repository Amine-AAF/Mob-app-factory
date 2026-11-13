import { createAnalytics, createConsoleProvider, type AnalyticsProvider } from '@factory/analytics';

/**
 * Product events (anonymous, opt-in). Typed so call sites can't drift from the catalogue.
 * Never include names, titles, notes, amounts, addresses, file names or any document content:
 * only enumerated values (categories, counts, plan ids).
 */
export type ProductEvent =
  | { name: 'onboarding_completed'; params: { home_type: string; ui_language: string } }
  | { name: 'asset_created'; params: { category: string } }
  | { name: 'maintenance_completed'; params: { category: string; from_template: boolean } }
  | { name: 'template_used'; params: { template_id: string } }
  | { name: 'document_imported'; params: { type: string } }
  | { name: 'expense_added'; params: { category: string; recurring: boolean } }
  | { name: 'export_created'; params: { kind: string } }
  | { name: 'premium_paywall_viewed'; params: { source: string } }
  | { name: 'subscription_started'; params: { plan: string } };

const providers: AnalyticsProvider[] = [];
if (__DEV__ && process.env.NODE_ENV !== 'test') providers.push(createConsoleProvider());
// Production: register a provider here once configured (see factory/documentation/analytics.md).
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

/** Logs an error without personal data: only the error class/message and a static context. */
export function recordError(error: unknown, context?: string): void {
  analytics.recordError(error, context);
  if (__DEV__ && process.env.NODE_ENV !== 'test') console.warn(`[error] ${context ?? ''}`, error instanceof Error ? error.message : 'unknown');
}
