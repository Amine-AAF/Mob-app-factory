import { Badge, Card, EmptyState, Screen, Stack, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Fab, ItemRow, Notice, ScreenHeader } from '@/components/ui';
import { EXPENSE_ICONS, tintFor } from '@/config/icons';
import { repos } from '@/database';
import { sumByCurrency } from '@/domain/money';
import { monthlyEquivalentMinor } from '@/domain/recurringExpenses';
import { EXPENSE_CATEGORIES } from '@/domain/types';
import { useData } from '@/hooks/useData';
import { useActiveHome } from '@/hooks/useHome';
import { fmt } from '@/i18n';

export default function RecurringExpenses() {
  const { t } = useTranslation();
  const home = useActiveHome();
  const { data } = useData(() => (home ? repos().expenses.listRecurring(home.id) : Promise.resolve([])), [home?.id]);
  const monthly = sumByCurrency((data ?? []).filter((r) => r.active).map((r) => ({ currency: r.currency, amountMinor: monthlyEquivalentMinor(r.amountMinor, r.frequency) })), home?.currency);

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <ScreenHeader title={t('recurring.title')} subtitle={t('recurring.subtitle')} back />
        {data?.length ? (
          <Card>
            <Text variant="label" tone="subtle">
              {t('recurring.monthlyEquivalent')}
            </Text>
            <Text variant="title">{fmt.moneyList(monthly)}</Text>
          </Card>
        ) : null}
        <Notice icon="repeat-outline">{t('recurring.hint')}</Notice>
        {data && data.length === 0 ? <EmptyState icon="repeat-outline" title={t('recurring.emptyTitle')} message={t('recurring.emptyMessage')} /> : null}
        <Stack gap={2}>
          {data?.map((r) => (
            <ItemRow
              key={r.id}
              icon={EXPENSE_ICONS[r.category]}
              tint={tintFor(EXPENSE_CATEGORIES, r.category)}
              title={r.title}
              subtitle={r.active ? `${t(`frequencies.${r.frequency}`)} · ${t('recurring.next', { date: fmt.day(r.nextDate) })}` : t('recurring.ended')}
              right={r.active ? <Text variant="subheading">{fmt.money(r)}</Text> : <Badge label={t('recurring.inactive')} tone="neutral" />}
              onPress={() => router.push({ pathname: '/expenses/recurring-edit', params: { id: r.id } })}
            />
          ))}
        </Stack>
        <View style={{ height: 72 }} />
      </Screen>
      <Fab label={t('recurring.add')} bottomInset onPress={() => router.push('/expenses/recurring-edit')} />
    </View>
  );
}
