import { router, Stack as RouterStack } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SectionList, View } from 'react-native';

import { AdBanner } from '@/components/AdBanner';
import { PremiumCard } from '@/components/forms';
import { repos } from '@/database';
import { budgetStatus, totalsByCurrency } from '@/domain/budget';
import { monthKeyOf } from '@/domain/planner';
import type { ShoppingRecord } from '@/domain/types';
import { BudgetCard, BudgetSheet } from '@/features/shopping/BudgetCard';
import { monthSections } from '@/features/shopping/logic';
import { ShoppingAnalytics } from '@/features/shopping/ShoppingAnalytics';
import { useAsync } from '@/hooks/useAsync';
import { useLabels } from '@/hooks/useLabels';
import { fmt } from '@/i18n';
import { afterWrite, updateSettings } from '@/services/data';
import { clock } from '@/services/clock';
import { useIsPremium, useSettings } from '@/store/session';
import { Button, EmptyState, Fab, Loading, PressableScale, Row, Screen, SectionHeader, Stack, Text } from '@/ui/components';
import { useTheme } from '@/ui/ThemeProvider';

function PurchaseRow({ record, category }: { record: ShoppingRecord; category: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const meta = [record.brand, record.store, category].filter(Boolean).join(' · ');
  const price = fmt.money(record.price, record.currency);
  const date = fmt.day(record.purchasedOn);
  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/shopping/edit', params: { id: record.id } })}
      accessibilityRole="button"
      accessibilityLabel={t('shopping.rowA11y', { name: record.itemName, price, date })}
      style={{ paddingVertical: theme.spacing(3), borderBottomWidth: 1, borderBottomColor: theme.colors.border, minHeight: 56 }}
    >
      <Row gap={3}>
        <Stack gap={0.5} style={{ flex: 1 }}>
          <Text numberOfLines={1}>{record.itemName}</Text>
          <Text variant="bodySmall" tone="subtle" numberOfLines={1}>
            {meta ? `${meta} · ${date}` : date}
          </Text>
        </Stack>
        <Text variant="heading">{price}</Text>
      </Row>
    </PressableScale>
  );
}

export default function ShoppingScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useLabels();
  const settings = useSettings();
  const isPremium = useIsPremium();
  const [budgetOpen, setBudgetOpen] = useState(false);

  const { data } = useAsync(async () => {
    const [records, notifications] = await Promise.all([repos().shopping.list(), repos().settings.notifications()]);
    return { records, budgetAlert: notifications.find((n) => n.kind === 'budget') ?? null };
  }, []);

  const monthKey = monthKeyOf(clock.today());
  const warnPercent = data?.budgetAlert?.param || 80;
  const records = useMemo(() => data?.records ?? [], [data]);
  const status = useMemo(() => budgetStatus(records, monthKey, settings.monthlyBudget, settings.currency, warnPercent), [records, monthKey, settings.monthlyBudget, settings.currency, warnPercent]);
  const sections = useMemo(() => monthSections(records), [records]);

  const saveBudget = async (amount: number | null) => {
    await updateSettings({ monthlyBudget: amount, lastBudgetAlert: null });
    afterWrite({ notifications: true });
  };

  const add = () => router.push('/shopping/edit');

  const header = (
    <Stack gap={4} style={{ paddingBottom: theme.spacing(2) }}>
      <Text tone="muted">{t('shopping.intro')}</Text>
      <BudgetCard status={status} currency={settings.currency} monthKey={monthKey} onEdit={() => setBudgetOpen(true)} />
      {records.length > 0 ? (
        isPremium ? (
          <ShoppingAnalytics records={records} monthKey={monthKey} currency={settings.currency} labels={labels} alertsEnabled={!!data?.budgetAlert?.enabled} warnPercent={warnPercent} />
        ) : (
          <PremiumCard message={t('shopping.premiumMessage')} source="shopping" />
        )
      ) : null}
      {records.length > 0 ? <SectionHeader title={t('shopping.historyTitle')} /> : null}
    </Stack>
  );

  return (
    <Screen edges={[]} scroll={false} padded={false}>
      <RouterStack.Screen options={{ title: t('shopping.title') }} />
      <View style={{ flex: 1 }}>
        {!data ? (
          <Loading />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(r) => r.id}
            stickySectionHeadersEnabled={false}
            initialNumToRender={20}
            windowSize={9}
            removeClippedSubviews
            contentContainerStyle={{ paddingHorizontal: theme.spacing(5), paddingTop: theme.spacing(3), paddingBottom: theme.spacing(24) }}
            ListHeaderComponent={header}
            renderSectionHeader={({ section }) => (
              <Row style={{ justifyContent: 'space-between', paddingTop: theme.spacing(4), paddingBottom: theme.spacing(1) }}>
                <Text variant="title" accessibilityRole="header">
                  {fmt.monthYear(section.key)}
                </Text>
                <Text variant="bodySmall" tone="muted">
                  {totalsByCurrency(section.data)
                    .map((c) => fmt.money(c.total, c.currency))
                    .join(' · ')}
                </Text>
              </Row>
            )}
            renderItem={({ item }) => <PurchaseRow record={item} category={item.categoryId ? labels.category(item.categoryId) : ''} />}
            ListEmptyComponent={
              <EmptyState icon="bag-handle-outline" title={t('shopping.empty.title')} message={t('shopping.empty.message')} action={<Button label={t('shopping.add')} icon="add" onPress={add} />} />
            }
          />
        )}
        <Fab label={t('shopping.add')} onPress={add} testID="shopping-add" />
      </View>
      <AdBanner screen="shopping" />
      <BudgetSheet visible={budgetOpen} onClose={() => setBudgetOpen(false)} current={settings.monthlyBudget} currency={settings.currency} onSave={saveBudget} />
    </Screen>
  );
}
