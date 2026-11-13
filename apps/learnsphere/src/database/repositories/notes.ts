import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

import { plainText } from '@/features/notes/format';
import { clock } from '@/services/clock';
import { newId } from '@/utils/id';
import { likePattern, normalizeText } from '@/utils/text';

export interface Note {
  id: string;
  subjectId: string | null;
  chapterId: string | null;
  title: string;
  body: string;
  tags: string[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteRevision {
  id: string;
  noteId: string;
  title: string;
  body: string;
  createdAt: string;
}

export type NoteInput = Pick<Note, 'subjectId' | 'chapterId' | 'title' | 'body' | 'tags'>;

interface NoteRow {
  id: string;
  subject_id: string | null;
  chapter_id: string | null;
  title: string;
  body: string;
  tags: string;
  favorite: number;
  created_at: string;
  updated_at: string;
}

const toNote = (r: NoteRow): Note => ({
  id: r.id,
  subjectId: r.subject_id,
  chapterId: r.chapter_id,
  title: r.title,
  body: r.body,
  tags: fromJson<string[]>(r.tags, []),
  favorite: r.favorite === 1,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

/** Previous versions kept per note. */
export const MAX_REVISIONS = 20;
/** A new revision is recorded at most every 5 minutes of editing, so autosave doesn't flood history. */
export const REVISION_MIN_INTERVAL_MS = 5 * 60_000;

const searchText = (n: Pick<Note, 'title' | 'body' | 'tags'>) => normalizeText(`${n.title} ${plainText(n.body)} ${n.tags.join(' ')}`);

export interface NoteQuery {
  subjectId?: string | null;
  chapterId?: string | null;
  query?: string;
  tag?: string;
  favoritesOnly?: boolean;
}

export function createNotesRepository(db: SqlDatabase) {
  const now = () => clock.now().toISOString();

  return {
    async list(q: NoteQuery = {}): Promise<Note[]> {
      const where: string[] = [];
      const params: (string | number)[] = [];
      if (q.subjectId) {
        where.push('subject_id = ?');
        params.push(q.subjectId);
      }
      if (q.chapterId) {
        where.push('chapter_id = ?');
        params.push(q.chapterId);
      }
      if (q.favoritesOnly) where.push('favorite = 1');
      if (q.query?.trim()) {
        where.push("search_text LIKE ? ESCAPE '\\'");
        params.push(likePattern(q.query));
      }
      if (q.tag) {
        where.push('tags LIKE ?');
        params.push(`%${JSON.stringify(q.tag)}%`);
      }
      const rows = await db.getAllAsync<NoteRow>(`SELECT * FROM notes ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY favorite DESC, updated_at DESC`, params);
      return rows.map(toNote);
    },

    async get(id: string): Promise<Note | null> {
      const r = await db.getFirstAsync<NoteRow>('SELECT * FROM notes WHERE id = ?', [id]);
      return r ? toNote(r) : null;
    },

    async count(): Promise<number> {
      return (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM notes', []))?.n ?? 0;
    },

    async allTags(): Promise<string[]> {
      const rows = await db.getAllAsync<{ tags: string }>("SELECT tags FROM notes WHERE tags != '[]'", []);
      return Array.from(new Set(rows.flatMap((r) => fromJson<string[]>(r.tags, [])))).sort();
    },

    async create(input: NoteInput): Promise<string> {
      const id = newId('n');
      const t = now();
      await db.runAsync('INSERT INTO notes (id, subject_id, chapter_id, title, body, search_text, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        id,
        input.subjectId,
        input.chapterId,
        input.title.trim(),
        input.body,
        searchText(input),
        toJson(input.tags),
        t,
        t,
      ]);
      return id;
    },

    /**
     * Saves a note. The previous content is stored as a revision when it changed and the last
     * revision is older than REVISION_MIN_INTERVAL_MS. History is capped at MAX_REVISIONS.
     */
    async update(id: string, input: NoteInput): Promise<void> {
      await db.withTransactionAsync(async () => {
        const previous = await db.getFirstAsync<NoteRow>('SELECT * FROM notes WHERE id = ?', [id]);
        if (!previous) return;
        const changed = previous.title !== input.title.trim() || previous.body !== input.body;
        if (changed && previous.body.trim().length + previous.title.trim().length > 0) {
          const last = await db.getFirstAsync<{ created_at: string }>('SELECT created_at FROM note_revisions WHERE note_id = ? ORDER BY created_at DESC LIMIT 1', [id]);
          const lastMs = last ? new Date(last.created_at).getTime() : 0;
          if (clock.now().getTime() - lastMs >= REVISION_MIN_INTERVAL_MS) {
            await db.runAsync('INSERT INTO note_revisions (id, note_id, title, body, created_at) VALUES (?, ?, ?, ?, ?)', [newId('nr'), id, previous.title, previous.body, now()]);
            await db.runAsync(
              'DELETE FROM note_revisions WHERE note_id = ? AND id NOT IN (SELECT id FROM note_revisions WHERE note_id = ? ORDER BY created_at DESC LIMIT ?)',
              [id, id, MAX_REVISIONS],
            );
          }
        }
        await db.runAsync('UPDATE notes SET subject_id = ?, chapter_id = ?, title = ?, body = ?, search_text = ?, tags = ?, updated_at = ? WHERE id = ?', [
          input.subjectId,
          input.chapterId,
          input.title.trim(),
          input.body,
          searchText(input),
          toJson(input.tags),
          now(),
          id,
        ]);
      });
    },

    async setFavorite(id: string, favorite: boolean): Promise<void> {
      await db.runAsync('UPDATE notes SET favorite = ?, updated_at = ? WHERE id = ?', [favorite ? 1 : 0, now(), id]);
    },

    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
    },

    async revisions(noteId: string): Promise<NoteRevision[]> {
      const rows = await db.getAllAsync<{ id: string; note_id: string; title: string; body: string; created_at: string }>('SELECT * FROM note_revisions WHERE note_id = ? ORDER BY created_at DESC', [noteId]);
      return rows.map((r) => ({ id: r.id, noteId: r.note_id, title: r.title, body: r.body, createdAt: r.created_at }));
    },

    /** Restores a revision (the current content becomes a revision itself). */
    async restoreRevision(revisionId: string): Promise<void> {
      const rev = await db.getFirstAsync<{ note_id: string; title: string; body: string }>('SELECT note_id, title, body FROM note_revisions WHERE id = ?', [revisionId]);
      if (!rev) return;
      const note = await db.getFirstAsync<NoteRow>('SELECT * FROM notes WHERE id = ?', [rev.note_id]);
      if (!note) return;
      await db.runAsync('INSERT INTO note_revisions (id, note_id, title, body, created_at) VALUES (?, ?, ?, ?, ?)', [newId('nr'), note.id, note.title, note.body, now()]);
      const tags = fromJson<string[]>(note.tags, []);
      await db.runAsync('UPDATE notes SET title = ?, body = ?, search_text = ?, updated_at = ? WHERE id = ?', [rev.title, rev.body, searchText({ title: rev.title, body: rev.body, tags }), now(), note.id]);
    },
  };
}

export type NotesRepository = ReturnType<typeof createNotesRepository>;
