import { percentChange, rankCategories, savingsRate, type Summary } from './stats';

/**
 * Deterministic insights. Each one is produced only when the data supports it:
 * - at least MIN_TX transactions in the current period;
 * - comparisons also need MIN_TX transactions in the previous period and a non-zero base;
 * - changes smaller than MIN_CHANGE_PCT are not reported.
 * The UI translates `key` with the params (category ids are resolved to names there).
 */
export const MIN_TX = 3;
export const MIN_CHANGE_PCT = 5;

export type Insight =
  | { key: 'largestCategory'; categoryId: string; sharePct: number }
  | { key: 'categoryLess' | 'categoryMore'; categoryId: string; pct: number }
  | { key: 'spendingLess' | 'spendingMore'; pct: number }
  | { key: 'savingsRate'; pct: number }
  | { key: 'overspent'; pct: number };

export function buildInsights(current: Summary, previous: Summary | null): Insight[] {
  const out: Insight[] = [];
  if (current.count < MIN_TX) return out;

  const ranked = rankCategories(current.spendingByCategory);
  const top = ranked[0];
  if (top && current.spending > 0) {
    out.push({ key: 'largestCategory', categoryId: top.categoryId, sharePct: Math.round((top.amount * 100) / current.spending) });
  }

  if (previous && previous.count >= MIN_TX) {
    const total = percentChange(previous.spending, current.spending);
    if (total !== null && Math.abs(total) >= MIN_CHANGE_PCT) out.push({ key: total < 0 ? 'spendingLess' : 'spendingMore', pct: Math.abs(total) });

    // Largest relative change among categories present in both periods.
    let best: { categoryId: string; pct: number } | null = null;
    for (const [categoryId, prev] of Object.entries(previous.spendingByCategory)) {
      const pct = percentChange(prev, current.spendingByCategory[categoryId] ?? 0);
      if (pct === null || Math.abs(pct) < MIN_CHANGE_PCT || !(categoryId in current.spendingByCategory)) continue;
      if (!best || Math.abs(pct) > Math.abs(best.pct)) best = { categoryId, pct };
    }
    if (best) out.push({ key: best.pct < 0 ? 'categoryLess' : 'categoryMore', categoryId: best.categoryId, pct: Math.abs(best.pct) });
  }

  const rate = savingsRate(current);
  if (rate !== null) {
    const pct = Math.round(rate * 100);
    out.push(pct < 0 ? { key: 'overspent', pct: Math.abs(pct) } : { key: 'savingsRate', pct });
  }
  return out;
}
