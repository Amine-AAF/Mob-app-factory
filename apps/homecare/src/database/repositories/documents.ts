import type { SqlDatabase, SqlValue } from '@factory/storage';

import { addDays, type DayKey } from '@/domain/dates';
import { newId } from '@/domain/ids';
import type { DocumentType, HomeDocument } from '@/domain/types';

import { createTable, likePattern } from '../table';

export type DocumentInput = Omit<HomeDocument, 'id' | 'homeId' | 'createdAt' | 'updatedAt'>;

export interface DocumentFilters {
  search?: string;
  type?: DocumentType | null;
  assetId?: string | null;
  roomId?: string | null;
  /** Only documents with an expiry date. */
  expiringOnly?: boolean;
}

export function createDocumentsRepository(db: SqlDatabase, now: () => Date) {
  const docs = createTable<HomeDocument>(db, 'documents');
  const stamp = () => now().toISOString();

  return {
    get: (id: string) => docs.get(id),
    count: (homeId: string) => docs.count('home_id = ?', [homeId]),

    list(homeId: string, f: DocumentFilters = {}): Promise<HomeDocument[]> {
      const where = ['home_id = ?'];
      const params: SqlValue[] = [homeId];
      if (f.search?.trim()) {
        where.push("(LOWER(title) LIKE ? ESCAPE '\\' OR LOWER(COALESCE(file_name,'')) LIKE ? ESCAPE '\\' OR LOWER(COALESCE(notes,'')) LIKE ? ESCAPE '\\')");
        const p = likePattern(f.search);
        params.push(p, p, p);
      }
      if (f.type) {
        where.push('type = ?');
        params.push(f.type);
      }
      if (f.assetId) {
        where.push('asset_id = ?');
        params.push(f.assetId);
      }
      if (f.roomId) {
        where.push('room_id = ?');
        params.push(f.roomId);
      }
      if (f.expiringOnly) where.push('expiry_date IS NOT NULL');
      return docs.select(where.join(' AND '), params, f.expiringOnly ? 'expiry_date ASC' : 'created_at DESC');
    },

    async create(homeId: string, input: DocumentInput & { id?: string }): Promise<HomeDocument> {
      const id = input.id ?? newId('d_');
      const ts = stamp();
      await docs.insert({ ...input, id, homeId, title: input.title.trim(), createdAt: ts, updatedAt: ts });
      return (await docs.get(id)) as HomeDocument;
    },

    async update(id: string, patch: Partial<DocumentInput>): Promise<void> {
      await docs.update(id, { ...patch, updatedAt: stamp() });
    },

    remove: (id: string) => docs.delete(id),

    expiringBetween: (homeId: string, today: DayKey, windowDays: number, pastDays = 0) =>
      docs.select('home_id = ? AND expiry_date IS NOT NULL AND expiry_date BETWEEN ? AND ?', [homeId, addDays(today, -pastDays), addDays(today, windowDays)], 'expiry_date ASC'),

    withExpiry: (homeIds: string[], from: DayKey) =>
      homeIds.length ? docs.select(`home_id IN (${homeIds.map(() => '?').join(',')}) AND expiry_date >= ?`, [...homeIds, from], 'expiry_date ASC') : Promise.resolve([]),

    /** Every stored file path (used to clean orphan files and to delete a home's files). */
    async filePaths(homeId?: string): Promise<string[]> {
      const rows = await db.getAllAsync<{ file_path: string }>(
        `SELECT file_path FROM documents WHERE file_path IS NOT NULL${homeId ? ' AND home_id = ?' : ''}`,
        homeId ? [homeId] : [],
      );
      return rows.map((r) => r.file_path);
    },
  };
}

export type DocumentsRepository = ReturnType<typeof createDocumentsRepository>;
