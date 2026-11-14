import { renderToTemp, type JobHandle, type ProcessingEnv } from '@/services/image/engine';
import { ProcessingError } from '@/services/files/errors';
import type { RenderRecipe, RenderResult, SourceImage } from '@/types/image';

/**
 * "Target size" compression (Premium): binary search on quality for the best result that
 * fits under the target. At most MAX_ATTEMPTS encodes; temp files of discarded attempts
 * are deleted immediately so at most two candidates exist on disk.
 */
export const MAX_ATTEMPTS = 7;
const MIN_QUALITY = 5;

export interface TargetResult {
  result: RenderResult;
  quality: number;
  attempts: number;
  reached: boolean;
}

interface Candidate {
  result: RenderResult;
  quality: number;
}

export async function compressToTarget(
  env: ProcessingEnv,
  job: JobHandle,
  recipe: RenderRecipe,
  source: SourceImage,
  targetBytes: number,
  onProgress?: (n: number, total: number) => void,
): Promise<TargetResult> {
  if (recipe.encode.format === 'png') throw new ProcessingError('unknown', 'png has no quality setting');
  // Assigned inside `attempt`: the casts stop TypeScript narrowing them to `null`.
  let best = null as Candidate | null; // highest quality that fits
  let smallest = null as Candidate | null; // fallback when nothing fits
  let attempts = 0;

  const attempt = async (quality: number): Promise<Candidate> => {
    attempts++;
    const result = await renderToTemp(env, job, { ...recipe, encode: { ...recipe.encode, quality } }, source);
    onProgress?.(attempts, MAX_ATTEMPTS);
    const c = { result, quality };
    const previous = [best, smallest];
    if (result.bytes <= targetBytes && (!best || quality > best.quality)) best = c;
    if (!smallest || result.bytes < smallest.result.bytes) smallest = c;
    for (const p of [...previous, c]) {
      if (p && p !== best && p !== smallest) await env.fs.delete(p.result.uri).catch(() => undefined);
    }
    return c;
  };

  let hi = Math.round(Math.min(100, Math.max(MIN_QUALITY, recipe.encode.quality)));
  let lo = MIN_QUALITY;
  const first = await attempt(hi);
  if (first.result.bytes <= targetBytes) return { result: first.result, quality: hi, attempts, reached: true };
  while (attempts < MAX_ATTEMPTS && hi - lo > 1) {
    const q = Math.round((lo + hi) / 2);
    const c = await attempt(q);
    if (c.result.bytes <= targetBytes) lo = q;
    else hi = q;
  }
  const chosen: Candidate | null = best ?? smallest;
  if (!chosen) throw new ProcessingError('write_failed');
  const other: Candidate | null = chosen === best ? smallest : best;
  if (other && other !== chosen) await env.fs.delete(other.result.uri).catch(() => undefined);
  return { result: chosen.result, quality: chosen.quality, attempts, reached: best !== null };
}
