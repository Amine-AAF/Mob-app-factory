import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

import type { ArtColor, Difficulty, Nutrition, Recipe, RecipeCategory, RecipeIngredient, RecipeStep } from '@/domain/types';

interface Row {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  prep_minutes: number;
  cook_minutes: number;
  servings: number;
  difficulty: string;
  categories: string;
  tags: string;
  ingredients: string;
  steps: string;
  nutrition: string | null;
  created_at: string;
  updated_at: string;
}

function toRecipe(r: Row): Recipe {
  return {
    id: r.id,
    source: 'user',
    title: r.title,
    description: r.description,
    emoji: r.emoji,
    color: r.color as ArtColor,
    prepMinutes: r.prep_minutes,
    cookMinutes: r.cook_minutes,
    servings: r.servings,
    difficulty: r.difficulty as Difficulty,
    categories: fromJson<RecipeCategory[]>(r.categories, []),
    tags: fromJson<string[]>(r.tags, []),
    ingredients: fromJson<RecipeIngredient[]>(r.ingredients, []),
    steps: fromJson<RecipeStep[]>(r.steps, []),
    nutrition: fromJson<Nutrition | null>(r.nutrition, null),
    premium: false,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export type RecipeInput = Omit<Recipe, 'id' | 'source' | 'premium' | 'createdAt' | 'updatedAt'>;

export function newRecipeId(now: Date, rand: () => number = Math.random): string {
  return `u-${now.getTime().toString(36)}${Math.floor(rand() * 1e6).toString(36)}`;
}

export function createRecipeRepository(db: SqlDatabase) {
  return {
    async list(): Promise<Recipe[]> {
      return (await db.getAllAsync<Row>('SELECT * FROM user_recipes ORDER BY updated_at DESC', [])).map(toRecipe);
    },
    async get(id: string): Promise<Recipe | null> {
      const r = await db.getFirstAsync<Row>('SELECT * FROM user_recipes WHERE id = ?', [id]);
      return r ? toRecipe(r) : null;
    },
    async count(): Promise<number> {
      return (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM user_recipes', []))?.n ?? 0;
    },
    async create(input: RecipeInput, now = new Date()): Promise<string> {
      const id = newRecipeId(now);
      const ts = now.toISOString();
      await db.runAsync(
        `INSERT INTO user_recipes (id, title, description, emoji, color, prep_minutes, cook_minutes, servings, difficulty, categories, tags, ingredients, steps, nutrition, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          input.title.trim(),
          input.description.trim(),
          input.emoji,
          input.color,
          Math.round(input.prepMinutes),
          Math.round(input.cookMinutes),
          Math.round(input.servings),
          input.difficulty,
          toJson(input.categories),
          toJson(input.tags),
          toJson(input.ingredients),
          toJson(input.steps.filter((s) => s.text.trim())),
          input.nutrition ? toJson(input.nutrition) : null,
          ts,
          ts,
        ],
      );
      return id;
    },
    async update(id: string, input: RecipeInput, now = new Date()): Promise<void> {
      await db.runAsync(
        `UPDATE user_recipes SET title = ?, description = ?, emoji = ?, color = ?, prep_minutes = ?, cook_minutes = ?, servings = ?, difficulty = ?,
           categories = ?, tags = ?, ingredients = ?, steps = ?, nutrition = ?, updated_at = ? WHERE id = ?`,
        [
          input.title.trim(),
          input.description.trim(),
          input.emoji,
          input.color,
          Math.round(input.prepMinutes),
          Math.round(input.cookMinutes),
          Math.round(input.servings),
          input.difficulty,
          toJson(input.categories),
          toJson(input.tags),
          toJson(input.ingredients),
          toJson(input.steps.filter((s) => s.text.trim())),
          input.nutrition ? toJson(input.nutrition) : null,
          now.toISOString(),
          id,
        ],
      );
    },
    /** Deletes a personal recipe and its favorite; planned meals keep their slot as a custom meal. */
    async remove(id: string, now = new Date()): Promise<void> {
      await db.withTransactionAsync(async () => {
        const r = await db.getFirstAsync<{ title: string }>('SELECT title FROM user_recipes WHERE id = ?', [id]);
        if (r) {
          await db.runAsync('UPDATE plan_entries SET recipe_id = NULL, custom_title = ?, updated_at = ? WHERE recipe_id = ?', [r.title, now.toISOString(), id]);
        }
        await db.runAsync('DELETE FROM favorites WHERE recipe_id = ?', [id]);
        await db.runAsync('DELETE FROM user_recipes WHERE id = ?', [id]);
      });
    },

    // Favorites ---------------------------------------------------------------
    async favorites(): Promise<Set<string>> {
      return new Set((await db.getAllAsync<{ recipe_id: string }>('SELECT recipe_id FROM favorites ORDER BY created_at DESC', [])).map((r) => r.recipe_id));
    },
    async favoriteIds(): Promise<string[]> {
      return (await db.getAllAsync<{ recipe_id: string }>('SELECT recipe_id FROM favorites ORDER BY created_at DESC', [])).map((r) => r.recipe_id);
    },
    async setFavorite(recipeId: string, favorite: boolean, now = new Date()): Promise<void> {
      if (favorite) await db.runAsync('INSERT OR IGNORE INTO favorites (recipe_id, created_at) VALUES (?, ?)', [recipeId, now.toISOString()]);
      else await db.runAsync('DELETE FROM favorites WHERE recipe_id = ?', [recipeId]);
    },

    // History -----------------------------------------------------------------
    async logHistory(recipeId: string, action: 'viewed' | 'cooked', now = new Date()): Promise<void> {
      await db.runAsync('INSERT INTO recipe_history (recipe_id, action, at) VALUES (?, ?, ?)', [recipeId, action, now.toISOString()]);
      // Keep the history bounded.
      await db.runAsync('DELETE FROM recipe_history WHERE id NOT IN (SELECT id FROM recipe_history ORDER BY at DESC, id DESC LIMIT 500)', []);
    },
    /** Most recent distinct recipes (viewed or cooked). */
    async recent(limit = 20): Promise<{ recipeId: string; at: string; cooked: number }[]> {
      return db.getAllAsync<{ recipeId: string; at: string; cooked: number }>(
        `SELECT recipe_id AS recipeId, MAX(at) AS at, SUM(CASE WHEN action = 'cooked' THEN 1 ELSE 0 END) AS cooked
         FROM recipe_history GROUP BY recipe_id ORDER BY MAX(at) DESC LIMIT ?`,
        [limit],
      );
    },
    async cookedCounts(): Promise<Map<string, number>> {
      const rows = await db.getAllAsync<{ recipe_id: string; n: number }>("SELECT recipe_id, COUNT(*) AS n FROM recipe_history WHERE action = 'cooked' GROUP BY recipe_id", []);
      return new Map(rows.map((r) => [r.recipe_id, r.n]));
    },
  };
}

export type RecipeRepository = ReturnType<typeof createRecipeRepository>;
