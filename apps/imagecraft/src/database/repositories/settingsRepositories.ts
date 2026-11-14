import type { EntitlementState } from '@factory/monetization';
import { fromJson, toJson, type SqlDatabase } from '@factory/storage';
import { z } from 'zod';

/* ---------------------------------------------------------------- UserPreferences */

export const userPreferencesSchema = z.object({
  language: z.enum(['en', 'fr', 'es']).nullable(),
  theme: z.enum(['system', 'light', 'dark']),
  defaultFormat: z.enum(['jpeg', 'png', 'webp']),
  defaultQuality: z.number().int().min(1).max(100),
  /** Keep a private copy of edited pictures so projects can be re-opened. */
  keepProjects: z.boolean(),
});
export type UserPreferences = z.infer<typeof userPreferencesSchema>;

export const DEFAULT_PREFERENCES: UserPreferences = { language: null, theme: 'system', defaultFormat: 'jpeg', defaultQuality: 85, keepProjects: true };

interface PrefRow {
  language: string | null;
  theme: string;
  default_format: string;
  default_quality: number;
  keep_projects: number;
}

export function createPreferencesRepository(db: SqlDatabase) {
  return {
    async get(): Promise<UserPreferences> {
      const r = await db.getFirstAsync<PrefRow>('SELECT language, theme, default_format, default_quality, keep_projects FROM user_preferences WHERE id = 1', []);
      if (!r) return DEFAULT_PREFERENCES;
      const parsed = userPreferencesSchema.safeParse({
        language: r.language,
        theme: r.theme,
        defaultFormat: r.default_format,
        defaultQuality: r.default_quality,
        keepProjects: r.keep_projects === 1,
      });
      return parsed.success ? parsed.data : DEFAULT_PREFERENCES;
    },
    async update(patch: Partial<UserPreferences>): Promise<UserPreferences> {
      const next = userPreferencesSchema.parse({ ...(await this.get()), ...patch });
      await db.runAsync(
        `INSERT INTO user_preferences (id, language, theme, default_format, default_quality, keep_projects) VALUES (1, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET language = excluded.language, theme = excluded.theme, default_format = excluded.default_format,
           default_quality = excluded.default_quality, keep_projects = excluded.keep_projects`,
        [next.language, next.theme, next.defaultFormat, next.defaultQuality, next.keepProjects ? 1 : 0],
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
  exportsSinceInterstitial: number;
}

const SETTING_DEFAULTS: AppSettingsShape = {
  onboardingCompleted: false,
  analyticsConsent: false,
  sessionCount: 0,
  lastInterstitialAt: 0,
  exportsSinceInterstitial: 0,
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
    async clear(): Promise<void> {
      await db.runAsync("DELETE FROM app_settings WHERE key NOT IN ('onboardingCompleted', 'sessionCount')", []);
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

/* ---------------------------------------------------------------- Daily rewarded unlocks */

export interface DailyUsage {
  day: string;
  /** Premium exports unlocked today by watching an optional rewarded ad. */
  rewardedUnlocks: number;
  unlocksUsed: number;
}

export function createUsageRepository(db: SqlDatabase) {
  return {
    async get(day: string): Promise<DailyUsage> {
      const r = await db.getFirstAsync<{ rewarded_unlocks: number; unlocks_used: number }>('SELECT rewarded_unlocks, unlocks_used FROM daily_usage WHERE day = ?', [day]);
      return { day, rewardedUnlocks: r?.rewarded_unlocks ?? 0, unlocksUsed: r?.unlocks_used ?? 0 };
    },
    async addUnlock(day: string): Promise<void> {
      await db.runAsync('INSERT INTO daily_usage (day, rewarded_unlocks) VALUES (?, 1) ON CONFLICT(day) DO UPDATE SET rewarded_unlocks = rewarded_unlocks + 1', [day]);
    },
    async consumeUnlock(day: string): Promise<boolean> {
      const res = await db.runAsync('UPDATE daily_usage SET unlocks_used = unlocks_used + 1 WHERE day = ? AND unlocks_used < rewarded_unlocks', [day]);
      return res.changes > 0;
    },
    async prune(beforeDay: string): Promise<void> {
      await db.runAsync('DELETE FROM daily_usage WHERE day < ?', [beforeDay]);
    },
  };
}
