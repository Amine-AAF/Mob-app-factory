/** Free plan: a fixed number of speaking/listening exercises per day; a rewarded ad adds a bonus. */
export const FREE_DAILY_PRACTICE = 5;
export const REWARDED_BONUS = 5;

export function remainingPractice(input: { isPremium: boolean; doneToday: number; bonus: { day: string; count: number } | null; today: string }): number {
  if (input.isPremium) return Number.POSITIVE_INFINITY;
  const bonus = input.bonus?.day === input.today ? input.bonus.count : 0;
  return Math.max(0, FREE_DAILY_PRACTICE + bonus - input.doneToday);
}

export function grantBonus(bonus: { day: string; count: number } | null, today: string): { day: string; count: number } {
  return { day: today, count: (bonus?.day === today ? bonus.count : 0) + REWARDED_BONUS };
}
