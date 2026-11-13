import { annualSavingsPercent, type PlanOption } from '@factory/monetization';
import { Badge, Button, Card, Icon, IconButton, OptionCard, Row, Stack, Text, useTheme } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Linking, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { links } from '@/config/brand';
import { repos } from '@/database';
import type { PremiumFeature } from '@/features/premium/limits';
import { recordError, track } from '@/services/analytics';
import { afterWrite } from '@/services/boot';
import { loadPlans, purchase, restore } from '@/services/monetization';
import { useSession } from '@/store/session';

const ORDER: Record<PlanOption['period'], number> = { annual: 0, monthly: 1, lifetime: 2, unknown: 3 };
const FEATURES = ['vehicles', 'history', 'reports', 'documents', 'comparison', 'reminders', 'costs', 'ads'] as const;

/**
 * Prices always come from Google Play through RevenueCat (localized `priceString`);
 * nothing is hard-coded or simulated. Without a configured store the paywall says so.
 * The free plan keeps every entered record visible and exportable.
 */
export default function Paywall() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { reason } = useLocalSearchParams<{ reason?: PremiumFeature }>();
  const { plans, storeAvailable, entitlement } = useSession();
  const [picked, setPicked] = useState<string | null>(null);
  const [busy, setBusy] = useState<'buy' | 'restore' | 'load' | null>('load');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    track('premium_viewed', { source: reason ?? 'settings' });
    loadPlans()
      .catch((e) => recordError(e, 'paywall_plans'))
      .finally(() => setBusy(null));
  }, [reason]);

  const sorted = useMemo(() => [...plans].sort((a, b) => ORDER[a.period] - ORDER[b.period]), [plans]);
  const selected = picked ?? sorted[0]?.id ?? null;
  const savings = annualSavingsPercent(plans);

  const buy = async () => {
    if (!selected) return;
    setBusy('buy');
    setMessage(null);
    try {
      const outcome = await purchase(repos().db, selected);
      if (outcome.status === 'success' && outcome.state.isPremium) {
        afterWrite();
        router.back();
      } else if (outcome.status === 'cancelled') setMessage(t('paywall.cancelled'));
      else setMessage(t('paywall.error'));
    } catch (e) {
      recordError(e, 'purchase');
      setMessage(t('paywall.error'));
    } finally {
      setBusy(null);
    }
  };

  const doRestore = async () => {
    setBusy('restore');
    setMessage(null);
    try {
      const state = await restore(repos().db);
      setMessage(state?.isPremium ? t('paywall.restored') : t('paywall.nothingToRestore'));
      if (state?.isPremium) afterWrite();
    } catch (e) {
      recordError(e, 'restore');
      setMessage(t('paywall.error'));
    } finally {
      setBusy(null);
    }
  };

  const priceLabel = (p: PlanOption) => (p.period === 'monthly' ? t('paywall.perMonth', { price: p.priceString }) : p.period === 'annual' ? t('paywall.perYear', { price: p.priceString }) : t('paywall.once', { price: p.priceString }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'bottom']}>
      <Row style={{ justifyContent: 'flex-end', paddingHorizontal: 8 }}>
        <IconButton icon="close" label={t('common.close')} onPress={() => router.back()} />
      </Row>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <View style={{ width: 72, height: 72, borderRadius: 22, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="diamond" size={36} color={theme.colors.onPrimary} />
          </View>
          <Text variant="title" center>
            {t('paywall.title')}
          </Text>
          <Text tone="muted" center>
            {reason ? t(`paywall.reasons.${reason}`) : t('paywall.subtitle')}
          </Text>
        </View>

        <Card>
          {FEATURES.map((k) => (
            <Row key={k} gap={3}>
              <Icon name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={{ flex: 1 }}>{t(`paywall.features.${k}`)}</Text>
            </Row>
          ))}
        </Card>

        {entitlement.isPremium ? (
          <Card tone="primary">
            <Text variant="subheading">{t('paywall.active')}</Text>
            <Button label={t('paywall.manage')} variant="secondary" size="md" onPress={() => void Linking.openURL(links.manageSubscriptions)} />
          </Card>
        ) : busy === 'load' ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : !storeAvailable || sorted.length === 0 ? (
          <Card tone="alt">
            <Text variant="bodySmall">{t('paywall.unavailable')}</Text>
          </Card>
        ) : (
          <Stack gap={2}>
            {sorted.map((p) => (
              <View key={p.id}>
                <OptionCard title={t(`paywall.${p.period === 'unknown' ? 'monthly' : p.period}`)} subtitle={priceLabel(p)} selected={selected === p.id} onPress={() => setPicked(p.id)} testID={`plan-${p.period}`} />
                {p.period === 'annual' && savings ? (
                  <View style={{ position: 'absolute', right: 48, top: -8 }}>
                    <Badge label={t('paywall.save', { percent: savings })} tone="accent" />
                  </View>
                ) : null}
              </View>
            ))}
            <Button label={t('paywall.subscribe')} icon="lock-open" onPress={() => void buy()} loading={busy === 'buy'} disabled={!selected} />
          </Stack>
        )}

        <Button label={t('paywall.restore')} variant="ghost" onPress={() => void doRestore()} loading={busy === 'restore'} />
        {message ? (
          <Text variant="bodySmall" tone="primary" center accessibilityLiveRegion="polite">
            {message}
          </Text>
        ) : null}
        <Text variant="caption" tone="subtle" center>
          {t('paywall.freeKeeps')}
        </Text>
        <Text variant="caption" tone="subtle" center>
          {t('paywall.legal')}
        </Text>
        <Row gap={4} style={{ justifyContent: 'center' }}>
          {links.privacyPolicy ? (
            <Text variant="caption" tone="primary" onPress={() => void Linking.openURL(links.privacyPolicy!)}>
              {t('settings.privacyPolicy')}
            </Text>
          ) : null}
          {links.terms ? (
            <Text variant="caption" tone="primary" onPress={() => void Linking.openURL(links.terms!)}>
              {t('settings.terms')}
            </Text>
          ) : null}
        </Row>
      </ScrollView>
    </SafeAreaView>
  );
}
