import { allocate, parseDecimal, roundDiv } from '@/utils/money';

/**
 * Financial calculators. All inputs/outputs are integer minor units; percentages are
 * exact decimal strings ("7.5"). Results are ESTIMATES for planning, not financial advice.
 * Every formula is documented next to its function and in docs/financial-calculations.md.
 */

function pct(value: string): { num: bigint; den: bigint } | null {
  const r = parseDecimal(value || '0');
  if (!r) return null;
  return { num: r.num, den: r.den * 100n };
}

/* ------------------------------------------------------------ Monthly budget */

/**
 * available = income − Σ planned expenses − savings, where savings = income × savingsPct.
 * Also returns the 50/30/20 reference split of the income (needs / wants / savings).
 */
export function monthlyBudget(input: { income: number; expenses: readonly number[]; savingsPct: string }) {
  const p = pct(input.savingsPct);
  if (!p || p.num > p.den) return { ok: false as const, error: 'invalid_percent' };
  const savings = Number(roundDiv(BigInt(input.income) * p.num, p.den));
  const planned = input.expenses.reduce((a, b) => a + b, 0);
  const [needs, wants, save] = allocate(input.income, [50, 30, 20]) as [number, number, number];
  return {
    ok: true as const,
    savings,
    planned,
    available: input.income - planned - savings,
    reference: { needs, wants, savings: save },
  };
}

/* ------------------------------------------------------------ Savings goal */

/**
 * No interest is assumed (stated in the UI).
 * - With `months`: monthly = ceil(remaining / months).
 * - With `monthly`: months = ceil(remaining / monthly).
 */
export function savingsGoalPlan(input: { target: number; current: number; months?: number; monthly?: number }) {
  const remaining = Math.max(0, input.target - input.current);
  if (input.target <= 0) return { ok: false as const, error: 'invalid_target' };
  if (input.months !== undefined) {
    if (!Number.isInteger(input.months) || input.months < 1 || input.months > 1200) return { ok: false as const, error: 'invalid_months' };
    return { ok: true as const, remaining, monthly: Math.ceil(remaining / input.months), months: input.months };
  }
  if (input.monthly !== undefined) {
    if (input.monthly <= 0) return { ok: false as const, error: 'invalid_monthly' };
    return { ok: true as const, remaining, monthly: input.monthly, months: Math.ceil(remaining / input.monthly) };
  }
  return { ok: false as const, error: 'missing_input' };
}

/* ------------------------------------------------------------ Expense split */

/**
 * tip = round(total × tipPct); shares = (total + tip) split by integer weights with the
 * largest-remainder method, so the shares always add up exactly to the grand total.
 */
export function splitExpense(input: { total: number; people: number; tipPct?: string; weights?: readonly number[] }) {
  if (input.total < 0) return { ok: false as const, error: 'invalid_total' };
  if (!Number.isInteger(input.people) || input.people < 1 || input.people > 100) return { ok: false as const, error: 'invalid_people' };
  const p = pct(input.tipPct ?? '0');
  if (!p) return { ok: false as const, error: 'invalid_percent' };
  const tip = Number(roundDiv(BigInt(input.total) * p.num, p.den));
  const weights = input.weights && input.weights.length === input.people ? input.weights : Array.from({ length: input.people }, () => 1);
  if (weights.some((w) => !Number.isInteger(w) || w < 0) || weights.every((w) => w === 0)) return { ok: false as const, error: 'invalid_weights' };
  const grandTotal = input.total + tip;
  return { ok: true as const, tip, grandTotal, shares: allocate(grandTotal, weights) };
}

/* ------------------------------------------------------------ Salary breakdown */

export type SalaryPeriod = 'year' | 'month' | 'week' | 'hour';

/**
 * Converts a gross salary between periods. Conventions: 12 months, 52 weeks,
 * `hoursPerWeek` (default 40), 5 working days per week. Net = gross × (1 − deductionPct),
 * where deductionPct is the user's own estimate of taxes & contributions (no tax tables).
 */
export function salaryBreakdown(input: { amount: number; period: SalaryPeriod; hoursPerWeek: string; deductionPct: string }) {
  const h = parseDecimal(input.hoursPerWeek || '40');
  const d = pct(input.deductionPct);
  if (!h || h.num === 0n) return { ok: false as const, error: 'invalid_hours' };
  if (!d || d.num > d.den) return { ok: false as const, error: 'invalid_percent' };
  if (input.amount < 0) return { ok: false as const, error: 'invalid_amount' };
  // Annual gross as an exact rational: num / den.
  const A = BigInt(input.amount);
  let num: bigint;
  let den: bigint;
  switch (input.period) {
    case 'year':
      [num, den] = [A, 1n];
      break;
    case 'month':
      [num, den] = [A * 12n, 1n];
      break;
    case 'week':
      [num, den] = [A * 52n, 1n];
      break;
    case 'hour':
      [num, den] = [A * 52n * h.num, h.den];
      break;
  }
  const per = (div: bigint, extraNum = 1n, extraDen = 1n) => Number(roundDiv(num * extraNum, den * div * extraDen));
  const gross = {
    year: per(1n),
    month: per(12n),
    biweekly: per(26n),
    week: per(52n),
    day: per(260n),
    hour: per(52n, h.den, h.num),
  };
  const keepNum = d.den - d.num;
  const net = Object.fromEntries(Object.entries(gross).map(([k, v]) => [k, Number(roundDiv(BigInt(v) * keepNum, d.den))])) as typeof gross;
  return { ok: true as const, gross, net, deductionsPerYear: gross.year - net.year };
}

/* ------------------------------------------------------------ Debt repayment */

export interface DebtMonth {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

export const MAX_DEBT_MONTHS = 600;

/**
 * Fixed monthly payment simulation, interest compounded monthly:
 *   interest_m = round(balance × APR / 12)
 *   principal_m = payment − interest_m (last payment is reduced to the remaining balance)
 * Fails when the payment does not cover the first month's interest.
 */
export function debtRepayment(input: { balance: number; aprPct: string; payment: number }) {
  const r = pct(input.aprPct);
  if (!r) return { ok: false as const, error: 'invalid_percent' };
  if (input.balance <= 0) return { ok: false as const, error: 'invalid_balance' };
  if (input.payment <= 0) return { ok: false as const, error: 'invalid_payment' };
  const monthlyDen = r.den * 12n;
  let balance = input.balance;
  let totalInterest = 0;
  const schedule: DebtMonth[] = [];
  for (let m = 1; balance > 0; m++) {
    if (m > MAX_DEBT_MONTHS) return { ok: false as const, error: 'too_long' };
    const interest = Number(roundDiv(BigInt(balance) * r.num, monthlyDen));
    if (m === 1 && input.payment <= interest) return { ok: false as const, error: 'payment_too_low', minimumInterest: interest };
    const due = balance + interest;
    const payment = Math.min(input.payment, due);
    balance = due - payment;
    totalInterest += interest;
    schedule.push({ month: m, payment, interest, principal: payment - interest, balance });
  }
  return { ok: true as const, months: schedule.length, totalInterest, totalPaid: input.balance + totalInterest, schedule };
}

/** Smallest fixed payment (minor units) that clears the debt within `months` (binary search on the simulation). */
export function paymentForMonths(input: { balance: number; aprPct: string; months: number }): number | null {
  if (input.months < 1 || input.months > MAX_DEBT_MONTHS || input.balance <= 0) return null;
  let lo = 1;
  let hi = input.balance * 2 + 1;
  const fits = (p: number) => {
    const res = debtRepayment({ balance: input.balance, aprPct: input.aprPct, payment: p });
    return res.ok && res.months <= input.months;
  };
  if (!fits(hi)) return null;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (fits(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
