import { Button, Card, EmptyState, IconButton, ListRow, ProgressBar, Row, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { SelectField, TextField } from '@/components/forms';
import { Bars, ColumnChart, Kpi, KpiGrid, Notice, PremiumCard, ScreenTitle, StatusBadge } from '@/components/ui';
import { inEventCurrency, spendingEvolution, summarizeBudget } from '@/domain/budget';
import { minorToInput, parseAmount, totalsToList } from '@/domain/money';
import { BUDGET_CATEGORIES, type BudgetCategory } from '@/domain/types';
import { exportReport } from '@/features/exporter';
import { mutate, useSnapshot } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { useIsPremium } from '@/store/session';

export default function Budget() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: snap } = useSnapshot(id);
  const [envCat, setEnvCat] = useState<BudgetCategory | null>(null);
  const [envAmount, setEnvAmount] = useState('');
  if (!snap) return null;
  const e = snap.event;
  const cur = e.currency;
  const b = summarizeBudget({ currency: cur, initialMinor: e.budgetMinor, envelopes: snap.envelopes, expenses: snap.expenses });
  const m = (n: number) => fmt.money(n, cur);
  const unconverted = totalsToList(b.unconverted);
  const evolution = spendingEvolution(snap.expenses, cur);
  const vendors = new Map(snap.vendors.map((v) => [v.id, v.name]));

  const saveEnvelope = async () => {
    if (!envCat) return;
    const minor = parseAmount(envAmount || '0', cur);
    if (minor == null) return Alert.alert(t('errors.expense.amount'));
    await mutate((r) => r.budget.setEnvelope(e.id, envCat, minor));
    setEnvCat(null);
    setEnvAmount('');
  };

  return (
    <Screen
      edges={[]}
      footer={<Button label={t('budget.addExpense')} icon="add" onPress={() => router.push({ pathname: '/event/[id]/expense', params: { id } })} testID="expense-add" />}
    >
      <ScreenTitle title={t('modules.budget')} right={<IconButton icon="share-outline" label={t('reports.export')} onPress={() => void exportReport({ t, snap, kind: 'expenses', format: 'pdf', isPremium })} />} />
      <KpiGrid>
        <Kpi icon="flag" value={m(b.initialMinor)} label={t('budget.initial')} onPress={() => router.push({ pathname: '/event/new', params: { id } })} />
        <Kpi icon="calculator" tone="accent" value={m(b.estimatedMinor)} label={t('budget.estimated')} />
        <Kpi icon="card" tone="warning" value={m(b.spentMinor)} label={t('budget.spent')} />
        <Kpi icon="wallet" tone={b.remainingMinor < 0 ? 'danger' : 'success'} value={m(b.remainingMinor)} label={t('budget.remaining')} />
      </KpiGrid>
      {b.initialMinor > 0 ? (
        <Card>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text variant="subheading">{t('budget.committed')}</Text>
            <Text tone={b.overBudget ? 'danger' : 'muted'}>{fmt.percent(b.committedMinor / b.initialMinor)}</Text>
          </Row>
          <ProgressBar progress={b.committedMinor / b.initialMinor} tone={b.overBudget ? 'accent' : 'primary'} label={t('budget.committed')} />
          {b.unpaidMinor > 0 ? (
            <Text variant="caption" tone="muted">
              {t('budget.unpaid', { amount: m(b.unpaidMinor) })}
            </Text>
          ) : null}
        </Card>
      ) : (
        <Notice>{t('budget.noInitial')}</Notice>
      )}
      {b.overBudget ? <Notice tone="danger" icon="warning">{t('budget.overBudget', { amount: m(-b.remainingMinor) })}</Notice> : null}
      {unconverted.length ? (
        <Notice tone="warning" icon="swap-horizontal" title={t('budget.otherCurrencies')}>
          {t('budget.unconvertedNote', { amounts: unconverted.map((x) => fmt.money(x.amountMinor, x.currency)).join(', ') })}
        </Notice>
      ) : null}

      <SectionHeader title={t('budget.byCategory')} />
      {isPremium ? (
        <Card>
          {b.byCategory.length ? (
            <Bars
              rows={b.byCategory.map((l) => ({
                label: t(`budgetCategory.${l.category}`),
                value: Math.max(l.estimatedMinor, l.spentMinor),
                max: Math.max(l.plannedMinor, l.estimatedMinor, l.spentMinor),
                display: l.plannedMinor ? `${m(Math.max(l.estimatedMinor, l.spentMinor))} / ${m(l.plannedMinor)}` : m(Math.max(l.estimatedMinor, l.spentMinor)),
                tone: l.plannedMinor && Math.max(l.estimatedMinor, l.spentMinor) > l.plannedMinor ? 'danger' : 'primary',
              }))}
            />
          ) : (
            <Text tone="muted">{t('budget.noCategories')}</Text>
          )}
          {evolution.length > 1 ? (
            <>
              <Text variant="label" tone="muted" style={{ marginTop: 12 }}>
                {t('budget.evolution')}
              </Text>
              <ColumnChart points={evolution.slice(-8).map((p) => ({ label: fmt.dayShort(`${p.month}-01`).split(' ').slice(-1)[0] ?? p.month, value: p.cumulativeMinor, display: m(p.cumulativeMinor) }))} />
            </>
          ) : null}
        </Card>
      ) : (
        <>
          <Card>
            {b.byCategory.map((l) => (
              <Row key={l.category} style={{ justifyContent: 'space-between', minHeight: 36 }}>
                <Text variant="bodySmall">{t(`budgetCategory.${l.category}`)}</Text>
                <Text variant="bodySmall" tone="muted">{`${m(Math.max(l.estimatedMinor, l.spentMinor))}${l.plannedMinor ? ` / ${m(l.plannedMinor)}` : ''}`}</Text>
              </Row>
            ))}
          </Card>
          <PremiumCard feature="advancedBudget" source="budget" compact />
        </>
      )}

      <SectionHeader title={t('budget.envelopes')} />
      <Card>
        {snap.envelopes.map((env) => (
          <Row key={env.id} style={{ justifyContent: 'space-between', minHeight: 40 }}>
            <Text variant="bodySmall" style={{ flex: 1 }}>
              {t(`budgetCategory.${env.category}`)}
            </Text>
            <Text variant="bodySmall" tone="muted">
              {m(env.plannedMinor)}
            </Text>
            <IconButton
              icon="create-outline"
              label={t('common.edit')}
              size={18}
              onPress={() => {
                setEnvCat(env.category);
                setEnvAmount(minorToInput(env.plannedMinor, cur));
              }}
            />
          </Row>
        ))}
        <Row gap={2} style={{ alignItems: 'flex-end' }}>
          <View style={{ flex: 3 }}>
            <SelectField label={t('budget.category')} value={envCat} options={BUDGET_CATEGORIES.map((c) => ({ value: c, label: t(`budgetCategory.${c}`) }))} onChange={setEnvCat} />
          </View>
          <View style={{ flex: 2 }}>
            <TextField label={`${t('budget.planned')} (${cur})`} value={envAmount} onChangeText={setEnvAmount} keyboardType="decimal-pad" />
          </View>
        </Row>
        <Button size="md" variant="secondary" label={t('budget.setEnvelope')} onPress={() => void saveEnvelope()} disabled={!envCat} />
      </Card>

      <SectionHeader title={`${t('budget.expenses')} (${snap.expenses.length})`} />
      {snap.expenses.length === 0 ? (
        <EmptyState icon="receipt-outline" title={t('budget.noExpenses')} message={t('budget.noExpensesBody')} />
      ) : (
        <Card>
          {snap.expenses.map((x) => {
            const conv = x.currency !== cur ? inEventCurrency(x, cur) : null;
            const amount = Math.max(x.actualMinor, x.estimatedMinor);
            return (
              <ListRow
                key={x.id}
                title={x.title}
                subtitle={[t(`budgetCategory.${x.category}`), x.vendorId ? vendors.get(x.vendorId) : null, t(`payment.${x.paymentStatus}`), x.dueDate && x.paymentStatus !== 'paid' ? t('expense.dueOn', { date: fmt.dayShort(x.dueDate) }) : null].filter(Boolean).join(' · ')}
                right={
                  <Stack gap={0} style={{ alignItems: 'flex-end' }}>
                    <Text variant="bodySmall" style={{ fontWeight: '700' }}>
                      {fmt.money(amount, x.currency)}
                    </Text>
                    {x.currency !== cur ? (
                      <Text variant="caption" tone={conv ? 'subtle' : 'warning'}>
                        {conv ? `≈ ${m(Math.max(conv.actual, conv.estimated))}` : t('budget.notConverted')}
                      </Text>
                    ) : null}
                  </Stack>
                }
                onPress={() => router.push({ pathname: '/event/[id]/expense', params: { id, expenseId: x.id } })}
              />
            );
          })}
        </Card>
      )}
      <Row gap={2} wrap>
        <Button size="md" variant="ghost" icon="document-outline" label={t('reports.csv')} onPress={() => void exportReport({ t, snap, kind: 'expenses', format: 'csv', isPremium })} />
        <StatusBadge kind="event" status={e.status} />
      </Row>
    </Screen>
  );
}
