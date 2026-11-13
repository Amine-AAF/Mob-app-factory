import { createAnalytics, createConsoleProvider, type AnalyticsProvider } from '@factory/analytics';

/**
 * Anonymous product events only. The catalogue is typed so no call site can send
 * personal content: no names, destinations, booking references, documents,
 * addresses, amounts or photos. Parameters are coarse enums or small counts.
 */
export type ProductEvent =
  | { name: 'onboarding_completed'; params: { ui_language: string; created_trip: boolean } }
  | { name: 'trip_created'; params: { trip_type: string; destinations: number; from: 'onboarding' | 'app' | 'duplicate' } }
  | { name: 'itinerary_created'; params: { days: number } }
  | { name: 'activity_added'; params: { category: string } }
  | { name: 'booking_added'; params: { booking_type: string } }
  | { name: 'checklist_completed'; params: { kind: 'packing' | 'tasks' } }
  | { name: 'budget_created'; params: { categories: number } }
  | { name: 'export_completed'; params: { format: 'pdf' | 'csv' } }
  | { name: 'premium_viewed'; params: { source: string } }
  | { name: 'purchase_completed'; params: { plan: string } };

const providers: AnalyticsProvider[] = [];
if (__DEV__ && process.env.NODE_ENV !== 'test') providers.push(createConsoleProvider());
// Production: no provider is registered, so no event leaves the device until a
// provider (e.g. Firebase) is explicitly added AND the user opts in.

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

/** Records the error type only (no message: messages could contain user content). */
export function recordError(error: unknown, context?: string): void {
  const safe = new Error(error instanceof Error ? error.name : 'Error');
  analytics.recordError(safe, context);
  if (__DEV__ && process.env.NODE_ENV !== 'test') console.warn(`[error] ${context ?? ''}`, error);
}
