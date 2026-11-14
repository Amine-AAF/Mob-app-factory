import type { OverviewStats } from './stats';

/**
 * Short rule-based observations. Each one states a fact taken from the stats
 * (never advice, never a health or psychological claim) and only appears when
 * there is enough data behind it.
 */
export interface Insight {
  key: string;
  params: Record<string, string | number>;
  tone: 'positive' | 'neutral' | 'encourage';
}

export function buildInsights(o: OverviewStats): Insight[] {
  const out: Insight[] = [];
  const pct = (r: number) => Math.round(r * 100);

  if (o.weeklyRate !== null) {
    out.push({ key: 'insights.rules.weeklyRate', params: { percent: pct(o.weeklyRate) }, tone: o.weeklyRate >= 0.7 ? 'positive' : 'neutral' });
  }
  const best = o.ranking[0];
  if (best && best.rate >= 0.5) out.push({ key: 'insights.rules.mostConsistent', params: { name: best.habit.name }, tone: 'positive' });

  if (o.thisWeek !== null && o.lastWeek !== null) {
    const delta = pct(o.thisWeek) - pct(o.lastWeek);
    if (delta >= 5) out.push({ key: 'insights.rules.betterThanLastWeek', params: { points: delta }, tone: 'positive' });
    else if (delta <= -5) out.push({ key: 'insights.rules.lowerThanLastWeek', params: { points: -delta }, tone: 'encourage' });
  }
  if (o.bestCurrentStreak && o.bestCurrentStreak.streak.current >= 3) {
    const s = o.bestCurrentStreak;
    out.push({ key: `insights.rules.streak_${s.streak.unit}`, params: { name: s.habit.name, count: s.streak.current }, tone: 'positive' });
  }
  const worst = o.ranking.at(-1);
  if (worst && o.ranking.length >= 2 && worst.rate < 0.5 && worst !== best) {
    out.push({ key: 'insights.rules.needsAttention', params: { name: worst.habit.name, percent: pct(worst.rate) }, tone: 'encourage' });
  }
  if (o.totalCompletions >= 10) out.push({ key: 'insights.rules.totalCompletions', params: { count: o.totalCompletions }, tone: 'neutral' });
  return out;
}
