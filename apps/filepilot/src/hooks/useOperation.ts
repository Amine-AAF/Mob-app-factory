import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { ProcessingErrorCode } from '@/services/files/errors';
import { performOperation } from '@/services/operations/perform';
import type { CancelToken, OperationOutcome, RunSpec } from '@/services/operations/runner';
import { useResults, type ResultExtras } from '@/store/results';

/**
 * Tool screen state machine: idle -> running (real progress) -> result screen,
 * or back to idle with an error / after cancellation.
 */
export type OperationPhase = { phase: 'idle' } | { phase: 'running'; done: number; total: number } | { phase: 'failed'; code: ProcessingErrorCode } | { phase: 'cancelled' };

export function useOperation() {
  const [state, setState] = useState<OperationPhase>({ phase: 'idle' });
  const token = useRef<CancelToken | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      // Leaving the screen cancels the running job (temp files are cleaned by the runner).
      token.current?.cancel();
    };
  }, []);

  const run = useCallback(async (spec: Omit<RunSpec, 'onProgress'>, extras?: ResultExtras, onCompleted?: (o: Extract<OperationOutcome, { status: 'completed' }>) => void) => {
    setState({ phase: 'running', done: 0, total: 0 });
    const handle = performOperation(spec, (done, total) => {
      if (mounted.current) setState({ phase: 'running', done, total });
    });
    token.current = handle.token;
    const outcome = await handle.promise;
    token.current = null;
    if (!mounted.current) return outcome;
    if (outcome.status === 'completed') {
      onCompleted?.(outcome);
      useResults.getState().put(outcome, extras);
      setState({ phase: 'idle' });
      router.push({ pathname: '/result/[id]', params: { id: outcome.id } });
    } else if (outcome.status === 'cancelled') setState({ phase: 'cancelled' });
    else setState({ phase: 'failed', code: outcome.code });
    return outcome;
  }, []);

  const cancel = useCallback(() => token.current?.cancel(), []);
  const reset = useCallback(() => setState({ phase: 'idle' }), []);

  return { state, run, cancel, reset, running: state.phase === 'running' };
}
