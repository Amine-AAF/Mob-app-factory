import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

import type { ToolId } from '@/constants/tools';
import type { HistoryEntry, HistoryLine, HistoryPayload } from '@/types';

/**
 * CalculationHistory — local-only history of calculations (SQLite).
 * Nothing here ever leaves the device.
 *
 * - Free users keep their latest `limit` entries (older ones are pruned on insert).
 * - Premium passes `limit: null` (unlimited).
 * - Consecutive identical entries are not duplicated.
 */
interface Row {
  id: number;
  tool: string;
  expression: string;
  result: string;
  payload: string | null;
  created_at: string;
}

export interface NewEntry {
  tool: ToolId;
  expression: string;
  result: string;
  payload?: HistoryPayload;
}

const toEntry = (r: Row): HistoryEntry => ({
  id: r.id,
  tool: r.tool as ToolId,
  expression: r.expression,
  result: r.result,
  payload: r.payload ? fromJson<HistoryPayload | null>(r.payload, null) : null,
  createdAt: r.created_at,
});

function searchText(entry: NewEntry): string {
  const lines: HistoryLine[] = entry.payload ? [...entry.payload.inputs, ...entry.payload.outputs] : [];
  return [entry.tool, entry.expression, entry.result, ...lines.map((l) => l.value)].join(' ').toLowerCase();
}

/** Escapes LIKE wildcards so a search for "50%" means the literal text. */
function likePattern(query: string): string {
  return `%${query.toLowerCase().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

export function createHistoryRepository(db: SqlDatabase, now: () => Date = () => new Date()) {
  return {
    async add(entry: NewEntry, opts: { limit: number | null }): Promise<number | null> {
      const last = await db.getFirstAsync<Row>('SELECT * FROM history ORDER BY id DESC LIMIT 1', []);
      const payload = entry.payload ? toJson(entry.payload) : null;
      if (last && last.tool === entry.tool && last.expression === entry.expression && last.result === entry.result && last.payload === payload) {
        return null;
      }
      const ts = now().toISOString();
      const { lastInsertRowId } = await db.runAsync(
        'INSERT INTO history (tool, expression, result, payload, search_text, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [entry.tool, entry.expression, entry.result, payload, searchText(entry), ts, ts],
      );
      if (opts.limit !== null) await this.prune(opts.limit);
      return lastInsertRowId;
    },

    async prune(keep: number): Promise<number> {
      const { changes } = await db.runAsync('DELETE FROM history WHERE id NOT IN (SELECT id FROM history ORDER BY id DESC LIMIT ?)', [Math.max(0, Math.floor(keep))]);
      return changes;
    },

    /**
     * Lists newest first. `query` matches the expression, numbers and tool ids;
     * `toolIds` lets the UI add tools whose localized name matches the query.
     */
    async list(opts: { query?: string; toolIds?: string[]; limit?: number; offset?: number } = {}): Promise<HistoryEntry[]> {
      const params: (string | number)[] = [];
      let where = '';
      const q = opts.query?.trim();
      if (q) {
        const clauses = ["search_text LIKE ? ESCAPE '\\'"];
        params.push(likePattern(q));
        for (const id of opts.toolIds ?? []) {
          clauses.push('tool = ?');
          params.push(id);
        }
        where = `WHERE ${clauses.join(' OR ')}`;
      }
      params.push(opts.limit ?? 200, opts.offset ?? 0);
      const rows = await db.getAllAsync<Row>(`SELECT * FROM history ${where} ORDER BY id DESC LIMIT ? OFFSET ?`, params);
      return rows.map(toEntry);
    },

    async get(id: number): Promise<HistoryEntry | null> {
      const row = await db.getFirstAsync<Row>('SELECT * FROM history WHERE id = ?', [id]);
      return row ? toEntry(row) : null;
    },

    async remove(id: number): Promise<void> {
      await db.runAsync('DELETE FROM history WHERE id = ?', [id]);
    },

    async clear(): Promise<void> {
      await db.runAsync('DELETE FROM history', []);
    },

    async count(): Promise<number> {
      const r = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM history', []);
      return r?.n ?? 0;
    },
  };
}

export type HistoryRepository = ReturnType<typeof createHistoryRepository>;

/* ------------------------------------------------------------- Favorites */

export type ToggleOutcome = 'added' | 'removed' | 'limit';

export function createFavoritesRepository(db: SqlDatabase, now: () => Date = () => new Date()) {
  return {
    async list(): Promise<ToolId[]> {
      const rows = await db.getAllAsync<{ tool_id: string }>('SELECT tool_id FROM favorites ORDER BY position, created_at', []);
      return rows.map((r) => r.tool_id as ToolId);
    },

    async toggle(toolId: ToolId, opts: { max: number | null }): Promise<ToggleOutcome> {
      const existing = await db.getFirstAsync<{ tool_id: string }>('SELECT tool_id FROM favorites WHERE tool_id = ?', [toolId]);
      if (existing) {
        await db.runAsync('DELETE FROM favorites WHERE tool_id = ?', [toolId]);
        return 'removed';
      }
      const count = (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM favorites', []))?.n ?? 0;
      if (opts.max !== null && count >= opts.max) return 'limit';
      const pos = (await db.getFirstAsync<{ p: number | null }>('SELECT MAX(position) AS p FROM favorites', []))?.p ?? -1;
      await db.runAsync('INSERT INTO favorites (tool_id, position, created_at) VALUES (?, ?, ?)', [toolId, pos + 1, now().toISOString()]);
      return 'added';
    },

    /** Seeds the initial shortcuts once (first launch). */
    async seed(ids: readonly ToolId[]): Promise<void> {
      const count = (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM favorites', []))?.n ?? 0;
      if (count > 0) return;
      await db.withTransactionAsync(async () => {
        for (const [i, id] of ids.entries()) {
          await db.runAsync('INSERT OR IGNORE INTO favorites (tool_id, position, created_at) VALUES (?, ?, ?)', [id, i, now().toISOString()]);
        }
      });
    },

    async clear(): Promise<void> {
      await db.runAsync('DELETE FROM favorites', []);
    },
  };
}

export type FavoritesRepository = ReturnType<typeof createFavoritesRepository>;
