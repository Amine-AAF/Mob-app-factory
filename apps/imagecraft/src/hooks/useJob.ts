import { useCallback, useEffect, useRef, useState } from 'react';

import { recordError } from '@/services/analytics';
import { processingEnv } from '@/services/env';
import { toErrorCode, type ProcessingErrorCode } from '@/services/files/errors';
import { cancelJob, createJob, discardJob, type JobHandle } from '@/services/image/engine';
import { useSession } from '@/store/session';

export type JobState<T> =
  | { status: 'idle' }
  | { status: 'running'; done: number; total: number }
  | { status: 'success'; value: T }
  | { status: 'error'; code: ProcessingErrorCode }
  | { status: 'cancelled' };

/**
 * Runs one processing job with progress and cancellation. While it runs,
 * `session.processing` is true, which blocks every ad placement. Leaving the screen
 * cancels the job and deletes its temporary files.
 */
export function useJob<T>(tool: string) {
  const [state, setState] = useState<JobState<T>>({ status: 'idle' });
  const jobRef = useRef<JobHandle | null>(null);

  useEffect(
    () => () => {
      const job = jobRef.current;
      if (job) {
        const env = processingEnv();
        cancelJob(env, job);
        void discardJob(env, job);
        useSession.getState().set({ processing: false });
      }
    },
    [],
  );

  const run = useCallback(
    async (task: (job: JobHandle, progress: (done: number, total: number) => void) => Promise<T>): Promise<T | null> => {
      if (jobRef.current) return null; // one job at a time per screen
      const job = createJob(tool);
      jobRef.current = job;
      useSession.getState().set({ processing: true });
      setState({ status: 'running', done: 0, total: 1 });
      try {
        const value = await task(job, (done, total) => {
          if (!job.cancelled) setState({ status: 'running', done, total });
        });
        if (job.cancelled) {
          setState({ status: 'cancelled' });
          return null;
        }
        setState({ status: 'success', value });
        return value;
      } catch (e) {
        const code = job.cancelled ? 'cancelled' : toErrorCode(e);
        if (code === 'cancelled') setState({ status: 'cancelled' });
        else {
          recordError(e, `job_${tool}`);
          setState({ status: 'error', code });
        }
        await discardJob(processingEnv(), job);
        return null;
      } finally {
        jobRef.current = null;
        useSession.getState().set({ processing: false });
      }
    },
    [tool],
  );

  const cancel = useCallback(() => {
    if (jobRef.current) cancelJob(processingEnv(), jobRef.current);
  }, []);

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, run, cancel, reset, running: state.status === 'running' };
}
