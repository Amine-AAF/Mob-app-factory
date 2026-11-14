import { createAnalytics, createConsoleProvider, type AnalyticsProvider } from '@factory/analytics';

/**
 * Anonymous product events. Typed so call sites can't drift. Parameters are
 * coarse counters and ids of BUNDLED content only: never recipe titles,
 * ingredients, notes, list contents or anything the user typed.
 * Off by default; only sent with the user's consent and a registered provider.
 */
export type ProductEvent =
  | { name: 'onboarding_completed'; params: { ui_language: string; unit_system: string; diet: string } }
  | { name: 'recipe_created'; params: { source: 'manual' | 'import' | 'duplicate' } }
  | { name: 'meal_planned'; params: { slot: string; builtin: boolean } }
  | { name: 'template_applied'; params: { template_id: string } }
  | { name: 'grocery_generated'; params: { items: number; days: number } }
  | { name: 'cooking_mode_completed'; params: { builtin: boolean } }
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

export function recordError(error: unknown, context?: string): void {
  try {
    analytics.recordError(error, context);
  } catch {
    // ignore
  }
  if (__DEV__ && process.env.NODE_ENV !== 'test') console.warn(`[error] ${context ?? ''}`, error);
}
