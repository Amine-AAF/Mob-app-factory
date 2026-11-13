import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

import type { TemplateDef } from '@/content/templates';
import { clock } from '@/services/clock';
import { newId } from '@/utils/id';

export interface StoredTemplate {
  def: TemplateDef;
  source: 'bundle' | 'user';
  /** User templates have their own name (bundled ones are translated via i18n). */
  name: string | null;
}

/** Bundled templates are seeded (source = 'bundle'); learners can save their own (source = 'user'). */
export function createTemplatesRepository(db: SqlDatabase) {
  return {
    async list(): Promise<StoredTemplate[]> {
      const rows = await db.getAllAsync<{ id: string; source: 'bundle' | 'user'; payload: string }>("SELECT id, source, payload FROM templates ORDER BY CASE source WHEN 'user' THEN 0 ELSE 1 END, created_at, rowid", []);
      return rows
        .map((r) => {
          const p = fromJson<(TemplateDef & { name?: string }) | null>(r.payload, null);
          return p ? { def: { ...p, id: r.id }, source: r.source, name: p.name ?? null } : null;
        })
        .filter((t): t is StoredTemplate => !!t);
    },

    async get(id: string): Promise<StoredTemplate | null> {
      return (await this.list()).find((t) => t.def.id === id) ?? null;
    },

    async saveUserTemplate(name: string, def: Omit<TemplateDef, 'id' | 'premium'>): Promise<string> {
      const id = newId('ut');
      const t = clock.now().toISOString();
      await db.runAsync("INSERT INTO templates (id, source, category, premium, payload, created_at, updated_at) VALUES (?, 'user', ?, 0, ?, ?, ?)", [id, def.category, toJson({ ...def, id, premium: false, name }), t, t]);
      return id;
    },

    async removeUserTemplate(id: string): Promise<void> {
      await db.runAsync("DELETE FROM templates WHERE id = ? AND source = 'user'", [id]);
    },
  };
}

export type TemplatesRepository = ReturnType<typeof createTemplatesRepository>;
