import { createAnalytics, createConsoleProvider, type AnalyticsProvider } from '@factory/analytics';

/**
 * Anonymous product events, typed so call sites can't drift from the catalogue
 * documented in apps/booknest/store/data-safety.md. NEVER book titles, authors,
 * notes, quotes, reviews, journal text or tags. Nothing is sent before consent
 * (enforced by @factory/analytics, which also strips PII-looking parameters).
 */
export type ProductEvent =
  | { name: 'onboarding_completed'; params: { ui_language: string; yearly_goal: boolean; reminder: boolean } }
  | { name: 'book_added'; params: { format: string; source: string; has_cover: boolean } }
  | { name: 'book_completed'; params: { format: string; reread: boolean } }
  | { name: 'session_logged'; params: { source: string; minutes_bucket: string } }
  | { name: 'goal_created'; params: { type: string; challenge: boolean } }
  | { name: 'goal_reached'; params: { type: string } }
  | { name: 'quote_added'; params: { with_page: boolean } }
  | { name: 'journal_entry_added'; params: { kind: string } }
  | { name: 'import_completed'; params: { kind: string; rows: number } }
  | { name: 'export_completed'; params: { kind: string } }
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

/** Errors are reported with a context label only — never with user content. */
export function recordError(error: unknown, context?: string): void {
  analytics.recordError(error, context);
  if (__DEV__ && process.env.NODE_ENV !== 'test') console.warn(`[error] ${context ?? ''}`, error);
}

export function minutesBucket(seconds: number): string {
  const m = seconds / 60;
  return m < 10 ? '<10' : m < 30 ? '10-30' : m < 60 ? '30-60' : '60+';
}
