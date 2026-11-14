import type { SqlDatabase } from '@factory/storage';

import { DOCUMENT_TYPES, type DocumentType } from '@/constants/domain';
import type { Id, LocalDate, TravelDocument } from '@/types/models';
import { clock } from '@/utils/clock';
import { addDays, isValidDate } from '@/utils/dates';
import { createId } from '@/utils/ids';

/**
 * Travel documents: only metadata and the app-private file URI are stored in SQLite.
 * The file itself is copied by services/documents.ts into the app sandbox.
 */
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'] as const;
export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;

export type DocumentValidationCode = 'title_required' | 'title_too_long' | 'invalid_type' | 'unsupported_file' | 'file_too_large' | 'invalid_date' | 'not_found';

export class DocumentValidationError extends Error {
  constructor(
    public readonly code: DocumentValidationCode,
    public readonly field?: string,
  ) {
    super(`Invalid document: ${code}`);
    this.name = 'DocumentValidationError';
  }
}

interface DocumentRow {
  id: string;
  trip_id: string | null;
  title: string;
  type: string;
  file_uri: string;
  mime_type: string;
  size_bytes: number;
  expires_on: string | null;
  notes: string;
  created_at: string;
}

const toDocument = (r: DocumentRow): TravelDocument => ({
  id: r.id,
  tripId: r.trip_id,
  title: r.title,
  type: r.type as DocumentType,
  fileUri: r.file_uri,
  mimeType: r.mime_type,
  sizeBytes: r.size_bytes,
  expiresOn: r.expires_on,
  notes: r.notes,
  createdAt: r.created_at,
});

export interface DocumentMetaInput {
  title: string;
  type: DocumentType;
  tripId?: Id | null;
  expiresOn?: LocalDate | null;
  notes?: string;
}

/** Checks a picked file before it is copied (type and size), so nothing invalid is ever stored. */
export function checkFile(mimeType: string | null | undefined, sizeBytes: number | null | undefined): DocumentValidationCode | null {
  const mime = (mimeType ?? '').toLowerCase();
  if (!(ALLOWED_DOCUMENT_TYPES as readonly string[]).includes(mime)) return 'unsupported_file';
  if (sizeBytes == null || sizeBytes > MAX_DOCUMENT_BYTES) return 'file_too_large';
  return null;
}

function normalizeMeta(input: DocumentMetaInput) {
  const title = input.title.trim();
  if (!title) throw new DocumentValidationError('title_required', 'title');
  if (title.length > 120) throw new DocumentValidationError('title_too_long', 'title');
  if (!DOCUMENT_TYPES.includes(input.type)) throw new DocumentValidationError('invalid_type', 'type');
  const expiresOn = input.expiresOn?.trim() || null;
  if (expiresOn && !isValidDate(expiresOn)) throw new DocumentValidationError('invalid_date', 'expiresOn');
  return { title, type: input.type, tripId: input.tripId ?? null, expiresOn, notes: input.notes?.trim() ?? '' };
}

/** 'expired' | 'soon' (within `days`) | null — computed from the user-entered date only. */
export function expiryStatus(expiresOn: LocalDate | null, today: LocalDate, days = 30): 'expired' | 'soon' | null {
  if (!expiresOn || !isValidDate(expiresOn)) return null;
  if (expiresOn < today) return 'expired';
  return expiresOn <= addDays(today, days) ? 'soon' : null;
}

export function createDocumentRepository(db: SqlDatabase) {
  const repo = {
    /** Registers a file already copied into the app sandbox. */
    async create(meta: DocumentMetaInput, file: { uri: string; mimeType: string; sizeBytes: number }): Promise<TravelDocument> {
      const m = normalizeMeta(meta);
      const fileError = checkFile(file.mimeType, file.sizeBytes);
      if (fileError) throw new DocumentValidationError(fileError, 'file');
      const id = createId();
      await db.runAsync('INSERT INTO travel_documents (id, trip_id, title, type, file_uri, mime_type, size_bytes, expires_on, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        id,
        m.tripId,
        m.title,
        m.type,
        file.uri,
        file.mimeType.toLowerCase(),
        file.sizeBytes,
        m.expiresOn,
        m.notes,
        clock.instant(),
      ]);
      return (await repo.get(id))!;
    },

    async get(id: Id): Promise<TravelDocument | null> {
      const row = await db.getFirstAsync<DocumentRow>('SELECT * FROM travel_documents WHERE id = ?', [id]);
      return row ? toDocument(row) : null;
    },

    /** All documents (tripId undefined), a trip's documents, or unassigned ones (null). */
    async list(tripId?: Id | null): Promise<TravelDocument[]> {
      const rows =
        tripId === undefined
          ? await db.getAllAsync<DocumentRow>('SELECT * FROM travel_documents ORDER BY created_at DESC', [])
          : tripId === null
            ? await db.getAllAsync<DocumentRow>('SELECT * FROM travel_documents WHERE trip_id IS NULL ORDER BY created_at DESC', [])
            : await db.getAllAsync<DocumentRow>('SELECT * FROM travel_documents WHERE trip_id = ? ORDER BY created_at DESC', [tripId]);
      return rows.map(toDocument);
    },

    async update(id: Id, meta: DocumentMetaInput): Promise<TravelDocument> {
      const m = normalizeMeta(meta);
      const r = await db.runAsync('UPDATE travel_documents SET title = ?, type = ?, trip_id = ?, expires_on = ?, notes = ? WHERE id = ?', [m.title, m.type, m.tripId, m.expiresOn, m.notes, id]);
      if (!r.changes) throw new DocumentValidationError('not_found');
      return (await repo.get(id))!;
    },

    /** Deletes the row (bookings pointing to it are detached) and returns the file to delete. */
    async remove(id: Id): Promise<string | null> {
      const doc = await repo.get(id);
      if (!doc) return null;
      await db.runAsync('DELETE FROM travel_documents WHERE id = ?', [id]);
      return doc.fileUri;
    },

    async count(): Promise<number> {
      return (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM travel_documents', []))?.n ?? 0;
    },

    /** Every stored file URI (used to detect orphan files after an interrupted import). */
    async allFileUris(): Promise<string[]> {
      return (await db.getAllAsync<{ u: string }>('SELECT file_uri AS u FROM travel_documents', [])).map((r) => r.u);
    },
  };
  return repo;
}

export type DocumentRepository = ReturnType<typeof createDocumentRepository>;
