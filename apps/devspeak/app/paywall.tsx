import { annualSavingsPercent, type PlanOption } from '@factory/monetization';
import { Badge, Button, Card, Icon, IconButton, OptionCard, Row, Stack, Text, useTheme } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Linking, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { links } from '@/config/brand';
import { lessons, vocabulary } from '@/content';
import { repos } from '@/database';
import { fmt } from '@/i18n';
import { recordError, track } from '@/services/analytics';
import { loadPlans, purchase, restore, subscriptionsConfigured } from '@/services/monetization';
import { useSession } from '@/store/session';

export default function Paywall() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const { plans, storeAvailable, entitlement } = useSession();
  const [picked, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState<'buy' | 'restore' | 'load' | null>('load');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    track('premium_paywall_viewed', { source: source ?? 'unknown' });
    loadPlans()
      .catch((e) => recordError(e, 'paywall_plans'))
      .finally(() => setBusy(null));
  }, [source]);

  const sorted = useMemo(() => [...plans].sort((a, b) => (a.period === 'annual' ? -1 : b.period === 'annual' ? 1 : 0)), [plans]);
  // Annual is pre-selected (first in the list) until the user picks a plan.
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

  const planTitle = (p: PlanOption) => (p.period === 'annual' ? t('paywall.annual') : p.period === 'monthly' ? t('paywall.monthly') : p.id);
  const planSubtitle = (p: PlanOption) =>
    p.period === 'annual'
      ? [t('paywall.perYear', { price: p.priceString }), p.pricePerMonthString ? t('paywall.perMonth', { price: p.pricePerMonthString }) : null].filter(Boolean).join(' · ')
      : t('paywall.perMonth', { price: p.priceString });

  const benefits = [
    t('paywall.benefit1', { count: lessons.length }),
    t('paywall.benefit2', { words: vocabulary.length }),
    t('paywall.benefit3'),
    t('paywall.benefit4'),
    t('paywall.benefit5'),
    t('paywall.benefit6'),
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'bottom']} testID="paywall">
      <Row style={{ justifyContent: 'flex-end', paddingHorizontal: 12 }}>
        <IconButton icon="close" label={t('common.close')} onPress={() => router.back()} />
      </Row>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 16 }}>
        <View style={{ alignSelf: 'center', width: 76, height: 76, borderRadius: 24, backgroundColor: theme.colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="diamond" size={38} color={theme.colors.accent} />
        </View>
        <Text variant="title" center accessibilityRole="header">
          {t('paywall.title')}
        </Text>
        <Text tone="muted" center>
          {t('paywall.subtitle')}
        </Text>

        <Card>
          {benefits.map((b) => (
            <Row key={b} gap={3} style={{ paddingVertical: 4 }}>
              <Icon name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text variant="bodySmall" style={{ flex: 1 }}>
                {b}
              </Text>
            </Row>
          ))}
        </Card>

        {entitlement.isPremium ? (
          <Card tone="accent">
            <Text variant="subheading">{t('paywall.active')}</Text>
            {entitlement.expiresAt ? <Text variant="bodySmall">{t('paywall.activeUntil', { date: fmt.date(new Date(entitlement.expiresAt)) })}</Text> : null}
            <Button label={t('paywall.manage')} variant="secondary" size="md" onPress={() => Linking.openURL(links.manageSubscriptions)} />
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
                <OptionCard title={planTitle(p)} subtitle={planSubtitle(p)} selected={selected === p.id} onPress={() => setSelected(p.id)} testID={`plan-${p.period}`} />
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
            <Button label={t('paywall.subscribe')} onPress={buy} loading={busy === 'buy'} disabled={!selected || !storeAvailable || busy !== null} testID="subscribe" />
            <Button label={t('paywall.restore')} variant="ghost" onPress={doRestore} loading={busy === 'restore'} disabled={!subscriptionsConfigured() || busy !== null} />
          </Stack>
        ) : null}

        <Text variant="caption" tone="subtle" center>
          {t('paywall.legal')}
        </Text>
        <Row style={{ justifyContent: 'center' }} gap={4}>
          {links.terms ? <Button label={t('paywall.terms')} variant="ghost" size="md" onPress={() => Linking.openURL(links.terms as string)} /> : null}
          <Button label={t('paywall.privacy')} variant="ghost" size="md" onPress={() => router.push('/settings/privacy')} />
        </Row>
      </ScrollView>
    </SafeAreaView>
  );
}
