import { createAnalytics, createConsoleProvider, type AnalyticsProvider } from '@factory/analytics';

/**
 * Anonymous product events, typed so call sites can't drift from the catalogue
 * documented in apps/autocare/store/data-safety.md.
 *
 * NEVER sent: vehicle make/model, plate, VIN, mileage, amounts, station or garage
 * names, notes, documents — nothing about the vehicles themselves. Nothing is sent
 * before consent (enforced by @factory/analytics, which also strips PII-like params),
 * and no provider is registered in production until one is configured explicitly.
 */
export type ProductEvent =
  | { name: 'onboarding_completed'; params: { ui_language: string; distance_unit: string } }
  | { name: 'vehicle_added'; params: { fuel_type: string; count: number } }
  | { name: 'fuel_added'; params: { full: boolean } }
  | { name: 'expense_added'; params: { category: string } }
  | { name: 'maintenance_added'; params: { type: string } }
  | { name: 'report_exported'; params: { format: string } }
  | { name: 'premium_viewed'; params: { source: string } }
  | { name: 'purchase_started'; params: { plan: string } }
  | { name: 'purchase_completed'; params: { plan: string } };

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

/** Errors are logged by context only (never with user data). */
export function recordError(error: unknown, context?: string): void {
  analytics.recordError(error, context);
  if (__DEV__ && process.env.NODE_ENV !== 'test') console.warn(`[error] ${context ?? ''}`, error instanceof Error ? error.message : 'unknown');
}
