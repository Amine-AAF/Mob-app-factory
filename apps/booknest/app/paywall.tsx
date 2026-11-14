import { annualSavingsPercent } from '@factory/monetization';
import { Button, Icon, OptionCard, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, View } from 'react-native';

import { useBookTheme } from '@/components/theme';
import { IconAction, Page, Paper, Serif } from '@/components/ui';
import { links } from '@/config/brand';
import { PREMIUM_FEATURES } from '@/config/limits';
import { repos } from '@/database';
import { track } from '@/services/analytics';
import { loadPlans, purchase, restore } from '@/services/monetization';
import { useSession } from '@/store/session';

/**
 * Paywall. Prices are the localized Google Play prices (never hard-coded), the
 * free plan stays fully usable, and closing is always one tap away.
 */
export default function Paywall() {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const plans = useSession((s) => s.plans);
  const storeAvailable = useSession((s) => s.storeAvailable);
  const premium = useSession((s) => s.entitlement.isPremium);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    track('premium_viewed', { source: source ?? 'unknown' });
    void loadPlans();
  }, [source]);
  // Preselect the annual plan once plans are loaded (derived during render, no effect needed).
  if (!selected && plans.length) setSelected((plans.find((p) => p.period === 'annual') ?? plans[0])!.id);

  const savings = annualSavingsPercent(plans);

  const buy = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const out = await purchase(repos().db, selected);
      if (out.status === 'success' && out.state.isPremium) router.back();
      else if (out.status === 'pending') Alert.alert(t('premium.pendingTitle'), t('premium.pendingBody'));
      else if (out.status === 'error') Alert.alert(t('errors.title'), t('premium.purchaseError'));
    } finally {
      setBusy(false);
    }
  };

  const doRestore = async () => {
    setBusy(true);
    try {
      const s = await restore(repos().db);
      Alert.alert(s?.isPremium ? t('premium.restored') : t('premium.nothingToRestore'));
      if (s?.isPremium) router.back();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page
      edges={['top', 'bottom']}
      footer={
        premium ? (
          <Button label={t('premium.manage')} variant="secondary" onPress={() => void Linking.openURL(links.manageSubscriptions)} />
        ) : (
          <View style={{ gap: 8 }}>
            <Button label={t('premium.continue')} size="lg" onPress={() => void buy()} disabled={!storeAvailable || !selected} loading={busy} testID="buy" />
            <Text variant="caption" tone="subtle" center>
              {t('premium.legal')}
            </Text>
          </View>
        )
      }
    >
      <View style={{ alignItems: 'flex-end' }}>
        <IconAction icon="close" label={t('common.close')} onPress={() => router.back()} testID="close-paywall" />
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Icon name="diamond" size={44} color={theme.colors.accent} />
        <Serif size={28} center>
          {premium ? t('premium.active') : t('premium.headline')}
        </Serif>
        <Text tone="muted" center>
          {t('premium.subtitle')}
        </Text>
      </View>
      <Paper style={{ gap: 10 }}>
        {PREMIUM_FEATURES.map((f) => (
          <View key={f} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Icon name="checkmark-circle" size={18} color={theme.colors.success} />
            <Text variant="bodySmall" style={{ flex: 1 }}>
              {t(`premium.features.${f}`)}
            </Text>
          </View>
        ))}
      </Paper>
      {!premium ? (
        storeAvailable && plans.length ? (
          <View style={{ gap: 8 }}>
            {plans.map((p) => (
              <OptionCard
                key={p.id}
                title={t(`premium.plans.${p.period}`)}
                subtitle={`${p.priceString}${p.period === 'annual' && p.pricePerMonthString ? ` · ${t('premium.perMonth', { price: p.pricePerMonthString })}` : ''}${p.period === 'annual' && savings ? ` · ${t('premium.save', { percent: savings })}` : ''}${p.hasFreeTrial ? ` · ${t('premium.trial')}` : ''}`}
                selected={selected === p.id}
                onPress={() => setSelected(p.id)}
                role="radio"
                testID={`plan-${p.period}`}
              />
            ))}
          </View>
        ) : (
          <Paper tone="alt">
            <Text variant="bodySmall">{t('premium.storeUnavailable')}</Text>
          </Paper>
        )
      ) : null}
      <Text variant="caption" tone="subtle" center>
        {t('premium.freeForever')}
      </Text>
      {!premium ? <Button label={t('premium.restore')} variant="ghost" onPress={() => void doRestore()} disabled={busy} /> : null}
    </Page>
  );
}
