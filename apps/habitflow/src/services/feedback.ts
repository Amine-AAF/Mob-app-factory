import * as Haptics from 'expo-haptics';

import { usePreferences } from '@/store/preferences';

/** Haptic feedback, respecting the player's setting. Failures (unsupported devices) are ignored. */
const enabled = () => usePreferences.getState().haptics;

export const feedback = {
  tap: () => enabled() && void Haptics.selectionAsync().catch(() => undefined),
  success: () => enabled() && void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined),
  error: () => enabled() && void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined),
  warning: () => enabled() && void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined),
};
