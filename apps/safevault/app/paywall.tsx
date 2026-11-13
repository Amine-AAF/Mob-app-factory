import { annualSavingsPercent } from '@factory/monetization';
import { Button, Icon, IconButton, OptionCard, Row, Screen, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Notice } from '@/components/vault';
import { FREE_LIMITS } from '@/features/monetization/plan';
import { getContext } from '@/services/context';
import { loadPlans, purchase, restorePurchases } from '@/services/monetization';
import { useApp } from '@/store/app';

const FEATURES: { icon: IconName; key: string }[] = [
  { icon: 'infinite', key: 'unlimited' },
  { icon: 'pulse', key: 'audit' },
  { icon: 'folder', key: 'categories' },
  { icon: 'time', key: 'history' },
  { icon: 'cloud-download', key: 'backup' },
  { icon: 'color-palette', key: 'personalization' },
];

export default function Paywall() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { plans, storeAvailable, entitlement } = useApp();
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'success' | 'danger' | 'warning'; text: string } | null>(null);

  useEffect(() => {
    void loadPlans();
  }, []);
  const chosen = selected ?? (plans.find((p) => p.period === 'annual') ?? plans[0])?.id ?? null;

  const savings = annualSavingsPercent(plans);

  const buy = async () => {
    if (!chosen) return;
    setBusy(true);
    setMsg(null);
    const r = await purchase(getContext().db, chosen);
    setBusy(false);
    if (r.status === 'success') router.back();
    else if (r.status === 'pending') setMsg({ tone: 'warning', text: t('premium.pending') });
    else if (r.status === 'error') setMsg({ tone: 'danger', text: t('premium.error') });
  };

  const restore = async () => {
    setBusy(true);
    const r = await restorePurchases(getContext().db);
    setBusy(false);
    setMsg(r?.isPremium ? { tone: 'success', text: t('premium.restored') } : { tone: 'warning', text: t('premium.nothingToRestore') });
  };

  return (
    <Screen
      edges={['top', 'bottom']}
      footer={
        entitlement.isPremium ? null : (
          <Stack gap={2}>
            <Button label={t('premium.subscribe')} loading={busy} disabled={!storeAvailable || !chosen} onPress={buy} />
            <Button label={t('premium.restore')} variant="ghost" size="md" onPress={restore} disabled={!storeAvailable} />
          </Stack>
        )
      }
    >
      <Row style={{ justifyContent: 'flex-end' }}>
        <IconButton icon="close" label={t('common.close')} onPress={() => router.back()} />
      </Row>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Icon name="sparkles" size={36} color={theme.colors.accent} />
        <Text variant="title" center>
          {entitlement.isPremium ? t('premium.active') : t('premium.title')}
        </Text>
        <Text tone="muted" center>
          {t('premium.subtitle')}
        </Text>
      </View>
      <Stack gap={3}>
        {FEATURES.map((f) => (
          <Row key={f.key} gap={3}>
            <Icon name={f.icon} size={20} color={theme.colors.primary} />
            <Text variant="body" style={{ flex: 1 }}>
              {t(`premium.features.${f.key}`)}
            </Text>
          </Row>
        ))}
      </Stack>
      <Text variant="caption" tone="subtle">
        {t('premium.freeIncludes', { logins: FREE_LIMITS.login, notes: FREE_LIMITS.note })}
      </Text>
      {!entitlement.isPremium ? (
        storeAvailable ? (
          <Stack gap={2}>
            {plans.map((p) => (
              <OptionCard
                key={p.id}
                title={t(`premium.periods.${p.period}`)}
                subtitle={p.period === 'annual' && savings ? `${p.priceString} · ${t('premium.save', { percent: savings })}` : p.priceString}
                selected={chosen === p.id}
                onPress={() => setSelected(p.id)}
              />
            ))}
          </Stack>
        ) : (
          <Notice tone="primary">{t('premium.unavailable')}</Notice>
        )
      ) : null}
      <Text variant="caption" tone="subtle" center>
        {t('premium.legal')}
      </Text>
      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
    </Screen>
  );
}
