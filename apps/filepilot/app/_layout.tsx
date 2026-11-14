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
import { useThemePreference } from '@/store/session';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

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
        <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="tools/compress" options={{ title: t('tools.compress.title') }} />
        <Stack.Screen name="tools/resize" options={{ title: t('tools.resize.title') }} />
        <Stack.Screen name="tools/convert" options={{ title: t('tools.convert.title') }} />
        <Stack.Screen name="tools/pdf" options={{ title: t('tools.pdfTools.title') }} />
        <Stack.Screen name="tools/pdf-merge" options={{ title: t('pdf.merge.title') }} />
        <Stack.Screen name="tools/pdf-split" options={{ title: t('pdf.split.title') }} />
        <Stack.Screen name="tools/image-to-pdf" options={{ title: t('tools.imageToPdf.title') }} />
        <Stack.Screen name="tools/pdf-to-images" options={{ title: t('tools.pdfToImages.title') }} />
        <Stack.Screen name="result/[id]" options={{ title: t('result.title'), animation: 'fade_from_bottom' }} />
        <Stack.Screen name="settings/privacy" options={{ title: t('privacy.title') }} />
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
        <Text variant="title">FilePilot couldn&apos;t start</Text>
        <Text tone="muted">Your files are safe. Please try again. If this keeps happening, restart your phone or reinstall the app.</Text>
        <Button label="Try again" onPress={onRetry} />
      </UIStack>
    </View>
  );
}

export default function RootLayout() {
  const theme = useThemePreference();
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
