import { annualSavingsPercent, type PlanOption } from '@factory/monetization';
import { Badge, Button, Icon, IconButton, OptionCard, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { links } from '@/config/brand';
import { BUILTIN_RECIPES } from '@/content/recipes';
import { repos } from '@/database';
import { useLang } from '@/hooks/useLang';
import { recordError, track } from '@/services/analytics';
import { loadPlans, purchase, restore } from '@/services/monetization';
import { dataChanged, useSession } from '@/store/session';

const ORDER: PlanOption['period'][] = ['annual', 'monthly', 'lifetime', 'unknown'];

/**
 * Paywall. Prices always come from the store (localized); nothing is hard-coded.
 * Without a configured store the screen says so and never fakes a purchase.
 */
export default function Paywall() {
  const { t } = useLang();
  const theme = useTheme();
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

  const sorted = useMemo(() => [...plans].sort((a, b) => ORDER.indexOf(a.period) - ORDER.indexOf(b.period)), [plans]);
  const selected = picked ?? sorted[0]?.id ?? null;
  const savings = annualSavingsPercent(plans);
  const premiumRecipes = BUILTIN_RECIPES.filter((r) => r.premium).length;

  const buy = async () => {
    if (!selected) return;
    setBusy('buy');
    setMessage(null);
    try {
      const outcome = await purchase(repos().db, selected);
      if (outcome.status === 'success' && outcome.state.isPremium) {
        setMessage(t('paywall.success'));
        dataChanged();
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
      dataChanged();
    } finally {
      setBusy(null);
    }
  };

  const title = (p: PlanOption) => t(`paywall.${p.period === 'unknown' ? 'plan' : p.period}`);
  const subtitle = (p: PlanOption) =>
    p.period === 'annual'
      ? [t('paywall.perYear', { price: p.priceString }), p.pricePerMonthString ? t('paywall.perMonth', { price: p.pricePerMonthString }) : null].filter(Boolean).join(' · ')
      : p.period === 'lifetime'
        ? t('paywall.once', { price: p.priceString })
        : t('paywall.perMonth', { price: p.priceString });

  const benefits: [IconName, string][] = [
    ['book', t('paywall.benefitRecipes', { count: premiumRecipes })],
    ['calendar', t('paywall.benefitPlans')],
    ['albums', t('paywall.benefitTemplates')],
    ['file-tray-full', t('paywall.benefitPantry')],
    ['nutrition', t('paywall.benefitNutrition')],
    ['wallet', t('paywall.benefitBudget')],
    ['download', t('paywall.benefitExport')],
    ['eye-off', t('paywall.benefitNoAds')],
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} testID="paywall">
      <Row style={{ justifyContent: 'flex-end', paddingHorizontal: 8 }}>
        <IconButton icon="close" label={t('common.close')} onPress={() => router.back()} />
      </Row>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 16 }}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 48, lineHeight: 60 }} maxFontSizeMultiplier={1}>
            ✨
          </Text>
          <Text variant="display" center>
            {t('paywall.title')}
          </Text>
          <Text tone="muted" center>
            {t('paywall.subtitle')}
          </Text>
        </View>
        {entitlement.isPremium ? <Badge label={t('profile.premiumActive')} tone="success" icon="checkmark-circle" /> : null}
        <Stack gap={2}>
          {benefits.map(([icon, label]) => (
            <Row key={label} gap={3}>
              <Icon name={icon} size={20} color={theme.colors.accent} />
              <Text style={{ flex: 1 }}>{label}</Text>
            </Row>
          ))}
        </Stack>

        {busy === 'load' ? <ActivityIndicator color={theme.colors.primary} /> : null}
        {!busy && !storeAvailable ? (
          <Text tone="muted" center testID="paywall-unavailable">
            {t('paywall.storeUnavailable')}
          </Text>
        ) : null}
        {sorted.map((p) => (
          <View key={p.id}>
            <OptionCard title={title(p)} subtitle={subtitle(p)} selected={selected === p.id} onPress={() => setPicked(p.id)} />
            {p.period === 'annual' && savings ? (
              <View style={{ position: 'absolute', right: 12, top: -10 }}>
                <Badge label={t('paywall.save', { percent: savings })} tone="accent" />
              </View>
            ) : null}
          </View>
        ))}
        {sorted.length ? <Button label={t('paywall.continue')} onPress={buy} loading={busy === 'buy'} disabled={!selected || entitlement.isPremium} /> : null}
        <Button label={t('paywall.restore')} variant="ghost" onPress={doRestore} loading={busy === 'restore'} />
        {message ? (
          <Text center tone="muted" accessibilityLiveRegion="polite">
            {message}
          </Text>
        ) : null}
        <Text variant="caption" tone="subtle" center>
          {t('paywall.legal')}
        </Text>
        <Row gap={4} style={{ justifyContent: 'center' }}>
          {links.terms ? (
            <Text variant="caption" tone="primary" onPress={() => void Linking.openURL(links.terms)}>
              {t('privacy.terms')}
            </Text>
          ) : null}
          {links.privacy ? (
            <Text variant="caption" tone="primary" onPress={() => void Linking.openURL(links.privacy)}>
              {t('privacy.policy')}
            </Text>
          ) : null}
        </Row>
      </ScrollView>
    </SafeAreaView>
  );
}
