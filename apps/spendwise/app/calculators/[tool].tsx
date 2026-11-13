import { Button, Card, Divider, Row, Screen, Stack, Text } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AmountInput, ChoiceChips, CurrencySelector, FormField, Segmented } from '@/components/inputs';
import { debtRepayment, monthlyBudget, paymentForMonths, salaryBreakdown, savingsGoalPlan, splitExpense, type SalaryPeriod } from '@/features/calculators/calculators';
import { useMoney } from '@/hooks';
import { maybeShowInterstitial } from '@/services/ads';
import { useIsPremium, useMainCurrency } from '@/store/session';
import { parseAmount } from '@/utils/money';

type ToolId = 'budget' | 'savings' | 'split' | 'salary' | 'debt';
const TOOLS: readonly ToolId[] = ['budget', 'savings', 'split', 'salary', 'debt'];

/** Parses an amount field; empty -> null, invalid -> undefined. */
function amountOf(value: string, currency: string): number | null | undefined {
  if (!value.trim()) return null;
  const r = parseAmount(value, currency);
  return r.ok ? r.minor : undefined;
}

const percentText = (v: string) => v.replace(',', '.').trim();

function ResultLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <Row style={{ justifyContent: 'space-between' }} gap={3}>
      <Text variant={strong ? 'subheading' : 'bodySmall'} tone={strong ? 'default' : 'muted'} style={{ flex: 1 }}>
        {label}
      </Text>
      <Text variant={strong ? 'heading' : 'subheading'}>{value}</Text>
    </Row>
  );
}

function ResultCard({ children, formula, testID }: { children: ReactNode; formula: string; testID?: string }) {
  const { t } = useTranslation();
  return (
    <Card tone="primary" testID={testID}>
      <Text variant="label" tone="primary">
        {t('calculators.result')}
      </Text>
      {children}
      <Divider />
      <Text variant="caption" tone="muted">
        {t('calculators.formula')}: {formula}
      </Text>
      <Text variant="caption" tone="subtle">
        {t('common.notFinancialAdvice')}
      </Text>
    </Card>
  );
}

function Invalid() {
  const { t } = useTranslation();
  return (
    <Text tone="warning" accessibilityLiveRegion="polite">
      {t('calculators.invalid')}
    </Text>
  );
}

/* ------------------------------------------------------------------ Tools */

function BudgetTool({ currency, onResult }: { currency: string; onResult: () => void }) {
  const { t } = useTranslation();
  const money = useMoney();
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState<string[]>(['']);
  const [pct, setPct] = useState('10');
  const inc = amountOf(income, currency);
  const exp = expenses.map((e) => amountOf(e, currency));
  const valid = typeof inc === 'number' && exp.every((e) => e !== undefined);
  const res = valid ? monthlyBudget({ income: inc, expenses: exp.filter((e): e is number => e !== null), savingsPct: percentText(pct) || '0' }) : null;
  const ok = res?.ok ? res : null;
  useEffect(() => {
    if (ok) onResult();
  }, [ok, onResult]);
  return (
    <Stack gap={3}>
      <AmountInput label={t('calculators.budget.income')} value={income} onChange={setIncome} currency={currency} testID="calc-income" />
      <Text variant="subheading">{t('calculators.budget.expenses')}</Text>
      {expenses.map((e, i) => (
        <FormField key={i} label={t('calculators.budget.expense', { n: i + 1 })} value={e} onChangeText={(v) => setExpenses((list) => list.map((x, j) => (j === i ? v : x)))} keyboardType="decimal-pad" />
      ))}
      <Button label={t('calculators.budget.addExpense')} variant="ghost" icon="add" size="md" onPress={() => setExpenses((l) => [...l, ''])} />
      <FormField label={t('calculators.budget.savingsPct')} value={pct} onChangeText={setPct} keyboardType="decimal-pad" />
      {income.trim() && (!res || !res.ok) ? <Invalid /> : null}
      {ok ? (
        <ResultCard formula={t('calculators.budget.formula')} testID="calc-result">
          <ResultLine label={t('calculators.budget.planned')} value={money(ok.planned, currency)} />
          <ResultLine label={t('calculators.budget.savings')} value={money(ok.savings, currency)} />
          <ResultLine label={t('calculators.budget.available')} value={money(ok.available, currency, { signed: ok.available < 0 })} strong />
          <Divider />
          <Text variant="caption" tone="muted">
            {t('calculators.budget.reference')}
          </Text>
          <ResultLine label={t('calculators.budget.needs')} value={money(ok.reference.needs, currency)} />
          <ResultLine label={t('calculators.budget.wants')} value={money(ok.reference.wants, currency)} />
          <ResultLine label={t('calculators.budget.save')} value={money(ok.reference.savings, currency)} />
        </ResultCard>
      ) : null}
    </Stack>
  );
}

function SavingsTool({ currency, onResult }: { currency: string; onResult: () => void }) {
  const { t } = useTranslation();
  const money = useMoney();
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [mode, setMode] = useState<'months' | 'monthly'>('months');
  const [months, setMonths] = useState('12');
  const [monthly, setMonthly] = useState('');
  const tg = amountOf(target, currency);
  const cur = amountOf(current, currency);
  const mo = amountOf(monthly, currency);
  const n = Number(months);
  const res =
    typeof tg === 'number' && cur !== undefined
      ? mode === 'months'
        ? savingsGoalPlan({ target: tg, current: cur ?? 0, months: Number.isInteger(n) ? n : NaN })
        : typeof mo === 'number'
          ? savingsGoalPlan({ target: tg, current: cur ?? 0, monthly: mo })
          : null
      : null;
  const ok = res?.ok ? res : null;
  useEffect(() => {
    if (ok) onResult();
  }, [ok, onResult]);
  return (
    <Stack gap={3}>
      <AmountInput label={t('calculators.savings.target')} value={target} onChange={setTarget} currency={currency} testID="calc-target" />
      <FormField label={t('calculators.savings.current')} value={current} onChangeText={setCurrent} keyboardType="decimal-pad" />
      <Segmented
        options={[
          { value: 'months', label: t('calculators.savings.byMonths') },
          { value: 'monthly', label: t('calculators.savings.byMonthly') },
        ]}
        value={mode}
        onChange={setMode}
      />
      {mode === 'months' ? (
        <FormField label={t('calculators.savings.months')} value={months} onChangeText={setMonths} keyboardType="number-pad" />
      ) : (
        <FormField label={t('calculators.savings.monthly')} value={monthly} onChangeText={setMonthly} keyboardType="decimal-pad" />
      )}
      {target.trim() && res && !res.ok ? <Invalid /> : null}
      {ok ? (
        <ResultCard formula={t('calculators.savings.formula')} testID="calc-result">
          <ResultLine label={t('calculators.savings.remaining')} value={money(ok.remaining, currency)} />
          {mode === 'months' ? <ResultLine label={t('calculators.savings.resultMonthly')} value={money(ok.monthly, currency)} strong /> : <ResultLine label={t('calculators.savings.resultMonths')} value={String(ok.months)} strong />}
        </ResultCard>
      ) : null}
    </Stack>
  );
}

function SplitTool({ currency, onResult }: { currency: string; onResult: () => void }) {
  const { t } = useTranslation();
  const money = useMoney();
  const [total, setTotal] = useState('');
  const [people, setPeople] = useState('2');
  const [tip, setTip] = useState('0');
  const [weights, setWeights] = useState('');
  const tt = amountOf(total, currency);
  const p = Number(people);
  const w = weights.trim() ? weights.split(/[,;\s]+/).filter(Boolean).map(Number) : undefined;
  const weightsValid = !w || (w.length === p && w.every((x) => Number.isInteger(x) && x >= 0));
  const res = typeof tt === 'number' && weightsValid ? splitExpense({ total: tt, people: Number.isInteger(p) ? p : NaN, tipPct: percentText(tip) || '0', weights: w }) : null;
  const ok = res?.ok ? res : null;
  useEffect(() => {
    if (ok) onResult();
  }, [ok, onResult]);
  return (
    <Stack gap={3}>
      <AmountInput label={t('calculators.split.total')} value={total} onChange={setTotal} currency={currency} testID="calc-total" />
      <Row gap={2}>
        <View style={{ flex: 1 }}>
          <FormField label={t('calculators.split.people')} value={people} onChangeText={setPeople} keyboardType="number-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <FormField label={t('calculators.split.tipPct')} value={tip} onChangeText={setTip} keyboardType="decimal-pad" />
        </View>
      </Row>
      <FormField label={t('calculators.split.weights')} value={weights} onChangeText={setWeights} placeholder="2,1,1" />
      <Text variant="caption" tone="subtle">
        {t('calculators.split.weightsHint')}
      </Text>
      {total.trim() && (!res || !res.ok) ? <Invalid /> : null}
      {ok ? (
        <ResultCard formula={t('calculators.split.formula')} testID="calc-result">
          <ResultLine label={t('calculators.split.tip')} value={money(ok.tip, currency)} />
          <ResultLine label={t('calculators.split.grandTotal')} value={money(ok.grandTotal, currency)} strong />
          <Divider />
          {ok.shares.map((s, i) => (
            <ResultLine key={i} label={t('calculators.split.person', { n: i + 1 })} value={money(s, currency)} />
          ))}
        </ResultCard>
      ) : null}
    </Stack>
  );
}

function SalaryTool({ currency, onResult }: { currency: string; onResult: () => void }) {
  const { t } = useTranslation();
  const money = useMoney();
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<SalaryPeriod>('year');
  const [hours, setHours] = useState('40');
  const [ded, setDed] = useState('0');
  const a = amountOf(amount, currency);
  const res = typeof a === 'number' ? salaryBreakdown({ amount: a, period, hoursPerWeek: percentText(hours) || '40', deductionPct: percentText(ded) || '0' }) : null;
  const ok = res?.ok ? res : null;
  useEffect(() => {
    if (ok) onResult();
  }, [ok, onResult]);
  const rows = ['year', 'month', 'biweekly', 'week', 'day', 'hour'] as const;
  return (
    <Stack gap={3}>
      <AmountInput label={t('calculators.salary.amount')} value={amount} onChange={setAmount} currency={currency} testID="calc-salary" />
      <ChoiceChips
        label={t('calculators.salary.period')}
        value={period}
        onChange={setPeriod}
        options={(['year', 'month', 'week', 'hour'] as const).map((p) => ({ value: p, label: t(`calculators.salary.periods.${p}`) }))}
      />
      <Row gap={2}>
        <View style={{ flex: 1 }}>
          <FormField label={t('calculators.salary.hours')} value={hours} onChangeText={setHours} keyboardType="decimal-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <FormField label={t('calculators.salary.deductionPct')} value={ded} onChangeText={setDed} keyboardType="decimal-pad" />
        </View>
      </Row>
      <Text variant="caption" tone="subtle">
        {t('calculators.salary.deductionHint')}
      </Text>
      {amount.trim() && (!res || !res.ok) ? <Invalid /> : null}
      {ok ? (
        <ResultCard formula={t('calculators.salary.formula')} testID="calc-result">
          <Row style={{ justifyContent: 'flex-end' }} gap={3}>
            <Text variant="caption" tone="muted" style={{ width: 110, textAlign: 'right' }}>
              {t('calculators.salary.gross')}
            </Text>
            <Text variant="caption" tone="muted" style={{ width: 110, textAlign: 'right' }}>
              {t('calculators.salary.net')}
            </Text>
          </Row>
          {rows.map((k) => (
            <Row key={k} gap={3}>
              <Text variant="bodySmall" tone="muted" style={{ flex: 1 }}>
                {t(`calculators.salary.rows.${k}`)}
              </Text>
              <Text variant="bodySmall" style={{ width: 110, textAlign: 'right' }}>
                {money(ok.gross[k], currency)}
              </Text>
              <Text variant="bodySmall" style={{ width: 110, textAlign: 'right', fontWeight: '700' }}>
                {money(ok.net[k], currency)}
              </Text>
            </Row>
          ))}
          <ResultLine label={t('calculators.salary.deductions')} value={money(ok.deductionsPerYear, currency)} />
        </ResultCard>
      ) : null}
    </Stack>
  );
}

function DebtTool({ currency, onResult }: { currency: string; onResult: () => void }) {
  const { t } = useTranslation();
  const money = useMoney();
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [payment, setPayment] = useState('');
  const [target, setTarget] = useState('12');
  const b = amountOf(balance, currency);
  const p = amountOf(payment, currency);
  const aprText = percentText(apr) || '0';
  const res = typeof b === 'number' && typeof p === 'number' ? debtRepayment({ balance: b, aprPct: aprText, payment: p }) : null;
  const ok = res?.ok ? res : null;
  const n = Number(target);
  const needed = typeof b === 'number' && Number.isInteger(n) && n > 0 ? paymentForMonths({ balance: b, aprPct: aprText, months: n }) : null;
  useEffect(() => {
    if (ok || needed !== null) onResult();
  }, [ok, needed, onResult]);
  return (
    <Stack gap={3}>
      <AmountInput label={t('calculators.debt.balance')} value={balance} onChange={setBalance} currency={currency} testID="calc-balance" />
      <Row gap={2}>
        <View style={{ flex: 1 }}>
          <FormField label={t('calculators.debt.apr')} value={apr} onChangeText={setApr} keyboardType="decimal-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <FormField label={t('calculators.debt.payment')} value={payment} onChangeText={setPayment} keyboardType="decimal-pad" />
        </View>
      </Row>
      {res && !res.ok ? (
        <Text tone="warning" accessibilityLiveRegion="polite">
          {res.error === 'payment_too_low' ? t('calculators.debt.tooLow', { amount: money('minimumInterest' in res ? (res.minimumInterest ?? 0) : 0, currency) }) : res.error === 'too_long' ? t('calculators.debt.tooLong') : t('calculators.invalid')}
        </Text>
      ) : null}
      {ok ? (
        <ResultCard formula={t('calculators.debt.formula')} testID="calc-result">
          <ResultLine label={t('calculators.debt.months')} value={String(ok.months)} strong />
          <ResultLine label={t('calculators.debt.totalInterest')} value={money(ok.totalInterest, currency)} />
          <ResultLine label={t('calculators.debt.totalPaid')} value={money(ok.totalPaid, currency)} />
          <Divider />
          <Text variant="caption" tone="muted">
            {t('calculators.debt.schedule')}
          </Text>
          <Row gap={2}>
            {(['month', 'interest', 'principal', 'remaining'] as const).map((h) => (
              <Text key={h} variant="caption" tone="muted" style={{ flex: h === 'month' ? 0.6 : 1, textAlign: h === 'month' ? 'left' : 'right' }}>
                {t(`calculators.debt.${h}`)}
              </Text>
            ))}
          </Row>
          {ok.schedule.slice(0, 12).map((m) => (
            <Row key={m.month} gap={2}>
              <Text variant="caption" style={{ flex: 0.6 }}>
                {m.month}
              </Text>
              <Text variant="caption" style={{ flex: 1, textAlign: 'right' }}>
                {money(m.interest, currency)}
              </Text>
              <Text variant="caption" style={{ flex: 1, textAlign: 'right' }}>
                {money(m.principal, currency)}
              </Text>
              <Text variant="caption" style={{ flex: 1, textAlign: 'right' }}>
                {money(m.balance, currency)}
              </Text>
            </Row>
          ))}
        </ResultCard>
      ) : null}
      <Card>
        <Text variant="subheading">{t('calculators.debt.targetTitle')}</Text>
        <FormField label={t('calculators.debt.targetMonths')} value={target} onChangeText={setTarget} keyboardType="number-pad" />
        {needed !== null ? <ResultLine label={t('calculators.debt.targetResult')} value={money(needed, currency)} strong /> : null}
      </Card>
    </Stack>
  );
}

/* ------------------------------------------------------------------ Screen */

export default function CalculatorScreen() {
  const { tool } = useLocalSearchParams<{ tool: string }>();
  const { t } = useTranslation();
  const main = useMainCurrency();
  const isPremium = useIsPremium();
  const [currency, setCurrency] = useState(main);
  const hadResult = useRef(false);
  const premiumRef = useRef(isPremium);
  useEffect(() => {
    premiumRef.current = isPremium;
  }, [isPremium]);
  // Natural break: leaving a calculator after seeing a result. Never during input.
  useEffect(
    () => () => {
      if (hadResult.current) void maybeShowInterstitial(premiumRef.current);
    },
    [],
  );
  const [onResult] = useState(() => () => {
    hadResult.current = true;
  });

  const id = (TOOLS as readonly string[]).includes(tool ?? '') ? (tool as ToolId) : null;
  if (!id) {
    return (
      <Screen edges={[]}>
        <Text>{t('errors.not_found')}</Text>
      </Screen>
    );
  }
  const props = { currency, onResult };
  return (
    <Screen edges={[]} testID={`calculator-${id}`}>
      <RouterStack.Screen options={{ title: t(`calculators.tools.${id}.title`) }} />
      <Text tone="muted">{t(`calculators.tools.${id}.desc`)}</Text>
      <CurrencySelector label={t('common.currency')} value={currency} onChange={setCurrency} testID="calc-currency" />
      {id === 'budget' ? <BudgetTool {...props} /> : null}
      {id === 'savings' ? <SavingsTool {...props} /> : null}
      {id === 'split' ? <SplitTool {...props} /> : null}
      {id === 'salary' ? <SalaryTool {...props} /> : null}
      {id === 'debt' ? <DebtTool {...props} /> : null}
    </Screen>
  );
}
