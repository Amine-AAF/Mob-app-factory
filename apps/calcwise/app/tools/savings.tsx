import { Card, Stack, Text } from '@factory/design-system';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ExampleChips, InfoNote, NumberField, ResultCard, ResultRow, Segmented, useNumberField } from '@/components/fields';
import { GrowthChart } from '@/components/GrowthChart';
import { PremiumGate, TemporaryUnlockNote } from '@/components/PremiumGate';
import { Table } from '@/components/Table';
import { ToolScreen } from '@/components/ToolScreen';
import { useAdvancedAccess } from '@/hooks/useAdvancedAccess';
import { useFormat } from '@/hooks/useFormat';
import { useToolSession } from '@/hooks/useToolSession';
import { calculateSavings, type Compounding, type DepositTiming } from '@/services/calculators/SavingsCalculator';
import { ZERO } from '@/utils/decimal';

export default function SavingsScreen() {
  const { t } = useTranslation();
  const f = useFormat();
  const session = useToolSession('savings');
  const access = useAdvancedAccess();
  const initial = useNumberField(f);
  const monthly = useNumberField(f);
  const rate = useNumberField(f);
  const years = useNumberField(f);
  const [compounding, setCompounding] = useState<Compounding>('monthly');
  const [timing, setTiming] = useState<DepositTiming>('end');

  const months = years.value ? years.value.times(12) : null;
  const durationError = months && !months.isInteger() ? t('savings.durationWhole') : null;
  const ready = rate.value && months && months.isInteger() && (initial.value || monthly.value);
  const r = ready && rate.value && months ? calculateSavings({ initial: initial.value ?? ZERO, monthly: monthly.value ?? ZERO, annualRate: rate.value, months: months.toNumber(), compounding, timing }) : null;
  const err = (field: string) => (r && !r.ok && r.field === field ? t(`errors.${r.issue}`) : null);

  useEffect(() => {
    if (!r?.ok || !rate.value || !months) return session.setResult(null);
    session.setResult({
      expression: '',
      result: r.value.finalBalance.toString(),
      payload: {
        currency: f.currency,
        inputs: [
          { label: 'savings.fields.initial', value: (initial.value ?? ZERO).toString(), kind: 'money' },
          { label: 'savings.fields.monthly', value: (monthly.value ?? ZERO).toString(), kind: 'money' },
          { label: 'savings.fields.rate', value: rate.value.toString(), kind: 'percent' },
          { label: 'savings.durationMonths', value: months.toString(), kind: 'integer' },
        ],
        outputs: [
          { label: 'savings.results.final', value: r.value.finalBalance.toString(), kind: 'money' },
          { label: 'savings.results.deposited', value: r.value.totalDeposited.toString(), kind: 'money' },
          { label: 'savings.results.interest', value: r.value.totalInterest.toString(), kind: 'money' },
        ],
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on computed values
  }, [r?.ok ? r.value.finalBalance.toString() : null, f.currency]);

  const example = () => {
    initial.setText('1000');
    monthly.setText('100');
    rate.setText('5');
    years.setText('10');
    setCompounding('monthly');
    setTiming('end');
  };

  // Cumulative deposits per year for the chart (balance = deposits + interest).
  const bars = r?.ok
    ? (() => {
        let deposited = initial.value ?? ZERO;
        return r.value.years.map((y) => {
          deposited = deposited.plus(y.deposited);
          return { label: String(y.year), base: deposited.toNumber(), growth: y.balance.minus(deposited).toNumber() };
        });
      })()
    : [];

  return (
    <ToolScreen tool="savings">
      <Card>
        <Stack gap={3}>
          <NumberField label={t('savings.fields.initial')} field={initial} suffix={f.currency} error={err('initial')} testID="initial" />
          <NumberField label={t('savings.fields.monthly')} field={monthly} suffix={f.currency} error={err('monthly')} testID="monthly" />
          <NumberField label={t('savings.fields.rate')} field={rate} suffix="%" allowNegative hint={t('savings.rateHint')} error={err('rate')} testID="rate" />
          <NumberField label={t('savings.fields.years')} field={years} hint={t('savings.yearsHint')} error={durationError ?? err('duration')} testID="years" />
        </Stack>
      </Card>

      <Card>
        <Text variant="subheading">{t('savings.assumptionsTitle')}</Text>
        <Text variant="caption" tone="muted">
          {t('savings.fields.compounding')}
        </Text>
        <Segmented
          testID="compounding"
          value={compounding}
          onChange={setCompounding}
          options={[
            { value: 'monthly', label: t('savings.compounding.monthly') },
            { value: 'quarterly', label: t('savings.compounding.quarterly') },
            { value: 'annually', label: t('savings.compounding.annually') },
          ]}
        />
        <Text variant="caption" tone="muted">
          {t('savings.fields.timing')}
        </Text>
        <Segmented
          testID="timing"
          value={timing}
          onChange={setTiming}
          options={[
            { value: 'end', label: t('savings.timing.end') },
            { value: 'start', label: t('savings.timing.start') },
          ]}
        />
      </Card>

      {r?.ok ? (
        <Stack gap={2}>
          <ResultCard label={t('savings.results.final')} value={f.money(r.value.finalBalance)} testID="result" />
          <Card>
            <ResultRow label={t('savings.results.deposited')} value={f.money(r.value.totalDeposited)} />
            <ResultRow label={t('savings.results.interest')} value={f.money(r.value.totalInterest)} tone="success" strong />
          </Card>
          <Card>
            <Text variant="subheading">{t('savings.progress')}</Text>
            <GrowthChart
              bars={bars}
              baseLabel={t('savings.results.deposited')}
              growthLabel={t('savings.results.interest')}
              summary={t('savings.chartSummary', { years: r.value.years.length, amount: f.money(r.value.finalBalance) })}
            />
          </Card>
          <Text variant="heading" accessibilityRole="header">
            {t('savings.byYear')}
          </Text>
          {access.temporaryUntil ? <TemporaryUnlockNote until={access.temporaryUntil} /> : null}
          {access.unlocked ? (
            <Card testID="savings-table">
              <Table
                headers={[t('loan.table.year'), t('savings.results.deposited'), t('savings.results.interest'), t('loan.table.balance')]}
                rows={r.value.years.map((y) => [String(y.year), f.money(y.deposited), f.money(y.interest), f.money(y.balance)])}
              />
            </Card>
          ) : (
            <PremiumGate title={t('savings.gate.title')} description={t('savings.gate.description')} source="savings_table" />
          )}
        </Stack>
      ) : null}

      <ExampleChips examples={[{ label: t('savings.examples.plan'), apply: example }]} />
      <InfoNote icon="alert-circle-outline" tone="warning" text={t('savings.disclaimer')} />
      <InfoNote text={t('savings.assumptions', { rate: rate.value ? f.percent(rate.value) : '—' })} />
    </ToolScreen>
  );
}
