import { FREE_LIMITS } from '@/config/limits';
import { repos } from '@/database';
import type { OperationType } from '@/database/repositories/operationsRepository';
import { useSession } from '@/store/session';

import { recordError, track } from '../analytics';
import { clock } from '../clock';
import { processingEnv } from '../env';
import { quotaStatus } from '../quota';
import { createCancelToken, createOperationId, runOperation, type CancelToken, type OperationOutcome, type RunSpec } from './runner';

/**
 * App-level entry point for every tool: quota gate -> runner -> usage + analytics.
 * Only successful operations consume the daily free quota.
 */
export async function refreshUsage(): Promise<void> {
  const usage = await repos().usage.get(clock.today());
  useSession.getState().set({ usage });
}

export function currentQuota() {
  const s = useSession.getState();
  return quotaStatus(s.entitlement.isPremium, s.usage.day === clock.today() ? s.usage : { day: clock.today(), operations: 0, bonus: 0, rewardedCount: 0 });
}

export interface PerformHandle {
  token: CancelToken;
  promise: Promise<OperationOutcome>;
}

export function performOperation(spec: Omit<RunSpec, 'onProgress'>, onProgress?: (done: number, total: number) => void): PerformHandle {
  const token = createCancelToken();
  const promise = (async (): Promise<OperationOutcome> => {
    const r = repos();
    await refreshUsage();
    if (currentQuota().remaining <= 0) return { status: 'failed', id: '', type: spec.type, code: 'quota_exceeded' };
    const { workspace } = processingEnv();
    const outcome = await runOperation(
      { workspace, operations: r.operations, now: clock.now, newId: () => createOperationId() },
      { ...spec, ...(onProgress ? { onProgress } : {}) },
      token,
    );
    if (outcome.status === 'completed') {
      await r.usage.increment(clock.today());
      const since = await r.settings.get('operationsSinceInterstitial');
      await r.settings.set('operationsSinceInterstitial', since + 1);
      await refreshUsage();
    } else if (outcome.status === 'failed') {
      track('operation_failed', { tool: spec.type, code: outcome.code });
      if (outcome.code === 'unknown') recordError(new Error('operation_failed'), spec.type);
    }
    useSession.getState().bump();
    return outcome;
  })().catch((e): OperationOutcome => {
    recordError(e, 'perform_operation');
    return { status: 'failed', id: '', type: spec.type, code: 'unknown' };
  });
  return { token, promise };
}

/** Grants bonus operations after the rewarded ad's EARNED_REWARD event (never before). */
export async function grantRewardedBonus(): Promise<void> {
  await repos().usage.addBonus(clock.today(), FREE_LIMITS.rewardedBonus);
  await refreshUsage();
}

export const OPERATION_TOOL: Record<OperationType, string> = {
  image_compress: 'compress',
  image_resize: 'resize',
  image_convert: 'convert',
  pdf_merge: 'pdf_merge',
  pdf_split: 'pdf_split',
  pdf_extract: 'pdf_extract',
  image_to_pdf: 'image_to_pdf',
  pdf_to_images: 'pdf_to_images',
};
