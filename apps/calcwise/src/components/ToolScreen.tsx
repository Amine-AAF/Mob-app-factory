import { IconButton, Screen, Text, useTheme } from '@factory/design-system';
import { router, Stack } from 'expo-router';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform } from 'react-native';

import { LIMITS, type ToolId } from '@/constants/tools';
import { repos } from '@/database';
import { useAsync } from '@/hooks/useAsync';
import { recordError } from '@/services/analytics';
import { isPremiumNow, useSession } from '@/store/session';

/**
 * Layout shared by every tool: native header with the tool name and a favorite toggle,
 * keyboard-aware scrolling. Tool screens never contain ads.
 */
export function ToolScreen({ tool, children }: { tool: ToolId; children: ReactNode }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data: favorites, reload } = useAsync(() => repos().favorites.list(), []);
  const isFavorite = favorites?.includes(tool) ?? false;

  const toggle = async () => {
    try {
      const outcome = await repos().favorites.toggle(tool, { max: isPremiumNow() ? null : LIMITS.freeFavorites });
      if (outcome === 'limit') {
        Alert.alert(t('favorites.limitTitle'), t('favorites.limitReached', { count: LIMITS.freeFavorites }), [
          { text: t('common.notNow'), style: 'cancel' },
          { text: t('premium.unlockCta'), onPress: () => router.push({ pathname: '/paywall', params: { source: 'favorites_limit' } }) },
        ]);
      }
      reload();
      useSession.getState().bump();
    } catch (e) {
      recordError(e, 'favorite_toggle');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen
        options={{
          title: t(`tools.${tool}.name`),
          headerRight: () => (
            <IconButton
              icon={isFavorite ? 'star' : 'star-outline'}
              tone={isFavorite ? 'accent' : 'default'}
              label={isFavorite ? t('favorites.remove') : t('favorites.add')}
              onPress={toggle}
            />
          ),
        }}
      />
      <Screen edges={[]} testID={`tool-${tool}`}>
        <Text tone="muted" variant="bodySmall">
          {t(`tools.${tool}.description`)}
        </Text>
        {children}
      </Screen>
    </KeyboardAvoidingView>
  );
}
