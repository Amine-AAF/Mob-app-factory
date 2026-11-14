import type { SqlDatabase } from '@factory/storage';

import { PLACE_CATEGORIES, type PlaceCategory } from '@/constants/domain';
import type { Id, Place } from '@/types/models';
import { clock } from '@/utils/clock';
import { createId } from '@/utils/ids';

import { bool } from '../rows';
import { normalizeUrl } from './itinerary';

export type PlaceValidationCode = 'name_required' | 'name_too_long' | 'invalid_category' | 'invalid_coordinates' | 'invalid_country' | 'invalid_url' | 'not_found';

export class PlaceValidationError extends Error {
  constructor(
    public readonly code: PlaceValidationCode,
    public readonly field?: string,
  ) {
    super(`Invalid place: ${code}`);
    this.name = 'PlaceValidationError';
  }
}

interface PlaceRow {
  id: string;
  trip_id: string | null;
  day_id: string | null;
  name: string;
  address: string;
  city: string;
  country_code: string | null;
  category: string;
  notes: string;
  url: string | null;
  latitude: number | null;
  longitude: number | null;
  photo_uri: string | null;
  is_favorite: number;
  created_at: string;
}

const toPlace = (r: PlaceRow): Place => ({
  id: r.id,
  tripId: r.trip_id,
  dayId: r.day_id,
  name: r.name,
  address: r.address,
  city: r.city,
  countryCode: r.country_code,
  category: r.category as PlaceCategory,
  notes: r.notes,
  url: r.url,
  latitude: r.latitude,
  longitude: r.longitude,
  photoUri: r.photo_uri,
  isFavorite: r.is_favorite === 1,
  createdAt: r.created_at,
});

export interface PlaceInput {
  name: string;
  address?: string;
  city?: string;
  countryCode?: string | null;
  category?: PlaceCategory;
  notes?: string;
  url?: string | null;
  /** Only coordinates typed or pasted by the user; never guessed. Both or none. */
  latitude?: number | null;
  longitude?: number | null;
  photoUri?: string | null;
  isFavorite?: boolean;
  tripId?: Id | null;
  dayId?: Id | null;
}

/** Parses "38.7223, -9.1393" (or two separate values). Null when not a valid pair. */
export function parseCoordinates(text: string): { latitude: number; longitude: number } | null {
  const m = /^\s*(-?\d{1,2}(?:[.,]\d+)?)\s*[,; ]\s*(-?\d{1,3}(?:[.,]\d+)?)\s*$/.exec(text);
  if (!m) return null;
  const latitude = Number(m[1]!.replace(',', '.'));
  const longitude = Number(m[2]!.replace(',', '.'));
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude, longitude };
}

function normalize(input: PlaceInput) {
  const name = input.name.trim();
  if (!name) throw new PlaceValidationError('name_required', 'name');
  if (name.length > 120) throw new PlaceValidationError('name_too_long', 'name');
  const category = input.category ?? 'other';
  if (!PLACE_CATEGORIES.includes(category)) throw new PlaceValidationError('invalid_category', 'category');
  const lat = input.latitude ?? null;
  const lng = input.longitude ?? null;
  if ((lat === null) !== (lng === null)) throw new PlaceValidationError('invalid_coordinates', 'coordinates');
  if (lat !== null && lng !== null && (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180)) {
    throw new PlaceValidationError('invalid_coordinates', 'coordinates');
  }
  const country = input.countryCode?.trim().toUpperCase() || null;
  if (country && !/^[A-Z]{2}$/.test(country)) throw new PlaceValidationError('invalid_country', 'country');
  let url: string | null;
  try {
    url = normalizeUrl(input.url);
  } catch {
    throw new PlaceValidationError('invalid_url', 'url');
  }
  return {
    name,
    address: input.address?.trim() ?? '',
    city: input.city?.trim() ?? '',
    country,
    category,
    notes: input.notes?.trim() ?? '',
    url,
    lat,
    lng,
    photoUri: input.photoUri ?? null,
    isFavorite: !!input.isFavorite,
    tripId: input.tripId ?? null,
    dayId: input.dayId ?? null,
  };
}

/**
 * Links that hand the place over to a map app installed on the phone. TravelWise has no
 * map SDK and computes no route: the external app does that, online or with its own maps.
 * - `geo:` opens the user's default map app (Android intent).
 * - The Google Maps URL opens the Maps app if installed, else the browser.
 */
export function mapLinks(p: Pick<Place, 'name' | 'address' | 'city' | 'latitude' | 'longitude'>): { geo: string; web: string } | null {
  const text = [p.name, p.address, p.city].filter((s) => s && s.trim()).join(', ');
  if (p.latitude !== null && p.longitude !== null) {
    const ll = `${p.latitude},${p.longitude}`;
    return {
      geo: `geo:${ll}?q=${ll}(${encodeURIComponent(p.name)})`,
      web: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ll)}`,
    };
  }
  if (!text) return null;
  return { geo: `geo:0,0?q=${encodeURIComponent(text)}`, web: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}` };
}

export function createPlaceRepository(db: SqlDatabase) {
  const repo = {
    async get(id: Id): Promise<Place | null> {
      const r = await db.getFirstAsync<PlaceRow>('SELECT * FROM places WHERE id = ?', [id]);
      return r ? toPlace(r) : null;
    },

    async list(filter: { tripId?: Id | null; favorites?: boolean; category?: PlaceCategory | null; search?: string } = {}): Promise<Place[]> {
      const where: string[] = [];
      const params: (string | number)[] = [];
      if (filter.tripId) {
        where.push('trip_id = ?');
        params.push(filter.tripId);
      }
      if (filter.favorites) where.push('is_favorite = 1');
      if (filter.category) {
        where.push('category = ?');
        params.push(filter.category);
      }
      if (filter.search?.trim()) {
        const like = `%${filter.search.trim().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
        where.push("(name LIKE ? ESCAPE '\\' OR city LIKE ? ESCAPE '\\' OR address LIKE ? ESCAPE '\\')");
        params.push(like, like, like);
      }
      const rows = await db.getAllAsync<PlaceRow>(`SELECT * FROM places ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY is_favorite DESC, name COLLATE NOCASE`, params);
      return rows.map(toPlace);
    },

    async create(input: PlaceInput): Promise<Place> {
      const p = normalize(input);
      const id = createId();
      await db.runAsync(
        `INSERT INTO places (id, trip_id, day_id, name, address, city, country_code, category, notes, url, latitude, longitude, photo_uri, is_favorite, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, p.tripId, p.dayId, p.name, p.address, p.city, p.country, p.category, p.notes, p.url, p.lat, p.lng, p.photoUri, bool(p.isFavorite), clock.instant()],
      );
      return (await repo.get(id))!;
    },

    /** Updates a place; returns the previous photo URI when it was replaced or removed (to delete the file). */
    async update(id: Id, input: PlaceInput): Promise<{ place: Place; replacedPhoto: string | null }> {
      const before = await repo.get(id);
      if (!before) throw new PlaceValidationError('not_found');
      const p = normalize(input);
      await db.runAsync(
        `UPDATE places SET trip_id = ?, day_id = ?, name = ?, address = ?, city = ?, country_code = ?, category = ?, notes = ?, url = ?, latitude = ?, longitude = ?,
           photo_uri = ?, is_favorite = ? WHERE id = ?`,
        [p.tripId, p.dayId, p.name, p.address, p.city, p.country, p.category, p.notes, p.url, p.lat, p.lng, p.photoUri, bool(p.isFavorite), id],
      );
      return { place: (await repo.get(id))!, replacedPhoto: before.photoUri && before.photoUri !== p.photoUri ? before.photoUri : null };
    },

    async setFavorite(id: Id, favorite: boolean): Promise<void> {
      await db.runAsync('UPDATE places SET is_favorite = ? WHERE id = ?', [bool(favorite), id]);
    },

    async assignDay(id: Id, dayId: Id | null): Promise<void> {
      await db.runAsync('UPDATE places SET day_id = ? WHERE id = ?', [dayId, id]);
    },

    /** Deletes the place (activities keep their data, their link is cleared) and returns its photo. */
    async remove(id: Id): Promise<string | null> {
      const p = await repo.get(id);
      if (!p) return null;
      await db.runAsync('DELETE FROM places WHERE id = ?', [id]);
      return p.photoUri;
    },
  };
  return repo;
}

export type PlaceRepository = ReturnType<typeof createPlaceRepository>;
