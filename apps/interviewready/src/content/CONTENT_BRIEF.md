# InterviewReady — content brief

Single reference for everyone (human or AI session) writing or translating library content.
The validation suite (`src/content/validation.ts`, run by `src/__tests__/content.test.ts`) enforces the
mechanical rules; this brief covers what tests cannot check.

## Target distribution (v1: 500 questions, 150+ quizzes)

| Category | Prefix | Questions | Quizzes | Notes |
| --- | --- | --- | --- | --- |
| general | `gen` | 40 | — | Classic questions, all roles |
| behavioral | `beh` | 80 | — | 8 per competency, STAR |
| software | `sw` | 50 | 25 | |
| java | `java` | 50 | 25 | Java 17/21 LTS, Spring Boot 3 |
| frontend | `fe` | 50 | 25 | ES2022+, TS 5, React 18/19 |
| databases | `db` | 40 | 20 | PostgreSQL 15+, MongoDB 6+ |
| devops | `ops` | 45 | 20 | |
| ai-data | `ai` | 45 | 20 | |
| job-specific | `job` | 60 | — | ~7-8 per non-technical role |
| hr-salary | `hr` | 40 | 15 | |

## File layout

```
data/<category>/core.ts   export const core: QuestionCore[]        (language-neutral)
data/<category>/en.ts     export const en: TextTable<QuestionText>  (source language)
data/<category>/fr.ts     export const fr: TextTable<QuestionText>
data/<category>/es.ts     export const es: TextTable<QuestionText>
data/<category>/index.ts  export const pack: QuestionPack
```

## Writing rules

- **Original content.** Do not copy question banks, books or other apps (including DevSpeak's lessons).
- **No filler.** Each question must test something different. Variants of the same question are not new questions.
- **Model answers are examples, not scripts.** Write them in the first person with concrete but clearly
  illustrative details (company type, numbers, technologies). The UI reminds users to adapt them.
- **Behavioral answers follow STAR** explicitly: situation, task, action (the longest part, "I" not "we"), measurable result.
- **Technical answers must be correct** for current mainstream versions, matched to the stated level:
  - beginner: definition + simple example;
  - intermediate: how it works + trade-offs;
  - advanced: internals, edge cases, production concerns.
- **No promises.** Never claim an answer guarantees a job offer.
- **Neutral and inclusive.** No gender assumptions, no country-specific law presented as universal
  (salary, notice periods: say "depends on your country/contract").
- `intent`: what the interviewer wants to learn, 1-2 sentences.
- `explanation`: why the answer works / the concept behind it.
- `tips`: 2-4 actionable items. `commonMistakes`: 1-3. `followUpQuestions`: 1-3 realistic follow-ups.
- `example`: only when it adds something (code snippet, wording, scenario). Omit otherwise.

## Translation rules (FR / ES)

- Translate meaning, not words: natural professional French (vouvoiement) and neutral international Spanish (tuteo).
- Keep **the same number** of tips, mistakes and follow-ups, in the same order; keep `example` if and only if English has one.
- Keep code, identifiers, commands, product names and acronyms unchanged (`HashMap`, `git rebase`, `STAR`, `REST`).
  The STAR letters stay "Situation, Task, Action, Result"; explain them in the target language when introduced.
- Adapt idioms and currency formats naturally; keep amounts generic ("a range based on market data").
- French typography: non-breaking space is not required, but use « » for quotes and a space before `?` `!` `:` `;`.
- Spanish: opening ¿ and ¡ are required.
- Grammatical gender in first-person model answers: prefer neutral wording when it reads naturally
  (« j'ai constaté », « me di cuenta »); otherwise the masculine is the current fallback.
  A later pass may offer inclusive variants.
- Numbers: French « 1 000 », « 4,5 » ; Spanish « 1.000 », « 4,5 ».
- Common English workplace terms may stay in English when that is how professionals speak
  (product manager, sprint, feature flag, business plan).
