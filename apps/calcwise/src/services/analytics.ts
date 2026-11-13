import { createAnalytics, createConsoleProvider, type AnalyticsProvider } from '@factory/analytics';

import type { ToolId } from '@/constants/tools';

/**
 * Anonymous product events only. Parameters are restricted by type to tool ids,
 * modes and plan periods: expressions, amounts, rates, results and history can
 * never be passed (there is no parameter that could carry them).
 * Nothing is sent without the user's opt-in, and no remote provider is wired in 1.0.
 */
export type ProductEvent =
  | { name: 'calculator_opened'; params: { mode: 'standard' | 'scientific' } }
  | { name: 'calculation_completed'; params: { tool: ToolId } }
  | { name: 'tool_used'; params: { tool: ToolId } }
  | { name: 'premium_screen_viewed'; params: { source: string } }
  | { name: 'purchase_started'; params: { period: string } }
  | { name: 'purchase_completed'; params: { period: string } };

const providers: AnalyticsProvider[] = [];
if (__DEV__ && process.env.NODE_ENV !== 'test') providers.push(createConsoleProvider());
// Production: register a provider here (see factory/documentation/analytics.md). Until then
// no event leaves the device even with consent.

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

export function registerAnalyticsProvider(provider: AnalyticsProvider): void {
  providers.push(provider);
}
