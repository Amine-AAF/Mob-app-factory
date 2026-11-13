import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

import { CHALLENGES, CONTENT_VERSION } from '@/content';
import type { Category, Challenge, Difficulty } from '@/engine';

/** Copies the bundled library into SQLite when the content version changes (one transaction). */
export async function seedContentIfNeeded(db: SqlDatabase, library: readonly Challenge[] = CHALLENGES, version = CONTENT_VERSION): Promise<boolean> {
  const row = await db.getFirstAsync<{ value: string }>("SELECT value FROM content_meta WHERE key = 'content_version'", []);
  if (row && Number(row.value) === version) return false;
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM challenges', []);
    for (const c of library) {
      await db.runAsync(
        'INSERT INTO challenges (id, category, difficulty, skill, position, premium, est_seconds, xp, payload) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [c.id, c.category, c.difficulty, c.skill, c.position, c.premium ? 1 : 0, c.estimatedSeconds, c.xp, toJson(c)],
      );
    }
    await db.runAsync("INSERT INTO content_meta (key, value) VALUES ('content_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", [String(version)]);
  });
  return true;
}

export function createContentRepository(db: SqlDatabase) {
  const parse = (rows: { payload: string }[]) => rows.map((r) => fromJson<Challenge | null>(r.payload, null)).filter((c): c is Challenge => c !== null);
  return {
    async get(id: string): Promise<Challenge | null> {
      const row = await db.getFirstAsync<{ payload: string }>('SELECT payload FROM challenges WHERE id = ?', [id]);
      return row ? fromJson<Challenge | null>(row.payload, null) : null;
    },
    async list(category?: Category, difficulty?: Difficulty): Promise<Challenge[]> {
      const where: string[] = [];
      const params: string[] = [];
      if (category) {
        where.push('category = ?');
        params.push(category);
      }
      if (difficulty) {
        where.push('difficulty = ?');
        params.push(difficulty);
      }
      const sql = `SELECT payload FROM challenges ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY category, CASE difficulty WHEN 'easy' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END, position`;
      return parse(await db.getAllAsync<{ payload: string }>(sql, params));
    },
    async count(): Promise<number> {
      return (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM challenges', []))?.n ?? 0;
    },
  };
}

export type ContentRepository = ReturnType<typeof createContentRepository>;
