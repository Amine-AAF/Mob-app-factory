import { annualSavingsPercent, type PlanOption } from '@factory/monetization';
import { Badge, Button, Card, Icon, IconButton, OptionCard, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { repos } from '@/database';
import { recordError, track } from '@/services/analytics';
import { loadPlans, purchase, restore, subscriptionsConfigured } from '@/services/monetization';
import { useSession } from '@/store/session';

const BENEFITS: { key: string; icon: IconName }[] = [
  { key: 'filters', icon: 'color-filter' },
  { key: 'presets', icon: 'share-social' },
  { key: 'collage', icon: 'grid' },
  { key: 'watermark', icon: 'water' },
  { key: 'batch', icon: 'layers' },
  { key: 'quality', icon: 'sparkles' },
  { key: 'compression', icon: 'contract' },
  { key: 'noAds', icon: 'remove-circle' },
];

/**
 * Paywall. Prices ALWAYS come from Google Play through RevenueCat (localized, per market);
 * nothing is hard-coded and no purchase is ever simulated. Without a configured store the
 * screen says so and offers nothing to buy.
 */
export default function PaywallScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const plans = useSession((s) => s.plans);
  const isPremium = useSession((s) => s.entitlement.isPremium);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const configured = subscriptionsConfigured();

  useEffect(() => {
    track('premium_viewed', { source: source ?? 'unknown' });
    loadPlans().catch((e) => recordError(e, 'paywall_plans'));
  }, [source]);

  const chosen = selected ?? plans.find((p) => p.period === 'annual')?.id ?? plans[0]?.id ?? null;
  const savings = annualSavingsPercent(plans);

  const buy = async () => {
    if (!chosen) return;
    setBusy(true);
    setMessage(null);
    try {
      const outcome = await purchase(repos(), chosen);
      if (outcome.status === 'success') router.back();
      else if (outcome.status === 'pending') setMessage(t('premium.pending'));
      else if (outcome.status === 'error') setMessage(t('premium.error'));
    } catch (e) {
      recordError(e, 'purchase');
      setMessage(t('premium.error'));
    } finally {
      setBusy(false);
    }
  };

  const planTitle = (p: PlanOption) => t(`premium.plans.${p.period}`);
  const planSubtitle = (p: PlanOption) =>
    p.period === 'annual' && p.pricePerMonthString ? t('premium.perMonth', { price: p.priceString, monthly: p.pricePerMonthString }) : p.period === 'lifetime' ? t('premium.oneTime', { price: p.priceString }) : p.priceString;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} testID="paywall">
      <Row style={{ justifyContent: 'flex-end', paddingHorizontal: 8 }}>
        <IconButton icon="close" label={t('common.close')} onPress={() => router.back()} />
      </Row>
      <ScrollView contentContainerStyle={{ padding: theme.spacing(5), gap: theme.spacing(4) }}>
        <Stack gap={2} style={{ alignItems: 'center' }}>
          <Icon name="diamond" size={44} color={theme.colors.accent} />
          <Text variant="title" center accessibilityRole="header">
            {t('premium.title')}
          </Text>
          <Text tone="muted" center>
            {t('premium.subtitle')}
          </Text>
        </Stack>
        <Card>
          {BENEFITS.map((b) => (
            <Row key={b.key} gap={3}>
              <Icon name={b.icon} size={18} color={theme.colors.primary} />
              <Text variant="bodySmall" style={{ flex: 1 }}>
                {t(`premium.benefits.${b.key}`)}
              </Text>
            </Row>
          ))}
        </Card>
        {isPremium ? (
          <Card tone="accent">
            <Text variant="subheading">{t('premium.activeShort')}</Text>
          </Card>
        ) : !configured || plans.length === 0 ? (
          <Card tone="alt" testID="store-unavailable">
            <Text variant="bodySmall" tone="muted">
              {t('premium.storeUnavailable')}
            </Text>
          </Card>
        ) : (
          <Stack gap={2}>
            {plans.map((p) => (
              <OptionCard key={p.id} title={planTitle(p)} subtitle={planSubtitle(p)} selected={chosen === p.id} onPress={() => setSelected(p.id)} testID={`plan-${p.period}`} />
            ))}
            {savings ? <Badge label={t('premium.savings', { percent: savings })} tone="success" /> : null}
            <Button label={t('premium.subscribe')} onPress={() => void buy()} loading={busy} disabled={!chosen} testID="subscribe" />
          </Stack>
        )}
        {message ? (
          <Text variant="bodySmall" tone="warning" accessibilityLiveRegion="polite">
            {message}
          </Text>
        ) : null}
        <Button
          label={t('settings.restore')}
          variant="ghost"
          onPress={() =>
            void restore(repos())
              .then((s) => (s?.isPremium ? router.back() : setMessage(t('settings.nothingToRestore'))))
              .catch(() => setMessage(t('premium.storeUnavailable')))
          }
        />
        <Text variant="caption" tone="muted" center>
          {t('premium.legal')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
