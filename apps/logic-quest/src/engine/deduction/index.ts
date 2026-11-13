import { createRng, hashString } from '../rng';
import type { DeductionChallenge, Difficulty, Skill, Translate } from '../types';

import {
  assignmentKey,
  atomsOf,
  codeFeedback,
  entailedOptions,
  evalFormula,
  LEGS,
  premiseModels,
  solveCode,
  solveGrid,
  solveKnights,
  solveLogic,
  solveMath,
  solveOrdering,
  knightStatementTrue,
  type KnightAssignment,
} from './solvers';
import type { DeductionSpec, Formula, GridCategory, Literal, LogicOption, OrderingClue, ValueRef } from './types';

export * from './types';
export * from './solvers';

export interface DeductionEntry {
  id: string;
  difficulty: Difficulty;
  spec: DeductionSpec;
}

const XP: Record<Difficulty, number> = { easy: 10, medium: 20, hard: 30 };
const SECONDS: Record<Difficulty, number> = { easy: 60, medium: 100, hard: 150 };

export const DEDUCTION_SKILL: Record<DeductionSpec['type'], Skill> = {
  ordering: 'ordering',
  grid: 'grid-deduction',
  logic: 'conditional',
  knights: 'truth-statements',
  code: 'elimination',
  math: 'math-reasoning',
};

/* ------------------------------------------------------------------ compile */

export function compileDeduction(entry: DeductionEntry, position: number): DeductionChallenge {
  const { spec } = entry;
  let input: 'choice' | 'keypad' = 'choice';
  let options: string[] = [];
  let answer = -1;

  switch (spec.type) {
    case 'ordering': {
      const order = solveOrdering(spec)[0] ?? [];
      if (spec.ask.kind === 'at') {
        options = [...spec.people];
        answer = options.indexOf(order[spec.ask.pos] ?? '');
      } else {
        options = spec.people.map((_, i) => String(i + 1));
        answer = order.indexOf(spec.ask.who);
      }
      break;
    }
    case 'grid': {
      const sol = solveGrid(spec)[0];
      if (spec.ask.kind === 'whoHas') {
        const [cat, value] = spec.ask.v.split('.') as [GridCategory, string];
        options = [...spec.people];
        const map = sol?.[cat] ?? {};
        answer = options.findIndex((p) => map[p] === value);
      } else {
        options = [...(spec.values[spec.ask.category] ?? [])];
        answer = options.indexOf(sol?.[spec.ask.category]?.[spec.ask.who] ?? '');
      }
      break;
    }
    case 'logic':
      options = spec.options.map((_, i) => String(i));
      answer = solveLogic(spec)[0] ?? -1;
      break;
    case 'knights': {
      const solution = solveKnights(spec)[0];
      const key = solution ? assignmentKey(spec.people, solution) : '';
      // Distractors: assignments that differ from the solution by one person first (most tempting).
      const all = Array.from({ length: 1 << spec.people.length }, (_, mask) => spec.people.map((_, i) => (mask & (1 << i) ? 'T' : 'L')).join('')).filter((k) => k !== key);
      const distance = (k: string) => [...k].filter((ch, i) => ch !== key[i]).length;
      const rng = createRng(hashString(entry.id));
      const wrong = rng.shuffle(all).sort((x, y) => distance(x) - distance(y)).slice(0, 3);
      options = createRng(hashString(entry.id) ^ 0x6b6e).shuffle([key, ...wrong]);
      answer = options.indexOf(key);
      break;
    }
    case 'code':
      input = 'keypad';
      answer = Number(solveCode(spec)[0] ?? -1);
      break;
    case 'math':
      input = 'keypad';
      answer = solveMath(spec)[0] ?? -1;
      break;
  }

  return {
    id: entry.id,
    category: 'deduction',
    difficulty: entry.difficulty,
    skill: DEDUCTION_SKILL[spec.type],
    position,
    estimatedSeconds: SECONDS[entry.difficulty],
    xp: XP[entry.difficulty],
    premium: entry.difficulty === 'hard',
    spec,
    input,
    options,
    answer,
  };
}

/* -------------------------------------------------------------------- check */

const namesIn = (clue: OrderingClue) => Object.entries(clue).filter(([k]) => ['a', 'b', 'c'].includes(k)).map(([, v]) => String(v));

/** Integrity check: unique solution, answer matches the solver, no trivial give-away. */
export function checkDeduction(c: DeductionChallenge): string[] {
  const problems: string[] = [];
  const spec = c.spec;
  const uniqueOptions = () => {
    if (new Set(c.options).size !== c.options.length) problems.push('duplicate options');
    if (c.answer < 0 || c.answer >= c.options.length) problems.push('answer index out of range');
  };

  switch (spec.type) {
    case 'ordering': {
      const sols = solveOrdering(spec);
      if (sols.length !== 1) problems.push(`expected 1 solution, found ${sols.length}`);
      if (new Set(spec.people).size !== spec.people.length) problems.push('duplicate people');
      for (const clue of spec.clues) for (const n of namesIn(clue)) if (!spec.people.includes(n)) problems.push(`unknown person ${n}`);
      uniqueOptions();
      const order = sols[0] ?? [];
      if (spec.ask.kind === 'at') {
        if (c.options[c.answer] !== order[spec.ask.pos]) problems.push('answer does not match the solution');
        const pos = spec.ask.pos;
        const last = spec.people.length - 1;
        if (spec.clues.some((cl) => (cl.t === 'position' && cl.pos === pos) || (cl.t === 'first' && pos === 0) || (cl.t === 'last' && pos === last))) problems.push('a clue gives the answer away directly');
      } else {
        if (Number(c.options[c.answer]) - 1 !== order.indexOf(spec.ask.who)) problems.push('answer does not match the solution');
        const who = spec.ask.who;
        if (spec.clues.some((cl) => (cl.t === 'position' || cl.t === 'first' || cl.t === 'last') && cl.a === who)) problems.push('a clue gives the answer away directly');
      }
      // Every clue must be useful: removing it must break uniqueness.
      spec.clues.forEach((_, i) => {
        if (solveOrdering({ people: spec.people, clues: spec.clues.filter((__, j) => j !== i) }).length === 1) problems.push(`clue ${i + 1} is redundant`);
      });
      break;
    }
    case 'grid': {
      const sols = solveGrid(spec);
      if (sols.length !== 1) problems.push(`expected 1 solution, found ${sols.length}`);
      for (const [cat, values] of Object.entries(spec.values)) if ((values ?? []).length !== spec.people.length) problems.push(`category ${cat} needs ${spec.people.length} values`);
      const known = (v: ValueRef) => {
        const [cat, value] = v.split('.') as [GridCategory, string];
        return (spec.values[cat] ?? []).includes(value);
      };
      for (const cl of spec.clues) {
        const refs = cl.t === 'is' || cl.t === 'isNot' ? [cl.v] : [cl.v1, cl.v2];
        refs.forEach((r) => !known(r) && problems.push(`unknown value ${r}`));
        if ((cl.t === 'is' || cl.t === 'isNot') && !spec.people.includes(cl.who)) problems.push(`unknown person ${cl.who}`);
      }
      uniqueOptions();
      if (spec.ask.kind === 'whoHas') {
        const asked = spec.ask.v;
        if (spec.clues.some((cl) => cl.t === 'is' && cl.v === asked)) problems.push('a clue gives the answer away directly');
      }
      spec.clues.forEach((_, i) => {
        if (solveGrid({ ...spec, clues: spec.clues.filter((__, j) => j !== i) }).length === 1) problems.push(`clue ${i + 1} is redundant`);
      });
      break;
    }
    case 'logic': {
      if (premiseModels(spec).length === 0) problems.push('premises contradict each other');
      const entailed = entailedOptions(spec);
      const hasNone = spec.options.some((o) => 'none' in o);
      if (entailed.length > 1) problems.push('several options are certainly true');
      if (entailed.length === 0 && !hasNone) problems.push('no option follows from the premises');
      if (solveLogic(spec)[0] !== c.answer) problems.push('answer does not match the solver');
      if (spec.options.length !== 4) problems.push('4 options expected');
      const keys = spec.options.map((o) => JSON.stringify(o));
      if (new Set(keys).size !== keys.length) problems.push('duplicate options');
      // An option that just repeats a premise is a give-away.
      const premiseKeys = new Set(spec.premises.map((p) => JSON.stringify(p)));
      if (keys.some((k, i) => i === c.answer && premiseKeys.has(k))) problems.push('the answer repeats a premise');
      break;
    }
    case 'knights': {
      const sols = solveKnights(spec);
      if (sols.length !== 1) problems.push(`expected 1 solution, found ${sols.length}`);
      for (const st of spec.statements) {
        if (!spec.people.includes(st.by)) problems.push(`unknown speaker ${st.by}`);
        const s = st.says;
        if ((s.t === 'liar' || s.t === 'truthful') && s.x === st.by) problems.push('self-referential statement carries no information');
      }
      uniqueOptions();
      if (sols[0] && c.options[c.answer] !== assignmentKey(spec.people, sols[0])) problems.push('answer does not match the solution');
      break;
    }
    case 'code': {
      const sols = solveCode(spec);
      if (sols.length !== 1) problems.push(`expected 1 code, found ${sols.length}`);
      if (sols[0]?.startsWith('0')) problems.push('code must not start with 0');
      for (const cl of spec.clues) {
        if (cl.guess.length !== spec.digits || new Set(cl.guess).size !== spec.digits) problems.push(`invalid guess ${cl.guess}`);
        if (cl.correct === spec.digits) problems.push('a clue reveals the code');
      }
      if (String(c.answer) !== sols[0]) problems.push('answer does not match the solution');
      spec.clues.forEach((_, i) => {
        if (solveCode({ ...spec, clues: spec.clues.filter((__, j) => j !== i) }).length === 1) problems.push(`clue ${i + 1} is redundant`);
      });
      break;
    }
    case 'math': {
      const sols = solveMath(spec);
      if (sols.length !== 1) problems.push(`expected 1 solution, found ${sols.length}`);
      if (sols[0] !== c.answer) problems.push('answer does not match the solver');
      if (!(c.answer > 0)) problems.push('answer must be a positive whole number');
      break;
    }
  }
  return problems;
}

export function deductionSignature(c: DeductionChallenge): string {
  return JSON.stringify(c.spec);
}

/* ----------------------------------------------------------------- describe */

export function joinList(items: string[], t: Translate): string {
  if (items.length <= 1) return items.join('');
  const last = items[items.length - 1] as string;
  // Spanish "y" becomes "e" before an /i/ sound (Eli e Ines); other languages map both keys to the same word.
  const conj = /^h?i(?![aeouáéóú])/i.test(last) ? t('ded.andBeforeI') : t('ded.and');
  return `${items.slice(0, -1).join(', ')} ${conj} ${last}`;
}

const capitalize = (s: string) => (s ? s[0]!.toLocaleUpperCase() + s.slice(1) : s);

function renderLiteral(l: Literal, t: Translate): string {
  return t(`atom.${l.atom}.${l.neg ? 'neg' : 'pos'}`);
}

export function renderFormula(f: Formula | LogicOption, t: Translate): string {
  if ('none' in f) return t('logic.none');
  if ('atom' in f) return `${capitalize(renderLiteral(f, t))}.`;
  if ('if' in f) return t('logic.if', { a: renderLiteral(f.if[0], t), b: renderLiteral(f.if[1], t) });
  if ('or' in f) return t('logic.or', { a: renderLiteral(f.or[0], t), b: renderLiteral(f.or[1], t) });
  return t('logic.and', { a: renderLiteral(f.and[0], t), b: renderLiteral(f.and[1], t) });
}

const ord = (t: Translate, n: number) => t('ded.rank', { n });

function orderingClueText(theme: string, clue: OrderingClue, t: Translate): string {
  const k = `ord.${theme}.${clue.t}`;
  switch (clue.t) {
    case 'position':
    case 'notPosition':
      return t(k, { a: clue.a, n: clue.pos + 1 });
    case 'between':
      return t(k, { a: clue.a, b: clue.b, c: clue.c });
    case 'first':
    case 'last':
    case 'notFirst':
    case 'notLast':
      return t(k, { a: clue.a });
    default:
      return t(k, { a: clue.a, b: clue.b });
  }
}

const vp = (v: ValueRef, t: Translate, neg = false) => t(`grid.${neg ? 'vpNeg' : 'vp'}.${v}`);
const noun = (v: ValueRef, t: Translate) => t(`grid.v.${v}`);

function knightText(by: string, s: Parameters<typeof knightStatementTrue>[0], t: Translate): string {
  switch (s.t) {
    case 'liar':
    case 'truthful':
      return t(`kn.s.${s.t}`, { x: s.x });
    case 'atLeastOneLiar':
      return t('kn.s.atLeastOneLiar');
    case 'exactlyLiars':
      return t('kn.s.exactlyLiars', { count: s.n });
    default: {
      // Self-reference uses a first-person template ("Kai and I are both liars").
      if (s.x === by || s.y === by) return t(`kn.s.${s.t}Me`, { other: s.x === by ? s.y : s.x });
      return t(`kn.s.${s.t}`, { x: s.x, y: s.y });
    }
  }
}

function knightAssignmentLabel(people: string[], key: string, t: Translate): string {
  const truthful = people.filter((_, i) => key[i] === 'T');
  const liars = people.filter((_, i) => key[i] === 'L');
  return t('kn.assignment', {
    truthful: truthful.length ? joinList(truthful, t) : t('kn.nobody'),
    liars: liars.length ? joinList(liars, t) : t('kn.nobody'),
  });
}

function describeModel(m: Record<string, boolean>, atoms: string[], t: Translate): string {
  return joinList(atoms.map((a) => renderLiteral({ atom: a, neg: !m[a] }, t)), t);
}

export interface DeductionText {
  title: string;
  instructions: string;
  prompt: string[];
  optionLabels: string[];
  hint: string;
  explanation: string[];
  answerLabel: string;
}

export function describeDeduction(c: DeductionChallenge, t: Translate): DeductionText {
  const spec = c.spec;
  const answerIs = (answer: string) => t('ded.answerIs', { answer });
  switch (spec.type) {
    case 'ordering': {
      const order = solveOrdering(spec)[0] ?? [];
      const th = spec.theme;
      const ask =
        spec.ask.kind === 'at'
          ? spec.ask.pos === 0
            ? t(`ord.${th}.askFirst`)
            : spec.ask.pos === spec.people.length - 1
              ? t(`ord.${th}.askLast`)
              : t(`ord.${th}.askAt`, { n: spec.ask.pos + 1 })
          : t(`ord.${th}.askPositionOf`, { who: spec.ask.who });
      const optionLabels = spec.ask.kind === 'at' ? c.options : c.options.map((o) => ord(t, Number(o)));
      const anchor = spec.clues.find((cl) => cl.t === 'first' || cl.t === 'last' || cl.t === 'position');
      return {
        title: t(`ord.${th}.title`),
        instructions: t('ded.instructions.ordering'),
        prompt: [t(`ord.${th}.intro`, { names: joinList(spec.people, t) }), ...spec.clues.map((cl) => orderingClueText(th, cl, t)), ask],
        optionLabels,
        hint: anchor ? t('ord.hint.anchor', { a: anchor.a }) : t('ord.hint.chain'),
        explanation: [t(`ord.${th}.order`, { order: order.join(' → ') }), t('ord.unique'), answerIs(optionLabels[c.answer] ?? '')],
        answerLabel: optionLabels[c.answer] ?? '',
      };
    }
    case 'grid': {
      const sol = solveGrid(spec)[0] ?? {};
      const cats = Object.keys(spec.values) as GridCategory[];
      const optionLabels =
        spec.ask.kind === 'whoHas' ? c.options : c.options.map((v) => capitalize(noun(`${(spec.ask as { category: GridCategory }).category}.${v}`, t)));
      const clueText = spec.clues.map((cl) => {
        switch (cl.t) {
          case 'is':
            return t('grid.is', { who: cl.who, vp: vp(cl.v, t) });
          case 'isNot':
            return t('grid.isNot', { who: cl.who, vp: vp(cl.v, t, true) });
          case 'same':
            return t('grid.same', { vp1: vp(cl.v1, t), vp2: vp(cl.v2, t) });
          case 'notSame':
            return t('grid.notSame', { vp1: vp(cl.v1, t), vp2: vp(cl.v2, t, true) });
        }
      });
      const ask = spec.ask.kind === 'whoHas' ? t('grid.askWho', { vp: vp(spec.ask.v, t) }) : t(`grid.askWhat.${spec.ask.category}`, { who: spec.ask.who });
      return {
        title: t('grid.title'),
        instructions: t('ded.instructions.grid'),
        prompt: [
          t('grid.intro', { names: joinList(spec.people, t) }),
          ...cats.map((cat) => t('grid.catLine', { cat: t(`grid.cat.${cat}`), values: (spec.values[cat] ?? []).map((v) => noun(`${cat}.${v}`, t)).join(', ') })),
          ...clueText,
          ask,
        ],
        optionLabels,
        hint: t('grid.hint'),
        explanation: [
          ...spec.people.map((p) => t('grid.solutionLine', { who: p, items: cats.map((cat) => noun(`${cat}.${sol[cat]?.[p] ?? ''}`, t)).join(', ') })),
          t('grid.unique'),
          answerIs(optionLabels[c.answer] ?? ''),
        ],
        answerLabel: optionLabels[c.answer] ?? '',
      };
    }
    case 'logic': {
      const models = premiseModels(spec);
      const atoms = atomsOf([...spec.premises, ...spec.options]);
      const optionLabels = spec.options.map((o) => renderFormula(o, t));
      const explanation: string[] = [];
      const correct = spec.options[c.answer];
      if (correct && !('none' in correct)) explanation.push(t('logic.explainCertain', { conclusion: optionLabels[c.answer] }));
      else explanation.push(t('logic.explainNone'));
      spec.options.forEach((o, i) => {
        if (i === c.answer || 'none' in o) return;
        const counter = models.find((m) => !evalFormula(o, m));
        if (counter) explanation.push(t('logic.explainNotCertain', { option: optionLabels[i], example: describeModel(counter, atoms, t) }));
      });
      return {
        title: t('logic.title'),
        instructions: t('ded.instructions.logic'),
        prompt: [t('logic.intro'), ...spec.premises.map((p) => renderFormula(p, t)), t('logic.ask')],
        optionLabels,
        hint: t('logic.hint'),
        explanation,
        answerLabel: optionLabels[c.answer] ?? '',
      };
    }
    case 'knights': {
      const sol = solveKnights(spec)[0] as KnightAssignment | undefined;
      const optionLabels = c.options.map((k) => knightAssignmentLabel(spec.people, k, t));
      return {
        title: t('kn.title'),
        instructions: t('ded.instructions.knights'),
        prompt: [t('kn.intro', { names: joinList(spec.people, t) }), ...spec.statements.map((st) => t('kn.says', { who: st.by, text: knightText(st.by, st.says, t) })), t('kn.ask')],
        optionLabels,
        hint: t('kn.hint'),
        explanation: [
          ...spec.statements.map((st) =>
            t(sol?.[st.by] ? 'kn.checkTruthful' : 'kn.checkLiar', {
              who: st.by,
              text: knightText(st.by, st.says, t),
            }),
          ),
          t('kn.unique'),
          answerIs(optionLabels[c.answer] ?? ''),
        ],
        answerLabel: optionLabels[c.answer] ?? '',
      };
    }
    case 'code': {
      const code = String(c.answer);
      const zeroClue = spec.clues.find((cl) => cl.correct === 0 && cl.misplaced === 0);
      return {
        title: t('code.title'),
        instructions: t('ded.instructions.code'),
        prompt: [t('code.intro', { digits: spec.digits }), ...spec.clues.map((cl) => t('code.clue', { guess: cl.guess, correct: cl.correct, misplaced: cl.misplaced })), t('code.ask')],
        optionLabels: [],
        hint: zeroClue ? t('code.hintZero', { guess: zeroClue.guess }) : t('code.hint'),
        explanation: [
          ...spec.clues.map((cl) => {
            const f = codeFeedback(code, cl.guess);
            return t('code.check', { guess: cl.guess, code, correct: f.correct, misplaced: f.misplaced });
          }),
          t('code.unique', { code }),
        ],
        answerLabel: code,
      };
    }
    case 'math': {
      const a = c.answer;
      let question: string;
      let explanation: string[];
      switch (spec.t) {
        case 'headsLegs': {
          const [l1, l2] = LEGS[spec.theme];
          const base = spec.heads * l1;
          question = t(`math.headsLegs.${spec.theme}`, { heads: spec.heads, legs: spec.legs });
          explanation = [t(`math.headsLegs.explain.${spec.theme}`, { heads: spec.heads, base, extra: l2 - l1, legs: spec.legs, answer: a, other: spec.heads - a })];
          break;
        }
        case 'ages': {
          const younger = spec.ask === 'younger' ? a : a / spec.ratioNow;
          const older = younger * spec.ratioNow;
          question = t(spec.ask === 'younger' ? 'math.ages.askYounger' : 'math.ages.askOlder', { ratioNow: spec.ratioNow, years: spec.years, ratioLater: spec.ratioLater });
          explanation = [t('math.ages.explain', { ratioNow: spec.ratioNow, years: spec.years, ratioLater: spec.ratioLater, younger, older, youngerLater: younger + spec.years, olderLater: older + spec.years })];
          break;
        }
        case 'sumDiff': {
          question = t(`math.sumDiff.${spec.theme}`, { sum: spec.sum, diff: spec.diff });
          explanation = [t(`math.sumDiff.explain.${spec.theme}`, { sum: spec.sum, diff: spec.diff, answer: a, small: (spec.sum - spec.diff) / 2, large: (spec.sum + spec.diff) / 2 })];
          break;
        }
        case 'consecutive': {
          const first = spec.ask === 'smallest' ? a : a - spec.count + 1;
          const nums = Array.from({ length: spec.count }, (_, k) => first + k);
          question = t(spec.ask === 'smallest' ? 'math.consecutive.askSmallest' : 'math.consecutive.askLargest', { count: spec.count, sum: spec.sum });
          explanation = [t('math.consecutive.explain', { count: spec.count, middle: spec.sum / spec.count }), `${nums.join(' + ')} = ${spec.sum}`];
          break;
        }
        case 'handshakes':
          question = t('math.handshakes.ask', { handshakes: spec.handshakes });
          explanation = [t('math.handshakes.explain'), `${a} × ${a - 1} ÷ 2 = ${spec.handshakes}`];
          break;
      }
      return {
        title: t(`math.${spec.t}.title`),
        instructions: t('ded.instructions.math'),
        prompt: [question],
        optionLabels: [],
        hint: t(`math.${spec.t}.hint`),
        explanation: [...explanation, answerIs(String(a))],
        answerLabel: String(a),
      };
    }
  }
}
