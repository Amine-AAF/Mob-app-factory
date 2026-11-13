import { Button, Stack as UIStack, Text, ThemeProvider, useTheme } from '@factory/design-system';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import type { i18n as I18n } from 'i18next';
import { useCallback, useEffect, useState } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { brandWithAccent } from '@/config/brand';
import { registerActivity, useAutoLock } from '@/hooks/useAutoLock';
import { ToastHost } from '@/hooks/useToast';
import { boot } from '@/services/boot';
import { logEvent } from '@/services/log';
import { useApp } from '@/store/app';
import { useVault } from '@/store/vault';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

/** Routes reachable without an unlocked vault. Everything else is protected. */
const PUBLIC_ROUTES = new Set(['index', 'welcome', 'create', 'unlock', 'restore']);

function LockGuard() {
  const status = useVault((s) => s.status);
  const segments = useSegments();
  const router = useRouter();
  useAutoLock();
  useEffect(() => {
    const first = segments[0] ?? 'index';
    if (PUBLIC_ROUTES.has(first) || status === 'loading' || status === 'unlocked') return;
    // Unmount every protected screen (drops any decrypted value held in component state).
    if (router.canDismiss()) router.dismissAll();
    router.replace(status === 'locked' ? '/unlock' : '/welcome');
  }, [status, segments, router]);
  return null;
}

function Navigator() {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1 }} onStartShouldSetResponderCapture={() => (registerActivity(), false)}>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <LockGuard />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: theme.colors.background },
          // Discreet transitions only.
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="create" options={{ title: t('create.title') }} />
        <Stack.Screen name="restore" options={{ title: t('restore.title') }} />
        <Stack.Screen name="unlock" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="items" options={{ title: '' }} />
        <Stack.Screen name="item/[id]" options={{ title: '' }} />
        <Stack.Screen name="edit" options={{ title: '', presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="category-edit" options={{ title: '', presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="settings/security" options={{ title: t('settings.security.title') }} />
        <Stack.Screen name="settings/change-password" options={{ title: t('changePassword.title') }} />
        <Stack.Screen name="settings/backup" options={{ title: t('backup.title') }} />
        <Stack.Screen name="settings/appearance" options={{ title: t('settings.appearance.title') }} />
        <Stack.Screen name="settings/about" options={{ title: t('about.title') }} />
        <Stack.Screen name="paywall" options={{ presentation: 'modal', headerShown: false, animation: 'slide_from_bottom' }} />
      </Stack>
      <ToastHost />
    </View>
  );
}

function BootError({ onRetry }: { onRetry: () => void }) {
  const theme = useTheme();
  // i18n may not be ready: English only, and never any technical detail.
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.colors.background }}>
      <UIStack gap={4}>
        <Text variant="title">SafeVault couldn&apos;t start</Text>
        <Text tone="muted">Your vault has not been modified. Please try again. If this keeps happening, restart your phone.</Text>
        <Button label="Try again" onPress={onRetry} />
      </UIStack>
    </View>
  );
}

export default function RootLayout() {
  const settings = useApp((s) => s.settings);
  const isPremium = useApp((s) => s.entitlement.isPremium);
  const [i18n, setI18n] = useState<I18n | null>(null);
  const [failed, setFailed] = useState(false);

  const start = useCallback(() => {
    boot()
      .then(({ i18n: instance }) => setI18n(instance))
      .catch((e) => {
        logEvent('boot_failed', e);
        setFailed(true);
      })
      .finally(() => SplashScreen.hideAsync().catch(() => undefined));
  }, []);

  useEffect(start, [start]);

  useEffect(() => {
    if (i18n && settings.language && i18n.language !== settings.language) void i18n.changeLanguage(settings.language);
  }, [i18n, settings.language]);

  return (
    <SafeAreaProvider>
      <ThemeProvider brand={brandWithAccent(isPremium ? settings.accent : null)} preference={settings.theme}>
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
