import { Card, Chip, Row, Stack } from '@factory/design-system';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ExampleChips, InfoNote, NumberField, ResultCard, ResultRow, useNumberField } from '@/components/fields';
import { ToolScreen } from '@/components/ToolScreen';
import { useFormat } from '@/hooks/useFormat';
import { useToolSession } from '@/hooks/useToolSession';
import * as P from '@/services/calculators/PercentageCalculator';
import type { CalcResult } from '@/services/calculators/result';
import type { HistoryLine } from '@/types';
import type { Dec } from '@/utils/decimal';

type Mode = 'of' | 'increase' | 'decrease' | 'change' | 'ratio' | 'original' | 'margin';
const MODES: Mode[] = ['of', 'increase', 'decrease', 'change', 'ratio', 'original', 'margin'];

interface Issue {
  field: 'a' | 'b';
  text: string;
}

interface Output {
  main: { label: string; value: string; caption?: string };
  rows: { label: string; value: string; tone?: 'success' | 'danger' }[];
  lines: HistoryLine[];
  mainRaw: string;
}

export default function PercentageScreen() {
  const { t } = useTranslation();
  const f = useFormat();
  const session = useToolSession('percentage');
  const [mode, setMode] = useState<Mode>('of');
  const a = useNumberField(f);
  const b = useNumberField(f);

  // Field labels per mode: a is always the first input, b the second.
  const labels: Record<Mode, [string, string]> = {
    of: [t('percentage.fields.percent'), t('percentage.fields.value')],
    increase: [t('percentage.fields.value'), t('percentage.fields.percent')],
    decrease: [t('percentage.fields.value'), t('percentage.fields.percent')],
    change: [t('percentage.fields.from'), t('percentage.fields.to')],
    ratio: [t('percentage.fields.part'), t('percentage.fields.whole')],
    original: [t('percentage.fields.finalPrice'), t('percentage.fields.discountPercent')],
    margin: [t('percentage.fields.cost'), t('percentage.fields.sellingPrice')],
  };
  const percentField: Record<Mode, 'a' | 'b' | null> = { of: 'a', increase: 'b', decrease: 'b', change: null, ratio: null, original: 'b', margin: null };

  let output: Output | null = null;
  let issue: Issue | null = null;
  const fail = (r: CalcResult<unknown>, fieldMap: Record<string, 'a' | 'b'>): Issue | null => (r.ok ? null : { field: fieldMap[r.field ?? ''] ?? 'b', text: t(`errors.${r.issue}`) });

  const x = a.value;
  const y = b.value;
  if (x && y) {
    const n = (v: Dec) => f.number(v);
    const pc = (v: Dec) => f.percent(v);
    switch (mode) {
      case 'of': {
        const r = P.percentOf(x, y);
        if (r.ok) output = { main: { label: t('percentage.results.result'), value: n(r.value), caption: t('percentage.sentences.of', { p: pc(x), x: n(y), r: n(r.value) }) }, rows: [], lines: [], mainRaw: r.value.toString() };
        break;
      }
      case 'increase':
      case 'decrease': {
        const r = mode === 'increase' ? P.increase(x, y) : P.decrease(x, y);
        if (r.ok) output = { main: { label: t('percentage.results.newValue'), value: n(r.value.result) }, rows: [{ label: mode === 'increase' ? t('percentage.results.added') : t('percentage.results.removed'), value: n(r.value.delta) }], lines: [{ label: 'percentage.results.newValue', value: r.value.result.toString(), kind: 'number' }], mainRaw: r.value.result.toString() };
        break;
      }
      case 'change': {
        const r = P.change(x, y);
        issue = fail(r, { from: 'a' });
        if (r.ok) {
          const up = r.value.percent.gte(0);
          output = {
            main: { label: up ? t('percentage.results.increase') : t('percentage.results.decrease'), value: pc(r.value.percent.abs()), caption: t('percentage.sentences.change', { from: n(x), to: n(y), p: pc(r.value.percent) }) },
            rows: [{ label: t('percentage.results.difference'), value: n(r.value.delta), tone: up ? 'success' : 'danger' }],
            lines: [{ label: 'percentage.results.change', value: r.value.percent.toString(), kind: 'percent' }],
            mainRaw: r.value.percent.toString(),
          };
        }
        break;
      }
      case 'ratio': {
        const r = P.ratio(x, y);
        issue = fail(r, { whole: 'b' });
        if (r.ok) output = { main: { label: t('percentage.results.share'), value: pc(r.value), caption: t('percentage.sentences.ratio', { part: n(x), whole: n(y), p: pc(r.value) }) }, rows: [], lines: [{ label: 'percentage.results.share', value: r.value.toString(), kind: 'percent' }], mainRaw: r.value.toString() };
        break;
      }
      case 'original': {
        const r = P.originalBeforeDecrease(x, y);
        issue = fail(r, { percent: 'b' });
        if (r.ok) output = { main: { label: t('percentage.results.originalPrice'), value: n(r.value.original) }, rows: [{ label: t('percentage.results.discountAmount'), value: n(r.value.delta) }], lines: [{ label: 'percentage.results.originalPrice', value: r.value.original.toString(), kind: 'number' }], mainRaw: r.value.original.toString() };
        break;
      }
      case 'margin': {
        const r = P.marginFromPrices(x, y);
        issue = fail(r, { cost: 'a', price: 'b' });
        if (r.ok) {
          const v = r.value;
          output = {
            main: { label: t('percentage.results.margin'), value: v.marginPercent ? pc(v.marginPercent) : '—' },
            rows: [
              { label: t('percentage.results.markup'), value: v.markupPercent ? pc(v.markupPercent) : '—' },
              { label: t('percentage.results.profit'), value: n(v.profit), tone: v.profit.isNegative() ? 'danger' : 'success' },
            ],
            lines: [
              { label: 'percentage.results.margin', value: (v.marginPercent ?? v.profit).toString(), kind: v.marginPercent ? 'percent' : 'number' },
              { label: 'percentage.results.profit', value: v.profit.toString(), kind: 'number' },
            ],
            mainRaw: (v.marginPercent ?? v.profit).toString(),
          };
        }
        break;
      }
    }
  }

  const final = output as Output | null;
  useEffect(() => {
    if (!final || !x || !y) return session.setResult(null);
    const kindA = percentField[mode] === 'a' ? 'percent' : 'number';
    const kindB = percentField[mode] === 'b' ? 'percent' : 'number';
    session.setResult({
      expression: '',
      result: final.mainRaw,
      payload: {
        mode: `percentage.modes.${mode}`,
        inputs: [
          { label: `percentage.fieldKeys.${mode}.a`, value: x.toString(), kind: kindA },
          { label: `percentage.fieldKeys.${mode}.b`, value: y.toString(), kind: kindB },
        ],
        outputs: final.lines.length ? final.lines : [{ label: 'percentage.results.result', value: final.mainRaw, kind: 'number' }],
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- result identity is captured by mainRaw
  }, [final?.mainRaw, mode, x?.toString(), y?.toString()]);

  const examples: Record<Mode, { label: string; a: string; b: string }[]> = {
    of: [{ label: t('percentage.examples.of'), a: '20', b: '250' }],
    increase: [{ label: t('percentage.examples.increase'), a: '80', b: '12.5' }],
    decrease: [{ label: t('percentage.examples.decrease'), a: '500', b: '15' }],
    change: [{ label: t('percentage.examples.change'), a: '100', b: '120' }],
    ratio: [{ label: t('percentage.examples.ratio'), a: '45', b: '180' }],
    original: [{ label: t('percentage.examples.original'), a: '80', b: '20' }],
    margin: [{ label: t('percentage.examples.margin'), a: '60', b: '100' }],
  };
  const fill = (v: string) => v.replace('.', f.separators.decimal);
  const found = issue as Issue | null;
  const issueA = found?.field === 'a' ? found.text : null;
  const issueB = found?.field === 'b' ? found.text : null;

  return (
    <ToolScreen tool="percentage">
      <Row gap={2} wrap accessibilityRole="radiogroup">
        {MODES.map((m) => (
          <Chip key={m} label={t(`percentage.modes.${m}`)} selected={mode === m} onPress={() => setMode(m)} testID={`mode-${m}`} />
        ))}
      </Row>
      <Card>
        <Stack gap={3}>
          <NumberField label={labels[mode][0]} field={a} suffix={percentField[mode] === 'a' ? '%' : undefined} allowNegative={mode === 'change'} error={issueA} testID="field-a" />
          <NumberField label={labels[mode][1]} field={b} suffix={percentField[mode] === 'b' ? '%' : undefined} allowNegative={mode === 'change' || mode === 'increase'} error={issueB} testID="field-b" />
        </Stack>
      </Card>
      {final ? (
        <Stack gap={2}>
          <ResultCard label={final.main.label} value={final.main.value} caption={final.main.caption} testID="result" />
          {final.rows.length ? (
            <Card>
              {final.rows.map((r) => (
                <ResultRow key={r.label} label={r.label} value={r.value} tone={r.tone} />
              ))}
            </Card>
          ) : null}
        </Stack>
      ) : null}
      <ExampleChips
        examples={examples[mode].map((e) => ({
          label: e.label,
          apply: () => {
            a.setText(fill(e.a));
            b.setText(fill(e.b));
          },
        }))}
      />
      <InfoNote text={t(`percentage.help.${mode}`)} />
    </ToolScreen>
  );
}
