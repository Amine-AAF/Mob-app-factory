import { annualSavingsPercent } from '@factory/monetization';
import { Badge, Button, Card, Icon, IconButton, OptionCard, Row, Screen, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking } from 'react-native';

import { repos } from '@/database';
import { FREE_LIMITS } from '@/domain/limits';
import { track } from '@/services/analytics';
import { loadPlans, purchase, restore, subscriptionsConfigured } from '@/services/monetization';
import { useSession } from '@/store/session';

const BENEFITS: { icon: IconName; key: string }[] = [
  { icon: 'paw-outline', key: 'pets' },
  { icon: 'time-outline', key: 'history' },
  { icon: 'folder-open-outline', key: 'documents' },
  { icon: 'stats-chart-outline', key: 'stats' },
  { icon: 'document-text-outline', key: 'exports' },
  { icon: 'list-outline', key: 'templates' },
  { icon: 'eye-off-outline', key: 'ads' },
];

/**
 * Premium paywall. Prices are always the localized store prices (never hard-coded).
 * Billing is handled by Google Play; cancelling is done from the Play Store.
 */
export default function Paywall() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const { plans, storeAvailable, entitlement } = useSession();
  const [picked, setSelected] = useState<string | null>(null);
  // Default to the annual plan once plans are loaded (derived, not stored).
  const selected = picked ?? (plans.find((p) => p.period === 'annual') ?? plans[0])?.id ?? null;
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    track('premium_paywall_viewed', { source: source ?? 'unknown' });
    loadPlans().catch(() => undefined);
  }, [source]);


  const savings = annualSavingsPercent(plans);

  const buy = async () => {
    if (!selected) return;
    setBusy(true);
    const outcome = await purchase(repos().db, selected);
    setBusy(false);
    if (outcome.status === 'success' && outcome.state.isPremium) {
      Alert.alert(t('premium.welcomeTitle'), t('premium.welcomeBody'));
      router.back();
    } else if (outcome.status === 'pending') Alert.alert(t('premium.pendingTitle'), t('premium.pendingBody'));
    else if (outcome.status === 'error') Alert.alert(t('premium.errorTitle'), t('premium.errorBody'));
  };

  const restorePurchases = async () => {
    setBusy(true);
    const state = await restore(repos().db).catch(() => null);
    setBusy(false);
    Alert.alert(state?.isPremium ? t('premium.restored') : t('premium.nothingToRestore'));
    if (state?.isPremium) router.back();
  };

  return (
    <Screen
      edges={['top']}
      footer={
        entitlement.isPremium ? (
          <Button label={t('premium.manage')} variant="secondary" onPress={() => Linking.openURL('https://play.google.com/store/account/subscriptions')} />
        ) : (
          <Stack gap={2}>
            <Button label={t('premium.continue')} onPress={buy} loading={busy} disabled={!storeAvailable || !selected} testID="buy" />
            <Button label={t('premium.restore')} variant="ghost" onPress={restorePurchases} disabled={!subscriptionsConfigured() || busy} />
          </Stack>
        )
      }
    >
      <Row style={{ justifyContent: 'flex-end' }}>
        <IconButton icon="close" label={t('common.close')} onPress={() => router.back()} />
      </Row>
      <Text variant="display">{t('premium.headline')}</Text>
      {source === 'pet_limit' ? (
        <Card tone="accent">
          <Text variant="bodySmall">{t('premium.petLimit', { count: FREE_LIMITS.pets })}</Text>
        </Card>
      ) : null}
      <Card>
        {BENEFITS.map((b) => (
          <Row key={b.key} gap={3} style={{ paddingVertical: 4 }}>
            <Icon name={b.icon} size={20} color={theme.colors.primary} />
            <Text style={{ flex: 1 }}>{t(`premium.benefits.${b.key}`)}</Text>
          </Row>
        ))}
      </Card>

      {entitlement.isPremium ? (
        <Card tone="accent">
          <Text variant="subheading">{t('premium.active')}</Text>
          <Text variant="bodySmall">{t('premium.thanks')}</Text>
        </Card>
      ) : !storeAvailable ? (
        <Card tone="alt">
          <Text variant="subheading">{t('premium.unavailableTitle')}</Text>
          <Text variant="bodySmall" tone="muted">
            {t('premium.unavailableBody')}
          </Text>
        </Card>
      ) : (
        <Stack gap={2}>
          {plans.map((p) => (
            <OptionCard
              key={p.id}
              title={t(`premium.plans.${p.period}`)}
              subtitle={[p.priceString, p.period === 'annual' && p.pricePerMonthString ? t('premium.perMonth', { price: p.pricePerMonthString }) : null, p.hasFreeTrial ? t('premium.trial') : null].filter(Boolean).join(' · ')}
              selected={selected === p.id}
              onPress={() => setSelected(p.id)}
              testID={`plan-${p.period}`}
            />
          ))}
          {savings ? <Badge label={t('premium.save', { percent: savings })} tone="success" /> : null}
        </Stack>
      )}
      <Text variant="caption" tone="subtle">
        {t('premium.legal')}
      </Text>
    </Screen>
  );
}
