import { Button, Card, Row, Stack, Text } from '@factory/design-system';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ExampleChips, InfoNote, NumberField, ResultCard, ResultRow, Segmented, localizedDefault, useNumberField, type NumberFieldState } from '@/components/fields';
import { PremiumGate, TemporaryUnlockNote } from '@/components/PremiumGate';
import { Table } from '@/components/Table';
import { ToolScreen } from '@/components/ToolScreen';
import { useAdvancedAccess } from '@/hooks/useAdvancedAccess';
import { useFormat, type Formatters } from '@/hooks/useFormat';
import { useToolSession } from '@/hooks/useToolSession';
import { calculateLoan, compareLoans, simulatePrepayment, type LoanInput, type LoanResult, type PrepaymentMode } from '@/services/calculators/LoanCalculator';
import type { CalcResult } from '@/services/calculators/result';
import { ZERO } from '@/utils/decimal';

type DurationUnit = 'years' | 'months';
type Advanced = 'schedule' | 'compare' | 'prepay';

/** Reads the loan form into a LoanInput, or returns null while incomplete. */
function readLoan(principal: NumberFieldState, rate: NumberFieldState, duration: NumberFieldState, unit: DurationUnit, fees: NumberFieldState, digits: number): LoanInput | 'invalid_duration' | null {
  if (!principal.value || !rate.value || !duration.value) return null;
  const months = unit === 'years' ? duration.value.times(12) : duration.value;
  if (!months.isInteger()) return 'invalid_duration';
  return { principal: principal.value, annualRate: rate.value, months: months.toNumber(), fees: fees.value ?? ZERO, fractionDigits: digits };
}

function useLoanForm(f: Formatters) {
  const principal = useNumberField(f);
  const rate = useNumberField(f);
  const duration = useNumberField(f);
  const fees = useNumberField(f);
  const [unit, setUnit] = useState<DurationUnit>('years');
  const input = readLoan(principal, rate, duration, unit, fees, f.currencyDigits);
  return { principal, rate, duration, fees, unit, setUnit, input };
}

function LoanFields({ form, f, result, compact }: { form: ReturnType<typeof useLoanForm>; f: Formatters; result: CalcResult<LoanResult> | null; compact?: boolean }) {
  const { t } = useTranslation();
  const err = (field: string) => (result && !result.ok && result.field === field ? t(`errors.${result.issue}`) : null);
  return (
    <Stack gap={3}>
      <NumberField label={t('loan.fields.principal')} field={form.principal} suffix={f.currency} error={err('principal')} testID={compact ? 'b-principal' : 'principal'} />
      <NumberField label={t('loan.fields.rate')} field={form.rate} suffix="%" hint={compact ? undefined : t('loan.rateHint')} error={err('rate')} testID={compact ? 'b-rate' : 'rate'} />
      <Row gap={2} style={{ alignItems: 'flex-start' }}>
        <Stack style={{ flex: 1 }}>
          <NumberField label={t('loan.fields.duration')} field={form.duration} integer={form.unit === 'months'} error={form.input === 'invalid_duration' ? t('errors.not_integer') : err('duration')} testID={compact ? 'b-duration' : 'duration'} />
        </Stack>
        <Stack style={{ width: 150, paddingTop: 24 }}>
          <Segmented
            value={form.unit}
            onChange={form.setUnit}
            options={[
              { value: 'years', label: t('loan.years') },
              { value: 'months', label: t('loan.months') },
            ]}
          />
        </Stack>
      </Row>
      {!compact ? <NumberField label={t('loan.fields.fees')} field={form.fees} suffix={f.currency} hint={t('loan.feesHint')} error={err('fees')} testID="fees" /> : null}
    </Stack>
  );
}

export default function LoanScreen() {
  const { t } = useTranslation();
  const f = useFormat();
  const session = useToolSession('loan');
  const access = useAdvancedAccess();
  const form = useLoanForm(f);
  const input = typeof form.input === 'object' ? form.input : null;
  const result = input ? calculateLoan(input) : null;
  const [advanced, setAdvanced] = useState<Advanced>('schedule');

  useEffect(() => {
    if (!result?.ok || !input) return session.setResult(null);
    session.setResult({
      expression: '',
      result: result.value.monthlyPayment.toString(),
      payload: {
        currency: f.currency,
        inputs: [
          { label: 'loan.fields.principal', value: input.principal.toString(), kind: 'money' },
          { label: 'loan.fields.rate', value: input.annualRate.toString(), kind: 'percent' },
          { label: 'loan.durationMonths', value: String(input.months), kind: 'integer' },
        ],
        outputs: [
          { label: 'loan.results.monthly', value: result.value.monthlyPayment.toString(), kind: 'money' },
          { label: 'loan.results.totalInterest', value: result.value.totalInterest.toString(), kind: 'money' },
          { label: 'loan.results.totalCost', value: result.value.totalCost.toString(), kind: 'money' },
        ],
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on computed values
  }, [result?.ok ? `${result.value.monthlyPayment}|${result.value.totalCost}` : null, f.currency]);

  const example = () => {
    form.principal.setText('200000');
    form.rate.setText(localizedDefault(f, '3.5'));
    form.duration.setText('20');
    form.setUnit('years');
  };

  return (
    <ToolScreen tool="loan">
      <InfoNote icon="alert-circle-outline" tone="warning" text={t('loan.disclaimer')} />
      <Card>
        <LoanFields form={form} f={f} result={result} />
      </Card>

      {result?.ok ? (
        <Stack gap={2}>
          <ResultCard label={t('loan.results.monthly')} value={f.money(result.value.monthlyPayment)} caption={t('loan.results.payments', { count: result.value.months })} testID="result" />
          <Card>
            <ResultRow label={t('loan.results.totalPaid')} value={f.money(result.value.totalPaid)} />
            <ResultRow label={t('loan.results.totalInterest')} value={f.money(result.value.totalInterest)} tone="danger" />
            {input?.fees?.gt(0) ? <ResultRow label={t('loan.fields.fees')} value={f.money(input.fees)} /> : null}
            <ResultRow label={t('loan.results.totalCost')} value={f.money(result.value.totalCost)} strong />
          </Card>

          <Card>
            <Text variant="subheading">{t('loan.byYear')}</Text>
            <Table
              testID="year-table"
              headers={[t('loan.table.year'), t('loan.table.interest'), t('loan.table.principal'), t('loan.table.balance')]}
              rows={result.value.years.map((y) => [String(y.year), f.money(y.interest), f.money(y.principal), f.money(y.endBalance)])}
            />
          </Card>

          <Text variant="heading" accessibilityRole="header">
            {t('loan.advanced')}
          </Text>
          <Segmented
            testID="loan-advanced"
            value={advanced}
            onChange={setAdvanced}
            options={[
              { value: 'schedule', label: t('loan.tabs.schedule') },
              { value: 'compare', label: t('loan.tabs.compare') },
              { value: 'prepay', label: t('loan.tabs.prepay') },
            ]}
          />
          {access.temporaryUntil ? <TemporaryUnlockNote until={access.temporaryUntil} /> : null}
          {!access.unlocked ? (
            <PremiumGate title={t(`loan.gate.${advanced}.title`)} description={t(`loan.gate.${advanced}.description`)} source={`loan_${advanced}`} />
          ) : advanced === 'schedule' ? (
            <Schedule result={result.value} f={f} />
          ) : advanced === 'compare' && input ? (
            <Compare base={input} f={f} />
          ) : input ? (
            <Prepay base={input} f={f} />
          ) : null}
        </Stack>
      ) : null}

      <ExampleChips examples={[{ label: t('loan.examples.mortgage'), apply: example }]} />
      <InfoNote text={t('loan.assumptions')} />
    </ToolScreen>
  );
}

function Schedule({ result, f }: { result: LoanResult; f: Formatters }) {
  const { t } = useTranslation();
  const [shown, setShown] = useState(24);
  const rows = result.schedule.slice(0, shown);
  return (
    <Card testID="schedule">
      <Table
        headers={[t('loan.table.month'), t('loan.table.interest'), t('loan.table.principal'), t('loan.table.balance')]}
        rows={rows.map((r) => [String(r.month), f.money(r.interest), f.money(r.principal), f.money(r.balance)])}
      />
      {shown < result.schedule.length ? <Button label={t('loan.showMore', { count: Math.min(60, result.schedule.length - shown) })} variant="ghost" size="md" onPress={() => setShown((n) => n + 60)} /> : null}
      <Text variant="caption" tone="subtle">
        {t('loan.lastPaymentNote', { amount: f.money(result.schedule[result.schedule.length - 1]?.payment ?? ZERO) })}
      </Text>
    </Card>
  );
}

function Compare({ base, f }: { base: LoanInput; f: Formatters }) {
  const { t } = useTranslation();
  const form = useLoanForm(f);
  const other = typeof form.input === 'object' ? form.input : null;
  const r = other ? compareLoans(base, { ...other, fees: ZERO }) : null;
  const signed = (v: typeof ZERO) => `${v.isNegative() ? '−' : '+'}${f.money(v.abs())}`;
  return (
    <Stack gap={2} testID="compare">
      <Card>
        <Text variant="subheading">{t('loan.compare.scenarioB')}</Text>
        <LoanFields form={form} f={f} result={r && !r.ok ? { ok: false, issue: r.issue, field: r.field?.replace(/^b\./, '') } : null} compact />
      </Card>
      {r?.ok ? (
        <Card tone="alt">
          <Table
            headers={['', 'A', 'B']}
            rows={[
              [t('loan.results.monthly'), f.money(r.value.a.monthlyPayment), f.money(r.value.b.monthlyPayment)],
              [t('loan.results.totalInterest'), f.money(r.value.a.totalInterest), f.money(r.value.b.totalInterest)],
              [t('loan.compare.months'), String(r.value.a.months), String(r.value.b.months)],
            ]}
          />
          <ResultRow label={t('loan.compare.paymentDiff')} value={signed(r.value.paymentDifference)} />
          <ResultRow label={t('loan.compare.interestDiff')} value={signed(r.value.interestDifference)} tone={r.value.interestDifference.gt(0) ? 'danger' : 'success'} strong />
        </Card>
      ) : null}
    </Stack>
  );
}

function Prepay({ base, f }: { base: LoanInput; f: Formatters }) {
  const { t } = useTranslation();
  const amount = useNumberField(f);
  const after = useNumberField(f, '12');
  const [mode, setMode] = useState<PrepaymentMode>('reduce_term');
  const month = after.value?.isInteger() ? after.value.toNumber() : NaN;
  const r = amount.value && after.value ? simulatePrepayment(base, { afterMonth: month, amount: amount.value, mode }) : null;
  return (
    <Stack gap={2} testID="prepay">
      <Card>
        <NumberField label={t('loan.prepay.amount')} field={amount} suffix={f.currency} error={r && !r.ok && r.field === 'amount' ? t(`errors.${r.issue}`) : null} testID="prepay-amount" />
        <NumberField label={t('loan.prepay.afterMonth')} field={after} integer error={r && !r.ok && r.field === 'afterMonth' ? t('loan.prepay.monthRange', { max: base.months - 1 }) : null} testID="prepay-month" />
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: 'reduce_term', label: t('loan.prepay.reduceTerm') },
            { value: 'reduce_payment', label: t('loan.prepay.reducePayment') },
          ]}
        />
      </Card>
      {r?.ok ? (
        <Card tone="alt">
          <ResultRow label={t('loan.prepay.interestSaved')} value={f.money(r.value.interestSaved)} tone="success" strong />
          {mode === 'reduce_term' ? <ResultRow label={t('loan.prepay.monthsSaved')} value={String(r.value.monthsSaved)} /> : <ResultRow label={t('loan.prepay.newPayment')} value={f.money(r.value.newMonthlyPayment)} />}
          <ResultRow label={t('loan.prepay.newEnd')} value={t('loan.results.payments', { count: r.value.withPrepayment.months })} />
          <Text variant="caption" tone="subtle">
            {t('loan.prepay.note')}
          </Text>
        </Card>
      ) : null}
    </Stack>
  );
}
