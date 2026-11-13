/* Global mocks for native modules that have no Node implementation. */
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

jest.mock('expo-notifications', () => {
  const scheduled: { identifier: string; content: unknown; trigger: unknown }[] = [];
  return {
    __scheduled: scheduled,
    setNotificationHandler: jest.fn(),
    setNotificationChannelAsync: jest.fn(async () => null),
    getPermissionsAsync: jest.fn(async () => ({ status: 'granted', canAskAgain: true })),
    requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
    getAllScheduledNotificationsAsync: jest.fn(async () => [...scheduled]),
    scheduleNotificationAsync: jest.fn(async (req: { identifier?: string; content: unknown; trigger: unknown }) => {
      const identifier = req.identifier ?? `n-${scheduled.length}`;
      scheduled.push({ identifier, content: req.content, trigger: req.trigger });
      return identifier;
    }),
    cancelScheduledNotificationAsync: jest.fn(async (id: string) => {
      const i = scheduled.findIndex((n) => n.identifier === id);
      if (i >= 0) scheduled.splice(i, 1);
    }),
    AndroidImportance: { DEFAULT: 3 },
    SchedulableTriggerInputTypes: { DATE: 'date', DAILY: 'daily', TIME_INTERVAL: 'timeInterval' },
  };
});

jest.mock('expo-file-system', () => ({
  Paths: { document: { uri: 'file:///doc/' }, cache: { uri: 'file:///cache/' } },
  File: class {
    uri: string;
    constructor(...parts: (string | { uri: string })[]) {
      this.uri = parts.map((p) => (typeof p === 'string' ? p : p.uri)).join('/');
    }
    get exists() {
      return false;
    }
    copy() {}
    delete() {}
    write() {}
    text() {
      return Promise.resolve('');
    }
  },
  Directory: class {
    uri: string;
    constructor(...parts: (string | { uri: string })[]) {
      this.uri = parts.map((p) => (typeof p === 'string' ? p : p.uri)).join('/');
    }
    get exists() {
      return true;
    }
    create() {}
    delete() {}
  },
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true, assets: null })),
  launchCameraAsync: jest.fn(async () => ({ canceled: true, assets: null })),
  requestCameraPermissionsAsync: jest.fn(async () => ({ status: 'denied', canAskAgain: false })),
}));

/*
 * RN 0.88's TextInput never settles under jest-expo here (a test rendering a bare <TextInput/>
 * times out). Replace it with a plain host component: props such as value, onChangeText,
 * accessibilityLabel and testID are kept, so fireEvent.changeText keeps working.
 */
jest.mock('react-native/Libraries/Components/TextInput/TextInput', () => {
  const React = require('react');
  const MockTextInput = React.forwardRef((props: Record<string, unknown>, ref: unknown) => React.createElement('TextInput', { ...props, ref }));
  MockTextInput.displayName = 'TextInput';
  return { __esModule: true, default: MockTextInput };
});
