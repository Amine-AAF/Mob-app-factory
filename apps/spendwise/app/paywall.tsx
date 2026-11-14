import { annualSavingsPercent, type PlanOption } from '@factory/monetization';
import { Badge, Button, Card, Icon, IconButton, OptionCard, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { links } from '@/config/brand';
import { repos } from '@/database';
import { recordError, track } from '@/services/analytics';
import { loadPlans, purchase, restore, subscriptionsConfigured } from '@/services/monetization';
import { useSession } from '@/store/session';

const FEATURES = ['accounts', 'budgets', 'reports', 'history', 'export', 'categories', 'goals', 'noAds'] as const;

/** Prices are ALWAYS the localized strings returned by Google Play (never hard-coded). */
export default function Paywall() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const plans = useSession((s) => s.plans);
  const storeAvailable = useSession((s) => s.storeAvailable);
  const entitlement = useSession((s) => s.entitlement);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    track('premium_viewed', { source: source ?? 'unknown' });
    loadPlans().catch((e) => recordError(e, 'paywall_plans'));
  }, [source]);

  const chosen = selected ?? plans.find((p) => p.period === 'annual')?.id ?? plans[0]?.id ?? null;
  const savings = annualSavingsPercent(plans);

  async function buy() {
    if (!chosen) return;
    setBusy('buy');
    setMessage(null);
    try {
      const outcome = await purchase(repos().db, chosen);
      if (outcome.status === 'success') router.back();
      else if (outcome.status === 'pending') setMessage(t('paywall.pending'));
      else if (outcome.status === 'error') setMessage(t('paywall.error'));
    } catch (e) {
      recordError(e, 'purchase');
      setMessage(t('paywall.error'));
    } finally {
      setBusy(null);
    }
  }

  async function doRestore() {
    setBusy('restore');
    try {
      const state = await restore(repos().db);
      setMessage(state?.isPremium ? t('paywall.restored') : t('paywall.nothingToRestore'));
    } catch (e) {
      recordError(e, 'restore');
      setMessage(t('paywall.error'));
    } finally {
      setBusy(null);
    }
  }

  const label = (p: PlanOption) => t(`paywall.plans.${p.period}`);

  return (
    <Screen
      edges={['top', 'bottom']}
      footer={
        entitlement.isPremium ? (
          <Button label={t('common.close')} onPress={() => router.back()} />
        ) : storeAvailable && chosen ? (
          <Stack gap={2}>
            <Button label={t('paywall.subscribe')} onPress={buy} loading={busy === 'buy'} testID="paywall-buy" />
            <Text variant="caption" tone="subtle" center>
              {t('paywall.legal')}
            </Text>
          </Stack>
        ) : undefined
      }
    >
      <Row style={{ justifyContent: 'flex-end' }}>
        <IconButton icon="close" label={t('common.close')} onPress={() => router.back()} />
      </Row>
      <Icon name="star" size={40} color={theme.colors.accent} />
      <Text variant="title">{t('paywall.title')}</Text>
      <Text tone="muted">{t('paywall.subtitle')}</Text>
      {entitlement.isPremium ? (
        <Card tone="primary">
          <Badge label={t('settings.premiumActive')} tone="success" icon="checkmark" />
        </Card>
      ) : null}
      <Card>
        {FEATURES.map((f) => (
          <Row key={f} gap={3}>
            <Icon name="checkmark-circle" size={20} color={theme.colors.success} />
            <Text style={{ flex: 1 }}>{t(`paywall.features.${f}`)}</Text>
          </Row>
        ))}
      </Card>
      {!entitlement.isPremium ? (
        storeAvailable && plans.length ? (
          <Stack gap={2}>
            {plans.map((p) => (
              <OptionCard
                key={p.id}
                title={`${label(p)} · ${p.priceString}`}
                subtitle={p.period === 'annual' && savings ? t('paywall.save', { pct: savings }) : p.period === 'lifetime' ? t('paywall.lifetimeDesc') : p.pricePerMonthString ? t('paywall.perMonth', { price: p.pricePerMonthString }) : undefined}
                selected={p.id === chosen}
                onPress={() => setSelected(p.id)}
                testID={`plan-${p.period}`}
              />
            ))}
          </Stack>
        ) : (
          <Card tone="alt">
            <Text tone="muted">{subscriptionsConfigured() ? t('paywall.loading') : t('paywall.unavailable')}</Text>
          </Card>
        )
      ) : null}
      {message ? <Text tone="warning">{message}</Text> : null}
      <Button label={t('paywall.restore')} variant="ghost" size="md" onPress={doRestore} loading={busy === 'restore'} />
      <Button label={t('paywall.manage')} variant="ghost" size="md" onPress={() => Linking.openURL(links.manageSubscriptions)} />
      <Text variant="caption" tone="subtle">
        {t('paywall.freeStays')}
      </Text>
    </Screen>
  );
}
