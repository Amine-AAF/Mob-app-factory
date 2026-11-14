import { createAnalytics, createConsoleProvider, type AnalyticsProvider } from '@factory/analytics';

/**
 * Anonymous product events (opt-in, off by default). The catalogue is typed so call sites
 * CANNOT attach images, file names, local URIs, EXIF data or any content: parameters are
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

/** Saved-percent rounded to 10 % steps (coarse on purpose). */
export function percentBucket(ratio: number): number {
  return Math.round(Math.max(-1, Math.min(1, ratio)) * 10) * 10;
}

export type ProductEvent =
  | { name: 'image_imported'; params: { source: string; format: string; size_bucket: SizeBucket; count: string } }
  | { name: 'editor_opened'; params: { entry: string } }
  | { name: 'image_cropped'; params: { ratio: string } }
  | { name: 'image_resized'; params: { mode: string; format: string } }
  | { name: 'image_compressed'; params: { format: string; quality: number; saved_percent: number; target_size: boolean } }
  | { name: 'image_converted'; params: { from: string; to: string } }
  | { name: 'collage_created'; params: { template: string; images: string } }
  | { name: 'social_preset_used'; params: { preset: string } }
  | { name: 'batch_completed'; params: { operation: string; files: string; failed: string } }
  | { name: 'export_completed'; params: { tool: string; format: string; destination: string } }
  | { name: 'operation_failed'; params: { tool: string; code: string } }
  | { name: 'premium_viewed'; params: { source: string } }
  | { name: 'purchase_completed'; params: { plan: string } };

const providers: AnalyticsProvider[] = [];
if (__DEV__ && process.env.NODE_ENV !== 'test') providers.push(createConsoleProvider());
// Production: register a provider (e.g. Firebase) here once configured — see
// factory/documentation/analytics.md. Until then, no analytics data leaves the device.

const analytics = createAnalytics({ providers, consent: false });

/** Rejects any parameter value that looks like a path, URI or file name (defence in depth). */
export function isSafeValue(v: string | number | boolean): boolean {
  if (typeof v !== 'string') return true;
  return !/(:\/\/|\/|\\|\.(jpe?g|png|webp|heic|gif)$)/i.test(v);
}

export function track<E extends ProductEvent>(name: E['name'], params: E['params']): void {
  try {
    const safe = Object.fromEntries(Object.entries(params as Record<string, string | number | boolean>).filter(([, v]) => isSafeValue(v)));
    analytics.track(name, safe);
  } catch {
    // Analytics must never break the app.
  }
}

export function setAnalyticsConsent(granted: boolean): void {
  analytics.setConsent(granted);
}

/** Error reporting: only the error class and a context label, never names, paths or content. */
export function recordError(error: unknown, context?: string): void {
  const safe = error instanceof Error ? new Error(error.name) : new Error('non_error_thrown');
  analytics.recordError(safe, context);
  if (__DEV__ && process.env.NODE_ENV !== 'test') console.warn(`[error] ${context ?? ''}`, error);
}

export function registerAnalyticsProvider(provider: AnalyticsProvider): void {
  providers.push(provider);
}
