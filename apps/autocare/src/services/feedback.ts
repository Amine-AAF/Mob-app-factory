import * as Haptics from 'expo-haptics';

import { usePreferences } from '@/store/preferences';

/** Subtle haptics, disabled with the Settings toggle. Never throws. */
const on = () => usePreferences.getState().haptics;

export const feedback = {
  success: () => on() && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined),
  warning: () => on() && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined),
  tap: () => on() && Haptics.selectionAsync().catch(() => undefined),
};
