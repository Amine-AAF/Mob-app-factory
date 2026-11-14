import { annualSavingsPercent, type PlanOption } from '@factory/monetization';
import { Badge, Button, Card, Icon, IconButton, OptionCard, Row, Stack, Text, useTheme } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Linking, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLeaf } from '@/components/leaf';
import { links } from '@/config/brand';
import { SPECIES } from '@/content/species';
import { repos } from '@/database';
import { FREE_PLANT_LIMIT } from '@/domain/limits';
import { fmt } from '@/i18n';
import { recordError, track } from '@/services/analytics';
import { loadPlans, purchase, restore, subscriptionsConfigured } from '@/services/monetization';
import { useSession } from '@/store/session';

/**
 * Premium paywall. Prices always come from Google Play (localized); nothing is hard-coded.
 * Without a configured store key the screen explains that purchases are unavailable —
 * it never fakes a purchase.
 */
export default function Paywall() {
  const { t } = useTranslation();
  const theme = useTheme();
  const tokens = useLeaf();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const { plans, storeAvailable, entitlement } = useSession();
  const [picked, setPicked] = useState<string | null>(null);
  const [busy, setBusy] = useState<'buy' | 'restore' | 'load' | null>('load');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    track('premium_paywall_viewed', { source: source ?? 'unknown' });
    loadPlans()
      .catch((e) => recordError(e, 'paywall_plans'))
      .finally(() => setBusy(null));
  }, [source]);

  const order = { annual: 0, monthly: 1, lifetime: 2, unknown: 3 } as const;
  const sorted = useMemo(() => [...plans].sort((a, b) => order[a.period] - order[b.period]), [plans]); // eslint-disable-line react-hooks/exhaustive-deps
  const selected = picked ?? sorted[0]?.id ?? null;
  const savings = annualSavingsPercent(plans);

  const buy = async () => {
    if (!selected) return;
    setBusy('buy');
    setMessage(null);
    try {
      const outcome = await purchase(repos().db, selected);
      if (outcome.status === 'success' && outcome.state.isPremium) {
        setMessage(t('paywall.success'));
        useSession.getState().bump();
        setTimeout(() => router.back(), 900);
      } else if (outcome.status === 'cancelled') setMessage(t('paywall.cancelled'));
      else if (outcome.status === 'pending') setMessage(t('paywall.pending'));
      else setMessage(t('paywall.unavailable'));
    } finally {
      setBusy(null);
    }
  };

  const doRestore = async () => {
    setBusy('restore');
    setMessage(null);
    try {
      const state = await restore(repos().db);
      setMessage(state?.isPremium ? t('paywall.restored') : state ? t('paywall.nothingToRestore') : t('paywall.unavailable'));
      useSession.getState().bump();
    } finally {
      setBusy(null);
    }
  };

  const planTitle = (p: PlanOption) => t(`paywall.periods.${p.period}`);
  const planSubtitle = (p: PlanOption) =>
    p.period === 'annual'
      ? [t('paywall.perYear', { price: p.priceString }), p.pricePerMonthString ? t('paywall.perMonth', { price: p.pricePerMonthString }) : null].filter(Boolean).join(' · ')
      : p.period === 'lifetime'
        ? t('paywall.once', { price: p.priceString })
        : t('paywall.perMonth', { price: p.priceString });

  const benefits = [
    t('paywall.benefits.plants', { free: FREE_PLANT_LIMIT }),
    t('paywall.benefits.library', { count: SPECIES.length }),
    t('paywall.benefits.history'),
    t('paywall.benefits.growth'),
    t('paywall.benefits.photoJournal'),
    t('paywall.benefits.stats'),
    t('paywall.benefits.garden'),
    t('paywall.benefits.seasonal'),
    t('paywall.benefits.pdf'),
    t('paywall.benefits.noAds'),
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'bottom']} testID="paywall">
      <Row style={{ justifyContent: 'flex-end', paddingHorizontal: 12 }}>
        <IconButton icon="close" label={t('common.close')} onPress={() => router.back()} />
      </Row>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 16 }}>
        <View style={{ alignSelf: 'center', width: 80, height: 80, borderRadius: 40, backgroundColor: tokens.sage, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="leaf" size={40} color={theme.colors.primary} />
        </View>
        <Text variant="title" center accessibilityRole="header">
          {t('paywall.title')}
        </Text>
        <Text tone="muted" center>
          {t('paywall.subtitle')}
        </Text>

        <Card>
          {benefits.map((b) => (
            <Row key={b} gap={3} style={{ paddingVertical: 3 }}>
              <Icon name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text variant="bodySmall" style={{ flex: 1 }}>
                {b}
              </Text>
            </Row>
          ))}
        </Card>

        {entitlement.isPremium ? (
          <Card tone="primary">
            <Text variant="subheading">{t('premium.active')}</Text>
            {entitlement.expiresAt ? <Text variant="bodySmall">{t('paywall.activeUntil', { date: fmt.date(new Date(entitlement.expiresAt)) })}</Text> : null}
            <Button label={t('paywall.manage')} variant="secondary" size="md" onPress={() => void Linking.openURL(links.manageSubscriptions)} />
          </Card>
        ) : busy === 'load' ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : !subscriptionsConfigured() ? (
          <Card tone="alt">
            <Text variant="bodySmall">{t('paywall.notConfigured')}</Text>
          </Card>
        ) : !storeAvailable ? (
          <Card tone="alt">
            <Text variant="bodySmall">{t('paywall.unavailable')}</Text>
          </Card>
        ) : (
          <Stack gap={3} accessibilityRole="radiogroup">
            {sorted.map((p) => (
              <View key={p.id}>
                <OptionCard title={planTitle(p)} subtitle={planSubtitle(p)} selected={selected === p.id} onPress={() => setPicked(p.id)} testID={`plan-${p.period}`} />
                <Row gap={2} style={{ position: 'absolute', right: 48, top: -10 }}>
                  {p.period === 'annual' && savings ? <Badge label={t('paywall.save', { percent: savings })} tone="accent" /> : null}
                  {p.hasFreeTrial ? <Badge label={t('paywall.freeTrial')} tone="success" /> : null}
                </Row>
              </View>
            ))}
          </Stack>
        )}

        {message ? (
          <Text variant="bodySmall" center tone="primary" accessibilityLiveRegion="polite">
            {message}
          </Text>
        ) : null}

        {!entitlement.isPremium ? (
          <Stack gap={2}>
            <Button label={t('paywall.subscribe')} onPress={() => void buy()} loading={busy === 'buy'} disabled={!selected || !storeAvailable || busy !== null} testID="subscribe" />
            <Button label={t('paywall.restore')} variant="ghost" onPress={() => void doRestore()} loading={busy === 'restore'} disabled={!subscriptionsConfigured() || busy !== null} />
          </Stack>
        ) : null}

        <Text variant="caption" tone="subtle" center>
          {t('paywall.legal')}
        </Text>
        <Row style={{ justifyContent: 'center' }} gap={4}>
          {links.terms ? <Button label={t('paywall.terms')} variant="ghost" size="md" onPress={() => void Linking.openURL(links.terms as string)} /> : null}
          <Button label={t('paywall.privacy')} variant="ghost" size="md" onPress={() => router.push('/settings/privacy')} />
        </Row>
      </ScrollView>
    </SafeAreaView>
  );
}
