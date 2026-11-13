import { evaluate, type AngleMode, type CalcErrorCode, type FunctionName } from '@/services/MathematicalEngine';
import { Dec, Decimal } from '@/utils/decimal';

/**
 * Pure keypad state machine for the Standard & Scientific calculators.
 * The expression is canonical text understood by the MathematicalEngine
 * ("12.5*(3+ans)", "sin(30)"); the UI localizes it for display.
 */
export interface CalcState {
  expr: string;
  /** Full-precision result of the last "=" (referenced as "ans"). */
  ans: string | null;
  /** True right after "=": typing a digit starts a new expression, an operator continues from ans. */
  justEvaluated: boolean;
  error: CalcErrorCode | null;
}

export const INITIAL_STATE: CalcState = { expr: '', ans: null, justEvaluated: false, error: null };

export const MAX_DIGITS_PER_NUMBER = 20;

export type Key =
  | { type: 'digit'; value: string }
  | { type: 'decimal' }
  | { type: 'op'; value: '+' | '-' | '*' | '/' | '^' }
  | { type: 'percent' }
  | { type: 'paren' } // smart "( )"
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'sign' }
  | { type: 'fn'; value: FunctionName }
  | { type: 'const'; value: 'pi' | 'e' }
  | { type: 'square' }
  | { type: 'cube' }
  | { type: 'factorial' }
  | { type: 'reciprocal' }
  | { type: 'tenPower' }
  | { type: 'expPower' }
  | { type: 'exp' } // scientific-notation "E"
  | { type: 'separator' } // ";" in root(x;n)
  | { type: 'backspace' }
  | { type: 'clear' };

const OPERATORS = '+-*/^';
const last = (s: string) => s.charAt(s.length - 1);
/** Expression ends with something that can be followed by an operator. */
export function endsWithOperand(expr: string): boolean {
  return /([0-9.)%!πe]|ans|pi)$/.test(expr);
}
const trailingNumber = (expr: string) => /(\d+\.?\d*(E[+-]?\d*)?|\.\d+)$/.exec(expr)?.[0] ?? '';

function startFresh(state: CalcState): CalcState {
  return { ...state, expr: '', justEvaluated: false, error: null };
}

/** When continuing after "=", operators chain on the precise previous result. */
function continueFromAns(state: CalcState): CalcState {
  return state.justEvaluated && state.ans !== null ? { ...state, expr: 'ans', justEvaluated: false, error: null } : { ...state, justEvaluated: false, error: null };
}

function append(state: CalcState, text: string): CalcState {
  return { ...state, expr: state.expr + text, justEvaluated: false, error: null };
}

export function press(state: CalcState, key: Key): CalcState {
  switch (key.type) {
    case 'clear':
      return { ...INITIAL_STATE, ans: state.ans };

    case 'backspace': {
      if (state.justEvaluated) return startFresh(state);
      const fn = /(asin|acos|atan|sin|cos|tan|log|ln|sqrt|cbrt|root|abs)\($/.exec(state.expr);
      const cut = fn ? fn[0].length : /ans$/.test(state.expr) ? 3 : 1;
      return { ...state, expr: state.expr.slice(0, -cut), error: null };
    }

    case 'digit': {
      const s = state.justEvaluated ? startFresh(state) : state;
      const num = trailingNumber(s.expr).replace(/[.E+-]/g, '');
      if (num.length >= MAX_DIGITS_PER_NUMBER) return s;
      // "0" then "5" → "5" (no leading zeros), but keep "0." and "10".
      if (/(^|[^0-9.])0$/.test(s.expr)) return { ...s, expr: s.expr.slice(0, -1) + key.value, error: null };
      return append(s, key.value);
    }

    case 'decimal': {
      const s = state.justEvaluated ? startFresh(state) : state;
      const num = trailingNumber(s.expr);
      if (num.includes('.') || num.includes('E')) return s;
      return append(s, num ? '.' : endsWithOperand(s.expr) ? '*0.' : '0.');
    }

    case 'exp': {
      const num = trailingNumber(state.expr);
      if (!num || num.includes('E') || state.justEvaluated) return state;
      return append(state, 'E');
    }

    case 'op': {
      const s = continueFromAns(state);
      const e = s.expr;
      if (/E$/.test(e)) return key.value === '-' || key.value === '+' ? append(s, key.value) : s;
      if (e === '' || last(e) === '(' || last(e) === ';') return key.value === '-' ? append(s, '-') : s;
      if (OPERATORS.includes(last(e))) {
        // "3*" + "-" → "3*-" (negative operand); otherwise replace the operator.
        if (key.value === '-' && '*/^'.includes(last(e))) return append(s, '-');
        const trimmed = e.replace(/[+\-*/^]+$/, '');
        return trimmed === '' ? s : { ...s, expr: trimmed + key.value };
      }
      return append(s, key.value);
    }

    case 'percent':
    case 'factorial':
    case 'square':
    case 'cube': {
      const s = continueFromAns(state);
      if (!endsWithOperand(s.expr)) return s;
      const text = { percent: '%', factorial: '!', square: '^2', cube: '^3' }[key.type];
      return append(s, text);
    }

    case 'reciprocal': {
      const s = continueFromAns(state);
      if (!endsWithOperand(s.expr)) return s;
      return { ...s, expr: `1/(${s.expr})` };
    }

    case 'paren': {
      const s = state.justEvaluated ? continueFromAns(state) : state;
      const open = (s.expr.match(/\(/g) ?? []).length - (s.expr.match(/\)/g) ?? []).length;
      if (open > 0 && endsWithOperand(s.expr)) return append(s, ')');
      return append(s, '(');
    }

    case 'open':
      return append(state.justEvaluated ? continueFromAns(state) : state, '(');

    case 'close': {
      const open = (state.expr.match(/\(/g) ?? []).length - (state.expr.match(/\)/g) ?? []).length;
      if (open <= 0 || !endsWithOperand(state.expr)) return state;
      return append(state, ')');
    }

    case 'separator': {
      if (!/root\([^;()]*$/.test(state.expr) || !endsWithOperand(state.expr)) return state;
      return append(state, ';');
    }

    case 'sign': {
      if (state.justEvaluated && state.ans !== null) return { ...state, expr: '-ans', justEvaluated: false, error: null };
      const e = state.expr;
      const num = trailingNumber(e);
      if (!num) return append(state, '(-');
      const before = e.slice(0, e.length - num.length);
      if (before.endsWith('(-')) return { ...state, expr: before.slice(0, -2) + num, error: null };
      return { ...state, expr: `${before}(-${num}`, error: null };
    }

    case 'fn':
      return append(state.justEvaluated ? startFresh(state) : state, `${key.value}(`);

    case 'tenPower':
      return append(state.justEvaluated ? startFresh(state) : state, '10^(');

    case 'expPower':
      return append(state.justEvaluated ? startFresh(state) : state, 'e^(');

    case 'const':
      return append(state.justEvaluated ? startFresh(state) : state, key.value === 'pi' ? 'π' : 'e');
  }
}

export interface EqualsOutcome {
  state: CalcState;
  /** Set when a new result was produced (for history). */
  record?: { expression: string; result: string };
}

/** Canonical text of a decimal that the engine can parse back (uppercase exponent). */
export function canonical(value: Dec, significant = 15): string {
  return value.toSignificantDigits(significant, Decimal.ROUND_HALF_UP).toString().replace('e', 'E');
}

export function previewValue(state: CalcState, angle: AngleMode): Dec | null {
  if (state.justEvaluated || !/[+\-*/^%!(]/.test(state.expr.replace(/^-/, '').replace(/E[+-]/g, ''))) return null;
  const r = evaluate(state.expr, { angle, ans: state.ans ? new Dec(state.ans) : undefined });
  return r.ok ? r.value : null;
}

export function equals(state: CalcState, angle: AngleMode): EqualsOutcome {
  if (state.justEvaluated || state.expr === '') return { state };
  const ans = state.ans ? new Dec(state.ans) : undefined;
  const r = evaluate(state.expr, { angle, ans });
  if (!r.ok) return { state: { ...state, error: r.error } };
  const expression = ans ? state.expr.replace(/ans/g, canonical(ans)) : state.expr;
  return {
    state: { expr: canonical(r.value), ans: r.value.toString(), justEvaluated: true, error: null },
    record: { expression, result: canonical(r.value) },
  };
}

/** Puts a value from the history back into the calculator. */
export function loadValue(state: CalcState, value: string): CalcState {
  const v = value.replace(/^-/, '(-');
  if (state.justEvaluated || state.expr === '') return { ...state, expr: v, justEvaluated: false, error: null };
  if (endsWithOperand(state.expr)) return state;
  return append(state, v);
}
