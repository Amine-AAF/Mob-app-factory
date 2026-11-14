import { annualSavingsPercent } from '@factory/monetization';
import { Badge, Button, Icon, IconButton, OptionCard, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { links } from '@/config/brand';
import { repos } from '@/database';
import { recordError, track } from '@/services/analytics';
import { loadPlans, purchase, restore, subscriptionsConfigured } from '@/services/monetization';
import { useIsPremium, useSession } from '@/store/session';

const BENEFITS = ['library', 'answers', 'roles', 'mocks', 'paths', 'noAds'] as const;

/**
 * Premium screen. Prices always come from the store (localized by Google Play).
 * Without a configured store the screen says so: no fake purchase is ever simulated.
 */
export default function Paywall() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const isPremium = useIsPremium();
  const plans = useSession((s) => s.plans);
  const storeAvailable = useSession((s) => s.storeAvailable);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    track('premium_viewed', { source: source ?? 'unknown' });
    loadPlans().catch((e) => recordError(e, 'paywall_plans'));
  }, [source]);

  const savings = annualSavingsPercent(plans);
  const chosen = selected ?? plans.find((p) => p.period === 'annual')?.id ?? plans[0]?.id ?? null;

  const buy = async () => {
    if (!chosen) return;
    setBusy(true);
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
      setBusy(false);
    }
  };

  const onRestore = async () => {
    setBusy(true);
    try {
      const state = await restore(repos().db);
      setMessage(state?.isPremium ? t('paywall.restored') : t('paywall.nothingToRestore'));
    } catch (e) {
      recordError(e, 'restore');
      setMessage(t('paywall.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen testID="paywall">
      <Row style={{ justifyContent: 'flex-end' }}>
        <IconButton icon="close" label={t('common.close')} onPress={() => router.back()} />
      </Row>
      <Icon name="diamond" size={44} color={theme.colors.accent} />
      <Text variant="title">{t('paywall.title')}</Text>
      <Text tone="muted">{t('paywall.subtitle')}</Text>
      <Stack gap={2}>
        {BENEFITS.map((b) => (
          <Row key={b} gap={3}>
            <Icon name="checkmark-circle" size={20} color={theme.colors.success} />
            <Text style={{ flex: 1 }}>{t(`paywall.benefit.${b}`)}</Text>
          </Row>
        ))}
      </Stack>

      {isPremium ? (
        <Badge label={t('paywall.active')} tone="success" icon="checkmark" />
      ) : !subscriptionsConfigured() || !storeAvailable || plans.length === 0 ? (
        <Text tone="muted" testID="paywall-unavailable">
          {t('paywall.unavailable')}
        </Text>
      ) : (
        <Stack gap={2}>
          {plans.map((p) => (
            <OptionCard
              key={p.id}
              title={`${t(`paywall.period.${p.period}`)} · ${p.priceString}`}
              subtitle={p.period === 'annual' && savings ? t('paywall.save', { percent: savings }) : p.pricePerMonthString}
              selected={chosen === p.id}
              onPress={() => setSelected(p.id)}
              role="radio"
            />
          ))}
          <Button label={t('paywall.cta')} size="lg" loading={busy} onPress={buy} testID="paywall-buy" />
          <Text variant="caption" tone="subtle">
            {t('paywall.legal')}
          </Text>
        </Stack>
      )}

      {message ? <Text tone="primary">{message}</Text> : null}
      <Row wrap gap={2}>
        <Button label={t('paywall.restore')} variant="ghost" onPress={onRestore} disabled={busy || !subscriptionsConfigured()} />
        <Button label={t('paywall.manage')} variant="ghost" onPress={() => Linking.openURL(links.manageSubscriptions)} />
      </Row>
    </Screen>
  );
}
