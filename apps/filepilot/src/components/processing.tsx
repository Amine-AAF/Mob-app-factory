import { Button, Card, Icon, ProgressBar, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import type { OperationPhase } from '@/hooks/useOperation';
import { useIsPremium } from '@/store/session';

import { Notice } from './controls';

/**
 * Processing screen. Progress is shown only when it is real (completed steps reported
 * by the engine); otherwise an indeterminate indicator is used. No ads, no animations
 * competing with the work.
 */
export function ProcessingView({ title, done, total, onCancel, unit = 'step' }: { title: string; done: number; total: number; onCancel: () => void; unit?: 'step' | 'file' | 'page' }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const determinate = total > 1;
  const ratio = determinate ? Math.min(1, done / total) : 0;
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 20, backgroundColor: theme.colors.background }} testID="processing">
      <View style={{ alignSelf: 'center', width: 84, height: 84, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primarySoft }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
      <Text variant="title" center accessibilityRole="header">
        {title}
      </Text>
      {determinate ? (
        <Stack gap={2}>
          <ProgressBar progress={ratio} label={t('processing.progressLabel')} />
          <Text variant="bodySmall" tone="muted" center accessibilityLiveRegion="polite">
            {Number.isInteger(done) && unit !== 'step' ? t(`processing.${unit}Progress`, { done: Math.min(done, total), total }) : t('processing.percent', { percent: Math.round(ratio * 100) })}
          </Text>
        </Stack>
      ) : (
        <Text variant="bodySmall" tone="muted" center>
          {t('processing.working')}
        </Text>
      )}
      <Text variant="caption" tone="subtle" center>
        {t('processing.onDevice')}
      </Text>
      <Button label={t('common.cancel')} variant="secondary" icon="close" onPress={onCancel} testID="cancel-processing" />
    </View>
  );
}

/** Error / cancellation feedback after a run, with the right recovery action. */
export function OperationFeedback({ state, onRetry }: { state: OperationPhase; onRetry?: () => void }) {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  if (state.phase === 'cancelled') return <Notice tone="info">{t('processing.cancelled')}</Notice>;
  if (state.phase !== 'failed') return null;
  const quota = state.code === 'quota_exceeded';
  return (
    <Card tone="alt" testID="operation-error">
      <Notice tone={quota ? 'warning' : 'danger'} icon={quota ? 'time-outline' : undefined}>
        <Stack gap={1}>
          <Text variant="subheading">{quota ? t('quota.reachedTitle') : t('processing.failedTitle')}</Text>
          <Text variant="bodySmall">{t(`errors.${state.code}`)}</Text>
        </Stack>
      </Notice>
      {quota && !isPremium ? (
        <Button label={t('premium.unlock')} variant="accent" icon="diamond" onPress={() => router.push({ pathname: '/paywall', params: { source: 'quota' } })} />
      ) : onRetry && state.code !== 'unsupported_format' ? (
        <Button label={t('common.retry')} variant="secondary" icon="refresh" onPress={onRetry} />
      ) : null}
    </Card>
  );
}

export function ToolIntro({ icon, text }: { icon: IconName; text: string }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
      <Icon name={icon} size={18} color={theme.colors.textMuted} />
      <Text variant="bodySmall" tone="muted" style={{ flex: 1 }}>
        {text}
      </Text>
    </View>
  );
}
