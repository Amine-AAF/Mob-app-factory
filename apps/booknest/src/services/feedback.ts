import * as Haptics from 'expo-haptics';

import { usePreferences } from '@/store/preferences';

/** Subtle haptics, respecting the user's preference. Never throws. */
const enabled = () => usePreferences.getState().haptics;

export const feedback = {
  tap: () => enabled() && Haptics.selectionAsync().catch(() => undefined),
  success: () => enabled() && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined),
  warning: () => enabled() && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined),
  error: () => enabled() && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined),
};
