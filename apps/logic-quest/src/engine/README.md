# Logic Quest engine

Pure TypeScript — no React, no SDK, no I/O — so every rule is unit-tested.

| Module | Responsibility |
| --- | --- |
| `types.ts` | Challenge model (language-independent), `PlayerAnswer`, `Translate` |
| `sequences.ts` | 21 rule families → terms, answer, distractors, explanation; ambiguity check (linear / quadratic / geometric / Fibonacci models must agree with the answer) |
| `patterns.ts` | Glyph model with visual equality (rotation normalized by symmetry), row / matrix / analogy / symmetry boards; shortest-period and row/column/Latin-square ambiguity checks |
| `deduction/` | Specs + brute-force solvers (ordering, grid, propositional logic, truth-tellers, code locks, word problems); uniqueness, no redundant clue, no give-away |
| `memory.ts` | Seeded rounds; display timeline as a pure function of elapsed time |
| `answers.ts` | `checkAnswer` (the only validation entry point), `checkChallenge`, `describeChallenge` |
| `scoring.ts` | XP rules (retry ×0.5, hint ×0.5, previously revealed ×0.25, 0 if wrong or already rewarded), levels & ranks |
| `session.ts` | Session state machine; time passed in explicitly; timed clock pauses during feedback |
| `progression.ts` | Unlocks, Premium gates (`PREMIUM`), hint allowance, queue building, difficulty suggestion |
| `achievements.ts` | Definitions evaluated from real statistics |
| `generators.ts`, `daily.ts` | Seeded generators validated by `checkChallenge`; daily = template(day) × seed(date) |

## Correct by construction

1. Content files contain **rules or specs, never answers**. `compile*` derives the answer.
2. `checkChallenge` re-derives and re-solves; the content test fails the build on any problem.
3. Texts are rendered from the `content` i18n namespace with the same parameters the solver used,
   so an explanation cannot disagree with the answer.

## Adding content

- Sequence: add a row to `src/content/sequences.ts` (`[rule, length, missingIndex?]`).
- Pattern: add a rule to `src/content/patterns.ts`.
- Logic / math: add a spec to `src/content/deduction.ts`. Ordering/grid/knights/code puzzles can be
  produced with `generateChallenge` (fixed seed) and frozen into `src/content/data/`.
- Bump `CONTENT_VERSION` in `src/content/index.ts`, then run `pnpm --filter logic-quest validate:content`.
- Never reuse or renumber an id (progress and XP are keyed by id).
