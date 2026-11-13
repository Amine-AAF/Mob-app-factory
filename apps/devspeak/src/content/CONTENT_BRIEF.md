# DevSpeak content writing brief

DevSpeak is an offline Android app that teaches **professional and technical English to software
developers** (Java, React, DevOps, QA, architects, IT students). Learners are non-native speakers;
the interface can be English, French or Spanish, so every learner-facing English string has
helper translations in French (`fr`) and Spanish (`es`).

The TypeScript content model is in `src/content/types.ts` — read it first and follow it exactly.

## Quality bar (non-negotiable)

- **Original** writing. Do not copy or paraphrase any existing course, book, or app.
- **Grammatically perfect, natural, modern workplace English** — the way engineers on an
  international team really talk (Slack, stand-ups, code reviews), not textbook English.
- **Technically accurate.** A senior engineer reading it must find no errors.
- **Practical**: every lesson should leave the learner with phrases they can use tomorrow.
- **Level-appropriate**: beginner = short sentences, common words; intermediate = normal workplace
  speech; advanced = nuance, hedging, diplomacy, precise technical vocabulary.
- **Translations** (fr, es) must be natural and accurate, not word-for-word. Keep technical terms
  that professionals keep in English (e.g. "pull request", "commit", "sprint") in English inside the
  translation where that is what a French/Spanish developer would actually say, but translate the
  rest of the sentence. Use proper accents (é, è, à, ç, ñ, á, ¿, ¡).
- Do not promise outcomes (no "this answer will get you hired").
- Use realistic but generic names for speakers (e.g. Priya, Tom, Lucía, Kenji, Amara, Marco) and
  roles ("Team lead", "Interviewer"). No real companies or real people.

## Per-lesson shape

- `vocabulary`: 5 items (4–6 acceptable).
- `expressions`: 5 items (4–6 acceptable). `usage` explains when to use the phrase.
- `dialogue.lines`: 6–10 lines, alternating speakers, realistic.
- `quiz`: exactly 3 questions with ids `<lessonId>-q1`, `-q2`, `-q3`.
  - 3 or 4 `options` each, exactly one correct, plausible distractors.
  - Mix `choice` and `fill` (a `fill` prompt contains exactly one `___`).
  - **Vary `correctIndex`** (do not always put the answer first).
  - `explanation`: one or two sentences explaining why.
- `estimatedMinutes`: 5–12.
- `roles`: one or more of the `RoleTag` values.
- Strings use straight ASCII apostrophes inside TypeScript single-quoted strings escaped (`\'`), or
  just use double-quoted / template strings — any valid TypeScript is fine. Prefer double quotes
  for strings containing apostrophes.

## File format

```ts
import type { Lesson } from '../types';

export const workplaceA: Lesson[] = [
  {
    id: 'wp-01',
    moduleId: 'workplace',
    ...
  },
];
```

The file must compile under TypeScript `strict`. Only import types from `../types`.
