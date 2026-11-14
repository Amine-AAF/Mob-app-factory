import { createAnalytics, createConsoleProvider, type AnalyticsProvider } from '@factory/analytics';

/**
 * Anonymous product events only. The typed catalogue below is the ONLY thing that can be sent:
 * no amounts, currencies of transactions, account names, descriptions, custom category names,
 * balances or history — parameters are limited to enums and booleans.
 * Nothing is sent without the user's opt-in consent (default: off).
 */
export type ProductEvent =
  | { name: 'onboarding_completed'; params: { created_account: boolean; created_budget: boolean } }
  | { name: 'transaction_created'; params: { type: 'expense' | 'income' | 'transfer' | 'refund' | 'adjustment' } }
  | { name: 'budget_created'; params: { copied: boolean } }
  | { name: 'savings_goal_created'; params: Record<string, never> }
  | { name: 'subscription_added'; params: Record<string, never> }
  | { name: 'report_opened'; params: { period: 'week' | 'month' | 'year' } }
  | { name: 'premium_viewed'; params: { source: string } }
  | { name: 'purchase_completed'; params: { plan: string } };

const providers: AnalyticsProvider[] = [];
if (__DEV__ && process.env.NODE_ENV !== 'test') providers.push(createConsoleProvider());
// Production: a Firebase provider can be registered once configured (factory/documentation/analytics.md).
// Until then, no event leaves the device.

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

/** Errors are recorded with a context label only (never with user data). */
export function recordError(error: unknown, context?: string): void {
  analytics.recordError(error instanceof Error ? new Error(error.name) : new Error('error'), context);
  if (__DEV__ && process.env.NODE_ENV !== 'test') console.warn(`[error] ${context ?? ''}`, error);
}

export function registerAnalyticsProvider(provider: AnalyticsProvider): void {
  providers.push(provider);
}
