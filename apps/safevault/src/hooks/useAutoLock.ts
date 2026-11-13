import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { shouldLock, type AutoLockState } from '@/services/autolock';
import { clearClipboardIfExpired } from '@/services/clipboard';
import { useApp } from '@/store/app';
import { lockVault, useVault } from '@/store/vault';

const state: AutoLockState = { lastActivityAt: Date.now(), backgroundedAt: null };

/** Call from any touch handler: resets the inactivity timer. */
export function registerActivity(): void {
  state.lastActivityAt = Date.now();
}

/**
 * Locks the vault after the configured delay in background, or after inactivity in the
 * foreground. Re-evaluates on resume (timers don't fire while Android freezes the app).
 */
export function useAutoLock(): void {
  const status = useVault((s) => s.status);
  const timeout = useApp((s) => s.settings.autoLockSeconds);
  const timeoutRef = useRef(timeout);
  useEffect(() => {
    timeoutRef.current = timeout;
  }, [timeout]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const now = Date.now();
      if (next === 'active') {
        void clearClipboardIfExpired(now);
        if (useVault.getState().status === 'unlocked' && shouldLock(state, timeoutRef.current, now)) lockVault();
        state.backgroundedAt = null;
        state.lastActivityAt = now;
      } else if (next === 'background') {
        state.backgroundedAt = now;
        if (timeoutRef.current === 0 && useVault.getState().status === 'unlocked') lockVault();
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (status !== 'unlocked') return;
    state.lastActivityAt = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      void clearClipboardIfExpired(now);
      if (state.backgroundedAt === null && shouldLock(state, timeoutRef.current, now)) lockVault();
    }, 5_000);
    return () => clearInterval(timer);
  }, [status]);
}
