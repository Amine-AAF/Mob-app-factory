import { z } from 'zod';

/**
 * Application manifest: the single source of truth describing one factory app.
 * Each app owns its manifest; the factory registry only aggregates them.
 */

export const localeSchema = z.enum(['en', 'fr', 'es', 'de', 'pt', 'ar']);
export type FactoryLocale = z.infer<typeof localeSchema>;

export const RTL_LOCALES: readonly FactoryLocale[] = ['ar'];

export const releaseStatusSchema = z.enum(['idea', 'development', 'internal', 'closed-testing', 'production', 'retired']);

const subscriptionPlanSchema = z.object({
  /** Store product identifier, e.g. "devspeak_premium_monthly". */
  productId: z.string().min(1),
  period: z.enum(['monthly', 'annual', 'lifetime']),
  /** Indicative price for planning only. NEVER displayed: the UI shows the localized store price. */
  indicativePriceUsd: z.number().positive(),
});

export const monetizationSchema = z.object({
  model: z.enum(['free', 'ads', 'subscription', 'hybrid', 'paid']),
  subscriptions: z
    .object({
      provider: z.literal('revenuecat'),
      entitlementId: z.string().min(1),
      offeringId: z.string().min(1).optional(),
      plans: z.array(subscriptionPlanSchema),
    })
    .optional(),
  ads: z
    .object({
      provider: z.literal('admob'),
      placements: z.array(z.enum(['banner', 'rewarded', 'interstitial'])),
      /** Do not show ads during the first N sessions. */
      graceSessions: z.number().int().min(0).default(0),
    })
    .optional(),
});

export const appManifestSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]+$/, 'kebab-case id'),
  name: z.string().min(1),
  storeName: z.string().min(1).max(30),
  slug: z.string().min(1),
  scheme: z.string().regex(/^[a-z][a-z0-9]+$/),
  packageId: z.string().regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/, 'reverse-DNS package id'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  versionCode: z.number().int().positive(),
  category: z.string(),
  defaultLocale: localeSchema,
  locales: z.array(localeSchema).min(1),
  plannedLocales: z.array(localeSchema).default([]),
  brand: z.object({
    primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    splashBackground: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  }),
  monetization: monetizationSchema,
  features: z.record(z.string(), z.boolean()),
  build: z.object({
    minSdkVersion: z.number().int(),
    targetSdkVersion: z.number().int(),
    easProjectIdEnv: z.string().default('EAS_PROJECT_ID'),
  }),
  releaseStatus: releaseStatusSchema,
});

export type AppManifest = z.infer<typeof appManifestSchema>;
export type AppManifestInput = z.input<typeof appManifestSchema>;

/** Validates and returns a manifest. Throws with a readable message on invalid input. */
export function defineApp(input: AppManifestInput): AppManifest {
  const result = appManifestSchema.safeParse(input);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid app manifest "${String((input as { id?: unknown }).id)}": ${issues}`);
  }
  if (!result.data.locales.includes(result.data.defaultLocale)) {
    throw new Error(`Invalid app manifest "${result.data.id}": defaultLocale must be in locales`);
  }
  return result.data;
}

export function isFeatureEnabled(manifest: AppManifest, feature: string): boolean {
  return manifest.features[feature] === true;
}

/**
 * Runtime environment configuration that must never be committed
 * (API keys, ad unit IDs). Values come from EXPO_PUBLIC_* env vars at build time.
 */
export interface RuntimeSecrets {
  revenueCatAndroidKey?: string;
  admobAndroidAppId?: string;
  admobBannerId?: string;
  admobRewardedId?: string;
}

export function readEnv(env: Record<string, string | undefined>, key: string): string | undefined {
  const value = env[key];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}
