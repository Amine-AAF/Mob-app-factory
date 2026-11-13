import { Button, Card, Icon, ProgressBar, Row, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { FREE_LIMITS } from '@/config/limits';
import { useRewardedAd } from '@/hooks/useRewardedAd';
import { adsSdk, adUnits, bannerAllowed, onAdsStateChange } from '@/services/ads';
import { recordError } from '@/services/analytics';
import { currentQuota, grantRewardedBonus } from '@/services/operations/perform';
import { useIsPremium, useSession } from '@/store/session';

/**
 * Anchored adaptive banner, labelled and separated from content so it can't be
 * mistaken for an app control. Only rendered on browsing screens (dashboard, history).
 */
export function AdBanner() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const sessionCount = useSession((s) => s.sessionCount);
  const [, force] = useState(0);
  const [failed, setFailed] = useState(false);
  useEffect(() => onAdsStateChange(() => force((n) => n + 1)), []);

  const sdk = adsSdk();
  if (!sdk || failed || !adUnits.banner || !bannerAllowed({ isPremium, sessionCount })) return null;
  const { BannerAd, BannerAdSize } = sdk;
  return (
    <View style={{ alignItems: 'center', paddingTop: 8, marginTop: 8, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
      <Text variant="caption" tone="subtle" style={{ marginBottom: 4 }}>
        {t('ads.label')}
      </Text>
      <BannerAd unitId={adUnits.banner} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} onAdFailedToLoad={() => setFailed(true)} />
    </View>
  );
}

/** Daily free quota, with optional rewarded bonus and upgrade entry. Hidden for Premium. */
export function QuotaCard({ compact }: { compact?: boolean }) {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  useSession((s) => s.usage); // re-render on usage changes
  const quota = currentQuota();
  const rewarded = useRewardedAd(isPremium);
  const [message, setMessage] = useState<string | null>(null);
  if (isPremium) return null;

  const watch = async () => {
    setMessage(null);
    try {
      const shown = await rewarded.show(() => {
        grantRewardedBonus()
          .then(() => setMessage(t('quota.bonusGranted', { count: FREE_LIMITS.rewardedBonus })))
          .catch((e) => recordError(e, 'rewarded_bonus'));
      });
      if (!shown) setMessage(t('quota.adUnavailable'));
    } catch (e) {
      recordError(e, 'rewarded_show');
      setMessage(t('quota.adUnavailable'));
    }
  };

  return (
    <Card testID="quota-card">
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="subheading">{t('quota.title')}</Text>
        <Text variant="bodySmall" tone={quota.remaining === 0 ? 'danger' : 'primary'} style={{ fontWeight: '700' }}>
          {t('quota.remaining', { count: quota.remaining, total: quota.limit })}
        </Text>
      </Row>
      <ProgressBar progress={quota.limit ? quota.used / quota.limit : 1} tone={quota.remaining === 0 ? 'accent' : 'primary'} label={t('quota.title')} />
      {!compact ? (
        <Text variant="caption" tone="muted">
          {t('quota.explainer')}
        </Text>
      ) : null}
      {message ? (
        <Text variant="bodySmall" tone="success" accessibilityLiveRegion="polite">
          {message}
        </Text>
      ) : null}
      <Row gap={2} wrap>
        {rewarded.available && quota.canEarnBonus ? (
          <Button size="md" variant="secondary" icon="play-circle-outline" label={t('quota.watchAd', { count: FREE_LIMITS.rewardedBonus })} onPress={watch} disabled={!rewarded.ready} />
        ) : null}
        <Button size="md" variant="ghost" icon="diamond-outline" label={t('premium.goUnlimited')} onPress={() => router.push({ pathname: '/paywall', params: { source: 'quota_card' } })} />
      </Row>
    </Card>
  );
}

/** Upgrade entry card (dashboard). */
export function PremiumCard() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  if (isPremium) {
    return (
      <Card tone="accent">
        <Row gap={3}>
          <Icon name="diamond" size={22} color={theme.colors.accent} />
          <Text variant="subheading">{t('premium.activeShort')}</Text>
        </Row>
      </Card>
    );
  }
  return (
    <Card tone="primary" onPress={() => router.push({ pathname: '/paywall', params: { source: 'dashboard' } })} accessibilityLabel={t('premium.cardTitle')} testID="premium-card">
      <Row gap={3}>
        <View style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface }}>
          <Icon name="diamond" size={22} color={theme.colors.accent} />
        </View>
        <Stack gap={0} style={{ flex: 1 }}>
          <Text variant="subheading">{t('premium.cardTitle')}</Text>
          <Text variant="caption" tone="muted">
            {t('premium.cardSubtitle')}
          </Text>
        </Stack>
        <Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} />
      </Row>
    </Card>
  );
}
