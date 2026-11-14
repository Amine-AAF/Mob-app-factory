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
import { boot } from '@/services/boot';
import { syncNotifications } from '@/services/notifications';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Navigator({ i18n }: { i18n: I18n }) {
  const theme = useTheme();

  useEffect(() => {
    // Notification taps open the related screen (routes are built by the planner, never from user text).
    const sub = Notifications.addNotificationResponseReceivedListener((r) => {
      const url = r.notification.request.content.data?.url;
      if (typeof url === 'string' && url.startsWith('/')) router.push(url as never);
    });
    // Returning to the foreground re-plans reminders (new day, time-zone change, expired items).
    const app = AppState.addEventListener('change', (s) => {
      if (s === 'active' && useSession.getState().dbReady && usePreferences.getState().onboardingCompleted) {
        syncNotifications(repos(), i18n.t).catch((e) => recordError(e, 'foreground_sync'));
        useSession.getState().bump();
      }
    });
    return () => {
      sub.remove();
      app.remove();
    };
  }, [i18n]);

  return (
    <>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="paywall" options={{ presentation: 'modal', headerShown: false, animation: 'slide_from_bottom' }} />
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
        <Text variant="title">PetCare couldn&apos;t start</Text>
        <Text tone="muted">Your data is safe on this device. Please try again. If this keeps happening, restart your phone.</Text>
        <Button label="Try again" onPress={onRetry} />
      </UIStack>
    </View>
  );
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
            <Navigator i18n={i18n} />
          </I18nextProvider>
        ) : null}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
