import type { SqlDatabase } from '@factory/storage';

import { clock } from '@/services/clock';
import { newId } from '@/utils/id';
import { likePattern } from '@/utils/text';

export interface Subject {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  objective: string;
  startDay: string | null;
  targetDay: string | null;
  favorite: boolean;
  archived: boolean;
  position: number;
  createdAt: string;
}

export interface SubjectWithProgress extends Subject {
  courses: number;
  chapters: number;
  chaptersDone: number;
  progress: number;
}

export interface Course {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  position: number;
  chapters: number;
  chaptersDone: number;
}

export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  kind: 'chapter' | 'module';
  position: number;
  completedAt: string | null;
  lessons: number;
  lessonsDone: number;
}

export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  position: number;
  completedAt: string | null;
}

export interface Resource {
  id: string;
  subjectId: string;
  courseId: string | null;
  kind: 'link' | 'pdf' | 'book' | 'video' | 'other';
  title: string;
  uri: string;
  sizeBytes: number | null;
  createdAt: string;
}

export type SubjectInput = Pick<Subject, 'name' | 'description' | 'color' | 'icon' | 'objective' | 'startDay' | 'targetDay'>;

interface SubjectRow {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  objective: string;
  start_day: string | null;
  target_day: string | null;
  favorite: number;
  archived: number;
  position: number;
  created_at: string;
  courses?: number;
  chapters?: number;
  chapters_done?: number;
}

const toSubject = (r: SubjectRow): Subject => ({
  id: r.id,
  name: r.name,
  description: r.description,
  color: r.color,
  icon: r.icon,
  objective: r.objective,
  startDay: r.start_day,
  targetDay: r.target_day,
  favorite: r.favorite === 1,
  archived: r.archived === 1,
  position: r.position,
  createdAt: r.created_at,
});

export type SubjectFilter = 'active' | 'favorites' | 'archived' | 'all';

const SUBJECT_PROGRESS_SQL = `
  SELECT s.*,
    (SELECT COUNT(*) FROM courses c WHERE c.subject_id = s.id AND c.archived = 0) AS courses,
    (SELECT COUNT(*) FROM chapters ch JOIN courses c ON c.id = ch.course_id WHERE c.subject_id = s.id) AS chapters,
    (SELECT COUNT(*) FROM chapters ch JOIN courses c ON c.id = ch.course_id WHERE c.subject_id = s.id AND ch.completed_at IS NOT NULL) AS chapters_done
  FROM subjects s`;

export function createSubjectsRepository(db: SqlDatabase) {
  const now = () => clock.now().toISOString();

  async function nextPosition(table: 'subjects' | 'courses' | 'chapters' | 'lessons', parentColumn?: string, parentId?: string): Promise<number> {
    const where = parentColumn ? `WHERE ${parentColumn} = ?` : '';
    const r = await db.getFirstAsync<{ p: number | null }>(`SELECT MAX(position) AS p FROM ${table} ${where}`, parentId ? [parentId] : []);
    return (r?.p ?? -1) + 1;
  }

  const repo = {
    async list(filter: SubjectFilter = 'active', query = ''): Promise<SubjectWithProgress[]> {
      const where: string[] = [];
      const params: string[] = [];
      if (filter === 'active') where.push('s.archived = 0');
      if (filter === 'favorites') where.push('s.archived = 0 AND s.favorite = 1');
      if (filter === 'archived') where.push('s.archived = 1');
      if (query.trim()) {
        where.push("(LOWER(s.name) LIKE ? ESCAPE '\\' OR LOWER(s.description) LIKE ? ESCAPE '\\')");
        params.push(likePattern(query), likePattern(query));
      }
      const rows = await db.getAllAsync<SubjectRow>(`${SUBJECT_PROGRESS_SQL} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY s.favorite DESC, s.position ASC, s.created_at ASC`, params);
      return rows.map((r) => {
        const chapters = r.chapters ?? 0;
        const done = r.chapters_done ?? 0;
        return { ...toSubject(r), courses: r.courses ?? 0, chapters, chaptersDone: done, progress: chapters ? done / chapters : 0 };
      });
    },

    async get(id: string): Promise<SubjectWithProgress | null> {
      const r = await db.getFirstAsync<SubjectRow>(`${SUBJECT_PROGRESS_SQL} WHERE s.id = ?`, [id]);
      if (!r) return null;
      const chapters = r.chapters ?? 0;
      const done = r.chapters_done ?? 0;
      return { ...toSubject(r), courses: r.courses ?? 0, chapters, chaptersDone: done, progress: chapters ? done / chapters : 0 };
    },

    async countActive(): Promise<number> {
      const r = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM subjects WHERE archived = 0', []);
      return r?.n ?? 0;
    },

    async create(input: SubjectInput): Promise<string> {
      const id = newId('s');
      const t = now();
      await db.runAsync(
        'INSERT INTO subjects (id, name, description, color, icon, objective, start_day, target_day, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, input.name.trim(), input.description.trim(), input.color, input.icon, input.objective.trim(), input.startDay, input.targetDay, await nextPosition('subjects'), t, t],
      );
      return id;
    },

    async update(id: string, input: SubjectInput): Promise<void> {
      await db.runAsync('UPDATE subjects SET name = ?, description = ?, color = ?, icon = ?, objective = ?, start_day = ?, target_day = ?, updated_at = ? WHERE id = ?', [
        input.name.trim(),
        input.description.trim(),
        input.color,
        input.icon,
        input.objective.trim(),
        input.startDay,
        input.targetDay,
        now(),
        id,
      ]);
    },

    async setFavorite(id: string, favorite: boolean): Promise<void> {
      await db.runAsync('UPDATE subjects SET favorite = ?, updated_at = ? WHERE id = ?', [favorite ? 1 : 0, now(), id]);
    },

    async setArchived(id: string, archived: boolean): Promise<void> {
      await db.runAsync('UPDATE subjects SET archived = ?, favorite = CASE WHEN ? = 1 THEN 0 ELSE favorite END, updated_at = ? WHERE id = ?', [archived ? 1 : 0, archived ? 1 : 0, now(), id]);
    },

    /** Deletes the subject and (cascade) its courses, chapters, lessons, resources, sessions and goals. Notes and cards are kept, unassigned. */
    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM subjects WHERE id = ?', [id]);
    },

    /* --------------------------------------------------------------- courses */

    async listCourses(subjectId: string): Promise<Course[]> {
      const rows = await db.getAllAsync<{ id: string; subject_id: string; title: string; description: string; position: number; chapters: number; chapters_done: number }>(
        `SELECT c.*, (SELECT COUNT(*) FROM chapters ch WHERE ch.course_id = c.id) AS chapters,
                (SELECT COUNT(*) FROM chapters ch WHERE ch.course_id = c.id AND ch.completed_at IS NOT NULL) AS chapters_done
         FROM courses c WHERE c.subject_id = ? AND c.archived = 0 ORDER BY c.position, c.created_at`,
        [subjectId],
      );
      return rows.map((r) => ({ id: r.id, subjectId: r.subject_id, title: r.title, description: r.description, position: r.position, chapters: r.chapters, chaptersDone: r.chapters_done }));
    },

    async getCourse(id: string): Promise<Course | null> {
      const r = await db.getFirstAsync<{ id: string; subject_id: string; title: string; description: string; position: number; chapters: number; chapters_done: number }>(
        `SELECT c.*, (SELECT COUNT(*) FROM chapters ch WHERE ch.course_id = c.id) AS chapters,
                (SELECT COUNT(*) FROM chapters ch WHERE ch.course_id = c.id AND ch.completed_at IS NOT NULL) AS chapters_done
         FROM courses c WHERE c.id = ?`,
        [id],
      );
      return r ? { id: r.id, subjectId: r.subject_id, title: r.title, description: r.description, position: r.position, chapters: r.chapters, chaptersDone: r.chapters_done } : null;
    },

    async countCourses(subjectId: string): Promise<number> {
      const r = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM courses WHERE subject_id = ? AND archived = 0', [subjectId]);
      return r?.n ?? 0;
    },

    async createCourse(subjectId: string, title: string, description = ''): Promise<string> {
      const id = newId('c');
      const t = now();
      await db.runAsync('INSERT INTO courses (id, subject_id, title, description, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        id,
        subjectId,
        title.trim(),
        description.trim(),
        await nextPosition('courses', 'subject_id', subjectId),
        t,
        t,
      ]);
      return id;
    },

    async updateCourse(id: string, title: string, description: string): Promise<void> {
      await db.runAsync('UPDATE courses SET title = ?, description = ?, updated_at = ? WHERE id = ?', [title.trim(), description.trim(), now(), id]);
    },

    async removeCourse(id: string): Promise<void> {
      await db.runAsync('DELETE FROM courses WHERE id = ?', [id]);
    },

    /* --------------------------------------------------------------- chapters */

    async listChapters(courseId: string): Promise<Chapter[]> {
      const rows = await db.getAllAsync<{ id: string; course_id: string; title: string; kind: 'chapter' | 'module'; position: number; completed_at: string | null; lessons: number; lessons_done: number }>(
        `SELECT ch.*, (SELECT COUNT(*) FROM lessons l WHERE l.chapter_id = ch.id) AS lessons,
                (SELECT COUNT(*) FROM lessons l WHERE l.chapter_id = ch.id AND l.completed_at IS NOT NULL) AS lessons_done
         FROM chapters ch WHERE ch.course_id = ? ORDER BY ch.position, ch.created_at`,
        [courseId],
      );
      return rows.map((r) => ({ id: r.id, courseId: r.course_id, title: r.title, kind: r.kind, position: r.position, completedAt: r.completed_at, lessons: r.lessons, lessonsDone: r.lessons_done }));
    },

    /** Chapters of a subject (for note/flashcard pickers). */
    async listSubjectChapters(subjectId: string): Promise<{ id: string; title: string; courseTitle: string }[]> {
      return db.getAllAsync<{ id: string; title: string; courseTitle: string }>(
        'SELECT ch.id, ch.title, c.title AS courseTitle FROM chapters ch JOIN courses c ON c.id = ch.course_id WHERE c.subject_id = ? ORDER BY c.position, ch.position',
        [subjectId],
      );
    },

    async createChapter(courseId: string, title: string, kind: 'chapter' | 'module' = 'chapter'): Promise<string> {
      const id = newId('ch');
      const t = now();
      await db.runAsync('INSERT INTO chapters (id, course_id, title, kind, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        id,
        courseId,
        title.trim(),
        kind,
        await nextPosition('chapters', 'course_id', courseId),
        t,
        t,
      ]);
      return id;
    },

    async renameChapter(id: string, title: string): Promise<void> {
      await db.runAsync('UPDATE chapters SET title = ?, updated_at = ? WHERE id = ?', [title.trim(), now(), id]);
    },

    async setChapterDone(id: string, done: boolean): Promise<void> {
      await db.runAsync('UPDATE chapters SET completed_at = ?, completed_day = ?, updated_at = ? WHERE id = ?', [done ? now() : null, done ? clock.today() : null, now(), id]);
    },

    async removeChapter(id: string): Promise<void> {
      await db.runAsync('DELETE FROM chapters WHERE id = ?', [id]);
    },

    /** Moves a chapter up/down within its course by swapping positions (normalises positions first). */
    async moveChapter(courseId: string, chapterId: string, direction: -1 | 1): Promise<void> {
      await db.withTransactionAsync(async () => {
        const ids = (await db.getAllAsync<{ id: string }>('SELECT id FROM chapters WHERE course_id = ? ORDER BY position, created_at', [courseId])).map((r) => r.id);
        const index = ids.indexOf(chapterId);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= ids.length) return;
        [ids[index], ids[target]] = [ids[target] as string, ids[index] as string];
        for (let i = 0; i < ids.length; i++) await db.runAsync('UPDATE chapters SET position = ? WHERE id = ?', [i, ids[i] as string]);
      });
    },

    /* --------------------------------------------------------------- lessons */

    async listLessons(chapterId: string): Promise<Lesson[]> {
      const rows = await db.getAllAsync<{ id: string; chapter_id: string; title: string; position: number; completed_at: string | null }>('SELECT * FROM lessons WHERE chapter_id = ? ORDER BY position, created_at', [chapterId]);
      return rows.map((r) => ({ id: r.id, chapterId: r.chapter_id, title: r.title, position: r.position, completedAt: r.completed_at }));
    },

    async createLesson(chapterId: string, title: string): Promise<string> {
      const id = newId('l');
      const t = now();
      await db.runAsync('INSERT INTO lessons (id, chapter_id, title, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)', [id, chapterId, title.trim(), await nextPosition('lessons', 'chapter_id', chapterId), t, t]);
      return id;
    },

    /** Completing every lesson completes the chapter; un-completing one re-opens it. */
    async setLessonDone(id: string, done: boolean): Promise<void> {
      await db.withTransactionAsync(async () => {
        await db.runAsync('UPDATE lessons SET completed_at = ?, updated_at = ? WHERE id = ?', [done ? now() : null, now(), id]);
        const r = await db.getFirstAsync<{ chapter_id: string; total: number; done: number }>(
          'SELECT l.chapter_id, (SELECT COUNT(*) FROM lessons WHERE chapter_id = l.chapter_id) AS total, (SELECT COUNT(*) FROM lessons WHERE chapter_id = l.chapter_id AND completed_at IS NOT NULL) AS done FROM lessons l WHERE l.id = ?',
          [id],
        );
        if (!r) return;
        if (r.total > 0 && r.done === r.total) {
          await db.runAsync('UPDATE chapters SET completed_at = COALESCE(completed_at, ?), completed_day = COALESCE(completed_day, ?), updated_at = ? WHERE id = ?', [now(), clock.today(), now(), r.chapter_id]);
        } else {
          await db.runAsync('UPDATE chapters SET completed_at = NULL, completed_day = NULL, updated_at = ? WHERE id = ?', [now(), r.chapter_id]);
        }
      });
    },

    async removeLesson(id: string): Promise<void> {
      await db.runAsync('DELETE FROM lessons WHERE id = ?', [id]);
    },

    /* --------------------------------------------------------------- resources */

    async listResources(subjectId: string): Promise<Resource[]> {
      const rows = await db.getAllAsync<{ id: string; subject_id: string; course_id: string | null; kind: Resource['kind']; title: string; uri: string; size_bytes: number | null; created_at: string }>(
        'SELECT * FROM resources WHERE subject_id = ? ORDER BY created_at DESC',
        [subjectId],
      );
      return rows.map((r) => ({ id: r.id, subjectId: r.subject_id, courseId: r.course_id, kind: r.kind, title: r.title, uri: r.uri, sizeBytes: r.size_bytes, createdAt: r.created_at }));
    },

    async addResource(input: Omit<Resource, 'id' | 'createdAt'>): Promise<string> {
      const id = newId('r');
      const t = now();
      await db.runAsync('INSERT INTO resources (id, subject_id, course_id, kind, title, uri, size_bytes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        id,
        input.subjectId,
        input.courseId,
        input.kind,
        input.title.trim(),
        input.uri.trim(),
        input.sizeBytes,
        t,
        t,
      ]);
      return id;
    },

    async removeResource(id: string): Promise<Resource | null> {
      const r = await db.getFirstAsync<{ id: string; subject_id: string; course_id: string | null; kind: Resource['kind']; title: string; uri: string; size_bytes: number | null; created_at: string }>('SELECT * FROM resources WHERE id = ?', [id]);
      await db.runAsync('DELETE FROM resources WHERE id = ?', [id]);
      return r ? { id: r.id, subjectId: r.subject_id, courseId: r.course_id, kind: r.kind, title: r.title, uri: r.uri, sizeBytes: r.size_bytes, createdAt: r.created_at } : null;
    },

    /** Courses in progress across subjects (dashboard). */
    async coursesInProgress(limit = 5): Promise<(Course & { subjectName: string; color: string; icon: string })[]> {
      const rows = await db.getAllAsync<{ id: string; subject_id: string; title: string; description: string; position: number; chapters: number; chapters_done: number; subject_name: string; color: string; icon: string }>(
        `SELECT c.*, s.name AS subject_name, s.color, s.icon,
           (SELECT COUNT(*) FROM chapters ch WHERE ch.course_id = c.id) AS chapters,
           (SELECT COUNT(*) FROM chapters ch WHERE ch.course_id = c.id AND ch.completed_at IS NOT NULL) AS chapters_done
         FROM courses c JOIN subjects s ON s.id = c.subject_id
         WHERE s.archived = 0 AND c.archived = 0
         ORDER BY c.updated_at DESC`,
        [],
      );
      return rows
        .filter((r) => r.chapters > 0 && r.chapters_done < r.chapters)
        .slice(0, limit)
        .map((r) => ({ id: r.id, subjectId: r.subject_id, title: r.title, description: r.description, position: r.position, chapters: r.chapters, chaptersDone: r.chapters_done, subjectName: r.subject_name, color: r.color, icon: r.icon }));
    },
  };
  return repo;
}

export type SubjectsRepository = ReturnType<typeof createSubjectsRepository>;
