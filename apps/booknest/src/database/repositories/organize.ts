import type { SqlDatabase, SqlValue } from '@factory/storage';

import { clock } from '@/services/clock';
import type { Collection, GoalType, NotificationKind, NotificationSetting, ReadingGoal, WishlistItem, WishlistStatus } from '@/types';
import { cleanText, newId } from '@/utils';

type Row = Record<string, SqlValue>;
const s = (v: SqlValue | undefined): string | null => (v == null ? null : String(v));
const n = (v: SqlValue | undefined): number | null => (v == null ? null : Number(v));

function mapGoal(r: Row): ReadingGoal {
  return {
    id: String(r.id),
    type: String(r.type) as GoalType,
    title: s(r.title),
    target: Number(r.target),
    unit: s(r.unit),
    manualProgress: Number(r.manual_progress),
    challengeId: s(r.challenge_id),
    periodStart: String(r.period_start),
    periodEnd: s(r.period_end),
    isActive: Number(r.is_active) === 1,
    completedAt: s(r.completed_at),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

function mapWish(r: Row): WishlistItem {
  return {
    id: String(r.id),
    title: String(r.title),
    author: s(r.author),
    coverUri: s(r.cover_uri),
    estimatedPriceCents: n(r.estimated_price_cents),
    currency: s(r.currency),
    store: s(r.store),
    url: s(r.url),
    priority: Number(r.priority) as 1 | 2 | 3,
    notes: s(r.notes),
    status: String(r.status) as WishlistStatus,
    bookId: s(r.book_id),
    acquiredAt: s(r.acquired_at),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

export interface GoalInput {
  type: GoalType;
  title?: string | null;
  target: number;
  unit?: string | null;
  challengeId?: string | null;
  periodStart: string;
  periodEnd?: string | null;
}

export interface WishlistInput {
  title: string;
  author?: string | null;
  coverUri?: string | null;
  estimatedPriceCents?: number | null;
  currency?: string | null;
  store?: string | null;
  url?: string | null;
  priority?: 1 | 2 | 3;
  notes?: string | null;
  status?: WishlistStatus;
}

export type WishlistSort = 'priority' | 'recent' | 'price' | 'title';

export function createOrganizeRepository(db: SqlDatabase) {
  return {
    /* --------------------------------------------------------------- goals */
    async saveGoal(input: GoalInput, id?: string): Promise<string> {
      const now = clock.iso();
      if (id) {
        await db.runAsync('UPDATE reading_goals SET type = ?, title = ?, target = ?, unit = ?, period_start = ?, period_end = ?, updated_at = ? WHERE id = ?', [
          input.type, cleanText(input.title), Math.floor(input.target), cleanText(input.unit), input.periodStart, input.periodEnd ?? null, now, id,
        ]);
        return id;
      }
      const gid = newId();
      await db.runAsync(
        'INSERT INTO reading_goals (id, type, title, target, unit, manual_progress, challenge_id, period_start, period_end, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, 1, ?, ?)',
        [gid, input.type, cleanText(input.title), Math.floor(input.target), cleanText(input.unit), input.challengeId ?? null, input.periodStart, input.periodEnd ?? null, now, now],
      );
      return gid;
    },
    async goals(opts: { activeOnly?: boolean } = {}): Promise<ReadingGoal[]> {
      const rows = await db.getAllAsync<Row>(`SELECT * FROM reading_goals ${opts.activeOnly ? 'WHERE is_active = 1' : ''} ORDER BY is_active DESC, created_at DESC`, []);
      return rows.map(mapGoal);
    },
    async goal(id: string): Promise<ReadingGoal | null> {
      const r = await db.getFirstAsync<Row>('SELECT * FROM reading_goals WHERE id = ?', [id]);
      return r ? mapGoal(r) : null;
    },
    async setGoalManualProgress(id: string, value: number) {
      await db.runAsync('UPDATE reading_goals SET manual_progress = ?, updated_at = ? WHERE id = ?', [Math.max(0, Math.floor(value)), clock.iso(), id]);
    },
    async markGoalCompleted(id: string, at: string | null) {
      await db.runAsync('UPDATE reading_goals SET completed_at = ?, updated_at = ? WHERE id = ?', [at, clock.iso(), id]);
    },
    async setGoalActive(id: string, active: boolean) {
      await db.runAsync('UPDATE reading_goals SET is_active = ?, updated_at = ? WHERE id = ?', [active ? 1 : 0, clock.iso(), id]);
    },
    async deleteGoal(id: string) {
      await db.runAsync('DELETE FROM reading_goals WHERE id = ?', [id]);
    },

    /* --------------------------------------------------------- collections */
    async collections(): Promise<Collection[]> {
      const rows = await db.getAllAsync<Row>(
        `SELECT c.*, (SELECT COUNT(*) FROM collection_books cb WHERE cb.collection_id = c.id) AS book_count
           FROM collections c ORDER BY c.is_pinned DESC, c.sort_order, c.created_at`,
        [],
      );
      const thumbs = await db.getAllAsync<{ collection_id: string; u: string }>(
        `SELECT cb.collection_id, b.cover_thumb_uri AS u FROM collection_books cb JOIN books b ON b.id = cb.book_id
          WHERE b.cover_thumb_uri IS NOT NULL ORDER BY cb.added_at DESC`,
        [],
      );
      const byCol = new Map<string, string[]>();
      for (const t of thumbs) {
        const list = byCol.get(t.collection_id) ?? [];
        if (list.length < 3) list.push(t.u);
        byCol.set(t.collection_id, list);
      }
      return rows.map((r) => ({
        id: String(r.id),
        name: String(r.name),
        presetKey: s(r.preset_key),
        icon: String(r.icon),
        color: s(r.color),
        sortOrder: Number(r.sort_order),
        isPinned: Number(r.is_pinned) === 1,
        createdAt: String(r.created_at),
        bookCount: Number(r.book_count),
        coverThumbs: byCol.get(String(r.id)) ?? [],
      }));
    },
    async createCollection(input: { name: string; icon?: string; color?: string | null; presetKey?: string | null }): Promise<string> {
      const id = newId();
      const max = await db.getFirstAsync<{ m: number | null }>('SELECT MAX(sort_order) AS m FROM collections', []);
      await db.runAsync('INSERT INTO collections (id, name, preset_key, icon, color, sort_order, is_pinned, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?)', [
        id, input.name.trim(), input.presetKey ?? null, input.icon ?? 'bookmark', input.color ?? null, (max?.m ?? 0) + 1, clock.iso(),
      ]);
      return id;
    },
    async renameCollection(id: string, name: string, icon?: string) {
      await db.runAsync('UPDATE collections SET name = ?, icon = COALESCE(?, icon) WHERE id = ?', [name.trim(), icon ?? null, id]);
    },
    async setCollectionPinned(id: string, pinned: boolean) {
      await db.runAsync('UPDATE collections SET is_pinned = ? WHERE id = ?', [pinned ? 1 : 0, id]);
    },
    async deleteCollection(id: string) {
      await db.runAsync('DELETE FROM collections WHERE id = ?', [id]);
    },
    async addToCollection(collectionId: string, bookId: string) {
      await db.runAsync('INSERT OR IGNORE INTO collection_books (collection_id, book_id, added_at) VALUES (?, ?, ?)', [collectionId, bookId, clock.iso()]);
    },
    async removeFromCollection(collectionId: string, bookId: string) {
      await db.runAsync('DELETE FROM collection_books WHERE collection_id = ? AND book_id = ?', [collectionId, bookId]);
    },
    async collectionsOfBook(bookId: string): Promise<string[]> {
      const rows = await db.getAllAsync<{ collection_id: string }>('SELECT collection_id FROM collection_books WHERE book_id = ?', [bookId]);
      return rows.map((r) => r.collection_id);
    },
    async customCollectionCount(): Promise<number> {
      return (await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM collections WHERE preset_key IS NULL', []))?.c ?? 0;
    },

    /* ------------------------------------------------------------ wishlist */
    async saveWish(input: WishlistInput, id?: string): Promise<string> {
      const now = clock.iso();
      const vals: SqlValue[] = [
        input.title.trim(), cleanText(input.author), input.coverUri ?? null, input.estimatedPriceCents ?? null, cleanText(input.currency)?.toUpperCase() ?? null,
        cleanText(input.store), cleanText(input.url), input.priority ?? 2, cleanText(input.notes), input.status ?? 'want_to_buy',
      ];
      if (id) {
        await db.runAsync(
          'UPDATE wishlist_items SET title = ?, author = ?, cover_uri = ?, estimated_price_cents = ?, currency = ?, store = ?, url = ?, priority = ?, notes = ?, status = ?, updated_at = ? WHERE id = ?',
          [...vals, now, id],
        );
        return id;
      }
      const wid = newId();
      await db.runAsync(
        'INSERT INTO wishlist_items (title, author, cover_uri, estimated_price_cents, currency, store, url, priority, notes, status, id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [...vals, wid, now, now],
      );
      return wid;
    },
    async wish(id: string): Promise<WishlistItem | null> {
      const r = await db.getFirstAsync<Row>('SELECT * FROM wishlist_items WHERE id = ?', [id]);
      return r ? mapWish(r) : null;
    },
    async wishlist(opts: { status?: WishlistStatus | null; search?: string; sort?: WishlistSort } = {}): Promise<WishlistItem[]> {
      const where: string[] = [];
      const params: SqlValue[] = [];
      if (opts.status) (where.push('status = ?'), params.push(opts.status));
      if (opts.search?.trim()) {
        where.push('(title LIKE ? OR author LIKE ? OR store LIKE ?)');
        const like = `%${opts.search.trim()}%`;
        params.push(like, like, like);
      }
      const order = {
        priority: 'priority ASC, created_at DESC',
        recent: 'created_at DESC',
        price: 'COALESCE(estimated_price_cents, 999999999) ASC',
        title: 'title COLLATE NOCASE ASC',
      }[opts.sort ?? 'priority'];
      const rows = await db.getAllAsync<Row>(`SELECT * FROM wishlist_items ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY ${order}`, params);
      return rows.map(mapWish);
    },
    async setWishStatus(id: string, status: WishlistStatus, bookId?: string | null) {
      const now = clock.iso();
      const acquired = status === 'purchased' || status === 'added_to_library';
      await db.runAsync(
        'UPDATE wishlist_items SET status = ?, book_id = COALESCE(?, book_id), acquired_at = CASE WHEN ? THEN COALESCE(acquired_at, ?) ELSE NULL END, updated_at = ? WHERE id = ?',
        [status, bookId ?? null, acquired ? 1 : 0, now, now, id],
      );
    },
    async deleteWish(id: string) {
      await db.runAsync('DELETE FROM wishlist_items WHERE id = ?', [id]);
    },

    /* --------------------------------------------------- notifications */
    async notificationSettings(): Promise<NotificationSetting[]> {
      const rows = await db.getAllAsync<Row>('SELECT * FROM notification_settings ORDER BY rowid', []);
      return rows.map((r) => ({ kind: String(r.kind) as NotificationKind, enabled: Number(r.enabled) === 1, hour: Number(r.hour), minute: Number(r.minute), weekday: n(r.weekday) }));
    },
    async saveNotificationSetting(setting: NotificationSetting) {
      await db.runAsync(
        `INSERT INTO notification_settings (kind, enabled, hour, minute, weekday, updated_at) VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(kind) DO UPDATE SET enabled = excluded.enabled, hour = excluded.hour, minute = excluded.minute, weekday = excluded.weekday, updated_at = excluded.updated_at`,
        [setting.kind, setting.enabled ? 1 : 0, setting.hour, setting.minute, setting.weekday, clock.iso()],
      );
    },
  };
}

export type OrganizeRepository = ReturnType<typeof createOrganizeRepository>;
