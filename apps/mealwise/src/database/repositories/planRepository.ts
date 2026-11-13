import { addDays } from '@factory/app-core';
import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

import type { PlanDraft } from '@/domain/planner';
import type { DayKey, MealSlot, MealTemplate, PlanEntry, TemplateEntry } from '@/domain/types';

interface Row {
  id: number;
  day: string;
  slot: MealSlot;
  recipe_id: string | null;
  custom_title: string | null;
  servings: number;
  note: string | null;
  position: number;
  cooked_at: string | null;
}

const toEntry = (r: Row): PlanEntry => ({
  id: r.id,
  day: r.day,
  slot: r.slot,
  recipeId: r.recipe_id,
  customTitle: r.custom_title,
  servings: r.servings,
  note: r.note,
  position: r.position,
  cookedAt: r.cooked_at,
});

export function createPlanRepository(db: SqlDatabase) {
  const nextPosition = async (day: DayKey, slot: MealSlot) =>
    ((await db.getFirstAsync<{ p: number | null }>('SELECT MAX(position) AS p FROM plan_entries WHERE day = ? AND slot = ?', [day, slot]))?.p ?? -1) + 1;

  const repo = {
    async range(from: DayKey, toInclusive: DayKey): Promise<PlanEntry[]> {
      const rows = await db.getAllAsync<Row>('SELECT * FROM plan_entries WHERE day >= ? AND day <= ? ORDER BY day, slot, position', [from, toInclusive]);
      return rows.map(toEntry);
    },
    async week(start: DayKey): Promise<PlanEntry[]> {
      return repo.range(start, addDays(start, 6));
    },
    async get(id: number): Promise<PlanEntry | null> {
      const r = await db.getFirstAsync<Row>('SELECT * FROM plan_entries WHERE id = ?', [id]);
      return r ? toEntry(r) : null;
    },
    async add(draft: Omit<PlanDraft, 'position'> & { position?: number }, now = new Date()): Promise<number> {
      if (!draft.recipeId && !draft.customTitle?.trim()) throw new Error('A planned meal needs a recipe or a title');
      const position = draft.position ?? (await nextPosition(draft.day, draft.slot));
      const ts = now.toISOString();
      const res = await db.runAsync(
        'INSERT INTO plan_entries (day, slot, recipe_id, custom_title, servings, note, position, cooked_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)',
        [draft.day, draft.slot, draft.recipeId, draft.customTitle?.trim() || null, Math.max(1, Math.round(draft.servings)), draft.note, position, ts, ts],
      );
      return res.lastInsertRowId;
    },
    async addMany(drafts: readonly PlanDraft[], now = new Date()): Promise<number> {
      let n = 0;
      await db.withTransactionAsync(async () => {
        for (const d of drafts) {
          await repo.add({ ...d, position: undefined }, now);
          n++;
        }
      });
      return n;
    },
    async update(id: number, patch: Partial<Pick<PlanEntry, 'servings' | 'note' | 'customTitle' | 'recipeId'>>, now = new Date()): Promise<void> {
      const current = await repo.get(id);
      if (!current) return;
      const next = { ...current, ...patch };
      await db.runAsync('UPDATE plan_entries SET servings = ?, note = ?, custom_title = ?, recipe_id = ?, updated_at = ? WHERE id = ?', [
        Math.max(1, Math.round(next.servings)),
        next.note,
        next.customTitle,
        next.recipeId,
        now.toISOString(),
        id,
      ]);
    },
    /** Moves a meal to another day and/or slot (appended at the end of the target slot). */
    async move(id: number, day: DayKey, slot: MealSlot, now = new Date()): Promise<void> {
      const position = await nextPosition(day, slot);
      await db.runAsync('UPDATE plan_entries SET day = ?, slot = ?, position = ?, updated_at = ? WHERE id = ?', [day, slot, position, now.toISOString(), id]);
    },
    async duplicate(id: number, day: DayKey, slot: MealSlot, now = new Date()): Promise<number | null> {
      const e = await repo.get(id);
      if (!e) return null;
      return repo.add({ day, slot, recipeId: e.recipeId, customTitle: e.customTitle, servings: e.servings, note: e.note }, now);
    },
    async setCooked(id: number, cooked: boolean, now = new Date()): Promise<void> {
      await db.runAsync('UPDATE plan_entries SET cooked_at = ?, updated_at = ? WHERE id = ?', [cooked ? now.toISOString() : null, now.toISOString(), id]);
    },
    async remove(id: number): Promise<void> {
      await db.runAsync('DELETE FROM plan_entries WHERE id = ?', [id]);
    },
    async clearRange(from: DayKey, toInclusive: DayKey): Promise<number> {
      return (await db.runAsync('DELETE FROM plan_entries WHERE day >= ? AND day <= ?', [from, toInclusive])).changes;
    },
    async countAll(): Promise<number> {
      return (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM plan_entries', []))?.n ?? 0;
    },
    /** Cooked meals history (newest first). */
    async cookedHistory(limit = 100): Promise<PlanEntry[]> {
      return (await db.getAllAsync<Row>('SELECT * FROM plan_entries WHERE cooked_at IS NOT NULL ORDER BY cooked_at DESC LIMIT ?', [limit])).map(toEntry);
    },
  };
  return repo;
}

export type PlanRepository = ReturnType<typeof createPlanRepository>;

interface TemplateRow {
  id: string;
  name: string;
  description: string;
  icon: string;
  entries: string;
}

export function createTemplateRepository(db: SqlDatabase) {
  return {
    async list(): Promise<MealTemplate[]> {
      const rows = await db.getAllAsync<TemplateRow>('SELECT * FROM meal_templates ORDER BY updated_at DESC', []);
      return rows.map((r) => ({ id: r.id, builtin: false, premium: false, name: r.name, description: r.description, icon: r.icon, entries: fromJson<TemplateEntry[]>(r.entries, []) }));
    },
    async count(): Promise<number> {
      return (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM meal_templates', []))?.n ?? 0;
    },
    async save(t: { id?: string; name: string; description?: string; icon?: string; entries: TemplateEntry[] }, now = new Date()): Promise<string> {
      const id = t.id ?? `ut-${now.getTime().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
      const ts = now.toISOString();
      await db.runAsync(
        `INSERT INTO meal_templates (id, name, description, icon, entries, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET name = excluded.name, description = excluded.description, icon = excluded.icon, entries = excluded.entries, updated_at = excluded.updated_at`,
        [id, t.name.trim(), t.description?.trim() ?? '', t.icon ?? 'calendar', toJson(t.entries), ts, ts],
      );
      return id;
    },
    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM meal_templates WHERE id = ?', [id]);
    },
  };
}

export type TemplateRepository = ReturnType<typeof createTemplateRepository>;
