import { annualSavingsPercent, type PlanOption } from '@factory/monetization';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking } from 'react-native';

import { repos } from '@/database';
import { recordError, track } from '@/services/analytics';
import { loadPlans, purchase, restore } from '@/services/monetization';
import { useSession } from '@/store/session';
import { Badge, Button, Card, Icon, IconButton, PressableScale, Row, Screen, Stack, Text, useTheme, type IconName } from '@/ui';

const PRIVACY_URL = process.env.EXPO_PUBLIC_PRIVACY_URL;
const TERMS_URL = process.env.EXPO_PUBLIC_TERMS_URL;

const PERIOD_ORDER: Record<PlanOption['period'], number> = { annual: 0, monthly: 1, lifetime: 2, unknown: 3 };

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/(tabs)');
}

export default function PaywallScreen() {
  const { source } = useLocalSearchParams<{ source?: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const plans = useSession((s) => s.plans);
  const storeAvailable = useSession((s) => s.storeAvailable);
  const isPremium = useSession((s) => s.entitlement.isPremium);
  const sorted = useMemo(() => [...plans].sort((a, b) => PERIOD_ORDER[a.period] - PERIOD_ORDER[b.period]), [plans]);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | 'purchase' | 'restore'>(null);
  const savings = annualSavingsPercent(plans);
  const plan = sorted.find((p) => p.id === selected) ?? sorted[0];

  useEffect(() => {
    track('premium_paywall_viewed', { source: source ?? 'unknown' });
    if (plans.length === 0) loadPlans().catch((e) => recordError(e, 'paywall_plans'));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per opening
  }, []);

  const values: { icon: IconName; label: string }[] = [
    { icon: 'infinite-outline', label: t('paywall.values.unlimited') },
    { icon: 'bulb-outline', label: t('paywall.values.suggestions') },
    { icon: 'stats-chart-outline', label: t('paywall.values.insights') },
    { icon: 'calendar-outline', label: t('paywall.values.calendar') },
    { icon: 'airplane-outline', label: t('paywall.values.packing') },
    { icon: 'time-outline', label: t('paywall.values.history') },
    { icon: 'bag-handle-outline', label: t('paywall.values.shopping') },
    { icon: 'download-outline', label: t('paywall.values.export') },
    { icon: 'color-palette-outline', label: t('paywall.values.themes') },
    { icon: 'eye-off-outline', label: t('paywall.values.noAds') },
  ];

  const buy = async () => {
    if (!plan) return;
    setBusy('purchase');
    try {
      const outcome = await purchase(repos().db, plan.id);
      if (outcome.status === 'success') {
        if (outcome.state.isPremium) {
          Alert.alert(t('paywall.success.title'), t('paywall.success.message'));
          close();
        }
      } else if (outcome.status === 'pending') Alert.alert(t('paywall.pending.title'), t('paywall.pending.message'));
      else if (outcome.status === 'error') Alert.alert(t('paywall.error.title'), t('paywall.error.message'));
    } catch (e) {
      recordError(e, 'paywall_purchase');
      Alert.alert(t('paywall.error.title'), t('paywall.error.message'));
    } finally {
      setBusy(null);
    }
  };

  const doRestore = async () => {
    setBusy('restore');
    try {
      const state = await restore(repos().db);
      if (state?.isPremium) {
        Alert.alert(t('paywall.restore.successTitle'), t('paywall.restore.successMessage'));
        close();
      } else Alert.alert(t('paywall.restore.noneTitle'), t('paywall.restore.noneMessage'));
    } catch (e) {
      recordError(e, 'paywall_restore');
      Alert.alert(t('paywall.error.title'), t('paywall.error.message'));
    } finally {
      setBusy(null);
    }
  };

  const periodLabel = (p: PlanOption) => (p.period === 'annual' ? t('paywall.plans.annual') : p.period === 'monthly' ? t('paywall.plans.monthly') : p.period === 'lifetime' ? t('paywall.plans.lifetime') : t('paywall.plans.other'));
  const periodSuffix = (p: PlanOption) => (p.period === 'annual' ? t('paywall.plans.perYear') : p.period === 'monthly' ? t('paywall.plans.perMonth') : p.period === 'lifetime' ? t('paywall.plans.once') : '');

  return (
    <Screen
      edges={['top', 'bottom']}
      footer={
        isPremium ? (
          <Button label={t('common.close')} onPress={close} />
        ) : storeAvailable && plan ? (
          <Stack gap={2}>
            <Button label={plan.hasFreeTrial ? t('paywall.cta.trial') : t('paywall.cta.subscribe', { price: plan.priceString })} onPress={() => void buy()} loading={busy === 'purchase'} disabled={!!busy} testID="paywall-buy" />
            <Button variant="ghost" small label={t('paywall.restore.button')} onPress={() => void doRestore()} loading={busy === 'restore'} disabled={!!busy} />
          </Stack>
        ) : (
          <Button variant="secondary" label={t('common.close')} onPress={close} />
        )
      }
    >
      <Row style={{ justifyContent: 'flex-end' }}>
        <IconButton icon="close" label={t('common.close')} onPress={close} filled testID="paywall-close" />
      </Row>
      <Stack gap={2}>
        <Text variant="label" tone="accent">
          {t('paywall.eyebrow')}
        </Text>
        <Text variant="hero" accessibilityRole="header">
          {isPremium ? t('paywall.activeTitle') : t('paywall.title')}
        </Text>
        <Text tone="muted">{isPremium ? t('paywall.activeMessage') : t('paywall.subtitle')}</Text>
      </Stack>

      <Card>
        {values.map((v) => (
          <Row key={v.icon} gap={3} style={{ minHeight: 32 }}>
            <Icon name={v.icon} size={18} color={theme.colors.accent} />
            <Text style={{ flex: 1 }}>{v.label}</Text>
          </Row>
        ))}
      </Card>

      {isPremium ? null : !storeAvailable ? (
        <Card tone="alt">
          <Row gap={2}>
            <Icon name="information-circle-outline" size={18} color={theme.colors.textMuted} />
            <Text variant="heading" style={{ flex: 1 }}>
              {t('paywall.unavailable.title')}
            </Text>
          </Row>
          <Text variant="bodySmall" tone="muted">
            {t('paywall.unavailable.message')}
          </Text>
        </Card>
      ) : (
        <Stack gap={2}>
          {sorted.map((p) => {
            const on = plan?.id === p.id;
            return (
              <PressableScale
                key={p.id}
                onPress={() => setSelected(p.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`${periodLabel(p)}, ${p.priceString}`}
                style={{ borderRadius: theme.radius.lg, borderWidth: on ? 2 : 1, borderColor: on ? theme.colors.primary : theme.colors.border, backgroundColor: theme.colors.surface, padding: theme.spacing(4), gap: theme.spacing(1) }}
              >
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text variant="heading">{periodLabel(p)}</Text>
                  {p.period === 'annual' && savings ? <Badge tone="accent" label={t('paywall.plans.save', { percent: savings })} /> : null}
                  {p.period === 'lifetime' ? <Badge tone="neutral" label={t('paywall.plans.oneTime')} /> : null}
                </Row>
                <Text>
                  <Text variant="title">{p.priceString}</Text>
                  <Text tone="muted">{periodSuffix(p) ? ` ${periodSuffix(p)}` : ''}</Text>
                </Text>
                {p.period === 'annual' && p.pricePerMonthString ? (
                  <Text variant="caption" tone="subtle">
                    {t('paywall.plans.perMonthEquivalent', { price: p.pricePerMonthString })}
                  </Text>
                ) : null}
                {p.hasFreeTrial ? (
                  <Text variant="caption" tone="success">
                    {t('paywall.plans.trial')}
                  </Text>
                ) : null}
              </PressableScale>
            );
          })}
        </Stack>
      )}

      {!isPremium ? (
        <Stack gap={2}>
          <Text variant="caption" tone="subtle">
            {t('paywall.legal')}
          </Text>
          <Row gap={4} wrap>
            {PRIVACY_URL ? <Button small variant="ghost" label={t('paywall.privacy')} onPress={() => void Linking.openURL(PRIVACY_URL)} /> : null}
            {TERMS_URL ? <Button small variant="ghost" label={t('paywall.terms')} onPress={() => void Linking.openURL(TERMS_URL)} /> : null}
          </Row>
        </Stack>
      ) : null}
    </Screen>
  );
}
