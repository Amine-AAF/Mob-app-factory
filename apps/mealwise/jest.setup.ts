/* Global mocks for native modules that have no Node implementation. */
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(async () => undefined),
  notificationAsync: jest.fn(async () => undefined),
  selectionAsync: jest.fn(async () => undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success', Error: 'error' },
}));

jest.mock('expo-keep-awake', () => ({
  activateKeepAwakeAsync: jest.fn(async () => undefined),
  deactivateKeepAwake: jest.fn(async () => undefined),
  useKeepAwake: jest.fn(),
}));

jest.mock('expo-notifications', () => {
  const scheduled: { identifier: string; content: unknown; trigger: unknown }[] = [];
  return {
    __scheduled: scheduled,
    setNotificationHandler: jest.fn(),
    setNotificationChannelAsync: jest.fn(async () => null),
    getPermissionsAsync: jest.fn(async () => ({ status: 'granted', canAskAgain: true })),
    requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
    scheduleNotificationAsync: jest.fn(async (req: { identifier?: string; content: unknown; trigger: unknown }) => {
      const identifier = req.identifier ?? `n-${scheduled.length}`;
      scheduled.push({ identifier, content: req.content, trigger: req.trigger });
      return identifier;
    }),
    getAllScheduledNotificationsAsync: jest.fn(async () => scheduled.map((s) => ({ ...s }))),
    cancelScheduledNotificationAsync: jest.fn(async (id: string) => {
      const idx = scheduled.findIndex((s) => s.identifier === id);
      if (idx >= 0) scheduled.splice(idx, 1);
    }),
    AndroidImportance: { DEFAULT: 3, HIGH: 4 },
    SchedulableTriggerInputTypes: { DAILY: 'daily', WEEKLY: 'weekly', DATE: 'date', TIME_INTERVAL: 'timeInterval' },
  };
});
