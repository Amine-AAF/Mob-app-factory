import { Button, Stack as UIStack, Text, ThemeProvider, useTheme } from '@factory/design-system';
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import type { i18n as I18n } from 'i18next';
import { useCallback, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { AppState, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { brand } from '@/config/brand';
import { repos } from '@/database';
import { recordError } from '@/services/analytics';
import { boot, runHousekeeping } from '@/services/boot';
import { routeFromNotification } from '@/services/reminders';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Navigator() {
  const theme = useTheme();
  return (
    <>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background }, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="paywall" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="maintenance/complete" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </>
  );
}

function BootError({ onRetry }: { onRetry: () => void }) {
  const theme = useTheme();
  // i18n may not be ready: this screen intentionally uses English only.
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.colors.background }}>
      <UIStack gap={4}>
        <Text variant="title">HomeCare couldn&apos;t start</Text>
        <Text tone="muted">Your data is safe on this device. Please try again. If this keeps happening, restart your phone.</Text>
        <Button label="Try again" onPress={onRetry} />
      </UIStack>
    </View>
  );
}

/** Opens the screen a tapped reminder points to (internal routes only). */
function useNotificationRouting(ready: boolean) {
  useEffect(() => {
    if (!ready) return;
    const open = (data: unknown) => {
      const route = routeFromNotification(data);
      if (route && usePreferences.getState().onboardingCompleted) router.push(route as never);
    };
    Notifications.getLastNotificationResponseAsync()
      .then((r) => r && open(r.notification.request.content.data))
      .catch(() => undefined);
    const sub = Notifications.addNotificationResponseReceivedListener((r) => open(r.notification.request.content.data));
    return () => sub.remove();
  }, [ready]);
}

/** Re-runs housekeeping (recurring bills, reminder re-planning) when the app returns to the foreground. */
function useForegroundRefresh(i18n: I18n | null) {
  useEffect(() => {
    if (!i18n) return;
    let last = Date.now();
    const sub = AppState.addEventListener('change', (s) => {
      if (s !== 'active' || Date.now() - last < 60_000) return;
      last = Date.now();
      runHousekeeping(repos(), i18n.t)
        .then(() => useSession.getState().bump())
        .catch((e) => recordError(e, 'foreground_housekeeping'));
    });
    return () => sub.remove();
  }, [i18n]);
}

export default function RootLayout() {
  const theme = usePreferences((s) => s.theme);
  const [i18n, setI18n] = useState<I18n | null>(null);
  const [failed, setFailed] = useState(false);

  const start = useCallback(() => {
    boot()
      .then(({ i18n: instance }) => setI18n(instance))
      .catch((e) => {
        recordError(e, 'boot');
        setFailed(true);
      })
      .finally(() => SplashScreen.hideAsync().catch(() => undefined));
  }, []);

  useEffect(start, [start]);
  useNotificationRouting(!!i18n);
  useForegroundRefresh(i18n);

  return (
    <SafeAreaProvider>
      <ThemeProvider brand={brand} preference={theme}>
        {failed ? (
          <BootError
            onRetry={() => {
              setFailed(false);
              start();
            }}
          />
        ) : i18n ? (
          <I18nextProvider i18n={i18n}>
            <Navigator />
          </I18nextProvider>
        ) : null}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
