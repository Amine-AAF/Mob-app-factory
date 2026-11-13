import { fromJson, type SqlDatabase } from '@factory/storage';

import type {
  DailyChallenge,
  Dialogue,
  Expression,
  InterviewBlock,
  InterviewPath,
  LessonVocabulary,
  Level,
  ModuleId,
  QuizQuestion,
  RoleTag,
  Translated,
  VocabularyCategory,
  VocabularyEntry,
} from '@/content/types';

export interface LessonSummary {
  id: string;
  moduleId: ModuleId;
  topic: string;
  position: number;
  title: string;
  titleTranslation: Translated;
  level: Level;
  premium: boolean;
  minutes: number;
  roles: RoleTag[];
  interviewPath: InterviewPath | null;
}

export interface LessonDetail extends LessonSummary {
  objective: string;
  objectiveTranslation: Translated;
  situation: string;
  situationTranslation: Translated;
  vocabulary: LessonVocabulary[];
  expressions: Expression[];
  dialogue: Dialogue;
  interview: InterviewBlock | null;
}

interface LessonRow {
  id: string;
  module_id: ModuleId;
  topic: string;
  position: number;
  title: string;
  title_translation: string;
  level: Level;
  premium: number;
  minutes: number;
  roles: string;
  interview_path: InterviewPath | null;
}

interface VocabRow {
  id: string;
  term: string;
  definition: string;
  translation: string;
  example: string;
  category: VocabularyCategory;
  difficulty: Level;
  pronounceable: number;
  premium: number;
}

const EMPTY_T: Translated = { fr: '', es: '' };

function mapLesson(r: LessonRow): LessonSummary {
  return {
    id: r.id,
    moduleId: r.module_id,
    topic: r.topic,
    position: r.position,
    title: r.title,
    titleTranslation: fromJson(r.title_translation, EMPTY_T),
    level: r.level,
    premium: r.premium === 1,
    minutes: r.minutes,
    roles: fromJson<RoleTag[]>(r.roles, ['any']),
    interviewPath: r.interview_path,
  };
}

function mapVocab(r: VocabRow): VocabularyEntry {
  return {
    id: r.id,
    term: r.term,
    definition: r.definition,
    translation: fromJson(r.translation, EMPTY_T),
    example: r.example,
    category: r.category,
    difficulty: r.difficulty,
    pronounceable: r.pronounceable === 1,
    premium: r.premium === 1,
  };
}

/** Escapes LIKE wildcards in user input. */
export function escapeLike(input: string): string {
  return input.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export function createContentRepository(db: SqlDatabase) {
  return {
    async listLessons(moduleId?: ModuleId): Promise<LessonSummary[]> {
      const rows = moduleId
        ? await db.getAllAsync<LessonRow>('SELECT * FROM lessons WHERE module_id = ? ORDER BY position', [moduleId])
        : await db.getAllAsync<LessonRow>('SELECT * FROM lessons ORDER BY position', []);
      return rows.map(mapLesson);
    },

    async getLesson(id: string): Promise<LessonDetail | null> {
      const row = await db.getFirstAsync<LessonRow>('SELECT * FROM lessons WHERE id = ?', [id]);
      if (!row) return null;
      const sections = await db.getAllAsync<{ kind: string; payload: string }>('SELECT kind, payload FROM lesson_sections WHERE lesson_id = ?', [id]);
      const get = <T,>(kind: string, fallback: T): T => fromJson(sections.find((s) => s.kind === kind)?.payload, fallback);
      const overview = get('overview', { objective: '', objectiveTranslation: EMPTY_T, situation: '', situationTranslation: EMPTY_T });
      return {
        ...mapLesson(row),
        ...overview,
        vocabulary: get<LessonVocabulary[]>('vocabulary', []),
        expressions: get<Expression[]>('expressions', []),
        dialogue: get<Dialogue>('dialogue', { context: '', lines: [] }),
        interview: get<InterviewBlock | null>('interview', null),
      };
    },

    async getQuiz(ownerType: 'lesson' | 'challenge', ownerId: string): Promise<QuizQuestion[]> {
      const questions = await db.getAllAsync<{ id: string; type: 'choice' | 'fill'; prompt: string; explanation: string; correct_position: number }>(
        'SELECT id, type, prompt, explanation, correct_position FROM quiz_questions WHERE owner_type = ? AND owner_id = ? ORDER BY position',
        [ownerType, ownerId],
      );
      if (questions.length === 0) return [];
      const answers = await db.getAllAsync<{ question_id: string; position: number; text: string }>(
        `SELECT a.question_id, a.position, a.text FROM quiz_answers a
         JOIN quiz_questions q ON q.id = a.question_id
         WHERE q.owner_type = ? AND q.owner_id = ? ORDER BY a.question_id, a.position`,
        [ownerType, ownerId],
      );
      return questions.map((q) => ({
        id: q.id,
        type: q.type,
        prompt: q.prompt,
        explanation: q.explanation,
        correctIndex: q.correct_position,
        options: answers.filter((a) => a.question_id === q.id).map((a) => a.text),
      }));
    },

    /** All 'fill' questions across lessons, used by sentence-completion practice. */
    async listFillQuestions(includePremium: boolean): Promise<(QuizQuestion & { lessonId: string })[]> {
      const rows = await db.getAllAsync<{ id: string; owner_id: string; prompt: string; explanation: string; correct_position: number }>(
        `SELECT q.id, q.owner_id, q.prompt, q.explanation, q.correct_position FROM quiz_questions q
         JOIN lessons l ON l.id = q.owner_id
         WHERE q.owner_type = 'lesson' AND q.type = 'fill' AND (? = 1 OR l.premium = 0)
         ORDER BY l.position, q.position`,
        [includePremium ? 1 : 0],
      );
      const answers = await db.getAllAsync<{ question_id: string; position: number; text: string }>(
        `SELECT a.question_id, a.position, a.text FROM quiz_answers a JOIN quiz_questions q ON q.id = a.question_id
         WHERE q.owner_type = 'lesson' AND q.type = 'fill' ORDER BY a.position`,
        [],
      );
      return rows.map((q) => ({
        id: q.id,
        lessonId: q.owner_id,
        type: 'fill' as const,
        prompt: q.prompt,
        explanation: q.explanation,
        correctIndex: q.correct_position,
        options: answers.filter((a) => a.question_id === q.id).map((a) => a.text),
      }));
    },

    async searchVocabulary(params: { query?: string; category?: VocabularyCategory | null; favoritesOnly?: boolean }): Promise<VocabularyEntry[]> {
      const where: string[] = [];
      const args: (string | number)[] = [];
      const q = params.query?.trim().toLowerCase();
      if (q) {
        const like = `%${escapeLike(q)}%`;
        where.push("(v.term_lower LIKE ? ESCAPE '\\' OR lower(v.definition) LIKE ? ESCAPE '\\' OR lower(v.translation) LIKE ? ESCAPE '\\')");
        args.push(like, like, like);
      }
      if (params.category) {
        where.push('v.category = ?');
        args.push(params.category);
      }
      if (params.favoritesOnly) where.push('f.vocab_id IS NOT NULL');
      const sql = `SELECT v.* FROM vocabulary v LEFT JOIN vocabulary_favorites f ON f.vocab_id = v.id
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY ${q ? "CASE WHEN v.term_lower LIKE ? ESCAPE '\\' THEN 0 ELSE 1 END, " : ''}v.term_lower`;
      // Prefix matches rank first.
      if (q) args.push(`${escapeLike(q)}%`);
      const rows = await db.getAllAsync<VocabRow>(sql, args);
      return rows.map(mapVocab);
    },

    async getWord(id: string): Promise<VocabularyEntry | null> {
      const row = await db.getFirstAsync<VocabRow>('SELECT * FROM vocabulary WHERE id = ?', [id]);
      return row ? mapVocab(row) : null;
    },

    async listWords(includePremium: boolean): Promise<VocabularyEntry[]> {
      const rows = await db.getAllAsync<VocabRow>('SELECT * FROM vocabulary WHERE (? = 1 OR premium = 0) ORDER BY id', [includePremium ? 1 : 0]);
      return rows.map(mapVocab);
    },

    async countContent(): Promise<{ lessons: number; words: number; challenges: number }> {
      const r = await db.getFirstAsync<{ lessons: number; words: number; challenges: number }>(
        'SELECT (SELECT COUNT(*) FROM lessons) AS lessons, (SELECT COUNT(*) FROM vocabulary) AS words, (SELECT COUNT(*) FROM daily_challenges) AS challenges',
        [],
      );
      return r ?? { lessons: 0, words: 0, challenges: 0 };
    },

    async getDailyChallenge(index: number): Promise<DailyChallenge | null> {
      const all = await db.getAllAsync<{ id: string; payload: string }>('SELECT id, payload FROM daily_challenges ORDER BY position', []);
      if (all.length === 0) return null;
      const n = all.length;
      const row = all[((index % n) + n) % n];
      if (!row) return null;
      const quiz = (await this.getQuiz('challenge', row.id))[0];
      if (!quiz) return null;
      return { ...fromJson<Omit<DailyChallenge, 'quiz'>>(row.payload, {} as Omit<DailyChallenge, 'quiz'>), quiz };
    },
  };
}

export type ContentRepository = ReturnType<typeof createContentRepository>;
