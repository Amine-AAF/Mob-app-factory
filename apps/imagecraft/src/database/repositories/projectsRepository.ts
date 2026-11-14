import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

import type { EditState, OutputFormat } from '@/types/image';

/** Local history of processed pictures ("Projects"). Metadata only. */
export const PROJECT_KINDS = ['edit', 'resize', 'compress', 'convert', 'social', 'collage', 'batch'] as const;
export type ProjectKind = (typeof PROJECT_KINDS)[number];

/** Operation identifiers stored with a project (also i18n keys: operations.<id>). */
export const OPERATION_IDS = ['crop', 'rotate', 'flip', 'resize', 'compress', 'convert', 'filter', 'adjust', 'text', 'watermark', 'social', 'collage', 'batch'] as const;
export type OperationId = (typeof OPERATION_IDS)[number];

export interface Project {
  id: string;
  kind: ProjectKind;
  title: string;
  sourceUri: string | null;
  sourceName: string | null;
  editState: EditState | null;
  operations: OperationId[];
  outputUri: string | null;
  outputName: string | null;
  outputFormat: OutputFormat | null;
  outputBytes: number | null;
  outputWidth: number | null;
  outputHeight: number | null;
  inputBytes: number | null;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Row {
  id: string;
  kind: string;
  title: string;
  source_uri: string | null;
  source_name: string | null;
  edit_state: string | null;
  operations: string;
  output_uri: string | null;
  output_name: string | null;
  output_format: string | null;
  output_bytes: number | null;
  output_width: number | null;
  output_height: number | null;
  input_bytes: number | null;
  item_count: number;
  created_at: string;
  updated_at: string;
}

const isKind = (k: string): k is ProjectKind => (PROJECT_KINDS as readonly string[]).includes(k);
const isOp = (k: unknown): k is OperationId => typeof k === 'string' && (OPERATION_IDS as readonly string[]).includes(k);
const isFormat = (f: string | null): f is OutputFormat => f === 'jpeg' || f === 'png' || f === 'webp';

function toProject(r: Row): Project {
  return {
    id: r.id,
    kind: isKind(r.kind) ? r.kind : 'edit',
    title: r.title,
    sourceUri: r.source_uri,
    sourceName: r.source_name,
    editState: fromJson<EditState | null>(r.edit_state, null),
    operations: fromJson<unknown[]>(r.operations, []).filter(isOp),
    outputUri: r.output_uri,
    outputName: r.output_name,
    outputFormat: isFormat(r.output_format) ? r.output_format : null,
    outputBytes: r.output_bytes,
    outputWidth: r.output_width,
    outputHeight: r.output_height,
    inputBytes: r.input_bytes,
    itemCount: r.item_count,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export type NewProject = Omit<Project, 'createdAt' | 'updatedAt'>;

export function createProjectsRepository(db: SqlDatabase) {
  return {
    async save(p: NewProject, now: string): Promise<Project> {
      await db.runAsync(
        `INSERT INTO projects (id, kind, title, source_uri, source_name, edit_state, operations, output_uri, output_name, output_format,
           output_bytes, output_width, output_height, input_bytes, item_count, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET title = excluded.title, source_uri = excluded.source_uri, source_name = excluded.source_name,
           edit_state = excluded.edit_state, operations = excluded.operations, output_uri = excluded.output_uri,
           output_name = excluded.output_name, output_format = excluded.output_format, output_bytes = excluded.output_bytes,
           output_width = excluded.output_width, output_height = excluded.output_height, input_bytes = excluded.input_bytes,
           item_count = excluded.item_count, updated_at = excluded.updated_at`,
        [
          p.id,
          p.kind,
          p.title,
          p.sourceUri,
          p.sourceName,
          p.editState ? toJson(p.editState) : null,
          toJson(p.operations),
          p.outputUri,
          p.outputName,
          p.outputFormat,
          p.outputBytes,
          p.outputWidth,
          p.outputHeight,
          p.inputBytes,
          p.itemCount,
          now,
          now,
        ],
      );
      return (await this.get(p.id)) as Project;
    },
    async get(id: string): Promise<Project | null> {
      const r = await db.getFirstAsync<Row>('SELECT * FROM projects WHERE id = ?', [id]);
      return r ? toProject(r) : null;
    },
    async list(limit = 200): Promise<Project[]> {
      const rows = await db.getAllAsync<Row>('SELECT * FROM projects ORDER BY updated_at DESC LIMIT ?', [limit]);
      return rows.map(toProject);
    },
    async count(): Promise<number> {
      const r = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM projects', []);
      return r?.n ?? 0;
    },
    /** Deletes the row and returns it so the caller can delete the project's files. */
    async remove(id: string): Promise<Project | null> {
      const existing = await this.get(id);
      if (existing) await db.runAsync('DELETE FROM projects WHERE id = ?', [id]);
      return existing;
    },
    async clear(): Promise<void> {
      await db.runAsync('DELETE FROM projects', []);
    },
    async referencedFiles(): Promise<Set<string>> {
      const rows = await db.getAllAsync<{ source_uri: string | null; output_uri: string | null; edit_state: string | null }>('SELECT source_uri, output_uri, edit_state FROM projects', []);
      const out = new Set<string>();
      for (const r of rows) {
        if (r.source_uri) out.add(r.source_uri);
        if (r.output_uri) out.add(r.output_uri);
        // An imported watermark logo is part of a re-openable project.
        const logo = fromJson<EditState | null>(r.edit_state, null)?.watermark?.logoUri;
        if (logo) out.add(logo);
      }
      return out;
    },
  };
}

export function createToolUsageRepository(db: SqlDatabase) {
  return {
    async record(toolId: string, now: string): Promise<void> {
      await db.runAsync('INSERT INTO tool_usage (tool_id, uses, last_used_at) VALUES (?, 1, ?) ON CONFLICT(tool_id) DO UPDATE SET uses = uses + 1, last_used_at = excluded.last_used_at', [toolId, now]);
    },
    async top(limit: number): Promise<{ toolId: string; uses: number }[]> {
      const rows = await db.getAllAsync<{ tool_id: string; uses: number }>('SELECT tool_id, uses FROM tool_usage ORDER BY uses DESC, last_used_at DESC LIMIT ?', [limit]);
      return rows.map((r) => ({ toolId: r.tool_id, uses: r.uses }));
    },
    async clear(): Promise<void> {
      await db.runAsync('DELETE FROM tool_usage', []);
    },
  };
}
