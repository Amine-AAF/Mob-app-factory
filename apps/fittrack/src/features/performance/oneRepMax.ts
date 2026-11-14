/**
 * One-repetition maximum ESTIMATES. These are never measured values: the UI always
 * labels them "estimated" and explains the formula (Settings › About the calculations).
 *
 * Epley (1985):   1RM ≈ w × (1 + r / 30)
 * Brzycki (1993): 1RM ≈ w × 36 / (37 − r)
 *
 * Both are only reasonably accurate for low repetition counts, so FitTrack computes
 * an estimate only for 1 ≤ reps ≤ 10 and a positive load. A single (r = 1) returns the
 * load itself (both formulas then agree within rounding; Epley would add 3.3 %).
 */
export const MAX_REPS_FOR_ESTIMATE = 10;

export type OneRmFormula = 'epley' | 'brzycki';

export function estimateOneRepMax(weightKg: number | null | undefined, reps: number | null | undefined, formula: OneRmFormula = 'epley'): number | null {
  if (!weightKg || !reps || weightKg <= 0 || reps < 1 || !Number.isFinite(weightKg) || !Number.isInteger(reps)) return null;
  if (reps > MAX_REPS_FOR_ESTIMATE) return null;
  if (reps === 1) return weightKg;
  return formula === 'epley' ? weightKg * (1 + reps / 30) : (weightKg * 36) / (37 - reps);
}

/** Training volume of a set: load × reps (0 when either is missing). */
export function setVolume(weightKg: number | null | undefined, reps: number | null | undefined): number {
  return weightKg && reps && weightKg > 0 && reps > 0 ? weightKg * reps : 0;
}
