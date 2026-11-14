import { Button, Card, Icon, Row, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { unlockStatus } from '@/features/premium/gating';
import { useRewardedAd } from '@/hooks/useRewardedAd';
import { adsSdk, adUnits, bannerAllowed, onAdsStateChange } from '@/services/ads';
import { recordError } from '@/services/analytics';
import { grantRewardedUnlock } from '@/services/usageActions';
import { useIsPremium, useSession } from '@/store/session';

/**
 * Anchored adaptive banner, labelled and separated from content so it can't be mistaken
 * for an app control. Only rendered at the bottom of browsing screens (Home, Tools,
 * Projects) — never on the editor, a tool, a preview, an export or during processing.
 */
export function AdBanner() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const sessionCount = useSession((s) => s.sessionCount);
  useSession((s) => s.processing);
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

/** Upgrade entry card. */
export function PremiumCard({ source }: { source: string }) {
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
    <Card tone="primary" onPress={() => router.push({ pathname: '/paywall', params: { source } })} accessibilityLabel={t('premium.cardTitle')} testID="premium-card">
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

/**
 * Shown when the user wants to export something that uses Premium items.
 * Options: go Premium, or (optionally) watch a rewarded ad to unlock ONE export.
 */
export function PremiumGate({ source, reasons, onUnlocked }: { source: string; reasons: string[]; onUnlocked?: () => void }) {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const usage = useSession((s) => s.usage);
  const rewarded = useRewardedAd(isPremium);
  const [message, setMessage] = useState<string | null>(null);
  if (isPremium || reasons.length === 0) return null;
  const status = unlockStatus(usage);

  const watch = async () => {
    setMessage(null);
    try {
      const shown = await rewarded.show(() => {
        grantRewardedUnlock()
          .then(() => {
            setMessage(t('premium.unlockGranted'));
            onUnlocked?.();
          })
          .catch((e) => recordError(e, 'rewarded_unlock'));
      });
      if (!shown) setMessage(t('premium.adUnavailable'));
    } catch (e) {
      recordError(e, 'rewarded_show');
      setMessage(t('premium.adUnavailable'));
    }
  };

  return (
    <Card tone="accent" testID="premium-gate">
      <Row gap={2}>
        <Icon name="diamond" size={18} />
        <Text variant="subheading" style={{ flex: 1 }}>
          {t('premium.gateTitle')}
        </Text>
      </Row>
      <Text variant="bodySmall" tone="muted">
        {t('premium.gateBody', { items: reasons.map((r) => t(`premium.reasons.${r}`)).join(', ') })}
      </Text>
      {status.available > 0 ? (
        <Text variant="bodySmall" tone="success">
          {t('premium.unlocksLeft', { count: status.available })}
        </Text>
      ) : null}
      {message ? (
        <Text variant="bodySmall" tone="primary" accessibilityLiveRegion="polite">
          {message}
        </Text>
      ) : null}
      <Row gap={2} wrap>
        <Button size="md" icon="diamond-outline" label={t('premium.goPremium')} onPress={() => router.push({ pathname: '/paywall', params: { source } })} testID="gate-paywall" />
        {rewarded.available && status.canEarn && status.available === 0 ? (
          <Button size="md" variant="secondary" icon="play-circle-outline" label={t('premium.watchToUnlock')} onPress={watch} disabled={!rewarded.ready} />
        ) : null}
      </Row>
    </Card>
  );
}
