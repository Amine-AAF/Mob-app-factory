import { Button, Card, Chip, EmptyState, Icon, Row, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatDay, PrivacyToggle, TransactionCard } from '@/components/finance';
import { SelectField, Sheet } from '@/components/inputs';
import { useCategoryName, useData } from '@/hooks';
import { TRANSACTION_TYPES, type TransactionType } from '@/types';

const PAGE = 50;

export default function TransactionsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const catName = useCategoryName();
  const [search, setSearch] = useState('');
  const [type, setType] = useState<TransactionType | 'all'>('all');
  const [accountId, setAccountId] = useState<string>('all');
  const [categoryId, setCategoryId] = useState<string>('all');
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');
  const [limit, setLimit] = useState(PAGE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filter = {
    search,
    types: type === 'all' ? undefined : [type],
    accountId: accountId === 'all' ? undefined : accountId,
    categoryId: categoryId === 'all' ? undefined : categoryId,
    order,
  };
  const { data } = useData(
    async (r) => {
      const [txs, total, accounts, categories] = await Promise.all([
        r.transactions.list({ ...filter, limit }),
        r.transactions.count(filter),
        r.accounts.list({ includeArchived: true }),
        r.categories.list({ includeArchived: true }),
      ]);
      return { txs, total, accounts, categories };
    },
    [search, type, accountId, categoryId, order, limit],
  );

  const accounts = useMemo(() => new Map((data?.accounts ?? []).map((a) => [a.id, a])), [data?.accounts]);
  const categories = useMemo(() => new Map((data?.categories ?? []).map((c) => [c.id, c])), [data?.categories]);
  const activeFilters = (type !== 'all' ? 1 : 0) + (accountId !== 'all' ? 1 : 0) + (categoryId !== 'all' ? 1 : 0);

  // Group rows by day for readable history.
  const rows = useMemo(() => {
    const out: ({ kind: 'day'; day: string } | { kind: 'tx'; id: string })[] = [];
    let last = '';
    for (const tx of data?.txs ?? []) {
      if (tx.date !== last) {
        out.push({ kind: 'day', day: tx.date });
        last = tx.date;
      }
      out.push({ kind: 'tx', id: tx.id });
    }
    return out;
  }, [data?.txs]);
  const txById = useMemo(() => new Map((data?.txs ?? []).map((x) => [x.id, x])), [data?.txs]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack gap={3} style={{ paddingHorizontal: theme.spacing(5), paddingTop: theme.spacing(2) }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="title" accessibilityRole="header">
            {t('tabs.transactions')}
          </Text>
          <PrivacyToggle />
        </Row>
        <Row gap={2}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, paddingHorizontal: 12, minHeight: 46 }}>
            <Icon name="search" size={18} color={theme.colors.textSubtle} />
            <TextInput
              value={search}
              onChangeText={(v) => {
                setSearch(v);
                setLimit(PAGE);
              }}
              placeholder={t('tx.searchPlaceholder')}
              placeholderTextColor={theme.colors.textSubtle}
              accessibilityLabel={t('common.search')}
              style={{ flex: 1, color: theme.colors.text, fontSize: 15 }}
              testID="tx-search"
            />
          </View>
          <Pressable onPress={() => setFiltersOpen(true)} accessibilityRole="button" accessibilityLabel={t('tx.filters')} testID="tx-filters" style={{ width: 46, height: 46, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: activeFilters ? theme.colors.primarySoft : theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}>
            <Icon name="options-outline" size={20} color={activeFilters ? theme.colors.primary : theme.colors.text} />
          </Pressable>
          <Pressable onPress={() => setOrder(order === 'desc' ? 'asc' : 'desc')} accessibilityRole="button" accessibilityLabel={order === 'desc' ? t('tx.sortNewest') : t('tx.sortOldest')} style={{ width: 46, height: 46, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}>
            <Icon name={order === 'desc' ? 'arrow-down' : 'arrow-up'} size={20} color={theme.colors.text} />
          </Pressable>
        </Row>
        {data ? (
          <Text variant="caption" tone="muted">
            {t('tx.count', { count: data.total })}
          </Text>
        ) : null}
      </Stack>

      <FlatList
        data={rows}
        keyExtractor={(r) => (r.kind === 'day' ? `d-${r.day}` : r.id)}
        contentContainerStyle={{ paddingHorizontal: theme.spacing(5), paddingBottom: 120 }}
        ListEmptyComponent={
          data ? (
            data.accounts.length === 0 ? (
              <EmptyState icon="wallet-outline" title={t('tx.needAccount')} action={<Button label={t('accounts.new')} icon="add" size="md" onPress={() => router.push('/accounts/edit')} />} />
            ) : (
              <EmptyState icon="search-outline" title={search || activeFilters ? t('tx.empty') : t('home.noTransactions')} message={search || activeFilters ? t('tx.emptyBody') : t('home.noTransactionsBody')} />
            )
          ) : undefined
        }
        renderItem={({ item }) => {
          if (item.kind === 'day')
            return (
              <Text variant="label" tone="muted" style={{ marginTop: theme.spacing(4), marginBottom: theme.spacing(1) }}>
                {formatDay(item.day)}
              </Text>
            );
          const tx = txById.get(item.id)!;
          const cat = tx.categoryId ? categories.get(tx.categoryId) : undefined;
          return <TransactionCard tx={tx} category={cat} categoryLabel={tx.categoryId ? catName(cat) : ''} account={accounts.get(tx.accountId)} toAccount={tx.toAccountId ? accounts.get(tx.toAccountId) : undefined} onPress={() => router.push(`/transaction?id=${tx.id}`)} />;
        }}
        ListFooterComponent={data && data.txs.length < data.total ? <Button label={t('tx.loadMore')} variant="secondary" size="md" onPress={() => setLimit(limit + PAGE)} /> : undefined}
      />

      {data && data.accounts.length > 0 ? (
        <Pressable
          onPress={() => router.push('/transaction?type=expense')}
          accessibilityRole="button"
          accessibilityLabel={t('tx.newExpense')}
          testID="fab-add"
          style={{ position: 'absolute', right: 20, bottom: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 4 }}
        >
          <Icon name="add" size={30} color={theme.colors.onPrimary} />
        </Pressable>
      ) : null}

      <Sheet visible={filtersOpen} onClose={() => setFiltersOpen(false)} title={t('tx.filters')}>
        <Stack gap={4} style={{ paddingHorizontal: theme.spacing(5), paddingBottom: theme.spacing(6) }}>
          <Row gap={2} wrap>
            <Chip label={t('tx.allTypes')} selected={type === 'all'} onPress={() => setType('all')} />
            {TRANSACTION_TYPES.map((k) => (
              <Chip key={k} label={t(`tx.types.${k}`)} selected={type === k} onPress={() => setType(k)} />
            ))}
          </Row>
          <SelectField label={t('tx.account')} value={accountId} onChange={setAccountId} options={[{ value: 'all', label: t('tx.allAccounts') }, ...(data?.accounts ?? []).map((a) => ({ value: a.id, label: a.name, icon: a.icon as never, color: a.color }))]} />
          <SelectField
            label={t('tx.category')}
            value={categoryId}
            onChange={setCategoryId}
            searchable
            options={[{ value: 'all', label: t('tx.allCategories') }, ...(data?.categories ?? []).map((c) => ({ value: c.id, label: catName(c), subtitle: t(`tx.types.${c.kind}`), icon: c.icon as never, color: c.color }))]}
          />
          <Card tone="alt">
            <Button
              label={t('common.done')}
              size="md"
              onPress={() => {
                setLimit(PAGE);
                setFiltersOpen(false);
              }}
            />
          </Card>
        </Stack>
      </Sheet>
    </SafeAreaView>
  );
}
