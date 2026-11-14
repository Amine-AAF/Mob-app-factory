import { Card, Chip, IconButton, Row, Stack, Text } from '@factory/design-system';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ExampleChips, InfoNote, NumberField, ResultCard, ResultRow, Segmented, localizedDefault, useNumberField } from '@/components/fields';
import { ToolScreen } from '@/components/ToolScreen';
import { useFormat } from '@/hooks/useFormat';
import { useToolSession } from '@/hooks/useToolSession';
import { MAX_PEOPLE, splitBill } from '@/services/calculators/TipCalculator';
import { usePreferences } from '@/store/preferences';
import { Dec, ZERO } from '@/utils/decimal';

const TIP_PRESETS = ['0', '10', '15', '18', '20', '25'];

export default function TipScreen() {
  const { t } = useTranslation();
  const f = useFormat();
  const session = useToolSession('tip');
  const defaultTip = usePreferences((s) => s.defaultTip);
  const bill = useNumberField(f);
  const tip = useNumberField(f, localizedDefault(f, defaultTip));
  const extra = useNumberField(f);
  const [people, setPeople] = useState(2);
  // Rounding steps adapt to the currency's minor unit (cents vs. whole yen).
  const steps = f.currencyDigits === 0 ? ['none', '1', '10', '100'] : ['none', '0.1', '0.5', '1'];
  const [step, setStep] = useState('none');
  const roundStep = step === 'none' ? null : new Dec(step);

  const r = bill.value && tip.value ? splitBill({ bill: bill.value, tipPercent: tip.value, people, extra: extra.value ?? ZERO, roundStep, fractionDigits: f.currencyDigits }) : null;
  const err = (field: string) => (r && !r.ok && r.field === field ? t(`errors.${r.issue}`) : null);

  useEffect(() => {
    if (!r?.ok || !bill.value || !tip.value) return session.setResult(null);
    session.setResult({
      expression: '',
      result: (r.value.shares[0]?.amount ?? ZERO).toString(),
      payload: {
        currency: f.currency,
        inputs: [
          { label: 'tip.fields.bill', value: bill.value.toString(), kind: 'money' },
          { label: 'tip.fields.tip', value: tip.value.toString(), kind: 'percent' },
          { label: 'tip.fields.people', value: String(people), kind: 'integer' },
        ],
        outputs: [
          { label: 'tip.results.tip', value: r.value.tip.toString(), kind: 'money' },
          { label: 'tip.results.total', value: r.value.collected.toString(), kind: 'money' },
          { label: 'tip.results.perPerson', value: (r.value.shares[0]?.amount ?? ZERO).toString(), kind: 'money' },
        ],
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on computed values
  }, [r?.ok ? `${r.value.collected}|${r.value.tip}|${r.value.shares[0]?.amount}` : null, people, f.currency]);

  const shareText = r?.ok
    ? r.value.shares.length === 1
      ? f.money(r.value.shares[0]?.amount ?? ZERO)
      : r.value.shares.map((s) => t('tip.results.shareGroup', { count: s.count, amount: f.money(s.amount) })).join(' · ')
    : '';

  return (
    <ToolScreen tool="tip">
      <Card>
        <Stack gap={3}>
          <NumberField label={t('tip.fields.bill')} field={bill} suffix={f.currency} error={err('bill')} testID="bill" />
          <Text variant="bodySmall" tone="muted" style={{ fontWeight: '600' }}>
            {t('tip.fields.tip')}
          </Text>
          <Row gap={2} wrap>
            {TIP_PRESETS.map((p) => (
              <Chip key={p} label={`${p} %`} selected={tip.value?.eq(p) ?? false} onPress={() => tip.setText(p)} testID={`tip-${p}`} />
            ))}
          </Row>
          <NumberField label={t('tip.fields.customTip')} field={tip} suffix="%" error={err('tip')} testID="tip" />
          <Stack gap={1}>
            <Text variant="bodySmall" tone="muted" style={{ fontWeight: '600' }}>
              {t('tip.fields.people')}
            </Text>
            <Row gap={3}>
              <IconButton icon="remove-circle-outline" label={t('tip.fewerPeople')} onPress={() => setPeople((n) => Math.max(1, n - 1))} size={30} />
              <Text variant="title" style={{ minWidth: 48, textAlign: 'center' }} testID="people" accessibilityLabel={t('tip.peopleCount', { count: people })}>
                {people}
              </Text>
              <IconButton icon="add-circle-outline" label={t('tip.morePeople')} onPress={() => setPeople((n) => Math.min(MAX_PEOPLE, n + 1))} size={30} />
            </Row>
          </Stack>
          <NumberField label={t('tip.fields.extra')} field={extra} suffix={f.currency} hint={t('tip.extraHint')} error={err('extra')} testID="extra" />
          <Stack gap={1}>
            <Text variant="bodySmall" tone="muted" style={{ fontWeight: '600' }}>
              {t('tip.fields.rounding')}
            </Text>
            <Segmented testID="rounding" value={step} onChange={setStep} options={steps.map((s) => ({ value: s, label: s === 'none' ? t('tip.rounding.none') : t('tip.rounding.upTo', { step: f.money(new Dec(s)) }) }))} />
          </Stack>
        </Stack>
      </Card>

      {r?.ok ? (
        <Stack gap={2}>
          <ResultCard label={t('tip.results.perPerson')} value={shareText} testID="result" />
          <Card>
            <ResultRow label={t('tip.results.tip')} value={f.money(r.value.tip)} />
            <ResultRow label={t('tip.results.total')} value={f.money(r.value.total)} strong />
            {r.value.roundingSurplus.gt(0) ? (
              <>
                <ResultRow label={t('tip.results.collected')} value={f.money(r.value.collected)} />
                <ResultRow label={t('tip.results.surplus')} value={f.money(r.value.roundingSurplus)} tone="success" />
              </>
            ) : null}
          </Card>
        </Stack>
      ) : null}
      <ExampleChips
        examples={[
          {
            label: t('tip.examples.dinner'),
            apply: () => {
              bill.setText(localizedDefault(f, '87.40'));
              tip.setText('15');
              setPeople(4);
            },
          },
        ]}
      />
      <InfoNote text={t('tip.help')} />
    </ToolScreen>
  );
}
