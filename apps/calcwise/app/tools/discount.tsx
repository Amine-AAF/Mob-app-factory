import { Badge, Button, Card, Chip, IconButton, Row, Stack, Text } from '@factory/design-system';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ExampleChips, InfoNote, NumberField, ResultCard, ResultRow, Segmented, localizedDefault, useNumberField, type NumberFieldState } from '@/components/fields';
import { ToolScreen } from '@/components/ToolScreen';
import { useFormat, type Formatters } from '@/hooks/useFormat';
import { useToolSession } from '@/hooks/useToolSession';
import { applyDiscounts, BASE_UNIT, compareOffers, MAX_DISCOUNTS, vatFromGross, vatFromNet, type QuantityUnit } from '@/services/calculators/DiscountCalculator';
import { usePreferences } from '@/store/preferences';
import type { Dec } from '@/utils/decimal';

type Section = 'discount' | 'vat' | 'compare';

export default function DiscountScreen() {
  const { t } = useTranslation();
  const [section, setSection] = useState<Section>('discount');
  return (
    <ToolScreen tool="discount">
      <Segmented
        testID="discount-section"
        value={section}
        onChange={setSection}
        options={[
          { value: 'discount', label: t('discount.sections.discount') },
          { value: 'vat', label: t('discount.sections.vat') },
          { value: 'compare', label: t('discount.sections.compare') },
        ]}
      />
      {section === 'discount' ? <DiscountSection /> : section === 'vat' ? <VatSection /> : <CompareSection />}
    </ToolScreen>
  );
}

/* ------------------------------------------------------------- Discounts */

function DiscountSection() {
  const { t } = useTranslation();
  const f = useFormat();
  const session = useToolSession('discount');
  const price = useNumberField(f);
  const d1 = useNumberField(f);
  const d2 = useNumberField(f);
  const d3 = useNumberField(f);
  const d4 = useNumberField(f);
  const d5 = useNumberField(f);
  const all = [d1, d2, d3, d4, d5];
  const [count, setCount] = useState(1);
  const fields = all.slice(0, count);
  const discounts = fields.map((x) => x.value).filter((v): v is Dec => v !== null);
  const ready = price.value && discounts.length === fields.length;
  const r = ready && price.value ? applyDiscounts(price.value, discounts) : null;
  const priceError = r && !r.ok && r.field === 'price' ? t(`errors.${r.issue}`) : null;
  const badIndex = r && !r.ok && r.field?.startsWith('discount') ? Number(r.field.slice(8)) : -1;

  useEffect(() => {
    if (!r?.ok || !price.value) return session.setResult(null);
    session.setResult({
      expression: '',
      result: r.value.final.toString(),
      payload: {
        mode: 'discount.sections.discount',
        currency: f.currency,
        inputs: [{ label: 'discount.fields.price', value: price.value.toString(), kind: 'money' }, ...discounts.map((d) => ({ label: 'discount.fields.discount', value: d.toString(), kind: 'percent' as const }))],
        outputs: [
          { label: 'discount.results.final', value: r.value.final.toString(), kind: 'money' },
          { label: 'discount.results.saved', value: r.value.saved.toString(), kind: 'money' },
        ],
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the computed values
  }, [r?.ok ? r.value.final.toString() : null, r?.ok ? r.value.saved.toString() : null, f.currency]);

  const example = () => {
    price.setText('120');
    d1.setText('20');
    d2.setText('10');
    setCount(2);
  };

  return (
    <Stack gap={4}>
      <Card>
        <Stack gap={3}>
          <NumberField label={t('discount.fields.price')} field={price} suffix={f.currency} error={priceError} testID="price" />
          {fields.map((field, i) => (
            <Row key={i} gap={2} style={{ alignItems: 'flex-end' }}>
              <View1>
                <NumberField label={count > 1 ? t('discount.fields.discountN', { n: i + 1 }) : t('discount.fields.discount')} field={field} suffix="%" error={badIndex === i ? t('errors.percent_range') : null} testID={`discount-${i}`} />
              </View1>
              {i > 0 && i === count - 1 ? (
                <IconButton
                  icon="close-circle-outline"
                  label={t('discount.removeDiscount')}
                  onPress={() => {
                    field.setText('');
                    setCount((c) => c - 1);
                  }}
                />
              ) : null}
            </Row>
          ))}
          {count < MAX_DISCOUNTS ? <Button label={t('discount.addDiscount')} icon="add" variant="ghost" size="md" onPress={() => setCount((c) => c + 1)} testID="add-discount" /> : null}
        </Stack>
      </Card>
      {r?.ok ? (
        <Stack gap={2}>
          <ResultCard label={t('discount.results.final')} value={f.money(r.value.final)} caption={t('discount.results.youSave', { amount: f.money(r.value.saved), percent: f.percent(r.value.effectivePercent) })} testID="result" />
          {r.value.steps.length > 1 ? (
            <Card>
              {r.value.steps.map((s, i) => (
                <ResultRow key={i} label={t('discount.results.step', { n: i + 1, percent: f.percent(s.percent) })} value={`−${f.money(s.saved)} → ${f.money(s.priceAfter)}`} />
              ))}
              <ResultRow label={t('discount.results.effective')} value={f.percent(r.value.effectivePercent)} strong />
            </Card>
          ) : null}
        </Stack>
      ) : null}
      <ExampleChips examples={[{ label: t('discount.examples.stacked'), apply: example }]} />
      <InfoNote text={t('discount.help.stacked')} />
    </Stack>
  );
}

/** Flex wrapper (keeps JSX readable). */
function View1({ children }: { children: ReactNode }) {
  return <Stack style={{ flex: 1 }}>{children}</Stack>;
}

/* ------------------------------------------------------------- VAT */

function VatSection() {
  const { t } = useTranslation();
  const f = useFormat();
  const session = useToolSession('discount');
  const defaultVat = usePreferences((s) => s.defaultVat);
  const [direction, setDirection] = useState<'net' | 'gross'>('net');
  const amount = useNumberField(f);
  const rate = useNumberField(f, localizedDefault(f, defaultVat));
  const r = amount.value && rate.value ? (direction === 'net' ? vatFromNet(amount.value, rate.value) : vatFromGross(amount.value, rate.value)) : null;

  useEffect(() => {
    if (!r?.ok || !rate.value) return session.setResult(null);
    session.setResult({
      expression: '',
      result: (direction === 'net' ? r.value.gross : r.value.net).toString(),
      payload: {
        mode: 'discount.sections.vat',
        currency: f.currency,
        inputs: [
          { label: direction === 'net' ? 'discount.fields.netAmount' : 'discount.fields.grossAmount', value: (direction === 'net' ? r.value.net : r.value.gross).toString(), kind: 'money' },
          { label: 'discount.fields.vatRate', value: rate.value.toString(), kind: 'percent' },
        ],
        outputs: [
          { label: 'discount.results.net', value: r.value.net.toString(), kind: 'money' },
          { label: 'discount.results.vat', value: r.value.vat.toString(), kind: 'money' },
          { label: 'discount.results.gross', value: r.value.gross.toString(), kind: 'money' },
        ],
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the computed values
  }, [r?.ok ? r.value.gross.toString() + r.value.net.toString() : null, direction, f.currency]);

  return (
    <Stack gap={4}>
      <Segmented
        testID="vat-direction"
        value={direction}
        onChange={setDirection}
        options={[
          { value: 'net', label: t('discount.vat.fromNet') },
          { value: 'gross', label: t('discount.vat.fromGross') },
        ]}
      />
      <Card>
        <Stack gap={3}>
          <NumberField label={direction === 'net' ? t('discount.fields.netAmount') : t('discount.fields.grossAmount')} field={amount} suffix={f.currency} testID="vat-amount" />
          <NumberField label={t('discount.fields.vatRate')} field={rate} suffix="%" error={r && !r.ok ? t(`errors.${r.issue}`) : null} hint={t('discount.vat.rateHint')} testID="vat-rate" />
        </Stack>
      </Card>
      {r?.ok ? (
        <Stack gap={2}>
          <ResultCard label={direction === 'net' ? t('discount.results.gross') : t('discount.results.net')} value={f.money(direction === 'net' ? r.value.gross : r.value.net)} testID="result" />
          <Card>
            <ResultRow label={t('discount.results.net')} value={f.money(r.value.net)} />
            <ResultRow label={t('discount.results.vat')} value={f.money(r.value.vat)} />
            <ResultRow label={t('discount.results.gross')} value={f.money(r.value.gross)} strong />
          </Card>
        </Stack>
      ) : null}
      <InfoNote text={t('discount.help.vat')} />
    </Stack>
  );
}

/* ------------------------------------------------------------- Compare offers */

const UNIT_CHOICES: QuantityUnit[] = ['g', 'kg', 'ml', 'cl', 'l', 'piece', 'oz', 'lb', 'floz', 'gal'];

function OfferForm({ title, price, quantity, unit, setUnit, error, f, testID }: { title: string; price: NumberFieldState; quantity: NumberFieldState; unit: QuantityUnit; setUnit: (u: QuantityUnit) => void; error?: string | null; f: Formatters; testID: string }) {
  const { t } = useTranslation();
  return (
    <Card testID={testID}>
      <Text variant="subheading">{title}</Text>
      <NumberField label={t('discount.fields.price')} field={price} suffix={f.currency} testID={`${testID}-price`} />
      <NumberField label={t('discount.fields.quantity')} field={quantity} suffix={t(`units.quantity.${unit}`)} error={error} testID={`${testID}-qty`} />
      <Row gap={2} wrap>
        {UNIT_CHOICES.map((u) => (
          <Chip key={u} label={t(`units.quantity.${u}`)} selected={unit === u} onPress={() => setUnit(u)} />
        ))}
      </Row>
    </Card>
  );
}

function CompareSection() {
  const { t } = useTranslation();
  const f = useFormat();
  const session = useToolSession('discount');
  const pa = useNumberField(f);
  const qa = useNumberField(f);
  const pb = useNumberField(f);
  const qb = useNumberField(f);
  const [ua, setUa] = useState<QuantityUnit>('g');
  const [ub, setUb] = useState<QuantityUnit>('kg');
  const r = pa.value && qa.value && pb.value && qb.value ? compareOffers({ price: pa.value, quantity: qa.value, unit: ua }, { price: pb.value, quantity: qb.value, unit: ub }) : null;
  const errA = r && !r.ok && r.field?.startsWith('a') ? t(`errors.${r.issue}`) : null;
  const errB = r && !r.ok && r.field?.startsWith('b') ? t(`errors.${r.issue}`) : null;

  useEffect(() => {
    if (!r?.ok) return session.setResult(null);
    const base = BASE_UNIT[r.value.a.dimension];
    session.setResult({
      expression: '',
      result: r.value.savingPerBase.toString(),
      payload: {
        mode: 'discount.sections.compare',
        currency: f.currency,
        inputs: [],
        outputs: [
          { label: 'discount.results.offerA', value: r.value.a.perBase.toString(), kind: 'money', suffix: `units.per.${base}` },
          { label: 'discount.results.offerB', value: r.value.b.perBase.toString(), kind: 'money', suffix: `units.per.${base}` },
        ],
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the computed values
  }, [r?.ok ? r.value.a.perBase.toString() + r.value.b.perBase.toString() : null, f.currency]);

  const example = () => {
    pa.setText(localizedDefault(f, '2.40'));
    qa.setText('400');
    setUa('g');
    pb.setText('5');
    qb.setText('1');
    setUb('kg');
  };

  const per = (dimension: keyof typeof BASE_UNIT) => t(`units.per.${BASE_UNIT[dimension]}`);

  return (
    <Stack gap={4}>
      <OfferForm title={t('discount.results.offerA')} price={pa} quantity={qa} unit={ua} setUnit={setUa} error={errA} f={f} testID="offer-a" />
      <OfferForm title={t('discount.results.offerB')} price={pb} quantity={qb} unit={ub} setUnit={setUb} error={errB} f={f} testID="offer-b" />
      {r?.ok ? (
        <Card tone="primary" testID="result">
          <Row style={{ justifyContent: 'space-between' }}>
            <Text variant="subheading">{r.value.cheaper === 'equal' ? t('discount.compare.equal') : t('discount.compare.cheaper', { offer: r.value.cheaper === 'a' ? 'A' : 'B' })}</Text>
            {r.value.cheaper !== 'equal' ? <Badge label={t('discount.compare.bestDeal')} tone="success" icon="checkmark-circle" /> : null}
          </Row>
          <ResultRow label={t('discount.results.offerA')} value={`${f.money(r.value.a.perBase)} ${per(r.value.a.dimension)}`} strong={r.value.cheaper === 'a'} />
          <ResultRow label={t('discount.results.offerB')} value={`${f.money(r.value.b.perBase)} ${per(r.value.b.dimension)}`} strong={r.value.cheaper === 'b'} />
          {r.value.cheaper !== 'equal' ? <Text variant="bodySmall" tone="muted">{t('discount.compare.difference', { percent: f.percent(r.value.differencePercent), amount: `${f.money(r.value.savingPerBase)} ${per(r.value.a.dimension)}` })}</Text> : null}
        </Card>
      ) : null}
      <ExampleChips examples={[{ label: t('discount.examples.compare'), apply: example }]} />
      <InfoNote text={t('discount.help.compare')} />
    </Stack>
  );
}

