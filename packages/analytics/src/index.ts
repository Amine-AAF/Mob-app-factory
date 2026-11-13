/**
 * Consent-aware, provider-agnostic analytics facade.
 *
 * - Event names are snake_case and validated.
 * - Parameters are restricted to primitives and filtered against a PII denylist.
 * - Nothing is sent until consent is granted (events before consent are dropped, not queued).
 * - Providers are injected, so apps that don't use Firebase don't depend on it.
 */
export type AnalyticsParams = Record<string, string | number | boolean>;

export interface AnalyticsProvider {
  name: string;
  logEvent(name: string, params?: AnalyticsParams): Promise<void> | void;
  setCollectionEnabled?(enabled: boolean): Promise<void> | void;
  recordError?(error: Error, context?: string): Promise<void> | void;
}

export interface Analytics {
  track(name: string, params?: AnalyticsParams): void;
  recordError(error: unknown, context?: string): void;
  setConsent(granted: boolean): void;
  readonly consent: boolean;
}

const EVENT_NAME = /^[a-z][a-z0-9_]{0,39}$/;
const PII_KEYS = /(e-?mail|phone|name|address|ip|password|token|device_?id|advertising_?id|lat|lng|location)/i;

export function sanitizeParams(params: AnalyticsParams | undefined): AnalyticsParams | undefined {
  if (!params) return undefined;
  const out: AnalyticsParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (PII_KEYS.test(key)) continue;
    if (typeof value === 'string') out[key] = value.slice(0, 100);
    else if (typeof value === 'number' && Number.isFinite(value)) out[key] = value;
    else if (typeof value === 'boolean') out[key] = value;
  }
  return out;
}

export function createAnalytics(opts: {
  providers: AnalyticsProvider[];
  consent?: boolean;
  onProviderError?: (provider: string, error: unknown) => void;
}): Analytics {
  let consent = opts.consent ?? false;
  const safe = (provider: AnalyticsProvider, fn: () => unknown) => {
    try {
      const r = fn();
      if (r && typeof (r as Promise<void>).catch === 'function') {
        (r as Promise<void>).catch((e) => opts.onProviderError?.(provider.name, e));
      }
    } catch (e) {
      opts.onProviderError?.(provider.name, e);
    }
  };

  return {
    get consent() {
      return consent;
    },
    track(name, params) {
      if (!EVENT_NAME.test(name)) throw new Error(`Invalid analytics event name: ${name}`);
      if (!consent) return;
      const clean = sanitizeParams(params);
      opts.providers.forEach((p) => safe(p, () => p.logEvent(name, clean)));
    },
    recordError(error, context) {
      if (!consent) return;
      const err = error instanceof Error ? error : new Error(String(error));
      opts.providers.forEach((p) => p.recordError && safe(p, () => p.recordError?.(err, context)));
    },
    setConsent(granted) {
      consent = granted;
      opts.providers.forEach((p) => p.setCollectionEnabled && safe(p, () => p.setCollectionEnabled?.(granted)));
    },
  };
}

/** Logs to the console in development. */
// eslint-disable-next-line no-console -- development-only provider
export function createConsoleProvider(log: (msg: string) => void = console.log): AnalyticsProvider {
  return {
    name: 'console',
    logEvent: (name, params) => log(`[analytics] ${name} ${params ? JSON.stringify(params) : ''}`),
    recordError: (error, context) => log(`[analytics:error] ${context ?? ''} ${error.message}`),
  };
}

/** Records events in memory (tests). */
export function createMemoryProvider(): AnalyticsProvider & { events: { name: string; params?: AnalyticsParams }[] } {
  const events: { name: string; params?: AnalyticsParams }[] = [];
  return {
    name: 'memory',
    events,
    logEvent: (name, params) => void events.push(params ? { name, params } : { name }),
  };
}

/**
 * Firebase adapter. The app injects the modular Firebase functions so this
 * package has no hard dependency on @react-native-firebase. See
 * factory/documentation/firebase.md for wiring instructions.
 */
export interface FirebaseModules {
  logEvent(name: string, params?: AnalyticsParams): Promise<void>;
  setAnalyticsCollectionEnabled(enabled: boolean): Promise<void>;
  recordError?(error: Error, context?: string): void;
  setCrashlyticsCollectionEnabled?(enabled: boolean): Promise<void>;
}

export function createFirebaseProvider(fb: FirebaseModules): AnalyticsProvider {
  return {
    name: 'firebase',
    logEvent: (name, params) => fb.logEvent(name, params),
    setCollectionEnabled: async (enabled) => {
      await fb.setAnalyticsCollectionEnabled(enabled);
      await fb.setCrashlyticsCollectionEnabled?.(enabled);
    },
    recordError: (error, context) => fb.recordError?.(error, context),
  };
}
