import { Button, Stack as UIStack, Text, ThemeProvider, useTheme } from '@factory/design-system';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import type { i18n as I18n } from 'i18next';
import { useCallback, useEffect, useState } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { AppState, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BRAND } from '@/config/brand';
import { recordError } from '@/services/analytics';
import { boot } from '@/services/boot';
import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Navigator() {
  const theme = useTheme();
  const { t } = useTranslation();
  // Day rollover & resume: recompute "today" when the app returns to the foreground.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') useSession.getState().setToday(clock.today());
    });
    return () => sub.remove();
  }, []);
  const modal = { presentation: 'modal' as const };
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
        <Stack.Screen name="workout/active" options={{ headerShown: false, gestureEnabled: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="workout/summary" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="exercise/pick" options={{ ...modal, title: t('picker.title') }} />
        <Stack.Screen name="exercise/new" options={{ ...modal, title: t('customExercise.title') }} />
        <Stack.Screen name="program/new" options={{ ...modal, title: t('builder.newTitle') }} />
        <Stack.Screen name="schedule" options={{ ...modal, title: t('planner.scheduleTitle') }} />
        <Stack.Screen name="body/add" options={{ ...modal, title: t('body.addTitle') }} />
        <Stack.Screen name="cardio/edit" options={{ ...modal, title: t('cardio.editTitle') }} />
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
        <Text variant="title">FitTrack could not start</Text>
        <Text tone="muted">Your workouts are safe on this device. Please try again. If this keeps happening, restart your phone.</Text>
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
      <ThemeProvider brand={BRAND} preference={theme}>
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
