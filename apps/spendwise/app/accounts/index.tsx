import { Button, Card, EmptyState, Row, Screen, Text } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { IconBubble } from '@/components/finance';
import { SwitchRow } from '@/components/inputs';
import { totalsByCurrency } from '@/features/accounts/balances';
import { useData, useMoney } from '@/hooks';
import { canAdd } from '@/services/premium';
import { useIsPremium } from '@/store/session';

export default function AccountsScreen() {
  const { t } = useTranslation();
  const money = useMoney();
  const isPremium = useIsPremium();
  const [showArchived, setShowArchived] = useState(false);
  const { data } = useData(async (r) => ({ accounts: await r.accounts.list({ includeArchived: true }), balances: await r.accounts.balances() }), []);
  const visible = (data?.accounts ?? []).filter((a) => showArchived || !a.archived);
  const active = (data?.accounts ?? []).filter((a) => !a.archived);
  const totals = data ? totalsByCurrency(data.accounts, data.balances) : {};

  function add() {
    if (!canAdd('accounts', active.length, isPremium)) router.push('/paywall?source=accounts');
    else router.push('/accounts/edit');
  }

  return (
    <Screen edges={[]} footer={<Button label={t('accounts.new')} icon="add" onPress={add} testID="account-add" />}>
      <RouterStack.Screen options={{ title: t('accounts.title') }} />
      {Object.keys(totals).length ? (
        <Card tone="primary">
          <Text variant="label" tone="primary">
            {t('accounts.total')}
          </Text>
          {Object.entries(totals).map(([c, v]) => (
            <Text key={c} variant="title">
              {money(v, c)}
            </Text>
          ))}
        </Card>
      ) : null}
      {visible.length === 0 ? <EmptyState icon="wallet-outline" title={t('home.noAccounts')} message={t('home.addFirstAccountBody')} /> : null}
      {visible.map((a) => (
        <Card key={a.id} onPress={() => router.push(`/accounts/${a.id}`)} accessibilityLabel={a.name} testID={`account-${a.id}`} style={a.archived ? { opacity: 0.6 } : undefined}>
          <Row gap={3}>
            <IconBubble icon={a.icon} color={a.color} />
            <View style={{ flex: 1 }}>
              <Text variant="subheading" numberOfLines={1}>
                {a.name}
              </Text>
              <Text variant="caption" tone="muted">
                {t(`accounts.types.${a.type}`)} · {a.currency}
                {a.archived ? ` · ${t('common.archived')}` : ''}
              </Text>
            </View>
            <Text variant="subheading" tone={(data?.balances[a.id] ?? 0) < 0 ? 'danger' : 'default'}>
              {money(data?.balances[a.id] ?? 0, a.currency)}
            </Text>
          </Row>
        </Card>
      ))}
      {(data?.accounts ?? []).some((a) => a.archived) ? <SwitchRow label={t('accounts.showArchived')} description={t('accounts.archivedNote')} value={showArchived} onChange={setShowArchived} /> : null}
    </Screen>
  );
}
