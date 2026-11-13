import { fromJson, toJson, type SqlDatabase } from '@factory/storage';
import { z } from 'zod';

export const ENGLISH_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export const ROLES = ['student', 'java', 'react', 'fullstack', 'devops', 'qa', 'architect', 'other'] as const;
export const OBJECTIVES = ['meetings', 'technical', 'interviews', 'vocabulary', 'speaking', 'writing'] as const;
export const DAILY_MINUTES = [5, 10, 15, 20] as const;

export const profileSchema = z.object({
  englishLevel: z.enum(ENGLISH_LEVELS),
  role: z.enum(ROLES),
  objectives: z.array(z.enum(OBJECTIVES)).min(1, 'pick_one').max(OBJECTIVES.length),
  dailyMinutes: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20)]),
  displayName: z
    .string()
    .trim()
    .max(30)
    .regex(/^[^<>{}]*$/u)
    .optional()
    .or(z.literal('')),
});

export type UserProfile = z.infer<typeof profileSchema>;

/** XP target derived from the daily time goal (≈10 XP per minute of focused practice). */
export function dailyXpGoal(minutes: number): number {
  return Math.max(30, minutes * 10);
}

export function createProfileRepository(db: SqlDatabase) {
  return {
    async get(): Promise<UserProfile | null> {
      const r = await db.getFirstAsync<{ english_level: string; role: string; objectives: string; daily_minutes: number; display_name: string | null }>(
        'SELECT english_level, role, objectives, daily_minutes, display_name FROM user_profile WHERE id = 1',
        [],
      );
      if (!r) return null;
      const parsed = profileSchema.safeParse({
        englishLevel: r.english_level,
        role: r.role,
        objectives: fromJson(r.objectives, []),
        dailyMinutes: r.daily_minutes,
        displayName: r.display_name ?? '',
      });
      return parsed.success ? parsed.data : null;
    },

    async save(input: UserProfile, now: Date): Promise<UserProfile> {
      const p = profileSchema.parse(input);
      await db.runAsync(
        `INSERT INTO user_profile (id, english_level, role, objectives, daily_minutes, display_name, created_at, updated_at)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET english_level = excluded.english_level, role = excluded.role, objectives = excluded.objectives,
           daily_minutes = excluded.daily_minutes, display_name = excluded.display_name, updated_at = excluded.updated_at`,
        [p.englishLevel, p.role, toJson(p.objectives), p.dailyMinutes, p.displayName?.trim() || null, now.toISOString(), now.toISOString()],
      );
      return p;
    },
  };
}

export function createPreferencesRepository(db: SqlDatabase) {
  return {
    async get<T>(key: string, fallback: T): Promise<T> {
      const r = await db.getFirstAsync<{ value: string }>('SELECT value FROM user_preferences WHERE key = ?', [key]);
      return fromJson(r?.value, fallback);
    },
    async set<T>(key: string, value: T, now: Date = new Date()): Promise<void> {
      await db.runAsync(
        'INSERT INTO user_preferences (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
        [key, toJson(value), now.toISOString()],
      );
    },
  };
}

export type ProfileRepository = ReturnType<typeof createProfileRepository>;
export type PreferencesRepository = ReturnType<typeof createPreferencesRepository>;
