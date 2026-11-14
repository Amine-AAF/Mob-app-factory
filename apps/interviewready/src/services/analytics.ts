import { createAnalytics, createConsoleProvider, type AnalyticsProvider } from '@factory/analytics';

/**
 * Product events (anonymous, opt-in). Typed so call sites cannot drift from the catalogue.
 *
 * PRIVACY RULE: never send what the user typed (answers, notes, drafts), nor their
 * detailed history. Only ids from the bundled content, enums and aggregate numbers.
 */
export type ProductEvent =
  | { name: 'onboarding_completed'; params: { job_role: string; level: string; ui_language: string } }
  | { name: 'job_role_selected'; params: { job_role: string; source: string } }
  | { name: 'question_viewed'; params: { question_id: string; category: string } }
  | { name: 'question_completed'; params: { question_id: string; category: string } }
  | { name: 'quiz_completed'; params: { mode: string; score: number; total: number } }
  | { name: 'mock_interview_started'; params: { job_role: string; level: string; minutes: number } }
  | { name: 'mock_interview_completed'; params: { job_role: string; answered: number; total: number } }
  | { name: 'premium_viewed'; params: { source: string } }
  | { name: 'purchase_completed'; params: { plan: string } }
  | { name: 'rewarded_ad_completed'; params: { placement: string } };

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

export function recordError(error: unknown, context?: string): void {
  analytics.recordError(error, context);
  if (__DEV__) console.warn(`[error] ${context ?? ''}`, error);
}

export function registerAnalyticsProvider(provider: AnalyticsProvider): void {
  providers.push(provider);
}
