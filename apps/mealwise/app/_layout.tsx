import { Button, Stack as UIStack, Text, ThemeProvider, useTheme } from '@factory/design-system';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import type { i18n as I18n } from 'i18next';
import { useCallback, useEffect, useState } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { brand } from '@/config/brand';
import { recordError } from '@/services/analytics';
import { boot } from '@/services/boot';
import { usePreferences } from '@/store/preferences';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Navigator() {
  const theme = useTheme();
  const { t } = useTranslation();
  const modal = { presentation: 'modal' as const, animation: 'slide_from_bottom' as const };
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
        <Stack.Screen name="recipe/[id]" options={{ title: '' }} />
        <Stack.Screen name="recipe/edit" options={{ title: t('editor.title') }} />
        <Stack.Screen name="recipe/import" options={{ title: t('import.title') }} />
        <Stack.Screen name="cook/[id]" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="plan/add" options={{ title: t('planner.addMeal'), ...modal }} />
        <Stack.Screen name="plan/entry" options={{ title: t('planner.mealDetails'), ...modal }} />
        <Stack.Screen name="grocery/item" options={{ title: t('grocery.item'), ...modal }} />
        <Stack.Screen name="grocery/history" options={{ title: t('grocery.history') }} />
        <Stack.Screen name="grocery/generate" options={{ title: t('grocery.generateTitle'), ...modal }} />
        <Stack.Screen name="pantry/index" options={{ title: t('pantry.title') }} />
        <Stack.Screen name="pantry/edit" options={{ title: t('pantry.item'), ...modal }} />
        <Stack.Screen name="pantry/cook" options={{ title: t('pantry.whatCanICook') }} />
        <Stack.Screen name="nutrition" options={{ title: t('nutrition.title') }} />
        <Stack.Screen name="budget" options={{ title: t('budget.title') }} />
        <Stack.Screen name="templates" options={{ title: t('templates.title') }} />
        <Stack.Screen name="history" options={{ title: t('history.title') }} />
        <Stack.Screen name="settings/region" options={{ title: t('settings.region') }} />
        <Stack.Screen name="settings/notifications" options={{ title: t('settings.notifications') }} />
        <Stack.Screen name="settings/data" options={{ title: t('settings.data') }} />
        <Stack.Screen name="settings/privacy" options={{ title: t('settings.privacy') }} />
        <Stack.Screen name="paywall" options={{ headerShown: false, ...modal }} />
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
        <Text variant="title">MealWise couldn&apos;t start</Text>
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
            <Navigator />
          </I18nextProvider>
        ) : null}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
