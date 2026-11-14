import { Button, Stack as UIStack, Text, ThemeProvider } from '@factory/design-system';
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import type { i18n as I18n } from 'i18next';
import { useCallback, useEffect, useState } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useBookTheme } from '@/components/theme';
import { FREE_PALETTE, PALETTES } from '@/config/brand';
import { recordError } from '@/services/analytics';
import { boot } from '@/services/boot';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Navigator() {
  const theme = useBookTheme();
  const { t } = useTranslation();

  // Tapping a reminder opens the screen it refers to.
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
      const url = resp.notification.request.content.data?.url;
      if (typeof url === 'string' && url.startsWith('/')) router.push(url as never);
    });
    return () => sub.remove();
  }, []);

  const modal = { presentation: 'modal' as const, animation: 'slide_from_bottom' as const };
  return (
    <>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: '700', fontFamily: theme.serif },
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'slide_from_right',
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="book/[id]" options={{ title: '' }} />
        <Stack.Screen name="book/edit" options={{ title: t('book.editTitle'), ...modal }} />
        <Stack.Screen name="book/review" options={{ title: t('review.title'), ...modal }} />
        <Stack.Screen name="book/collections" options={{ title: t('collections.chooseTitle'), ...modal }} />
        <Stack.Screen name="session/timer" options={{ title: t('session.timerTitle'), ...modal }} />
        <Stack.Screen name="session/manual" options={{ title: t('session.manualTitle'), ...modal }} />
        <Stack.Screen name="sessions" options={{ title: t('session.historyTitle') }} />
        <Stack.Screen name="quotes/index" options={{ title: t('quotes.title') }} />
        <Stack.Screen name="quotes/edit" options={{ title: t('quotes.editTitle'), ...modal }} />
        <Stack.Screen name="journal/index" options={{ title: t('journal.title') }} />
        <Stack.Screen name="journal/edit" options={{ title: t('journal.editTitle'), ...modal }} />
        <Stack.Screen name="collections/index" options={{ title: t('collections.title') }} />
        <Stack.Screen name="collections/[id]" options={{ title: '' }} />
        <Stack.Screen name="wishlist/index" options={{ title: t('wishlist.title') }} />
        <Stack.Screen name="wishlist/edit" options={{ title: t('wishlist.editTitle'), ...modal }} />
        <Stack.Screen name="goals/edit" options={{ title: t('goals.editTitle'), ...modal }} />
        <Stack.Screen name="stats" options={{ title: t('stats.title') }} />
        <Stack.Screen name="calendar" options={{ title: t('calendar.title') }} />
        <Stack.Screen name="ranking" options={{ title: t('review.rankingTitle') }} />
        <Stack.Screen name="settings/notifications" options={{ title: t('settings.notifications') }} />
        <Stack.Screen name="settings/data" options={{ title: t('settings.data') }} />
        <Stack.Screen name="settings/privacy" options={{ title: t('settings.privacy') }} />
        <Stack.Screen name="settings/import" options={{ title: t('transfer.importTitle'), ...modal }} />
        <Stack.Screen name="paywall" options={{ headerShown: false, ...modal }} />
      </Stack>
    </>
  );
}

function BootError({ onRetry }: { onRetry: () => void }) {
  const theme = useBookTheme();
  // i18n may not be ready: this screen intentionally uses English only.
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.colors.background }}>
      <UIStack gap={4}>
        <Text variant="title">BookNest couldn&apos;t start</Text>
        <Text tone="muted">Your library is safe on this device. Please try again. If this keeps happening, restart your phone.</Text>
        <Button label="Try again" onPress={onRetry} />
      </UIStack>
    </View>
  );
}

export default function RootLayout() {
  const themePref = usePreferences((s) => s.theme);
  const paletteId = usePreferences((s) => s.palette);
  const premium = useIsPremium();
  // Extra palettes are Premium: a lapsed subscription falls back to the default palette.
  const brand = PALETTES[premium ? paletteId : FREE_PALETTE] ?? PALETTES[FREE_PALETTE];
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
      <ThemeProvider brand={brand} preference={themePref}>
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
