import { Button, Stack as UIStack, Text, ThemeProvider, useTheme } from '@factory/design-system';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import type { i18n as I18n } from 'i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Toast } from '@/components/ui';
import { brand } from '@/config/brand';
import { ACHIEVEMENTS } from '@/content/achievements';
import { recordError } from '@/services/analytics';
import { boot } from '@/services/boot';
import { usePreferences } from '@/store/preferences';
import { useIsPremium, useSession } from '@/store/session';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Celebrations() {
  const { t } = useTranslation();
  const next = useSession((s) => s.celebrate[0]);
  const shift = useSession((s) => s.shiftCelebration);
  const hide = useCallback(() => shift(), [shift]);
  const def = ACHIEVEMENTS.find((a) => a.id === next);
  if (!def) return null;
  return <Toast key={def.id} title={t('achievements.unlocked')} message={t(`achievements.items.${def.id}.title`)} icon={def.icon as never} onHide={hide} />;
}

function Navigator() {
  const theme = useTheme();
  const { t } = useTranslation();
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
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="focus" options={{ title: t('focus.title') }} />
        <Stack.Screen name="flashcards/review" options={{ title: t('flashcards.review'), animation: 'slide_from_bottom' }} />
        <Stack.Screen name="quiz/run" options={{ title: t('quiz.title'), gestureEnabled: false }} />
        <Stack.Screen name="paywall" options={{ presentation: 'modal', headerShown: false, animation: 'slide_from_bottom' }} />
      </Stack>
      <Celebrations />
    </>
  );
}

function BootError({ onRetry }: { onRetry: () => void }) {
  const theme = useTheme();
  // i18n may not be ready: this screen intentionally uses English only.
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.colors.background }}>
      <UIStack gap={4}>
        <Text variant="title">LearnSphere couldn&apos;t start</Text>
        <Text tone="muted">Your notes and progress are safe on this device. Please try again. If this keeps happening, restart your phone.</Text>
        <Button label="Try again" onPress={onRetry} />
      </UIStack>
    </View>
  );
}

export default function RootLayout() {
  const theme = usePreferences((s) => s.theme);
  const accent = usePreferences((s) => s.accentColor);
  const isPremium = useIsPremium();
  const [i18n, setI18n] = useState<I18n | null>(null);
  const [failed, setFailed] = useState(false);
  // Premium personalisation: the learner's own accent color replaces the brand primary.
  const palette = useMemo(() => (isPremium && accent ? { ...brand, primary: accent } : brand), [isPremium, accent]);

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
      <ThemeProvider brand={palette} preference={theme}>
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
