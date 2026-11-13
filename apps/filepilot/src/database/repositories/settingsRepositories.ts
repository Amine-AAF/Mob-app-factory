import type { EntitlementState } from '@factory/monetization';
import { fromJson, toJson, type SqlDatabase } from '@factory/storage';
import { z } from 'zod';

/* ---------------------------------------------------------------- UserPreferences */

export const userPreferencesSchema = z.object({
  language: z.enum(['en', 'fr', 'es']).nullable(),
  theme: z.enum(['system', 'light', 'dark']),
  defaultImageQuality: z.number().int().min(1).max(100),
  defaultOutputFormat: z.enum(['jpeg', 'png', 'webp']),
});
export type UserPreferences = z.infer<typeof userPreferencesSchema>;

export const DEFAULT_PREFERENCES: UserPreferences = { language: null, theme: 'system', defaultImageQuality: 80, defaultOutputFormat: 'jpeg' };

export function createPreferencesRepository(db: SqlDatabase) {
  return {
    async get(): Promise<UserPreferences> {
      const r = await db.getFirstAsync<{ language: string | null; theme: string; default_image_quality: number; default_output_format: string }>(
        'SELECT language, theme, default_image_quality, default_output_format FROM user_preferences WHERE id = 1',
        [],
      );
      if (!r) return DEFAULT_PREFERENCES;
      const parsed = userPreferencesSchema.safeParse({ language: r.language, theme: r.theme, defaultImageQuality: r.default_image_quality, defaultOutputFormat: r.default_output_format });
      return parsed.success ? parsed.data : DEFAULT_PREFERENCES;
    },
    async update(patch: Partial<UserPreferences>): Promise<UserPreferences> {
      const next = userPreferencesSchema.parse({ ...(await this.get()), ...patch });
      await db.runAsync(
        `INSERT INTO user_preferences (id, language, theme, default_image_quality, default_output_format) VALUES (1, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET language = excluded.language, theme = excluded.theme,
           default_image_quality = excluded.default_image_quality, default_output_format = excluded.default_output_format`,
        [next.language, next.theme, next.defaultImageQuality, next.defaultOutputFormat],
      );
      return next;
    },
  };
}

/* ---------------------------------------------------------------- AppSettings (key/value) */

export interface AppSettingsShape {
  onboardingCompleted: boolean;
  analyticsConsent: boolean;
  sessionCount: number;
  lastInterstitialAt: number;
  operationsSinceInterstitial: number;
}

const SETTING_DEFAULTS: AppSettingsShape = {
  onboardingCompleted: false,
  analyticsConsent: false,
  sessionCount: 0,
  lastInterstitialAt: 0,
  operationsSinceInterstitial: 0,
};

export function createSettingsRepository(db: SqlDatabase) {
  return {
    async get<K extends keyof AppSettingsShape>(key: K): Promise<AppSettingsShape[K]> {
      const r = await db.getFirstAsync<{ value: string }>('SELECT value FROM app_settings WHERE key = ?', [key]);
      const fallback = SETTING_DEFAULTS[key];
      const value = fromJson<unknown>(r?.value, fallback);
      return (typeof value === typeof fallback ? value : fallback) as AppSettingsShape[K];
    },
    async set<K extends keyof AppSettingsShape>(key: K, value: AppSettingsShape[K]): Promise<void> {
      await db.runAsync('INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, toJson(value)]);
    },
    async all(): Promise<AppSettingsShape> {
      const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM app_settings', []);
      const out: AppSettingsShape = { ...SETTING_DEFAULTS };
      for (const r of rows) {
        if (r.key in SETTING_DEFAULTS) {
          const k = r.key as keyof AppSettingsShape;
          const v = fromJson<unknown>(r.value, SETTING_DEFAULTS[k]);
          if (typeof v === typeof SETTING_DEFAULTS[k]) (out as unknown as Record<string, unknown>)[k] = v;
        }
      }
      return out;
    },
  };
}

/* ---------------------------------------------------------------- SubscriptionCache */

export function createSubscriptionCacheRepository(db: SqlDatabase) {
  return {
    async read(): Promise<EntitlementState | null> {
      const r = await db.getFirstAsync<{ state: string }>('SELECT state FROM subscription_cache WHERE id = 1', []);
      return r ? fromJson<EntitlementState | null>(r.state, null) : null;
    },
    async write(state: EntitlementState, verifiedAt: string): Promise<void> {
      await db.runAsync(
        `INSERT INTO subscription_cache (id, entitlement, product_id, expiration_date, last_verified_at, state) VALUES (1, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET entitlement = excluded.entitlement, product_id = excluded.product_id,
           expiration_date = excluded.expiration_date, last_verified_at = excluded.last_verified_at, state = excluded.state`,
        [state.isPremium ? 'premium' : 'free', state.productId, state.expiresAt, state.verifiedAt ?? verifiedAt, toJson(state)],
      );
    },
    async clear(): Promise<void> {
      await db.runAsync('DELETE FROM subscription_cache', []);
    },
  };
}

/* ---------------------------------------------------------------- Daily usage (free quota) */

export interface DailyUsage {
  day: string;
  operations: number;
  bonus: number;
  rewardedCount: number;
}

export function createUsageRepository(db: SqlDatabase) {
  return {
    async get(day: string): Promise<DailyUsage> {
      const r = await db.getFirstAsync<{ operations: number; bonus: number; rewarded_count: number }>('SELECT operations, bonus, rewarded_count FROM daily_usage WHERE day = ?', [day]);
      return { day, operations: r?.operations ?? 0, bonus: r?.bonus ?? 0, rewardedCount: r?.rewarded_count ?? 0 };
    },
    async increment(day: string): Promise<void> {
      await db.runAsync('INSERT INTO daily_usage (day, operations) VALUES (?, 1) ON CONFLICT(day) DO UPDATE SET operations = operations + 1', [day]);
    },
    async addBonus(day: string, amount: number): Promise<void> {
      await db.runAsync('INSERT INTO daily_usage (day, bonus, rewarded_count) VALUES (?, ?, 1) ON CONFLICT(day) DO UPDATE SET bonus = bonus + excluded.bonus, rewarded_count = rewarded_count + 1', [
        day,
        amount,
      ]);
    },
    /** Old usage rows are useless; keep a week. */
    async prune(beforeDay: string): Promise<void> {
      await db.runAsync('DELETE FROM daily_usage WHERE day < ?', [beforeDay]);
    },
  };
}
