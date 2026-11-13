import { Button, Card, Icon, Row, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LIMITS } from '@/constants/tools';
import { useRewardedAd } from '@/hooks/useRewardedAd';
import { rewardedAvailable } from '@/services/ads';
import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

/**
 * Shown in place of an advanced section for free users. Two honest options:
 * open the Premium screen, or (when an ad can be served) watch a rewarded ad
 * to unlock advanced tools for one hour. Nothing is unlocked without the reward event.
 */
export function PremiumGate({ title, description, source }: { title: string; description: string; source: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const canReward = rewardedAvailable(isPremium);
  const rewarded = useRewardedAd(canReward);
  const [waiting, setWaiting] = useState(false);

  const watch = async () => {
    setWaiting(true);
    const shown = await rewarded.show(() => usePreferences.getState().set({ rewardedUnlockUntil: clock.now().getTime() + LIMITS.rewardedUnlockMs }));
    if (!shown) setWaiting(false);
  };

  return (
    <Card tone="alt" testID={`premium-gate-${source}`}>
      <Row gap={3} style={{ alignItems: 'flex-start' }}>
        <Icon name="lock-closed" size={20} color={theme.colors.accent} />
        <Stack gap={1} style={{ flex: 1 }}>
          <Text variant="subheading">{title}</Text>
          <Text variant="bodySmall" tone="muted">
            {description}
          </Text>
        </Stack>
      </Row>
      <Button label={t('premium.unlockCta')} icon="diamond-outline" size="md" onPress={() => router.push({ pathname: '/paywall', params: { source } })} testID="gate-paywall" />
      {canReward ? (
        <Button label={rewarded.ready ? t('premium.watchAd') : t('premium.adLoading')} variant="secondary" size="md" icon="play-circle-outline" disabled={!rewarded.ready || waiting} onPress={watch} />
      ) : null}
    </Card>
  );
}

/** Small banner shown while a rewarded unlock is active. */
export function TemporaryUnlockNote({ until }: { until: number }) {
  const { t, i18n } = useTranslation();
  const time = new Intl.DateTimeFormat(i18n.language, { timeStyle: 'short' }).format(new Date(until));
  return <Text variant="caption" tone="success">{t('premium.unlockedUntil', { time })}</Text>;
}
