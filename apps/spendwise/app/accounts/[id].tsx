import { Button, Card, EmptyState, IconButton, Row, Screen, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { TransactionCard } from '@/components/finance';
import { useCategoryName, useData, useMoney } from '@/hooks';

export default function AccountDetail() {
  const { t } = useTranslation();
  const money = useMoney();
  const catName = useCategoryName();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useData(
    async (r) => {
      const [account, balances, txs, accounts, categories] = await Promise.all([r.accounts.get(id), r.accounts.balances(), r.transactions.list({ accountId: id, limit: 200 }), r.accounts.list({ includeArchived: true }), r.categories.list({ includeArchived: true })]);
      return { account, balance: balances[id] ?? 0, txs, accounts: new Map(accounts.map((a) => [a.id, a])), categories: new Map(categories.map((c) => [c.id, c])) };
    },
    [id],
  );
  const a = data?.account;
  if (data && !a) return <EmptyState icon="alert-circle-outline" title={t('errors.not_found')} />;

  return (
    <Screen edges={[]} footer={a && !a.archived ? <Button label={t('tx.newExpense')} icon="add" onPress={() => router.push('/transaction?type=expense')} /> : undefined}>
      <RouterStack.Screen options={{ title: a?.name ?? '', headerRight: () => <IconButton icon="create-outline" label={t('common.edit')} onPress={() => router.push(`/accounts/edit?id=${id}`)} /> }} />
      {a ? (
        <Card tone="primary">
          <Text variant="label" tone="primary">
            {t('accounts.balance')}
          </Text>
          <Text variant="display" tone={data!.balance < 0 ? 'danger' : 'default'} testID="account-balance">
            {money(data!.balance, a.currency)}
          </Text>
          <Row gap={2}>
            <Text variant="caption" tone="muted">
              {t(`accounts.types.${a.type}`)} · {a.currency} · {t('accounts.initialBalance')}: {money(a.initialBalance, a.currency)}
            </Text>
          </Row>
        </Card>
      ) : null}
      <Text variant="heading">{t('accounts.movements')}</Text>
      {data && data.txs.length === 0 ? <EmptyState icon="receipt-outline" title={t('accounts.noMovements')} /> : null}
      <Card>
        {(data?.txs ?? []).map((tx) => {
          const cat = tx.categoryId ? data!.categories.get(tx.categoryId) : undefined;
          // For incoming transfers, show the movement from this account's point of view.
          return (
            <TransactionCard
              key={tx.id}
              tx={tx.type === 'transfer' && tx.toAccountId === id ? { ...tx, type: 'income', amount: tx.toAmount ?? tx.amount, currency: a?.currency ?? tx.currency } : tx}
              category={cat}
              categoryLabel={tx.type === 'transfer' ? t('tx.types.transfer') : tx.categoryId ? catName(cat) : ''}
              account={data!.accounts.get(tx.accountId)}
              toAccount={tx.toAccountId ? data!.accounts.get(tx.toAccountId) : undefined}
              onPress={() => router.push(`/transaction?id=${tx.id}`)}
            />
          );
        })}
      </Card>
    </Screen>
  );
}
