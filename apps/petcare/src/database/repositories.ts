import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

import { createId } from '@/domain/units';
import {
  NOTIFICATION_CATEGORIES,
  type Activity,
  type Appointment,
  type Checklist,
  type ChecklistItem,
  type DayKey,
  type Expense,
  type FeedingLog,
  type FeedingSchedule,
  type FoodItem,
  type FoodPurchase,
  type HealthRecord,
  type NotificationCategory,
  type NotificationSetting,
  type Pet,
  type PetDocument,
  type Treatment,
  type TreatmentLog,
  type Vaccination,
  type WeightRecord,
} from '@/domain/types';

import { defineTable, type Table } from './table';

const ts = ['created_at', 'text'] as const;
const up = ['updated_at', 'text'] as const;

export function createTables(db: SqlDatabase) {
  return {
    pets: defineTable<Pet>(db, 'pets', {
      id: ['id', 'text'],
      name: ['name', 'text'],
      species: ['species', 'text'],
      breed: ['breed', 'text'],
      sex: ['sex', 'text'],
      birthDate: ['birth_date', 'text'],
      birthEstimated: ['birth_estimated', 'bool'],
      weightKg: ['weight_kg', 'real'],
      color: ['color', 'text'],
      identification: ['identification', 'text'],
      adoptionDate: ['adoption_date', 'text'],
      notes: ['notes', 'text'],
      photo: ['photo', 'text'],
      walkGoalMinutes: ['walk_goal_minutes', 'int'],
      archived: ['archived', 'bool'],
      createdAt: ts,
      updatedAt: up,
    }),
    health: defineTable<HealthRecord>(db, 'health_records', {
      id: ['id', 'text'],
      petId: ['pet_id', 'text'],
      date: ['date', 'text'],
      reason: ['reason', 'text'],
      vetName: ['vet_name', 'text'],
      clinic: ['clinic', 'text'],
      diagnosis: ['diagnosis', 'text'],
      exams: ['exams', 'text'],
      results: ['results', 'text'],
      notes: ['notes', 'text'],
      cost: ['cost', 'real'],
      currency: ['currency', 'text'],
      createdAt: ts,
      updatedAt: up,
    }),
    vaccinations: defineTable<Vaccination>(db, 'vaccinations', {
      id: ['id', 'text'],
      petId: ['pet_id', 'text'],
      name: ['name', 'text'],
      administeredDate: ['administered_date', 'text'],
      nextDueDate: ['next_due_date', 'text'],
      vetName: ['vet_name', 'text'],
      notes: ['notes', 'text'],
      reminderDaysBefore: ['reminder_days_before', 'int'],
      createdAt: ts,
      updatedAt: up,
    }),
    treatments: defineTable<Treatment>(db, 'treatments', {
      id: ['id', 'text'],
      petId: ['pet_id', 'text'],
      name: ['name', 'text'],
      instructions: ['instructions', 'text'],
      startDate: ['start_date', 'text'],
      endDate: ['end_date', 'text'],
      frequency: ['frequency', 'text'],
      reminderTimes: ['reminder_times', 'json'],
      remindersEnabled: ['reminders_enabled', 'bool'],
      prescriber: ['prescriber', 'text'],
      notes: ['notes', 'text'],
      stoppedAt: ['stopped_at', 'text'],
      createdAt: ts,
      updatedAt: up,
    }),
    treatmentLogs: defineTable<TreatmentLog>(db, 'treatment_logs', {
      id: ['id', 'text'],
      treatmentId: ['treatment_id', 'text'],
      givenAt: ['given_at', 'text'],
      note: ['note', 'text'],
    }),
    weights: defineTable<WeightRecord>(db, 'weight_records', {
      id: ['id', 'text'],
      petId: ['pet_id', 'text'],
      date: ['date', 'text'],
      weightKg: ['weight_kg', 'real'],
      heightCm: ['height_cm', 'real'],
      notes: ['notes', 'text'],
      createdAt: ts,
    }),
    feeding: defineTable<FeedingSchedule>(db, 'feeding_schedules', {
      id: ['id', 'text'],
      petId: ['pet_id', 'text'],
      foodType: ['food_type', 'text'],
      brand: ['brand', 'text'],
      product: ['product', 'text'],
      quantity: ['quantity', 'text'],
      mealTimes: ['meal_times', 'json'],
      remindersEnabled: ['reminders_enabled', 'bool'],
      active: ['active', 'bool'],
      notes: ['notes', 'text'],
      createdAt: ts,
      updatedAt: up,
    }),
    feedingLogs: defineTable<FeedingLog>(db, 'feeding_logs', {
      id: ['id', 'text'],
      petId: ['pet_id', 'text'],
      scheduleId: ['schedule_id', 'text'],
      fedAt: ['fed_at', 'text'],
      notes: ['notes', 'text'],
    }),
    food: defineTable<FoodItem>(db, 'food_inventory', {
      id: ['id', 'text'],
      petId: ['pet_id', 'text'],
      name: ['name', 'text'],
      brand: ['brand', 'text'],
      quantity: ['quantity', 'real'],
      unit: ['unit', 'text'],
      lowThreshold: ['low_threshold', 'real'],
      dailyUsage: ['daily_usage', 'real'],
      restockAlert: ['restock_alert', 'bool'],
      notes: ['notes', 'text'],
      createdAt: ts,
      updatedAt: up,
    }),
    purchases: defineTable<FoodPurchase>(db, 'food_purchases', {
      id: ['id', 'text'],
      foodId: ['food_id', 'text'],
      date: ['date', 'text'],
      quantity: ['quantity', 'real'],
      cost: ['cost', 'real'],
      currency: ['currency', 'text'],
      expenseId: ['expense_id', 'text'],
    }),
    appointments: defineTable<Appointment>(db, 'appointments', {
      id: ['id', 'text'],
      petId: ['pet_id', 'text'],
      type: ['type', 'text'],
      startsAt: ['starts_at', 'text'],
      title: ['title', 'text'],
      address: ['address', 'text'],
      provider: ['provider', 'text'],
      phone: ['phone', 'text'],
      notes: ['notes', 'text'],
      estimatedCost: ['estimated_cost', 'real'],
      currency: ['currency', 'text'],
      status: ['status', 'text'],
      remindMinutesBefore: ['remind_minutes_before', 'int'],
      createdAt: ts,
      updatedAt: up,
    }),
    documents: defineTable<PetDocument>(db, 'documents', {
      id: ['id', 'text'],
      petId: ['pet_id', 'text'],
      category: ['category', 'text'],
      title: ['title', 'text'],
      fileName: ['file_name', 'text'],
      mimeType: ['mime_type', 'text'],
      sizeBytes: ['size_bytes', 'int'],
      healthRecordId: ['health_record_id', 'text'],
      vaccinationId: ['vaccination_id', 'text'],
      notes: ['notes', 'text'],
      createdAt: ts,
    }),
    activities: defineTable<Activity>(db, 'activities', {
      id: ['id', 'text'],
      petId: ['pet_id', 'text'],
      type: ['type', 'text'],
      date: ['date', 'text'],
      durationMinutes: ['duration_minutes', 'int'],
      distanceKm: ['distance_km', 'real'],
      notes: ['notes', 'text'],
      createdAt: ts,
    }),
    expenses: defineTable<Expense>(db, 'expenses', {
      id: ['id', 'text'],
      petId: ['pet_id', 'text'],
      date: ['date', 'text'],
      amount: ['amount', 'real'],
      currency: ['currency', 'text'],
      category: ['category', 'text'],
      notes: ['notes', 'text'],
      receiptDocumentId: ['receipt_document_id', 'text'],
      createdAt: ts,
    }),
  };
}

export type Tables = ReturnType<typeof createTables>;
export type TableName = keyof Tables;

/* ------------------------------------------------------------------ Repositories */

export function createRepositories(db: SqlDatabase) {
  const t = createTables(db);
  const now = () => new Date().toISOString();

  /** Inserts an entity, filling id and timestamps. */
  async function create<K extends TableName>(table: K, data: Omit<Parameters<Tables[K]['insert']>[0], 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) {
    const stamp = now();
    const entity = { ...data, id: data.id ?? createId(), createdAt: stamp, updatedAt: stamp } as unknown as Parameters<Tables[K]['insert']>[0];
    // Tables without created_at/updated_at ignore the extra fields thanks to the column map.
    const tbl = t[table] as unknown as Table<{ id: string }>;
    return (await tbl.insert(entity as { id: string })) as Parameters<Tables[K]['insert']>[0];
  }

  async function update<K extends TableName>(table: K, id: string, patch: Partial<Parameters<Tables[K]['insert']>[0]>) {
    const tbl = t[table] as unknown as Table<{ id: string; updatedAt?: string }>;
    await tbl.update(id, { ...patch, updatedAt: now() } as Partial<{ id: string; updatedAt: string }>);
  }

  async function remove(table: TableName, id: string) {
    await (t[table] as unknown as Table<{ id: string }>).remove(id);
  }

  const pets = {
    listActive: () => t.pets.list('archived = 0', [], 'name COLLATE NOCASE'),
    listAll: () => t.pets.list(undefined, [], 'archived, name COLLATE NOCASE'),
    countActive: () => t.pets.count('archived = 0'),
    get: (id: string) => t.pets.get(id),
  };

  const byPet = <T extends { id: string }>(tbl: Table<T>, order: string) => ({
    forPet: (petId: string) => tbl.list('pet_id = ?', [petId], order),
    all: () => tbl.list(undefined, [], order),
    get: (id: string) => tbl.get(id),
    countForPet: (petId: string) => tbl.count('pet_id = ?', [petId]),
  });

  const settings = {
    async get<T>(key: string, fallback: T): Promise<T> {
      const r = await db.getFirstAsync<{ value: string }>('SELECT value FROM app_settings WHERE key = ?', [key]);
      return r ? fromJson<T>(r.value, fallback) : fallback;
    },
    async set<T>(key: string, value: T): Promise<void> {
      await db.runAsync('INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, toJson(value)]);
    },
  };

  const notificationSettings = {
    async all(): Promise<NotificationSetting[]> {
      const rows = await db.getAllAsync<{ category: string; enabled: number; hour: number; minute: number; weekday: number | null }>('SELECT * FROM notification_settings', []);
      return NOTIFICATION_CATEGORIES.map((category) => {
        const r = rows.find((x) => x.category === category);
        return r ? { category, enabled: r.enabled === 1, hour: r.hour, minute: r.minute, weekday: r.weekday } : DEFAULT_NOTIFICATION_SETTINGS[category];
      });
    },
    async save(s: NotificationSetting): Promise<void> {
      await db.runAsync(
        'INSERT INTO notification_settings (category, enabled, hour, minute, weekday) VALUES (?, ?, ?, ?, ?) ON CONFLICT(category) DO UPDATE SET enabled = excluded.enabled, hour = excluded.hour, minute = excluded.minute, weekday = excluded.weekday',
        [s.category, s.enabled ? 1 : 0, s.hour, s.minute, s.weekday],
      );
    },
  };

  const checklists = {
    async list(): Promise<Checklist[]> {
      const lists = await db.getAllAsync<{ id: string; pet_id: string | null; template_id: string | null; title: string; created_at: string }>('SELECT * FROM checklists ORDER BY created_at DESC', []);
      const items = await db.getAllAsync<{ id: string; checklist_id: string; position: number; label: string; done: number }>('SELECT * FROM checklist_items ORDER BY position', []);
      return lists.map((l) => ({
        id: l.id,
        petId: l.pet_id,
        templateId: l.template_id,
        title: l.title,
        createdAt: l.created_at,
        items: items.filter((i) => i.checklist_id === l.id).map((i) => ({ id: i.id, checklistId: i.checklist_id, position: i.position, label: i.label, done: i.done === 1 })),
      }));
    },
    async get(id: string): Promise<Checklist | null> {
      return (await checklists.list()).find((c) => c.id === id) ?? null;
    },
    /** Creates a checklist with its items in one transaction. */
    async create(input: { title: string; petId: string | null; templateId: string | null; labels: string[] }): Promise<string> {
      const id = createId('cl');
      await db.withTransactionAsync(async () => {
        await db.runAsync('INSERT INTO checklists (id, pet_id, template_id, title, created_at) VALUES (?, ?, ?, ?, ?)', [id, input.petId, input.templateId, input.title, now()]);
        for (const [position, label] of input.labels.entries()) {
          await db.runAsync('INSERT INTO checklist_items (id, checklist_id, position, label, done) VALUES (?, ?, ?, ?, 0)', [createId('ci'), id, position, label]);
        }
      });
      return id;
    },
    async toggle(itemId: string, done: boolean) {
      await db.runAsync('UPDATE checklist_items SET done = ? WHERE id = ?', [done ? 1 : 0, itemId]);
    },
    async addItem(checklistId: string, label: string) {
      const r = await db.getFirstAsync<{ p: number | null }>('SELECT MAX(position) AS p FROM checklist_items WHERE checklist_id = ?', [checklistId]);
      await db.runAsync('INSERT INTO checklist_items (id, checklist_id, position, label, done) VALUES (?, ?, ?, ?, 0)', [createId('ci'), checklistId, (r?.p ?? -1) + 1, label]);
    },
    async removeItem(itemId: string) {
      await db.runAsync('DELETE FROM checklist_items WHERE id = ?', [itemId]);
    },
    async reset(checklistId: string) {
      await db.runAsync('UPDATE checklist_items SET done = 0 WHERE checklist_id = ?', [checklistId]);
    },
    async remove(checklistId: string) {
      await db.runAsync('DELETE FROM checklists WHERE id = ?', [checklistId]);
    },
    count: async () => Number((await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM checklists', []))?.n ?? 0),
  };

  /**
   * Records a food purchase: adds the quantity to the stock and, when a cost is given,
   * creates the matching expense — atomically.
   */
  async function recordPurchase(input: { foodId: string; date: DayKey; quantity: number; cost: number | null; currency: string; petId: string | null }): Promise<void> {
    await db.withTransactionAsync(async () => {
      const item = await t.food.get(input.foodId);
      if (!item) throw new Error('food_not_found');
      let expenseId: string | null = null;
      if (input.cost != null && input.cost > 0) {
        expenseId = createId('ex');
        await t.expenses.insert({ id: expenseId, petId: input.petId ?? item.petId, date: input.date, amount: input.cost, currency: input.currency, category: 'food', notes: item.name, receiptDocumentId: null, createdAt: now() });
      }
      await t.purchases.insert({ id: createId('fp'), foodId: input.foodId, date: input.date, quantity: input.quantity, cost: input.cost, currency: input.cost != null ? input.currency : null, expenseId });
      await t.food.update(input.foodId, { quantity: item.quantity + input.quantity, updatedAt: now() });
    });
  }

  /** Decrements stock (never below zero). */
  async function consumeFood(foodId: string, amount: number): Promise<void> {
    const item = await t.food.get(foodId);
    if (!item) return;
    await t.food.update(foodId, { quantity: Math.max(0, item.quantity - amount), updatedAt: now() });
  }

  async function logTreatmentDose(treatmentId: string, note: string | null = null): Promise<void> {
    await t.treatmentLogs.insert({ id: createId('tl'), treatmentId, givenAt: now(), note });
  }

  async function logMeal(petId: string, scheduleId: string | null): Promise<void> {
    await t.feedingLogs.insert({ id: createId('fl'), petId, scheduleId, fedAt: now(), notes: null });
  }

  /** Every file name referenced by the database (used to detect orphans/missing files). */
  async function referencedFiles(): Promise<{ documents: string[]; photos: string[] }> {
    const docs = await db.getAllAsync<{ file_name: string }>('SELECT file_name FROM documents', []);
    const photos = await db.getAllAsync<{ photo: string }>('SELECT photo FROM pets WHERE photo IS NOT NULL', []);
    return { documents: docs.map((d) => d.file_name), photos: photos.map((p) => p.photo) };
  }

  return {
    db,
    tables: t,
    create,
    update,
    remove,
    pets,
    health: byPet(t.health, 'date DESC, created_at DESC'),
    vaccinations: byPet(t.vaccinations, 'COALESCE(next_due_date, administered_date) DESC'),
    treatments: { ...byPet(t.treatments, 'start_date DESC'), logs: (treatmentId: string) => t.treatmentLogs.list('treatment_id = ?', [treatmentId], 'given_at DESC') },
    weights: byPet(t.weights, 'date ASC, created_at ASC'),
    feeding: { ...byPet(t.feeding, 'active DESC, created_at'), logs: (petId: string) => t.feedingLogs.list('pet_id = ?', [petId], 'fed_at DESC') },
    food: { all: () => t.food.list(undefined, [], 'name COLLATE NOCASE'), get: (id: string) => t.food.get(id), purchases: (foodId: string) => t.purchases.list('food_id = ?', [foodId], 'date DESC') },
    appointments: {
      ...byPet(t.appointments, 'starts_at DESC'),
      upcoming: (fromIso: string) => t.appointments.list("status = 'scheduled' AND starts_at >= ?", [fromIso], 'starts_at ASC'),
    },
    documents: {
      ...byPet(t.documents, 'created_at DESC'),
      /** Case-insensitive search on title, notes and category. */
      search: (query: string, petId?: string) => {
        const like = `%${query.trim().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
        return t.documents.list(
          `(title LIKE ? ESCAPE '\\' OR notes LIKE ? ESCAPE '\\' OR category LIKE ? ESCAPE '\\')${petId ? ' AND pet_id = ?' : ''}`,
          petId ? [like, like, like, petId] : [like, like, like],
          'created_at DESC',
        );
      },
      forHealthRecord: (id: string) => t.documents.list('health_record_id = ?', [id], 'created_at DESC'),
    },
    activities: byPet(t.activities, 'date DESC'),
    expenses: {
      ...byPet(t.expenses, 'date DESC, created_at DESC'),
      between: (from: DayKey, to: DayKey) => t.expenses.list('date >= ? AND date <= ?', [from, to], 'date DESC'),
    },
    settings,
    notificationSettings,
    checklists,
    customTemplates: {
      list: async () =>
        (await db.getAllAsync<{ id: string; title: string; category: string; items: string }>('SELECT * FROM care_templates ORDER BY created_at DESC', [])).map((r) => ({
          id: r.id,
          title: r.title,
          category: r.category,
          items: fromJson<string[]>(r.items, []),
        })),
      create: async (title: string, category: string, items: string[]) => {
        const id = createId('ct');
        await db.runAsync('INSERT INTO care_templates (id, title, category, items, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)', [id, title, category, toJson(items), now(), now()]);
        return id;
      },
      remove: (id: string) => db.runAsync('DELETE FROM care_templates WHERE id = ?', [id]),
    },
    recordPurchase,
    consumeFood,
    logTreatmentDose,
    logMeal,
    referencedFiles,
  };
}

export type Repositories = ReturnType<typeof createRepositories>;

export const DEFAULT_NOTIFICATION_SETTINGS: Record<NotificationCategory, NotificationSetting> = {
  vaccinations: { category: 'vaccinations', enabled: true, hour: 9, minute: 0, weekday: null },
  treatments: { category: 'treatments', enabled: true, hour: 9, minute: 0, weekday: null },
  appointments: { category: 'appointments', enabled: true, hour: 9, minute: 0, weekday: null },
  meals: { category: 'meals', enabled: false, hour: 8, minute: 0, weekday: null },
  walks: { category: 'walks', enabled: false, hour: 18, minute: 0, weekday: null },
  grooming: { category: 'grooming', enabled: false, hour: 10, minute: 0, weekday: 6 },
  restock: { category: 'restock', enabled: true, hour: 10, minute: 0, weekday: null },
  weighIn: { category: 'weighIn', enabled: false, hour: 10, minute: 0, weekday: null },
};

export type { ChecklistItem };
