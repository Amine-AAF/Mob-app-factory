import { addDays } from '@factory/app-core';
import type { SqlDatabase, SqlValue } from '@factory/storage';

import { newId } from '@/domain/ids';
import { afterCompletion, afterPostpone, afterSkip } from '@/domain/schedule';
import { BUILT_IN_SEASONAL } from '@/domain/seasons';
import type {
  CareHistoryEntry,
  CareTask,
  DayKey,
  FertilizerRecord,
  GardenLocation,
  GrowthRecord,
  HealthRecord,
  JournalEntry,
  NotificationSetting,
  Plant,
  PlantCategory,
  Season,
  SeasonalCompletion,
  SeasonalTask,
  SoilRecord,
  TaskType,
  WateringRecord,
  WishlistItem,
} from '@/domain/types';

import { defineTable } from './table';

/* ------------------------------------------------------------------ tables */

function tables(db: SqlDatabase) {
  return {
    plants: defineTable<Plant>(db, 'plants', {
      id: ['id', 'text'],
      nickname: ['nickname', 'text'],
      commonName: ['common_name', 'text'],
      scientificName: ['scientific_name', 'text'],
      speciesId: ['species_id', 'text'],
      category: ['category_id', 'text'],
      photoPath: ['photo_path', 'text'],
      acquiredOn: ['acquired_on', 'text'],
      plantedOn: ['planted_on', 'text'],
      locationId: ['location_id', 'text'],
      description: ['description', 'text'],
      notes: ['notes', 'text'],
      favorite: ['favorite', 'bool'],
      createdAt: ['created_at', 'text'],
      updatedAt: ['updated_at', 'text'],
    }),
    locations: defineTable<GardenLocation>(db, 'garden_locations', {
      id: ['id', 'text'],
      name: ['name', 'text'],
      type: ['type', 'text'],
      description: ['description', 'text'],
      photoPath: ['photo_path', 'text'],
      createdAt: ['created_at', 'text'],
    }),
    tasks: defineTable<CareTask>(db, 'care_tasks', {
      id: ['id', 'text'],
      plantId: ['plant_id', 'text'],
      type: ['type', 'text'],
      nextDue: ['next_due', 'text'],
      intervalDays: ['interval_days', 'int'],
      priority: ['priority', 'text'],
      notes: ['notes', 'text'],
      amountMl: ['amount_ml', 'int'],
      remindersEnabled: ['reminders_enabled', 'bool'],
      active: ['active', 'bool'],
      createdAt: ['created_at', 'text'],
    }),
    history: defineTable<CareHistoryEntry>(db, 'care_history', {
      id: ['id', 'text'],
      taskId: ['task_id', 'text'],
      plantId: ['plant_id', 'text'],
      type: ['type', 'text'],
      action: ['action', 'text'],
      date: ['date', 'text'],
      notes: ['notes', 'text'],
      createdAt: ['created_at', 'text'],
    }),
    watering: defineTable<WateringRecord>(db, 'watering_records', {
      id: ['id', 'text'],
      plantId: ['plant_id', 'text'],
      date: ['date', 'text'],
      amountMl: ['amount_ml', 'int'],
      notes: ['notes', 'text'],
      createdAt: ['created_at', 'text'],
    }),
    growth: defineTable<GrowthRecord>(db, 'growth_records', {
      id: ['id', 'text'],
      plantId: ['plant_id', 'text'],
      date: ['date', 'text'],
      heightCm: ['height_cm', 'real'],
      leafCount: ['leaf_count', 'int'],
      condition: ['condition', 'text'],
      photoPath: ['photo_path', 'text'],
      notes: ['notes', 'text'],
      createdAt: ['created_at', 'text'],
    }),
    journal: defineTable<JournalEntry>(db, 'plant_journal_entries', {
      id: ['id', 'text'],
      plantId: ['plant_id', 'text'],
      date: ['date', 'text'],
      kind: ['kind', 'text'],
      title: ['title', 'text'],
      body: ['body', 'text'],
      photoPath: ['photo_path', 'text'],
      createdAt: ['created_at', 'text'],
    }),
    health: defineTable<HealthRecord>(db, 'plant_health_records', {
      id: ['id', 'text'],
      plantId: ['plant_id', 'text'],
      category: ['category', 'text'],
      description: ['description', 'text'],
      observedOn: ['observed_on', 'text'],
      status: ['status', 'text'],
      actions: ['actions', 'json'],
      photoPaths: ['photo_paths', 'json'],
      notes: ['notes', 'text'],
      resolvedOn: ['resolved_on', 'text'],
      createdAt: ['created_at', 'text'],
    }),
    fertilizer: defineTable<FertilizerRecord>(db, 'fertilizer_records', {
      id: ['id', 'text'],
      plantId: ['plant_id', 'text'],
      fertilizerType: ['fertilizer_type', 'text'],
      brand: ['brand', 'text'],
      composition: ['composition', 'text'],
      appliedOn: ['applied_on', 'text'],
      quantity: ['quantity', 'text'],
      notes: ['notes', 'text'],
      createdAt: ['created_at', 'text'],
    }),
    soil: defineTable<SoilRecord>(db, 'soil_records', {
      id: ['id', 'text'],
      plantId: ['plant_id', 'text'],
      substrate: ['substrate', 'text'],
      potSizeCm: ['pot_size_cm', 'real'],
      repottedOn: ['repotted_on', 'text'],
      notes: ['notes', 'text'],
      createdAt: ['created_at', 'text'],
    }),
    wishlist: defineTable<WishlistItem>(db, 'plant_wishlist', {
      id: ['id', 'text'],
      name: ['name', 'text'],
      speciesId: ['species_id', 'text'],
      photoPath: ['photo_path', 'text'],
      description: ['description', 'text'],
      estimatedPrice: ['estimated_price', 'real'],
      store: ['store', 'text'],
      priority: ['priority', 'text'],
      notes: ['notes', 'text'],
      status: ['status', 'text'],
      createdAt: ['created_at', 'text'],
    }),
    seasonal: defineTable<SeasonalTask>(db, 'seasonal_tasks', {
      id: ['id', 'text'],
      season: ['season', 'text'],
      builtInKey: ['built_in_key', 'text'],
      title: ['title', 'text'],
      sort: ['sort', 'int'],
    }),
    seasonalDone: defineTable<SeasonalCompletion>(db, 'seasonal_completions', {
      id: ['id', 'text'],
      taskId: ['task_id', 'text'],
      seasonKey: ['season_key', 'text'],
      completedOn: ['completed_on', 'text'],
    }),
  };
}

/* ------------------------------------------------------------------ inputs */

export type PlantInput = Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>;
export type TaskInput = Omit<CareTask, 'id' | 'createdAt' | 'active'> & { active?: boolean };
type NewRecord<T> = Omit<T, 'id' | 'createdAt'>;

export interface PlantQuery {
  search?: string;
  category?: PlantCategory | null;
  locationId?: string | null;
  favoritesOnly?: boolean;
}

export type PlantSort = 'name' | 'date' | 'next_care';

/* ------------------------------------------------------------------ repositories */

export function createRepositories(db: SqlDatabase, now: () => Date = () => new Date()) {
  const t = tables(db);
  const iso = () => now().toISOString();

  /* ---------------- plants */
  const plants = {
    table: t.plants,
    count: () => t.plants.count(),
    get: (id: string) => t.plants.get(id),
    async list(query: PlantQuery = {}, sort: PlantSort = 'name'): Promise<Plant[]> {
      const where: string[] = [];
      const params: SqlValue[] = [];
      if (query.category) {
        where.push('category_id = ?');
        params.push(query.category);
      }
      if (query.locationId) {
        where.push('location_id = ?');
        params.push(query.locationId);
      }
      if (query.favoritesOnly) where.push('favorite = 1');
      if (query.search?.trim()) {
        where.push("(nickname LIKE ? ESCAPE '\\' OR common_name LIKE ? ESCAPE '\\' OR COALESCE(scientific_name, '') LIKE ? ESCAPE '\\')");
        const like = `%${query.search.trim().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
        params.push(like, like, like);
      }
      const order =
        sort === 'date'
          ? 'created_at DESC'
          : sort === 'next_care'
            ? "COALESCE((SELECT MIN(next_due) FROM care_tasks c WHERE c.plant_id = plants.id AND c.active = 1), '9999-12-31') ASC, nickname COLLATE NOCASE ASC"
            : 'nickname COLLATE NOCASE ASC';
      return t.plants.list(where.join(' AND ') || undefined, params, order);
    },
    async create(input: PlantInput): Promise<Plant> {
      const stamp = iso();
      return t.plants.insert({ ...input, id: newId('pl'), createdAt: stamp, updatedAt: stamp });
    },
    async update(id: string, patch: Partial<PlantInput>): Promise<void> {
      await t.plants.update(id, { ...patch, updatedAt: iso() });
    },
    async setFavorite(id: string, favorite: boolean): Promise<void> {
      await t.plants.update(id, { favorite, updatedAt: iso() });
    },
    /**
     * Duplicates the plant sheet and its care schedule (not its history, journal or photos:
     * a duplicate is a new individual plant). The photo is not shared so deleting one copy
     * never removes the other's photo.
     */
    async duplicate(id: string, nicknameSuffix: string): Promise<Plant | null> {
      const source = await t.plants.get(id);
      if (!source) return null;
      let copy: Plant | null = null;
      await db.withTransactionAsync(async () => {
        const stamp = iso();
        copy = await t.plants.insert({ ...source, id: newId('pl'), nickname: `${source.nickname} ${nicknameSuffix}`.trim(), photoPath: null, favorite: false, createdAt: stamp, updatedAt: stamp });
        for (const task of await t.tasks.list('plant_id = ? AND active = 1', [id])) {
          await t.tasks.insert({ ...task, id: newId('tk'), plantId: copy.id, createdAt: stamp });
        }
      });
      return copy;
    },
    /** Deletes a plant and (by cascade) all its records. Returns photo paths to delete from disk. */
    async remove(id: string): Promise<string[]> {
      const photos = await photoPathsForPlant(id);
      await t.plants.remove(id);
      return photos;
    },
  };

  async function photoPathsForPlant(plantId: string): Promise<string[]> {
    const out: string[] = [];
    const plant = await t.plants.get(plantId);
    if (plant?.photoPath) out.push(plant.photoPath);
    for (const g of await t.growth.list('plant_id = ? AND photo_path IS NOT NULL', [plantId])) if (g.photoPath) out.push(g.photoPath);
    for (const j of await t.journal.list('plant_id = ? AND photo_path IS NOT NULL', [plantId])) if (j.photoPath) out.push(j.photoPath);
    for (const h of await t.health.list('plant_id = ?', [plantId])) out.push(...h.photoPaths);
    return out;
  }

  /* ---------------- locations */
  const locations = {
    table: t.locations,
    list: () => t.locations.list(undefined, [], 'name COLLATE NOCASE ASC'),
    get: (id: string) => t.locations.get(id),
    count: () => t.locations.count(),
    create: (input: NewRecord<GardenLocation>) => t.locations.insert({ ...input, id: newId('lo'), createdAt: iso() }),
    update: (id: string, patch: Partial<NewRecord<GardenLocation>>) => t.locations.update(id, patch),
    /** Plants in the location are kept (location_id is set to NULL). Returns the photo to delete. */
    async remove(id: string): Promise<string | null> {
      const loc = await t.locations.get(id);
      await t.locations.remove(id);
      return loc?.photoPath ?? null;
    },
    async plantCounts(): Promise<Record<string, number>> {
      const rows = await db.getAllAsync<{ location_id: string; n: number }>('SELECT location_id, COUNT(*) AS n FROM plants WHERE location_id IS NOT NULL GROUP BY location_id', []);
      return Object.fromEntries(rows.map((r) => [r.location_id, Number(r.n)]));
    },
  };

  /* ---------------- care tasks */
  const tasks = {
    table: t.tasks,
    get: (id: string) => t.tasks.get(id),
    listActive: () => t.tasks.list('active = 1', [], 'next_due ASC'),
    listForPlant: (plantId: string) => t.tasks.list('plant_id = ?', [plantId], 'active DESC, next_due ASC'),
    listForLocation: (locationId: string) =>
      t.tasks.list('active = 1 AND plant_id IN (SELECT id FROM plants WHERE location_id = ?)', [locationId], 'next_due ASC'),
    async wateringTask(plantId: string): Promise<CareTask | null> {
      return (await t.tasks.list("plant_id = ? AND type = 'watering' AND active = 1", [plantId], 'created_at ASC'))[0] ?? null;
    },
    create: (input: TaskInput) => t.tasks.insert({ ...input, active: input.active ?? true, id: newId('tk'), createdAt: iso() }),
    update: (id: string, patch: Partial<TaskInput>) => t.tasks.update(id, patch),
    remove: (id: string) => t.tasks.remove(id),

    /**
     * Marks a task as done on `doneOn` (the user confirms each completion). Watering is logged
     * in watering_records (with optional amount); other tasks in care_history. Atomic.
     */
    async complete(taskId: string, doneOn: DayKey, opts: { notes?: string; amountMl?: number | null } = {}): Promise<CareTask | null> {
      const task = await t.tasks.get(taskId);
      if (!task) return null;
      const next = afterCompletion(task, doneOn);
      await db.withTransactionAsync(async () => {
        if (task.type === 'watering') {
          await t.watering.insert({ id: newId('wa'), plantId: task.plantId, date: doneOn, amountMl: opts.amountMl ?? task.amountMl, notes: opts.notes ?? '', createdAt: iso() });
        } else {
          await t.history.insert({ id: newId('hi'), taskId, plantId: task.plantId, type: task.type, action: 'done', date: doneOn, notes: opts.notes ?? '', createdAt: iso() });
        }
        await t.tasks.update(taskId, next);
      });
      return { ...task, ...next };
    },
    async skip(taskId: string, today: DayKey): Promise<void> {
      const task = await t.tasks.get(taskId);
      if (!task) return;
      await db.withTransactionAsync(async () => {
        await t.history.insert({ id: newId('hi'), taskId, plantId: task.plantId, type: task.type, action: 'skipped', date: today, notes: '', createdAt: iso() });
        await t.tasks.update(taskId, afterSkip(task, today));
      });
    },
    async postpone(taskId: string, days: number, today: DayKey): Promise<void> {
      const task = await t.tasks.get(taskId);
      if (!task) return;
      await db.withTransactionAsync(async () => {
        await t.history.insert({ id: newId('hi'), taskId, plantId: task.plantId, type: task.type, action: 'postponed', date: today, notes: String(days), createdAt: iso() });
        await t.tasks.update(taskId, afterPostpone(task, days, today));
      });
    },
  };

  /* ---------------- history & watering */
  const history = {
    forPlant: (plantId: string, since?: DayKey | null) =>
      since ? t.history.list('plant_id = ? AND date >= ?', [plantId, since], 'date DESC, created_at DESC') : t.history.list('plant_id = ?', [plantId], 'date DESC, created_at DESC'),
    between: (from: DayKey, to: DayKey) => t.history.list('date BETWEEN ? AND ?', [from, to], 'date DESC'),
    remove: (id: string) => t.history.remove(id),
  };

  const watering = {
    forPlant: (plantId: string, since?: DayKey | null) =>
      since ? t.watering.list('plant_id = ? AND date >= ?', [plantId, since], 'date DESC, created_at DESC') : t.watering.list('plant_id = ?', [plantId], 'date DESC, created_at DESC'),
    between: (from: DayKey, to: DayKey) => t.watering.list('date BETWEEN ? AND ?', [from, to], 'date DESC'),
    async last(plantId: string): Promise<WateringRecord | null> {
      return (await t.watering.list('plant_id = ?', [plantId], 'date DESC, created_at DESC LIMIT 1'))[0] ?? null;
    },
    /** Logs a watering that was not planned (no schedule yet, or watered early). */
    async log(plantId: string, date: DayKey, amountMl: number | null, notes = ''): Promise<WateringRecord> {
      const rec = await t.watering.insert({ id: newId('wa'), plantId, date, amountMl, notes, createdAt: iso() });
      // An active schedule restarts from this watering.
      const task = await tasks.wateringTask(plantId);
      if (task?.intervalDays) await t.tasks.update(task.id, { nextDue: addDays(date, task.intervalDays) });
      return rec;
    },
    remove: (id: string) => t.watering.remove(id),
  };

  /* ---------------- per-plant records */
  const growth = {
    forPlant: (plantId: string) => t.growth.list('plant_id = ?', [plantId], 'date ASC, created_at ASC'),
    countForPlant: (plantId: string) => t.growth.count('plant_id = ?', [plantId]),
    create: (input: NewRecord<GrowthRecord>) => t.growth.insert({ ...input, id: newId('gr'), createdAt: iso() }),
    update: (id: string, patch: Partial<NewRecord<GrowthRecord>>) => t.growth.update(id, patch),
    get: (id: string) => t.growth.get(id),
    async remove(id: string): Promise<string | null> {
      const r = await t.growth.get(id);
      await t.growth.remove(id);
      return r?.photoPath ?? null;
    },
  };

  const journal = {
    forPlant: (plantId: string) => t.journal.list('plant_id = ?', [plantId], 'date DESC, created_at DESC'),
    get: (id: string) => t.journal.get(id),
    create: (input: NewRecord<JournalEntry>) => t.journal.insert({ ...input, id: newId('jo'), createdAt: iso() }),
    update: (id: string, patch: Partial<NewRecord<JournalEntry>>) => t.journal.update(id, patch),
    async remove(id: string): Promise<string | null> {
      const r = await t.journal.get(id);
      await t.journal.remove(id);
      return r?.photoPath ?? null;
    },
    photos: (plantId: string) => t.journal.list('plant_id = ? AND photo_path IS NOT NULL', [plantId], 'date ASC'),
  };

  const health = {
    forPlant: (plantId: string) => t.health.list('plant_id = ?', [plantId], "CASE status WHEN 'resolved' THEN 1 ELSE 0 END, observed_on DESC"),
    open: () => t.health.list("status != 'resolved'", [], 'observed_on DESC'),
    get: (id: string) => t.health.get(id),
    create: (input: NewRecord<HealthRecord>) => t.health.insert({ ...input, id: newId('he'), createdAt: iso() }),
    update: (id: string, patch: Partial<NewRecord<HealthRecord>>) => t.health.update(id, patch),
    async addAction(id: string, date: DayKey, text: string): Promise<void> {
      const r = await t.health.get(id);
      if (!r) return;
      await t.health.update(id, { actions: [...r.actions, { date, text }] });
    },
    async remove(id: string): Promise<string[]> {
      const r = await t.health.get(id);
      await t.health.remove(id);
      return r?.photoPaths ?? [];
    },
  };

  const fertilizer = {
    forPlant: (plantId: string) => t.fertilizer.list('plant_id = ?', [plantId], 'applied_on DESC'),
    create: (input: NewRecord<FertilizerRecord>) => t.fertilizer.insert({ ...input, id: newId('fe'), createdAt: iso() }),
    remove: (id: string) => t.fertilizer.remove(id),
  };

  const soil = {
    forPlant: (plantId: string) => t.soil.list('plant_id = ?', [plantId], 'repotted_on DESC'),
    create: (input: NewRecord<SoilRecord>) => t.soil.insert({ ...input, id: newId('so'), createdAt: iso() }),
    remove: (id: string) => t.soil.remove(id),
  };

  /* ---------------- wishlist */
  const wishlist = {
    list: () => t.wishlist.list(undefined, [], "CASE status WHEN 'wishlist' THEN 0 WHEN 'purchased' THEN 1 ELSE 2 END, CASE priority WHEN 'high' THEN 0 WHEN 'normal' THEN 1 ELSE 2 END, created_at DESC"),
    get: (id: string) => t.wishlist.get(id),
    create: (input: NewRecord<WishlistItem>) => t.wishlist.insert({ ...input, id: newId('wi'), createdAt: iso() }),
    update: (id: string, patch: Partial<NewRecord<WishlistItem>>) => t.wishlist.update(id, patch),
    async remove(id: string): Promise<string | null> {
      const r = await t.wishlist.get(id);
      await t.wishlist.remove(id);
      return r?.photoPath ?? null;
    },
  };

  /* ---------------- seasonal */
  const seasonal = {
    /** Inserts the built-in checklist items once (they can then be removed or completed by the user). */
    async ensureBuiltIns(): Promise<void> {
      const seeded = await meta.get('seasonal_seeded');
      if (seeded) return;
      await db.withTransactionAsync(async () => {
        for (const season of Object.keys(BUILT_IN_SEASONAL) as Season[]) {
          let sort = 0;
          for (const key of BUILT_IN_SEASONAL[season]) {
            await t.seasonal.insert({ id: `ss_${key}`, season, builtInKey: key, title: '', sort: sort++ });
          }
        }
        await meta.set('seasonal_seeded', '1');
      });
    },
    list: (season: Season) => t.seasonal.list('season = ?', [season], 'sort ASC'),
    async add(season: Season, title: string): Promise<SeasonalTask> {
      const r = await db.getFirstAsync<{ m: number | null }>('SELECT MAX(sort) AS m FROM seasonal_tasks WHERE season = ?', [season]);
      return t.seasonal.insert({ id: newId('ss'), season, builtInKey: null, title: title.trim(), sort: Number(r?.m ?? -1) + 1 });
    },
    remove: (id: string) => t.seasonal.remove(id),
    completions: (seasonKey: string) => t.seasonalDone.list('season_key = ?', [seasonKey]),
    async toggle(taskId: string, seasonKey: string, today: DayKey): Promise<boolean> {
      const existing = await t.seasonalDone.list('task_id = ? AND season_key = ?', [taskId, seasonKey]);
      if (existing[0]) {
        await t.seasonalDone.remove(existing[0].id);
        return false;
      }
      await t.seasonalDone.insert({ id: newId('sc'), taskId, seasonKey, completedOn: today });
      return true;
    },
    /** Completion counts per past season instance, newest first. */
    async history(): Promise<{ seasonKey: string; done: number }[]> {
      const rows = await db.getAllAsync<{ season_key: string; n: number }>('SELECT season_key, COUNT(*) AS n FROM seasonal_completions GROUP BY season_key ORDER BY MAX(completed_on) DESC', []);
      return rows.map((r) => ({ seasonKey: r.season_key, done: Number(r.n) }));
    },
  };

  /* ---------------- notification settings */
  const notifications = {
    async all(): Promise<NotificationSetting[]> {
      const rows = await db.getAllAsync<{ plant_id: string | null; task_type: TaskType; enabled: number }>('SELECT plant_id, task_type, enabled FROM notification_settings', []);
      return rows.map((r) => ({ plantId: r.plant_id, taskType: r.task_type, enabled: Number(r.enabled) === 1 }));
    },
    async set(plantId: string | null, taskType: TaskType, enabled: boolean): Promise<void> {
      await db.runAsync("DELETE FROM notification_settings WHERE COALESCE(plant_id, '') = ? AND task_type = ?", [plantId ?? '', taskType]);
      await db.runAsync('INSERT INTO notification_settings (plant_id, task_type, enabled) VALUES (?, ?, ?)', [plantId, taskType, enabled ? 1 : 0]);
    },
  };

  /* ---------------- meta */
  const meta = {
    async get(key: string): Promise<string | null> {
      const r = await db.getFirstAsync<{ value: string }>('SELECT value FROM app_meta WHERE key = ?', [key]);
      return r?.value ?? null;
    },
    async set(key: string, value: string): Promise<void> {
      await db.runAsync('INSERT INTO app_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, value]);
    },
  };

  return { db, plants, locations, tasks, history, watering, growth, journal, health, fertilizer, soil, wishlist, seasonal, notifications, meta, photoPathsForPlant };
}

export type Repositories = ReturnType<typeof createRepositories>;
