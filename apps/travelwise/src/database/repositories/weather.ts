import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

import { WEATHER_CONDITIONS, type WeatherCondition } from '@/constants/domain';
import { PACKING_CATALOG, type CatalogItem } from '@/content/packingCatalog';
import type { Id, WeatherNote } from '@/types/models';
import { clock } from '@/utils/clock';
import { createId } from '@/utils/ids';

/**
 * Weather notes typed by the user (expected conditions, temperatures). TravelWise shows
 * no forecast: a future provider could fill these notes, with its source and date.
 */
export class WeatherValidationError extends Error {
  constructor(public readonly code: 'invalid_condition' | 'invalid_temperature') {
    super(`Invalid weather note: ${code}`);
    this.name = 'WeatherValidationError';
  }
}

interface WeatherRow {
  id: string;
  trip_id: string;
  destination_id: string | null;
  conditions: string;
  min_temp_c: number | null;
  max_temp_c: number | null;
  notes: string;
  updated_at: string;
}

const toNote = (r: WeatherRow): WeatherNote => ({
  id: r.id,
  tripId: r.trip_id,
  destinationId: r.destination_id,
  conditions: fromJson<WeatherCondition[]>(r.conditions, []),
  minTempC: r.min_temp_c,
  maxTempC: r.max_temp_c,
  notes: r.notes,
  updatedAt: r.updated_at,
});

export interface WeatherInput {
  conditions: WeatherCondition[];
  minTempC?: number | null;
  maxTempC?: number | null;
  notes?: string;
}

/** Packing items worth suggesting for the conditions the user entered (catalogue ids). */
const BY_CONDITION: Record<WeatherCondition, string[]> = {
  sunny: ['toi-sunscreen', 'acc-sunglasses', 'clo-sun-hat', 'ess-water-bottle'],
  hot: ['clo-shorts', 'clo-sandals', 'ess-water-bottle', 'toi-sunscreen', 'toi-insect-repellent'],
  mild: ['clo-light-jacket'],
  cold: ['clo-winter-coat', 'clo-thermal-layers', 'clo-gloves', 'clo-beanie', 'clo-scarf', 'toi-lip-balm'],
  snow: ['clo-snow-boots', 'clo-wool-socks', 'acc-hand-warmers', 'clo-gloves', 'acc-sunglasses'],
  rain: ['clo-rain-jacket', 'acc-umbrella', 'ele-waterproof-case'],
  wind: ['clo-light-jacket', 'toi-lip-balm'],
  humid: ['toi-insect-repellent', 'clo-tshirts'],
};

export function weatherPackingSuggestions(note: Pick<WeatherNote, 'conditions' | 'minTempC' | 'maxTempC'> | null): CatalogItem[] {
  if (!note) return [];
  const ids = new Set<string>();
  const conditions = new Set(note.conditions);
  // Temperatures typed by the user refine the conditions (no forecast involved).
  if (note.minTempC !== null && note.minTempC <= 5) conditions.add('cold');
  if (note.maxTempC !== null && note.maxTempC >= 28) conditions.add('hot');
  for (const c of conditions) for (const id of BY_CONDITION[c]) ids.add(id);
  return PACKING_CATALOG.filter((i) => ids.has(i.id));
}

export function createWeatherRepository(db: SqlDatabase) {
  const repo = {
    async get(tripId: Id, destinationId: Id | null = null): Promise<WeatherNote | null> {
      const r = destinationId
        ? await db.getFirstAsync<WeatherRow>('SELECT * FROM weather_notes WHERE trip_id = ? AND destination_id = ?', [tripId, destinationId])
        : await db.getFirstAsync<WeatherRow>('SELECT * FROM weather_notes WHERE trip_id = ? AND destination_id IS NULL', [tripId]);
      return r ? toNote(r) : null;
    },

    async list(tripId: Id): Promise<WeatherNote[]> {
      return (await db.getAllAsync<WeatherRow>('SELECT * FROM weather_notes WHERE trip_id = ?', [tripId])).map(toNote);
    },

    /** One note per trip (destinationId null) or per destination. */
    async save(tripId: Id, destinationId: Id | null, input: WeatherInput): Promise<WeatherNote> {
      if (input.conditions.some((c) => !WEATHER_CONDITIONS.includes(c))) throw new WeatherValidationError('invalid_condition');
      const temps = [input.minTempC, input.maxTempC].filter((v): v is number => v !== null && v !== undefined);
      if (temps.some((t) => !Number.isFinite(t) || t < -60 || t > 60)) throw new WeatherValidationError('invalid_temperature');
      if (input.minTempC != null && input.maxTempC != null && input.minTempC > input.maxTempC) throw new WeatherValidationError('invalid_temperature');
      const existing = await repo.get(tripId, destinationId);
      const conditions = toJson([...new Set(input.conditions)]);
      if (existing) {
        await db.runAsync('UPDATE weather_notes SET conditions = ?, min_temp_c = ?, max_temp_c = ?, notes = ?, updated_at = ? WHERE id = ?', [
          conditions,
          input.minTempC ?? null,
          input.maxTempC ?? null,
          input.notes?.trim() ?? '',
          clock.instant(),
          existing.id,
        ]);
      } else {
        await db.runAsync('INSERT INTO weather_notes (id, trip_id, destination_id, conditions, min_temp_c, max_temp_c, notes, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
          createId(),
          tripId,
          destinationId,
          conditions,
          input.minTempC ?? null,
          input.maxTempC ?? null,
          input.notes?.trim() ?? '',
          clock.instant(),
        ]);
      }
      return (await repo.get(tripId, destinationId))!;
    },
  };
  return repo;
}
