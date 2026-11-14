import { annualSavingsPercent, type PlanOption } from '@factory/monetization';
import { Badge, Button, Card, Icon, OptionCard, Row, Screen, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking } from 'react-native';

import { links } from '@/config/brand';
import { repos } from '@/database';
import { PREMIUM_BENEFITS, type PremiumFeature } from '@/features/premium/limits';
import { fmt } from '@/i18n';
import { recordError, track } from '@/services/analytics';
import { loadPlans, purchase, restore, subscriptionsConfigured } from '@/services/monetization';
import { useSession } from '@/store/session';

const BENEFIT_ICON: Record<PremiumFeature, IconName> = {
  unlimited_trips: 'airplane-outline',
  detailed_budget: 'pie-chart-outline',
  custom_split: 'people-outline',
  pdf_export: 'document-text-outline',
  csv_export: 'grid-outline',
  all_templates: 'copy-outline',
  unlimited_documents: 'folder-open-outline',
  no_ads: 'eye-off-outline',
};

const PLAN_ORDER = { annual: 0, monthly: 1, lifetime: 2, unknown: 3 } as const;

/** Premium paywall. No ad here. Prices come from Google Play, localized; nothing is simulated. */
export default function PaywallScreen() {
  const { source } = useLocalSearchParams<{ source?: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const entitlement = useSession((s) => s.entitlement);
  const plans = useSession((s) => s.plans);
  const plansAvailable = useSession((s) => s.plansAvailable);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const configured = subscriptionsConfigured();
  const sorted = [...plans].sort((a, b) => PLAN_ORDER[a.period] - PLAN_ORDER[b.period]);
  const savings = annualSavingsPercent(plans);
  const choice = selected ?? sorted[0]?.id ?? null;

  useEffect(() => {
    track('premium_viewed', { source: source ?? 'unknown' });
    loadPlans().catch((e) => recordError(e, 'paywall_plans'));
  }, [source]);

  const label = (p: PlanOption) => t(`paywall.period.${p.period}`);
  const subtitle = (p: PlanOption) =>
    p.period === 'annual' && p.pricePerMonthString ? t('paywall.perMonth', { price: p.pricePerMonthString }) : p.period === 'lifetime' ? t('paywall.oneTime') : t('paywall.renews');

  const buy = async () => {
    if (!choice) return;
    setBusy(true);
    try {
      const outcome = await purchase(repos().db, choice);
      if (outcome.status === 'success' && outcome.state.isPremium) {
        Alert.alert(t('paywall.thanks'));
        router.back();
      } else if (outcome.status === 'pending') Alert.alert(t('paywall.pending'));
      else if (outcome.status === 'error') Alert.alert(t('paywall.error'));
    } catch (e) {
      recordError(e, 'purchase');
      Alert.alert(t('paywall.error'));
    } finally {
      setBusy(false);
    }
  };

  const doRestore = async () => {
    setBusy(true);
    try {
      const state = await restore(repos().db);
      Alert.alert(state?.isPremium ? t('paywall.restored') : t('paywall.nothingToRestore'));
    } catch (e) {
      recordError(e, 'restore');
      Alert.alert(t('paywall.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={[]} testID="paywall-screen">
      <RouterStack.Screen options={{ headerShown: true, title: t('paywall.title') }} />
      <Stack gap={1}>
        <Text variant="title">{t('paywall.headline')}</Text>
        <Text tone="muted">{t('paywall.subtitle')}</Text>
      </Stack>

      {entitlement.isPremium ? (
        <Card tone="primary" testID="paywall-active">
          <Text variant="subheading">{t('paywall.active')}</Text>
          {entitlement.expiresAt ? (
            <Text variant="bodySmall">{t(entitlement.willRenew ? 'paywall.renewsOn' : 'paywall.endsOn', { date: fmt.date(entitlement.expiresAt.slice(0, 10)) })}</Text>
          ) : null}
          {entitlement.source === 'cache' ? (
            <Text variant="caption" tone="muted">
              {t('paywall.offlineCache')}
            </Text>
          ) : null}
        </Card>
      ) : null}

      <Card>
        {PREMIUM_BENEFITS.map((b) => (
          <Row key={b} gap={3}>
            <Icon name={BENEFIT_ICON[b]} size={20} color={theme.colors.primary} />
            <Text variant="bodySmall" style={{ flex: 1 }}>
              {t(`paywall.benefits.${b}`)}
            </Text>
          </Row>
        ))}
      </Card>
      <Text variant="caption" tone="subtle">
        {t('paywall.freeStays')}
      </Text>

      {!entitlement.isPremium ? (
        !configured || (!plansAvailable && plans.length === 0) ? (
          <Card tone="alt" testID="paywall-unavailable">
            <Text variant="bodySmall">{configured ? t('paywall.loadingOrOffline') : t('paywall.storeUnavailable')}</Text>
          </Card>
        ) : (
          <Stack gap={2}>
            {sorted.map((p) => (
              <Stack key={p.id} gap={1}>
                <OptionCard title={`${label(p)} · ${p.priceString}`} subtitle={subtitle(p)} selected={choice === p.id} onPress={() => setSelected(p.id)} role="radio" testID={`plan-${p.period}`} />
                {p.period === 'annual' && savings ? <Badge label={t('paywall.save', { percent: savings })} tone="success" /> : null}
                {p.hasFreeTrial ? <Badge label={t('paywall.freeTrial')} tone="accent" /> : null}
              </Stack>
            ))}
            <Button label={t('paywall.continue')} size="lg" loading={busy} disabled={!choice} onPress={buy} testID="paywall-buy" />
          </Stack>
        )
      ) : null}

      <Button label={t('paywall.restore')} variant="ghost" onPress={doRestore} disabled={busy || !configured} testID="paywall-restore" />
      <Text variant="caption" tone="subtle">
        {t('paywall.legal')}
      </Text>
      <Row gap={2} wrap>
        <Button label={t('paywall.manage')} variant="ghost" onPress={() => Linking.openURL('https://play.google.com/store/account/subscriptions').catch(() => undefined)} />
        {links.privacyPolicy ? <Button label={t('paywall.privacy')} variant="ghost" onPress={() => Linking.openURL(links.privacyPolicy!).catch(() => undefined)} /> : null}
        {links.terms ? <Button label={t('paywall.terms')} variant="ghost" onPress={() => Linking.openURL(links.terms!).catch(() => undefined)} /> : null}
      </Row>
    </Screen>
  );
}
