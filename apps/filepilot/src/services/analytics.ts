import { createAnalytics, createConsoleProvider, type AnalyticsProvider } from '@factory/analytics';

/**
 * Anonymous product events. The catalogue is typed so call sites cannot attach
 * file names, paths, document content or personal metadata: parameters are
 * limited to tool identifiers, formats and coarse buckets.
 */
export type SizeBucket = 'lt_100kb' | 'lt_1mb' | 'lt_5mb' | 'lt_20mb' | 'gte_20mb';

export function sizeBucket(bytes: number): SizeBucket {
  if (bytes < 100_000) return 'lt_100kb';
  if (bytes < 1_000_000) return 'lt_1mb';
  if (bytes < 5_000_000) return 'lt_5mb';
  if (bytes < 20_000_000) return 'lt_20mb';
  return 'gte_20mb';
}

export function countBucket(n: number): string {
  return n <= 1 ? '1' : n <= 5 ? '2_5' : n <= 20 ? '6_20' : '21_plus';
}

export type ProductEvent =
  | { name: 'tool_opened'; params: { tool: string } }
  | { name: 'file_selected'; params: { tool: string; kind: 'image' | 'pdf'; count: string } }
  | { name: 'compression_completed'; params: { format: string; size_bucket: SizeBucket; saved_percent: number; batch: boolean; target_size: boolean } }
  | { name: 'resize_completed'; params: { format: string; mode: string } }
  | { name: 'conversion_completed'; params: { from: string; to: string } }
  | { name: 'pdf_merge_completed'; params: { files: string } }
  | { name: 'pdf_split_completed'; params: { mode: string; parts: string } }
  | { name: 'pdf_extract_completed'; params: { pages: string } }
  | { name: 'image_to_pdf_completed'; params: { images: string; page_size: string } }
  | { name: 'pdf_to_images_completed'; params: { pages: string; format: string } }
  | { name: 'operation_failed'; params: { tool: string; code: string } }
  | { name: 'premium_paywall_viewed'; params: { source: string } }
  | { name: 'subscription_started'; params: { plan: string } };

const providers: AnalyticsProvider[] = [];
if (__DEV__ && process.env.NODE_ENV !== 'test') providers.push(createConsoleProvider());
// Production: register a provider (e.g. Firebase) here once configured — see
// factory/documentation/analytics.md. Until then, no analytics data leaves the device.

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

/** Error reporting: only the error class and context, never file names or content. */
export function recordError(error: unknown, context?: string): void {
  const safe = error instanceof Error ? new Error(error.name) : new Error('non_error_thrown');
  analytics.recordError(safe, context);
  if (__DEV__ && process.env.NODE_ENV !== 'test') console.warn(`[error] ${context ?? ''}`, error);
}

export function registerAnalyticsProvider(provider: AnalyticsProvider): void {
  providers.push(provider);
}
