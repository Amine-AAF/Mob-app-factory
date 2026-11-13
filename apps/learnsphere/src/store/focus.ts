import AsyncStorage from '@react-native-async-storage/async-storage';
import { createKeyValueStore } from '@factory/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { FOCUS_PRESETS, pauseRun, resumeRun, skipPhase, startRun, type FocusConfig, type FocusRun } from '@/features/focus/pomodoro';

/**
 * The running focus timer is persisted, so it survives backgrounding and even the app being
 * killed: on return, the screen recomputes everything from the stored timestamps.
 */
interface FocusState {
  run: FocusRun | null;
  lastConfig: FocusConfig;
  linkedSessionId: string | null;
  start: (config: FocusConfig, subjectId: string | null, now: number, linkedSessionId?: string | null) => void;
  pause: (now: number) => void;
  resume: (now: number) => void;
  skip: (now: number) => void;
  clear: () => void;
}

const kv = createKeyValueStore(AsyncStorage, 'learnsphere');

export const useFocus = create<FocusState>()(
  persist(
    (set, get) => ({
      run: null,
      lastConfig: FOCUS_PRESETS['25_5'],
      linkedSessionId: null,
      start: (config, subjectId, now, linkedSessionId = null) => set({ run: startRun(config, subjectId, now), lastConfig: config, linkedSessionId }),
      pause: (now) => {
        const run = get().run;
        if (run) set({ run: pauseRun(run, now) });
      },
      resume: (now) => {
        const run = get().run;
        if (run) set({ run: resumeRun(run, now) });
      },
      skip: (now) => {
        const run = get().run;
        if (run) set({ run: skipPhase(run, now) });
      },
      clear: () => set({ run: null, linkedSessionId: null }),
    }),
    {
      name: 'focus',
      version: 1,
      storage: createJSONStorage(() => kv.raw),
      partialize: ({ run, lastConfig, linkedSessionId }) => ({ run, lastConfig, linkedSessionId }),
    },
  ),
);
