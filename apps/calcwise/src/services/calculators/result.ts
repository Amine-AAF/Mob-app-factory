/**
 * Shared result type for every calculator service. Services never throw for
 * user input: they return a typed error that the UI translates.
 */
export type CalcIssue =
  | 'required'
  | 'not_positive'
  | 'negative'
  | 'zero_division'
  | 'percent_range'
  | 'too_large'
  | 'not_integer'
  | 'incompatible_units';

export type CalcResult<T> = { ok: true; value: T } | { ok: false; issue: CalcIssue; field?: string };

export const ok = <T>(value: T): CalcResult<T> => ({ ok: true, value });
export const fail = <T = never>(issue: CalcIssue, field?: string): CalcResult<T> => (field ? { ok: false, issue, field } : { ok: false, issue });
