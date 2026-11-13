/**
 * Learning templates. A template is a structure (courses → chapters, a weekly session rhythm,
 * goals, an optional exam with a preparation checklist). Every visible label is an i18n key:
 *   template name/description: `templates.items.<id>.name|desc`
 *   structure labels:          `templateLabels.<key>` (with optional {{n}})
 * Applying a template is customised by the learner (subject name, start date, duration,
 * days of week, minutes per session) — see features/courses/applyTemplate.ts.
 */
export type TemplateCategory = 'university' | 'exam' | 'language' | 'certification' | 'routine' | 'weekly' | 'roadmap' | 'reading';

export interface LabelSpec {
  key: string;
  n?: number;
}

export interface TemplateGoal {
  period: 'daily' | 'weekly' | 'monthly';
  metric: 'minutes' | 'sessions' | 'chapters' | 'flashcards' | 'quizzes';
  target: number;
}

export interface TemplateDef {
  id: string;
  category: TemplateCategory;
  premium: boolean;
  icon: string;
  color: string;
  /** Default duration (learner can change it). */
  weeks: number;
  courses: { label: LabelSpec; chapters: LabelSpec[] }[];
  /** Days of week 1 = Monday … 7 = Sunday. */
  sessions: { days: number[]; minutes: number; startMinute: number };
  goals: TemplateGoal[];
  /** Creates an exam / certification on the target date with this checklist. */
  exam?: { kind: 'exam' | 'certification'; checklist: string[] };
}

const range = (key: string, count: number): LabelSpec[] => Array.from({ length: count }, (_, i) => ({ key, n: i + 1 }));
const labels = (...keys: string[]): LabelSpec[] => keys.map((key) => ({ key }));

const WEEKDAYS = [1, 2, 3, 4, 5];
const EXAM_CHECKLIST = ['checkSyllabus', 'checkSummaries', 'checkFlashcards', 'checkPastPapers', 'checkMockExam', 'checkLogistics'];

export const TEMPLATES: TemplateDef[] = [
  // University ---------------------------------------------------------------
  {
    id: 'university-semester',
    category: 'university',
    premium: false,
    icon: 'school',
    color: '#1F6F8B',
    weeks: 15,
    courses: [
      { label: { key: 'lectures' }, chapters: range('week', 12) },
      { label: { key: 'tutorials' }, chapters: range('tutorial', 6) },
      { label: { key: 'finalReview' }, chapters: labels('summaries', 'pastPapers', 'mockExam') },
    ],
    sessions: { days: WEEKDAYS, minutes: 60, startMinute: 18 * 60 },
    goals: [
      { period: 'weekly', metric: 'minutes', target: 300 },
      { period: 'weekly', metric: 'chapters', target: 1 },
    ],
    exam: { kind: 'exam', checklist: EXAM_CHECKLIST },
  },
  {
    id: 'university-lab-course',
    category: 'university',
    premium: true,
    icon: 'flask',
    color: '#27AE60',
    weeks: 12,
    courses: [
      { label: { key: 'theory' }, chapters: range('unit', 6) },
      { label: { key: 'labs' }, chapters: range('lab', 6) },
      { label: { key: 'reports' }, chapters: range('report', 3) },
    ],
    sessions: { days: [2, 4, 6], minutes: 75, startMinute: 17 * 60 },
    goals: [{ period: 'weekly', metric: 'sessions', target: 3 }],
  },
  {
    id: 'thesis-project',
    category: 'university',
    premium: true,
    icon: 'document-text',
    color: '#6C5CE7',
    weeks: 20,
    courses: [
      { label: { key: 'research' }, chapters: labels('topic', 'literatureReview', 'methodology') },
      { label: { key: 'writing' }, chapters: labels('outline', 'draft', 'revision', 'finalVersion') },
      { label: { key: 'defense' }, chapters: labels('slides', 'rehearsal') },
    ],
    sessions: { days: WEEKDAYS, minutes: 90, startMinute: 9 * 60 },
    goals: [{ period: 'weekly', metric: 'minutes', target: 450 }],
  },
  // Exam preparation -----------------------------------------------------------
  {
    id: 'exam-prep-4-weeks',
    category: 'exam',
    premium: false,
    icon: 'ribbon',
    color: '#EB5757',
    weeks: 4,
    courses: [
      { label: { key: 'learnPhase' }, chapters: range('topicN', 6) },
      { label: { key: 'practicePhase' }, chapters: labels('exercises', 'pastPapers', 'mockExam') },
      { label: { key: 'finalReview' }, chapters: labels('summaries', 'weakSpots') },
    ],
    sessions: { days: [1, 2, 3, 4, 5, 6], minutes: 50, startMinute: 18 * 60 },
    goals: [
      { period: 'daily', metric: 'minutes', target: 50 },
      { period: 'daily', metric: 'flashcards', target: 20 },
    ],
    exam: { kind: 'exam', checklist: EXAM_CHECKLIST },
  },
  {
    id: 'exam-prep-2-weeks',
    category: 'exam',
    premium: false,
    icon: 'alarm',
    color: '#F2994A',
    weeks: 2,
    courses: [{ label: { key: 'intensiveReview' }, chapters: labels('summaries', 'weakSpots', 'pastPapers', 'mockExam') }],
    sessions: { days: [1, 2, 3, 4, 5, 6, 7], minutes: 60, startMinute: 17 * 60 },
    goals: [
      { period: 'daily', metric: 'minutes', target: 60 },
      { period: 'daily', metric: 'quizzes', target: 1 },
    ],
    exam: { kind: 'exam', checklist: EXAM_CHECKLIST },
  },
  {
    id: 'finals-multi-subject',
    category: 'exam',
    premium: true,
    icon: 'layers',
    color: '#9B51E0',
    weeks: 6,
    courses: [
      { label: { key: 'subjectN', n: 1 }, chapters: range('topicN', 4) },
      { label: { key: 'subjectN', n: 2 }, chapters: range('topicN', 4) },
      { label: { key: 'subjectN', n: 3 }, chapters: range('topicN', 4) },
    ],
    sessions: { days: [1, 2, 3, 4, 5, 6], minutes: 90, startMinute: 14 * 60 },
    goals: [{ period: 'weekly', metric: 'minutes', target: 540 }],
    exam: { kind: 'exam', checklist: EXAM_CHECKLIST },
  },
  {
    id: 'entrance-exam',
    category: 'exam',
    premium: true,
    icon: 'trophy',
    color: '#D4A017',
    weeks: 12,
    courses: [
      { label: { key: 'fundamentals' }, chapters: range('unit', 6) },
      { label: { key: 'practicePhase' }, chapters: range('practiceTest', 6) },
    ],
    sessions: { days: WEEKDAYS, minutes: 60, startMinute: 18 * 60 },
    goals: [
      { period: 'weekly', metric: 'quizzes', target: 3 },
      { period: 'weekly', metric: 'minutes', target: 300 },
    ],
    exam: { kind: 'exam', checklist: EXAM_CHECKLIST },
  },
  // Languages -----------------------------------------------------------------
  {
    id: 'language-beginner',
    category: 'language',
    premium: false,
    icon: 'language',
    color: '#2F80ED',
    weeks: 12,
    courses: [
      { label: { key: 'vocabulary' }, chapters: range('unit', 8) },
      { label: { key: 'grammar' }, chapters: range('unit', 6) },
      { label: { key: 'listeningSpeaking' }, chapters: range('week', 4) },
    ],
    sessions: { days: [1, 2, 3, 4, 5, 6, 7], minutes: 20, startMinute: 8 * 60 },
    goals: [
      { period: 'daily', metric: 'flashcards', target: 15 },
      { period: 'daily', metric: 'minutes', target: 20 },
    ],
  },
  {
    id: 'language-intermediate',
    category: 'language',
    premium: true,
    icon: 'chatbubbles',
    color: '#00A3A3',
    weeks: 16,
    courses: [
      { label: { key: 'reading' }, chapters: range('unit', 8) },
      { label: { key: 'writing' }, chapters: range('unit', 8) },
      { label: { key: 'conversation' }, chapters: range('week', 8) },
    ],
    sessions: { days: [1, 3, 5, 6], minutes: 40, startMinute: 19 * 60 },
    goals: [{ period: 'weekly', metric: 'minutes', target: 160 }],
  },
  {
    id: 'language-test',
    category: 'language',
    premium: true,
    icon: 'mic',
    color: '#5F27CD',
    weeks: 8,
    courses: [
      { label: { key: 'reading' }, chapters: range('practiceTest', 4) },
      { label: { key: 'listening' }, chapters: range('practiceTest', 4) },
      { label: { key: 'writing' }, chapters: range('practiceTest', 4) },
      { label: { key: 'speaking' }, chapters: range('practiceTest', 4) },
    ],
    sessions: { days: WEEKDAYS, minutes: 45, startMinute: 18 * 60 },
    goals: [{ period: 'weekly', metric: 'quizzes', target: 2 }],
    exam: { kind: 'certification', checklist: EXAM_CHECKLIST },
  },
  // Certifications --------------------------------------------------------------
  {
    id: 'certification-prep',
    category: 'certification',
    premium: false,
    icon: 'shield-checkmark',
    color: '#0E7C66',
    weeks: 8,
    courses: [
      { label: { key: 'officialObjectives' }, chapters: range('domain', 5) },
      { label: { key: 'practicePhase' }, chapters: range('practiceTest', 3) },
    ],
    sessions: { days: [1, 2, 4, 6], minutes: 60, startMinute: 19 * 60 },
    goals: [
      { period: 'weekly', metric: 'minutes', target: 240 },
      { period: 'weekly', metric: 'flashcards', target: 100 },
    ],
    exam: { kind: 'certification', checklist: ['checkObjectives', 'checkFlashcards', 'checkPracticeTests', 'checkBooking', 'checkLogistics'] },
  },
  {
    id: 'it-certification',
    category: 'certification',
    premium: true,
    icon: 'server',
    color: '#3867D6',
    weeks: 10,
    courses: [
      { label: { key: 'officialObjectives' }, chapters: range('domain', 6) },
      { label: { key: 'handsOn' }, chapters: range('lab', 5) },
      { label: { key: 'practicePhase' }, chapters: range('practiceTest', 4) },
    ],
    sessions: { days: [1, 2, 3, 4, 6], minutes: 60, startMinute: 20 * 60 },
    goals: [{ period: 'weekly', metric: 'minutes', target: 300 }],
    exam: { kind: 'certification', checklist: ['checkObjectives', 'checkFlashcards', 'checkPracticeTests', 'checkBooking', 'checkLogistics'] },
  },
  {
    id: 'professional-training',
    category: 'certification',
    premium: true,
    icon: 'briefcase',
    color: '#8854D0',
    weeks: 6,
    courses: [{ label: { key: 'modules' }, chapters: range('module', 6) }],
    sessions: { days: [2, 4], minutes: 45, startMinute: 12 * 60 + 30 },
    goals: [{ period: 'weekly', metric: 'chapters', target: 1 }],
  },
  // Daily routines --------------------------------------------------------------
  {
    id: 'daily-routine',
    category: 'routine',
    premium: false,
    icon: 'sunny',
    color: '#F2A541',
    weeks: 4,
    courses: [{ label: { key: 'dailyPractice' }, chapters: range('week', 4) }],
    sessions: { days: [1, 2, 3, 4, 5, 6, 7], minutes: 30, startMinute: 7 * 60 + 30 },
    goals: [
      { period: 'daily', metric: 'minutes', target: 30 },
      { period: 'daily', metric: 'flashcards', target: 10 },
    ],
  },
  {
    id: 'morning-pomodoro',
    category: 'routine',
    premium: true,
    icon: 'timer',
    color: '#E17055',
    weeks: 4,
    courses: [{ label: { key: 'deepWork' }, chapters: range('week', 4) }],
    sessions: { days: WEEKDAYS, minutes: 100, startMinute: 8 * 60 },
    goals: [{ period: 'daily', metric: 'minutes', target: 100 }],
  },
  {
    id: 'evening-review',
    category: 'routine',
    premium: false,
    icon: 'moon',
    color: '#4B4B8F',
    weeks: 4,
    courses: [{ label: { key: 'review' }, chapters: range('week', 4) }],
    sessions: { days: [1, 2, 3, 4, 5, 6, 7], minutes: 15, startMinute: 21 * 60 },
    goals: [{ period: 'daily', metric: 'flashcards', target: 20 }],
  },
  // Weekly plans ----------------------------------------------------------------
  {
    id: 'weekly-plan',
    category: 'weekly',
    premium: false,
    icon: 'calendar',
    color: '#1F6F8B',
    weeks: 8,
    courses: [{ label: { key: 'weeklyTopics' }, chapters: range('week', 8) }],
    sessions: { days: [1, 3, 5], minutes: 60, startMinute: 18 * 60 },
    goals: [{ period: 'weekly', metric: 'sessions', target: 3 }],
  },
  {
    id: 'weekend-learner',
    category: 'weekly',
    premium: false,
    icon: 'cafe',
    color: '#B9770E',
    weeks: 8,
    courses: [{ label: { key: 'weeklyTopics' }, chapters: range('week', 8) }],
    sessions: { days: [6, 7], minutes: 90, startMinute: 10 * 60 },
    goals: [{ period: 'weekly', metric: 'minutes', target: 180 }],
  },
  {
    id: 'balanced-week',
    category: 'weekly',
    premium: true,
    icon: 'git-network',
    color: '#16A085',
    weeks: 6,
    courses: [
      { label: { key: 'newMaterial' }, chapters: range('week', 6) },
      { label: { key: 'review' }, chapters: range('week', 6) },
    ],
    sessions: { days: [1, 2, 3, 4, 5, 6], minutes: 45, startMinute: 18 * 60 + 30 },
    goals: [
      { period: 'weekly', metric: 'minutes', target: 270 },
      { period: 'weekly', metric: 'quizzes', target: 2 },
    ],
  },
  // Self-learning roadmaps ------------------------------------------------------
  {
    id: 'self-learning-roadmap',
    category: 'roadmap',
    premium: false,
    icon: 'map',
    color: '#00B894',
    weeks: 12,
    courses: [
      { label: { key: 'fundamentals' }, chapters: range('milestone', 4) },
      { label: { key: 'projects' }, chapters: range('project', 3) },
      { label: { key: 'advanced' }, chapters: range('milestone', 3) },
    ],
    sessions: { days: [1, 3, 5, 6], minutes: 45, startMinute: 19 * 60 },
    goals: [{ period: 'weekly', metric: 'chapters', target: 1 }],
  },
  {
    id: 'coding-roadmap',
    category: 'roadmap',
    premium: true,
    icon: 'code-slash',
    color: '#2D3436',
    weeks: 16,
    courses: [
      { label: { key: 'fundamentals' }, chapters: range('milestone', 5) },
      { label: { key: 'handsOn' }, chapters: range('exercise', 8) },
      { label: { key: 'projects' }, chapters: range('project', 3) },
    ],
    sessions: { days: [1, 2, 3, 4, 5], minutes: 60, startMinute: 20 * 60 },
    goals: [{ period: 'weekly', metric: 'minutes', target: 300 }],
  },
  {
    id: 'skill-30-days',
    category: 'roadmap',
    premium: false,
    icon: 'flash',
    color: '#E84393',
    weeks: 5,
    courses: [{ label: { key: 'challenge30' }, chapters: range('day', 30) }],
    sessions: { days: [1, 2, 3, 4, 5, 6, 7], minutes: 25, startMinute: 19 * 60 },
    goals: [{ period: 'daily', metric: 'chapters', target: 1 }],
  },
  // Reading ---------------------------------------------------------------------
  {
    id: 'reading-plan',
    category: 'reading',
    premium: false,
    icon: 'book',
    color: '#A0522D',
    weeks: 6,
    courses: [{ label: { key: 'book' }, chapters: range('chapterN', 12) }],
    sessions: { days: [1, 2, 3, 4, 5, 6, 7], minutes: 20, startMinute: 21 * 60 + 30 },
    goals: [{ period: 'weekly', metric: 'chapters', target: 2 }],
  },
  {
    id: 'reading-list-12-books',
    category: 'reading',
    premium: true,
    icon: 'library',
    color: '#6D4C41',
    weeks: 52,
    courses: [{ label: { key: 'readingList' }, chapters: range('bookN', 12) }],
    sessions: { days: [1, 3, 5, 7], minutes: 30, startMinute: 21 * 60 },
    goals: [{ period: 'monthly', metric: 'chapters', target: 1 }],
  },
];

/** Every structure label key used by templates (checked against locales in tests). */
export function templateLabelKeys(): string[] {
  const keys = new Set<string>();
  for (const t of TEMPLATES) {
    for (const c of t.courses) {
      keys.add(c.label.key);
      c.chapters.forEach((ch) => keys.add(ch.key));
    }
    t.exam?.checklist.forEach((k) => keys.add(k));
  }
  return [...keys].sort();
}
