import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { parseAmount, type BudgetStatus } from '@/domain/budget';
import { fmt } from '@/i18n';
import { Button, Card, Divider, Field, ProgressBar, Row, Sheet, Stack, Text } from '@/ui/components';

import { budgetTone } from './logic';

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap={0.5} style={{ flex: 1 }}>
      <Text variant="caption" tone="subtle" numberOfLines={1}>
        {label}
      </Text>
      <Text variant="heading" numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </Stack>
  );
}

/** Current month's budget: spent / budget / remaining, with gentle wording at every level. */
export function BudgetCard({ status, currency, monthKey, onEdit }: { status: BudgetStatus; currency: string; monthKey: string; onEdit: () => void }) {
  const { t } = useTranslation();
  const money = (n: number) => fmt.money(n, currency);
  const message =
    status.level === 'none'
      ? t('shopping.budget.noneMessage')
      : status.level === 'over'
        ? t('shopping.budget.overMessage', { amount: money(Math.abs(status.remaining ?? 0)) })
        : status.level === 'warning'
          ? t('shopping.budget.warningMessage', { amount: money(status.remaining ?? 0) })
          : t('shopping.budget.okMessage', { amount: money(status.remaining ?? 0) });
  return (
    <Card tone={status.level === 'none' ? 'alt' : 'surface'} testID="budget-card">
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="label" tone="accent">
          {t('shopping.budget.eyebrow', { month: fmt.monthYear(monthKey) })}
        </Text>
        <Button small variant="ghost" label={status.budget == null ? t('shopping.budget.set') : t('shopping.budget.change')} onPress={onEdit} />
      </Row>
      <Row gap={3}>
        <Figure label={t('shopping.budget.spent')} value={money(status.spent)} />
        {status.budget != null ? <Figure label={t('shopping.budget.budget')} value={money(status.budget)} /> : null}
        {status.remaining != null ? <Figure label={status.remaining < 0 ? t('shopping.budget.over') : t('shopping.budget.remaining')} value={money(Math.abs(status.remaining))} /> : null}
      </Row>
      {status.ratio != null ? <ProgressBar progress={status.ratio} tone={budgetTone(status.level)} height={8} label={t('shopping.budget.progressLabel', { percent: Math.round(status.ratio * 100) })} /> : null}
      <Text tone="muted">{message}</Text>
      {status.otherCurrencies.length > 0 ? (
        <Stack gap={1.5}>
          <Divider />
          <Text variant="caption" tone="subtle">
            {t('shopping.budget.otherCurrencies')}
          </Text>
          {status.otherCurrencies.map((c) => (
            <Row key={c.currency} style={{ justifyContent: 'space-between' }}>
              <Text variant="bodySmall">{t('shopping.purchases', { count: c.count })}</Text>
              <Text variant="bodySmall" style={{ fontWeight: '600' }}>
                {fmt.money(c.total, c.currency)}
              </Text>
            </Row>
          ))}
          <Text variant="caption" tone="subtle">
            {t('shopping.budget.noConversion', { currency })}
          </Text>
        </Stack>
      ) : null}
    </Card>
  );
}

/** Sheet to set or clear the monthly budget (in the user's main currency). */
export function BudgetSheet({ visible, onClose, current, currency, onSave }: { visible: boolean; onClose: () => void; current: number | null; currency: string; onSave: (amount: number | null) => Promise<void> }) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(current != null ? String(current) : '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Re-sync with the stored budget each time the sheet opens.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setAmount(current != null ? String(current) : '');
      setError(null);
    }
  }
  const submit = async (value: number | null) => {
    setBusy(true);
    try {
      await onSave(value);
      onClose();
    } catch {
      setError(t('common.error'));
    } finally {
      setBusy(false);
    }
  };
  const save = () => {
    const n = parseAmount(amount);
    if (n == null || n <= 0) {
      setError(t('shopping.budget.invalid'));
      return;
    }
    void submit(n);
  };
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t('shopping.budget.sheetTitle')}
      footer={
        <>
          <Button label={t('common.save')} onPress={save} loading={busy} testID="budget-save" />
          {current != null ? <Button variant="ghost" label={t('shopping.budget.clear')} onPress={() => void submit(null)} disabled={busy} /> : null}
        </>
      }
    >
      <Text tone="muted">{t('shopping.budget.sheetIntro')}</Text>
      <Field
        label={t('shopping.budget.amountLabel', { currency })}
        value={amount}
        onChangeText={(s) => {
          setAmount(s);
          setError(null);
        }}
        keyboardType="decimal-pad"
        placeholder="0"
        error={error}
        hint={t('shopping.budget.currencyHint', { currency })}
        testID="budget-amount"
      />
    </Sheet>
  );
}
