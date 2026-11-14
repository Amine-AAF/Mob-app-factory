import type { SqlDatabase } from '@factory/storage';

import { tableForKind, type AgendaItem, type AgendaKind, type Priority } from '@/features/agenda/agenda';
import { clock } from '@/services/clock';
import { newId } from '@/utils/id';

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  position: number;
}

export interface AgendaInput {
  kind: AgendaKind;
  title: string;
  subjectId: string | null;
  day: string;
  minute: number | null;
  priority: Priority;
  notes: string;
}

interface Row {
  id: string;
  kind: AgendaKind;
  title: string;
  subject_id: string | null;
  day: string;
  minute: number | null;
  priority: Priority;
  notes: string;
  done_at?: string | null;
  checklist_total: number;
  checklist_done: number;
}

const checklistCols = (owner: 'exam' | 'deadline', table: string) => `
  (SELECT COUNT(*) FROM checklist_items ci WHERE ci.owner_type = '${owner}' AND ci.owner_id = ${table}.id) AS checklist_total,
  (SELECT COUNT(*) FROM checklist_items ci WHERE ci.owner_type = '${owner}' AND ci.owner_id = ${table}.id AND ci.done = 1) AS checklist_done`;

const toItem = (r: Row, table: 'exams' | 'deadlines'): AgendaItem => ({
  id: r.id,
  table,
  kind: r.kind,
  title: r.title,
  subjectId: r.subject_id,
  day: r.day,
  minute: r.minute,
  priority: r.priority,
  notes: r.notes,
  done: table === 'deadlines' ? !!r.done_at : false,
  checklistDone: r.checklist_done,
  checklistTotal: r.checklist_total,
});

const ownerType = (table: 'exams' | 'deadlines') => (table === 'exams' ? 'exam' : 'deadline');

export function createAgendaRepository(db: SqlDatabase) {
  const now = () => clock.now().toISOString();

  return {
    /** Exams and deadlines together. `from` filters by date (inclusive). */
    async list(opts: { from?: string; subjectId?: string } = {}): Promise<AgendaItem[]> {
      const filters = (alias: string) => {
        const parts: string[] = [];
        const params: string[] = [];
        if (opts.from) {
          parts.push(`${alias}.day >= ?`);
          params.push(opts.from);
        }
        if (opts.subjectId) {
          parts.push(`${alias}.subject_id = ?`);
          params.push(opts.subjectId);
        }
        return { sql: parts.length ? `WHERE ${parts.join(' AND ')}` : '', params };
      };
      const fe = filters('exams');
      const fd = filters('deadlines');
      const exams = await db.getAllAsync<Row>(`SELECT exams.*, ${checklistCols('exam', 'exams')} FROM exams ${fe.sql}`, fe.params);
      const deadlines = await db.getAllAsync<Row>(`SELECT deadlines.*, ${checklistCols('deadline', 'deadlines')} FROM deadlines ${fd.sql}`, fd.params);
      return [...exams.map((r) => toItem(r, 'exams')), ...deadlines.map((r) => toItem(r, 'deadlines'))];
    },

    async get(table: 'exams' | 'deadlines', id: string): Promise<AgendaItem | null> {
      const r = await db.getFirstAsync<Row>(`SELECT ${table}.*, ${checklistCols(ownerType(table), table)} FROM ${table} WHERE id = ?`, [id]);
      return r ? toItem(r, table) : null;
    },

    async create(input: AgendaInput): Promise<{ table: 'exams' | 'deadlines'; id: string }> {
      const table = tableForKind(input.kind);
      const id = newId(table === 'exams' ? 'ex' : 'dl');
      const t = now();
      await db.runAsync(`INSERT INTO ${table} (id, subject_id, kind, title, day, minute, priority, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        id,
        input.subjectId,
        input.kind,
        input.title.trim(),
        input.day,
        input.minute,
        input.priority,
        input.notes.trim(),
        t,
        t,
      ]);
      return { table, id };
    },

    async update(table: 'exams' | 'deadlines', id: string, input: AgendaInput): Promise<void> {
      await db.runAsync(`UPDATE ${table} SET subject_id = ?, kind = ?, title = ?, day = ?, minute = ?, priority = ?, notes = ?, updated_at = ? WHERE id = ?`, [
        input.subjectId,
        input.kind,
        input.title.trim(),
        input.day,
        input.minute,
        input.priority,
        input.notes.trim(),
        now(),
        id,
      ]);
    },

    async setDeadlineDone(id: string, done: boolean): Promise<void> {
      await db.runAsync('UPDATE deadlines SET done_at = ?, updated_at = ? WHERE id = ?', [done ? now() : null, now(), id]);
    },

    async remove(table: 'exams' | 'deadlines', id: string): Promise<void> {
      await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM checklist_items WHERE owner_type = ? AND owner_id = ?', [ownerType(table), id]);
        await db.runAsync(`DELETE FROM ${table} WHERE id = ?`, [id]);
      });
    },

    async checklist(table: 'exams' | 'deadlines', id: string): Promise<ChecklistItem[]> {
      const rows = await db.getAllAsync<{ id: string; label: string; done: number; position: number }>('SELECT * FROM checklist_items WHERE owner_type = ? AND owner_id = ? ORDER BY position, created_at', [ownerType(table), id]);
      return rows.map((r) => ({ id: r.id, label: r.label, done: r.done === 1, position: r.position }));
    },

    async addChecklistItem(table: 'exams' | 'deadlines', ownerId: string, label: string): Promise<string> {
      const id = newId('ci');
      const t = now();
      const p = await db.getFirstAsync<{ p: number | null }>('SELECT MAX(position) AS p FROM checklist_items WHERE owner_type = ? AND owner_id = ?', [ownerType(table), ownerId]);
      await db.runAsync('INSERT INTO checklist_items (id, owner_type, owner_id, label, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, ownerType(table), ownerId, label.trim(), (p?.p ?? -1) + 1, t, t]);
      return id;
    },

    async toggleChecklistItem(id: string, done: boolean): Promise<void> {
      await db.runAsync('UPDATE checklist_items SET done = ?, updated_at = ? WHERE id = ?', [done ? 1 : 0, now(), id]);
    },

    async removeChecklistItem(id: string): Promise<void> {
      await db.runAsync('DELETE FROM checklist_items WHERE id = ?', [id]);
    },
  };
}

export type AgendaRepository = ReturnType<typeof createAgendaRepository>;
