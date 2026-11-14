import { Button, Stack as UIStack, Text, ThemeProvider, useTheme } from '@factory/design-system';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import type { i18n as I18n } from 'i18next';
import { useCallback, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { brand } from '@/config/brand';
import { recordError } from '@/services/analytics';
import { boot } from '@/services/boot';
import { usePreferences } from '@/store/preferences';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Navigator() {
  const theme = useTheme();
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
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="questions" options={{ title: '' }} />
        <Stack.Screen name="question/[id]" options={{ title: '' }} />
        <Stack.Screen name="quiz" options={{ title: '', gestureEnabled: false }} />
        <Stack.Screen name="mock/index" options={{ title: '' }} />
        <Stack.Screen name="mock/[id]" options={{ title: '', gestureEnabled: false }} />
        <Stack.Screen name="builder/index" options={{ title: '' }} />
        <Stack.Screen name="builder/edit" options={{ title: '' }} />
        <Stack.Screen name="flashcards" options={{ title: '' }} />
        <Stack.Screen name="path" options={{ title: '' }} />
        <Stack.Screen name="data" options={{ title: '' }} />
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
        <Text variant="title">InterviewReady couldn&apos;t start</Text>
        <Text tone="muted">Your data is safe. Please try again. If this keeps happening, restart your phone or reinstall the app.</Text>
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

  const retry = () => {
    setFailed(false);
    start();
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider brand={brand} preference={theme}>
        {failed ? (
          <BootError onRetry={retry} />
        ) : i18n ? (
          <I18nextProvider i18n={i18n}>
            <Navigator />
          </I18nextProvider>
        ) : null}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
