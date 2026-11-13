import { Dec, E, PI, ZERO, isFiniteDec } from '@/utils/decimal';

/**
 * MathematicalEngine — a safe expression evaluator (no eval, no Function, no code execution).
 *
 * Pipeline: tokenize → recursive-descent parse to an AST → evaluate with 50-digit decimals.
 *
 * Grammar (lowest to highest precedence):
 *   expression := term (("+" | "-") term)*
 *   term       := unary (("*" | "/") unary | <implicit ×> unary)*
 *   unary      := ("-" | "+") unary | power
 *   power      := postfix ("^" unary)?                 right-associative: 2^3^2 = 2^9
 *   postfix    := primary ("!" | "%")*
 *   primary    := number | "π" | "e" | function "(" args ")" | "√" postfix | "(" expression ")"
 *
 * Conventions (documented in docs/FORMULAS.md):
 * - −2^2 = −4 (exponent binds tighter than the sign), 2^−1 = 0.5.
 * - Implicit multiplication: 2π, 2(3+1), (1+1)(2), 3√4, 2sin(30).
 * - Percent: "x%" = x/100, except "a ± b%" = a ± (a × b/100) like physical calculators
 *   (200 + 10% = 220, 200 − 10% = 180). "a × b%" = a × b/100.
 * - Missing closing parentheses are added at the end ("(2+3" → 5).
 * - Trigonometric results smaller than 1e−40 are noise from π's finite precision and are
 *   snapped to 0 (sin(180°) = 0, tan(90°) is undefined instead of 1.6e+49).
 * - Additive cancellation below 1e−46 × the operands is snapped to 0 (1/3×3−1 = 0).
 * - Factorial is defined for integers 0…3000. root(x; n) uses ";" as argument separator.
 */

export type AngleMode = 'deg' | 'rad';

export type CalcErrorCode = 'syntax' | 'division_by_zero' | 'domain' | 'overflow' | 'empty' | 'too_long';

export class CalcError extends Error {
  constructor(public readonly code: CalcErrorCode) {
    super(`calc_error:${code}`);
    this.name = 'CalcError';
  }
}

export const MAX_EXPRESSION_LENGTH = 500;
const MAX_FACTORIAL = 3000;
const MAX_ABS = new Dec('1e9999');
const TRIG_NOISE = new Dec('1e-40');
const CANCEL_NOISE = new Dec('1e-46');

/* ------------------------------------------------------------------ Tokens */

export const FUNCTIONS = ['asin', 'acos', 'atan', 'sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'cbrt', 'root', 'abs'] as const;
export type FunctionName = (typeof FUNCTIONS)[number];

type Token =
  | { type: 'num'; value: string }
  | { type: 'op'; value: '+' | '-' | '*' | '/' | '^' }
  | { type: 'postfix'; value: '!' | '%' }
  | { type: 'lparen' }
  | { type: 'rparen' }
  | { type: 'sep' }
  | { type: 'const'; value: 'pi' | 'e' | 'ans' }
  | { type: 'sqrt' }
  | { type: 'fn'; value: FunctionName };

const OP_ALIASES: Record<string, '+' | '-' | '*' | '/' | '^'> = {
  '+': '+',
  '-': '-',
  '−': '-',
  '*': '*',
  '×': '*',
  '·': '*',
  '/': '/',
  '÷': '/',
  '^': '^',
};

export function tokenize(input: string): Token[] {
  const src = input.replace(/\s+/g, '');
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i] as string;

    // Number literal: 12, 1.5, .5, 1.5E-3
    if (/[0-9.]/.test(ch)) {
      let j = i;
      let dots = 0;
      while (j < src.length && /[0-9.]/.test(src[j] as string)) {
        if (src[j] === '.') dots++;
        j++;
      }
      let literal = src.slice(i, j);
      if (dots > 1 || literal === '.') throw new CalcError('syntax');
      if (src[j] === 'E') {
        const m = /^E[+-]?[0-9]+/.exec(src.slice(j));
        if (!m) throw new CalcError('syntax');
        literal += m[0];
        j += m[0].length;
      }
      tokens.push({ type: 'num', value: literal });
      i = j;
      continue;
    }

    const op = OP_ALIASES[ch];
    if (op) {
      tokens.push({ type: 'op', value: op });
      i++;
      continue;
    }
    if (ch === '!' || ch === '%') {
      tokens.push({ type: 'postfix', value: ch });
      i++;
      continue;
    }
    if (ch === '(') {
      tokens.push({ type: 'lparen' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'rparen' });
      i++;
      continue;
    }
    if (ch === ';') {
      tokens.push({ type: 'sep' });
      i++;
      continue;
    }
    if (ch === 'π') {
      tokens.push({ type: 'const', value: 'pi' });
      i++;
      continue;
    }
    if (ch === '√') {
      tokens.push({ type: 'sqrt' });
      i++;
      continue;
    }
    if (ch === '²' || ch === '³') {
      tokens.push({ type: 'op', value: '^' }, { type: 'num', value: ch === '²' ? '2' : '3' });
      i++;
      continue;
    }

    // Identifiers: functions and named constants.
    if (/[a-z]/.test(ch)) {
      const rest = src.slice(i);
      const fn = FUNCTIONS.find((f) => rest.startsWith(f) && rest[f.length] === '(');
      if (fn) {
        tokens.push({ type: 'fn', value: fn });
        i += fn.length;
        continue;
      }
      if (rest.startsWith('ans')) {
        tokens.push({ type: 'const', value: 'ans' });
        i += 3;
        continue;
      }
      if (rest.startsWith('pi')) {
        tokens.push({ type: 'const', value: 'pi' });
        i += 2;
        continue;
      }
      if (ch === 'e') {
        tokens.push({ type: 'const', value: 'e' });
        i++;
        continue;
      }
    }
    throw new CalcError('syntax');
  }
  return tokens;
}

/* ------------------------------------------------------------------ AST */

export type Node =
  | { kind: 'num'; value: Dec }
  | { kind: 'neg'; arg: Node }
  | { kind: 'bin'; op: '+' | '-' | '*' | '/' | '^'; left: Node; right: Node }
  | { kind: 'percent'; arg: Node }
  | { kind: 'fact'; arg: Node }
  | { kind: 'call'; fn: FunctionName; args: Node[] };

function startsPrimary(tok: Token | undefined): boolean {
  return !!tok && (tok.type === 'num' || tok.type === 'const' || tok.type === 'fn' || tok.type === 'lparen' || tok.type === 'sqrt');
}

export function parse(tokens: Token[], ans?: Dec): Node {
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  const expression = (): Node => {
    let left = term();
    for (let t = peek(); t?.type === 'op' && (t.value === '+' || t.value === '-'); t = peek()) {
      next();
      left = { kind: 'bin', op: t.value, left, right: term() };
    }
    return left;
  };

  const term = (): Node => {
    let left = unary();
    for (;;) {
      const t = peek();
      if (t?.type === 'op' && (t.value === '*' || t.value === '/')) {
        next();
        left = { kind: 'bin', op: t.value, left, right: unary() };
      } else if (startsPrimary(t)) {
        left = { kind: 'bin', op: '*', left, right: power() };
      } else {
        return left;
      }
    }
  };

  const unary = (): Node => {
    const t = peek();
    if (t?.type === 'op' && (t.value === '-' || t.value === '+')) {
      next();
      const arg = unary();
      return t.value === '-' ? { kind: 'neg', arg } : arg;
    }
    return power();
  };

  const power = (): Node => {
    const base = postfix();
    const t = peek();
    if (t?.type === 'op' && t.value === '^') {
      next();
      return { kind: 'bin', op: '^', left: base, right: unary() };
    }
    return base;
  };

  const postfix = (): Node => {
    let node = primary();
    for (let t = peek(); t?.type === 'postfix'; t = peek()) {
      next();
      node = t.value === '!' ? { kind: 'fact', arg: node } : { kind: 'percent', arg: node };
    }
    return node;
  };

  const primary = (): Node => {
    const t = next();
    if (!t) throw new CalcError('syntax');
    switch (t.type) {
      case 'num': {
        const value = new Dec(t.value.startsWith('.') ? `0${t.value}` : t.value);
        return { kind: 'num', value };
      }
      case 'const':
        if (t.value === 'ans') {
          if (!ans) throw new CalcError('syntax');
          return { kind: 'num', value: ans };
        }
        return { kind: 'num', value: t.value === 'pi' ? PI : E };
      case 'sqrt':
        return { kind: 'call', fn: 'sqrt', args: [postfix()] };
      case 'fn': {
        if (next()?.type !== 'lparen') throw new CalcError('syntax');
        const args = [expression()];
        while (peek()?.type === 'sep') {
          next();
          args.push(expression());
        }
        if (next()?.type !== 'rparen') throw new CalcError('syntax');
        const arity = t.value === 'root' ? 2 : 1;
        if (args.length !== arity) throw new CalcError('syntax');
        return { kind: 'call', fn: t.value, args };
      }
      case 'lparen': {
        const inner = expression();
        if (next()?.type !== 'rparen') throw new CalcError('syntax');
        return inner;
      }
      default:
        throw new CalcError('syntax');
    }
  };

  const root = expression();
  if (pos !== tokens.length) throw new CalcError('syntax');
  return root;
}

/* ------------------------------------------------------------------ Evaluation */

function guard(value: Dec): Dec {
  if (value.isNaN()) throw new CalcError('domain');
  if (!value.isFinite() || value.abs().gt(MAX_ABS)) throw new CalcError('overflow');
  return value;
}

function snapTrig(value: Dec): Dec {
  return value.abs().lt(TRIG_NOISE) ? ZERO : value;
}

function addSub(a: Dec, b: Dec, op: '+' | '-'): Dec {
  const r = op === '+' ? a.plus(b) : a.minus(b);
  if (r.isZero()) return r;
  const scale = Dec.max(a.abs(), b.abs());
  return r.abs().lt(scale.times(CANCEL_NOISE)) ? ZERO : r;
}

function factorial(n: Dec): Dec {
  if (!n.isInteger() || n.isNegative()) throw new CalcError('domain');
  if (n.gt(MAX_FACTORIAL)) throw new CalcError('overflow');
  let acc = new Dec(1);
  for (let i = 2; i <= n.toNumber(); i++) acc = acc.times(i);
  return acc;
}

function power(base: Dec, exp: Dec): Dec {
  if (base.isZero() && exp.isNegative()) throw new CalcError('division_by_zero');
  if (base.isNegative() && !exp.isInteger()) throw new CalcError('domain');
  return Dec.pow(base, exp);
}

function nthRoot(x: Dec, n: Dec): Dec {
  if (n.isZero()) throw new CalcError('domain');
  if (x.isNegative()) {
    // Odd integer roots of negative numbers are real: root(−8; 3) = −2.
    if (n.isInteger() && n.mod(2).abs().eq(1)) return nthRoot(x.neg(), n).neg();
    throw new CalcError('domain');
  }
  if (x.isZero()) {
    if (n.isNegative()) throw new CalcError('division_by_zero');
    return ZERO;
  }
  return Dec.pow(x, new Dec(1).div(n));
}

export interface EvaluateOptions {
  angle: AngleMode;
  /** Full-precision previous result, referenced as "ans" (so chaining 1/3 = then ×3 gives exactly 1). */
  ans?: Dec;
}

function call(fn: FunctionName, args: Dec[], opts: EvaluateOptions): Dec {
  const x = args[0] as Dec;
  const toRad = (v: Dec) => (opts.angle === 'deg' ? v.times(PI).div(180) : v);
  const fromRad = (v: Dec) => (opts.angle === 'deg' ? v.times(180).div(PI) : v);
  switch (fn) {
    case 'sin':
      return snapTrig(Dec.sin(toRad(x)));
    case 'cos':
      return snapTrig(Dec.cos(toRad(x)));
    case 'tan': {
      const r = toRad(x);
      const cos = snapTrig(Dec.cos(r));
      if (cos.isZero()) throw new CalcError('domain');
      return snapTrig(Dec.sin(r)).div(cos);
    }
    case 'asin':
      if (x.abs().gt(1)) throw new CalcError('domain');
      return fromRad(Dec.asin(x));
    case 'acos':
      if (x.abs().gt(1)) throw new CalcError('domain');
      return fromRad(Dec.acos(x));
    case 'atan':
      return fromRad(Dec.atan(x));
    case 'log':
      if (x.lte(0)) throw new CalcError('domain');
      return Dec.log10(x);
    case 'ln':
      if (x.lte(0)) throw new CalcError('domain');
      return Dec.ln(x);
    case 'sqrt':
      if (x.isNegative()) throw new CalcError('domain');
      return Dec.sqrt(x);
    case 'cbrt':
      return Dec.cbrt(x);
    case 'root':
      return nthRoot(x, args[1] as Dec);
    case 'abs':
      return x.abs();
  }
}

export function evaluateNode(node: Node, opts: EvaluateOptions): Dec {
  const ev = (n: Node) => evaluateNode(n, opts);
  switch (node.kind) {
    case 'num':
      return node.value;
    case 'neg':
      return guard(ev(node.arg).neg());
    case 'percent':
      return guard(ev(node.arg).div(100));
    case 'fact':
      return guard(factorial(ev(node.arg)));
    case 'call':
      return guard(call(node.fn, node.args.map(ev), opts));
    case 'bin': {
      const left = ev(node.left);
      if ((node.op === '+' || node.op === '-') && node.right.kind === 'percent') {
        // a ± b%  →  a ± a·b/100
        const pct = ev(node.right.arg).div(100);
        return guard(addSub(left, left.times(pct), node.op));
      }
      const right = ev(node.right);
      switch (node.op) {
        case '+':
        case '-':
          return guard(addSub(left, right, node.op));
        case '*':
          return guard(left.times(right));
        case '/':
          if (right.isZero()) throw new CalcError('division_by_zero');
          return guard(left.div(right));
        case '^':
          return guard(power(left, right));
      }
    }
  }
}

/** Appends the closing parentheses the user didn't type yet. */
export function autoClose(expression: string): string {
  let depth = 0;
  for (const ch of expression) {
    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);
  }
  return expression + ')'.repeat(depth);
}

export type EvaluationResult = { ok: true; value: Dec } | { ok: false; error: CalcErrorCode };

/** Evaluates a canonical expression. Never throws. */
export function evaluate(expression: string, opts: EvaluateOptions = { angle: 'deg' }): EvaluationResult {
  try {
    const trimmed = expression.trim();
    if (!trimmed) return { ok: false, error: 'empty' };
    if (trimmed.length > MAX_EXPRESSION_LENGTH) return { ok: false, error: 'too_long' };
    const value = evaluateNode(parse(tokenize(autoClose(trimmed)), opts.ans), opts);
    if (!isFiniteDec(value)) return { ok: false, error: 'overflow' };
    return { ok: true, value };
  } catch (e) {
    if (e instanceof CalcError) return { ok: false, error: e.code };
    // Decimal.js throws on pathological inputs (e.g. exponent overflow): never show a wrong value.
    return { ok: false, error: 'overflow' };
  }
}
