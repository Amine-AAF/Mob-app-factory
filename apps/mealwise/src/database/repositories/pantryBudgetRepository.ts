import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

import type { Expense, PriceEntry } from '@/domain/budget';
import type { DayKey, GroceryCategory, PantryItem, PantryLocation, UnitId } from '@/domain/types';

interface PantryRow {
  id: number;
  key: string;
  name: string;
  category: string;
  quantity: number | null;
  unit: string;
  location: string;
  expires_on: string | null;
  consumed_at: string | null;
  created_at: string;
}

const toPantry = (r: PantryRow): PantryItem => ({
  id: r.id,
  key: r.key,
  name: r.name,
  category: r.category as GroceryCategory,
  quantity: r.quantity,
  unit: r.unit as UnitId,
  location: r.location as PantryLocation,
  expiresOn: r.expires_on,
  createdAt: r.created_at,
  consumedAt: r.consumed_at,
});

export type PantryInput = Pick<PantryItem, 'key' | 'name' | 'category' | 'quantity' | 'unit' | 'location' | 'expiresOn'>;

export function createPantryRepository(db: SqlDatabase) {
  return {
    async active(): Promise<PantryItem[]> {
      return (await db.getAllAsync<PantryRow>('SELECT * FROM pantry_items WHERE consumed_at IS NULL ORDER BY name', [])).map(toPantry);
    },
    async get(id: number): Promise<PantryItem | null> {
      const r = await db.getFirstAsync<PantryRow>('SELECT * FROM pantry_items WHERE id = ?', [id]);
      return r ? toPantry(r) : null;
    },
    async countActive(): Promise<number> {
      return (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM pantry_items WHERE consumed_at IS NULL', []))?.n ?? 0;
    },
    async add(input: PantryInput, now = new Date()): Promise<number> {
      const ts = now.toISOString();
      const res = await db.runAsync(
        'INSERT INTO pantry_items (key, name, category, quantity, unit, location, expires_on, consumed_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)',
        [input.key, input.name.trim(), input.category, input.unit === 'to_taste' ? null : input.quantity, input.unit, input.location, input.expiresOn, ts, ts],
      );
      return res.lastInsertRowId;
    },
    async update(id: number, input: PantryInput, now = new Date()): Promise<void> {
      await db.runAsync('UPDATE pantry_items SET key = ?, name = ?, category = ?, quantity = ?, unit = ?, location = ?, expires_on = ?, updated_at = ? WHERE id = ?', [
        input.key,
        input.name.trim(),
        input.category,
        input.unit === 'to_taste' ? null : input.quantity,
        input.unit,
        input.location,
        input.expiresOn,
        now.toISOString(),
        id,
      ]);
    },
    /** "Consumed": kept for history, hidden from the pantry. */
    async consume(id: number, now = new Date()): Promise<void> {
      await db.runAsync('UPDATE pantry_items SET consumed_at = ?, updated_at = ? WHERE id = ?', [now.toISOString(), now.toISOString(), id]);
    },
    async remove(id: number): Promise<void> {
      await db.runAsync('DELETE FROM pantry_items WHERE id = ?', [id]);
    },
    async recentlyConsumed(limit = 30): Promise<PantryItem[]> {
      return (await db.getAllAsync<PantryRow>('SELECT * FROM pantry_items WHERE consumed_at IS NOT NULL ORDER BY consumed_at DESC LIMIT ?', [limit])).map(toPantry);
    },
  };
}

export type PantryRepository = ReturnType<typeof createPantryRepository>;

export function createBudgetRepository(db: SqlDatabase) {
  return {
    async expenses(from: DayKey, toInclusive: DayKey): Promise<Expense[]> {
      return db.getAllAsync<Expense>('SELECT id, day, amount, note, list_id AS listId FROM expenses WHERE day >= ? AND day <= ? ORDER BY day DESC, id DESC', [from, toInclusive]);
    },
    async addExpense(day: DayKey, amount: number, note: string | null, now = new Date()): Promise<number> {
      if (!(amount >= 0)) throw new Error('Amount must be >= 0');
      return (await db.runAsync('INSERT INTO expenses (day, amount, note, list_id, created_at) VALUES (?, ?, ?, NULL, ?)', [day, amount, note?.trim() || null, now.toISOString()])).lastInsertRowId;
    },
    async removeExpense(id: number): Promise<void> {
      await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
    },
    async prices(): Promise<Map<string, PriceEntry>> {
      const rows = await db.getAllAsync<PriceEntry & { unit: UnitId }>('SELECT key, price, quantity, unit FROM price_book', []);
      return new Map(rows.map((r) => [r.key, r]));
    },
    async setPrice(entry: PriceEntry, now = new Date()): Promise<void> {
      await db.runAsync(
        'INSERT INTO price_book (key, price, quantity, unit, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(key) DO UPDATE SET price = excluded.price, quantity = excluded.quantity, unit = excluded.unit, updated_at = excluded.updated_at',
        [entry.key, entry.price, entry.quantity, entry.unit, now.toISOString()],
      );
    },
    async removePrice(key: string): Promise<void> {
      await db.runAsync('DELETE FROM price_book WHERE key = ?', [key]);
    },
  };
}

export type BudgetRepository = ReturnType<typeof createBudgetRepository>;

export function createPreferencesRepository(db: SqlDatabase) {
  return {
    async get<T>(key: string, fallback: T): Promise<T> {
      const r = await db.getFirstAsync<{ value: string }>('SELECT value FROM user_preferences WHERE key = ?', [key]);
      return fromJson(r?.value, fallback);
    },
    async set<T>(key: string, value: T, now = new Date()): Promise<void> {
      await db.runAsync(
        'INSERT INTO user_preferences (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
        [key, toJson(value), now.toISOString()],
      );
    },
  };
}

export type PreferencesRepository = ReturnType<typeof createPreferencesRepository>;
