import { Card, Chip, Divider, IconButton, Row, Stack, Text, useTheme } from '@factory/design-system';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { CopyButton, NumberField, ResultCard, useNumberField } from '@/components/fields';
import { ToolScreen } from '@/components/ToolScreen';
import { useFormat } from '@/hooks/useFormat';
import { useToolSession } from '@/hooks/useToolSession';
import { convert, convertAll, DEFAULT_PAIRS, findUnit, UNIT_CATEGORIES, UNITS, type UnitCategory } from '@/services/calculators/UnitConverter';

const CATEGORY_ICONS: Record<UnitCategory, Parameters<typeof Chip>[0]['icon']> = {
  length: 'resize-outline',
  mass: 'barbell-outline',
  temperature: 'thermometer-outline',
  area: 'square-outline',
  volume: 'beaker-outline',
  speed: 'speedometer-outline',
  time: 'time-outline',
  data: 'server-outline',
  energy: 'flash-outline',
};

function UnitPicker({ category, value, onChange, label, testID }: { category: UnitCategory; value: string; onChange: (id: string) => void; label: string; testID: string }) {
  const { t } = useTranslation();
  return (
    <Stack gap={1}>
      <Text variant="caption" tone="subtle">
        {label}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} testID={testID}>
        {UNITS[category].map((u) => (
          <Chip key={u.id} label={u.symbol} selected={value === u.id} onPress={() => onChange(u.id)} testID={`${testID}-${u.id}`} />
        ))}
      </ScrollView>
      <Text variant="caption" tone="muted">
        {t(`units.names.${category}.${value}`)}
      </Text>
    </Stack>
  );
}

export default function UnitsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const f = useFormat();
  const session = useToolSession('units');
  const [category, setCategory] = useState<UnitCategory>('length');
  const [from, setFrom] = useState(DEFAULT_PAIRS.length[0]);
  const [to, setTo] = useState(DEFAULT_PAIRS.length[1]);
  const input = useNumberField(f, '1');

  const pickCategory = (c: UnitCategory) => {
    setCategory(c);
    setFrom(DEFAULT_PAIRS[c][0]);
    setTo(DEFAULT_PAIRS[c][1]);
  };

  const r = input.value ? convert(input.value, category, from, to) : null;
  const all = input.value ? convertAll(input.value, category, from) : null;
  const fromUnit = findUnit(category, from);
  const toUnit = findUnit(category, to);
  const valueText = (v: Parameters<typeof f.number>[0]) => f.number(v, { significant: 12 });

  useEffect(() => {
    if (!r?.ok || !input.value) return session.setResult(null);
    session.setResult({
      expression: '',
      result: r.value.toString(),
      payload: {
        mode: `units.categories.${category}`,
        inputs: [{ label: `units.names.${category}.${from}`, value: input.value.toString(), kind: 'number', suffix: fromUnit?.symbol }],
        outputs: [{ label: `units.names.${category}.${to}`, value: r.value.toSignificantDigits(15).toString(), kind: 'number', suffix: toUnit?.symbol }],
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on computed values
  }, [r?.ok ? r.value.toString() : null, category, from, to]);

  return (
    <ToolScreen tool="units">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} testID="unit-categories">
        {UNIT_CATEGORIES.map((c) => (
          <Chip key={c} label={t(`units.categories.${c}`)} icon={CATEGORY_ICONS[c]} selected={category === c} onPress={() => pickCategory(c)} testID={`cat-${c}`} />
        ))}
      </ScrollView>

      <Card>
        <Stack gap={3}>
          <NumberField label={t('units.value')} field={input} suffix={fromUnit?.symbol} allowNegative={category === 'temperature' || category === 'energy' || category === 'time'} error={r && !r.ok ? t(category === 'temperature' ? 'errors.below_absolute_zero' : `errors.${r.issue}`) : null} testID="unit-value" />
          <UnitPicker category={category} value={from} onChange={setFrom} label={t('units.from')} testID="from" />
          <Row style={{ justifyContent: 'center' }}>
            <IconButton
              icon="swap-vertical"
              tone="primary"
              label={t('units.swap')}
              onPress={() => {
                setFrom(to);
                setTo(from);
              }}
            />
          </Row>
          <UnitPicker category={category} value={to} onChange={setTo} label={t('units.to')} testID="to" />
        </Stack>
      </Card>

      {r?.ok && toUnit ? <ResultCard label={t(`units.names.${category}.${to}`)} value={`${valueText(r.value)} ${toUnit.symbol}`} testID="result" /> : null}

      {all?.ok ? (
        <Card>
          <Text variant="label" tone="muted">
            {t('units.allUnits')}
          </Text>
          {all.value.map(({ unit, value }, i) => (
            <View key={unit.id}>
              {i > 0 ? <Divider /> : null}
              <Row style={{ justifyContent: 'space-between', minHeight: 44 }}>
                <Text variant="bodySmall" tone="muted" style={{ flex: 1 }}>
                  {t(`units.names.${category}.${unit.id}`)}
                </Text>
                <Text variant="bodySmall" style={{ fontWeight: '600', fontVariant: ['tabular-nums'], color: unit.id === to ? theme.colors.primary : theme.colors.text }}>
                  {`${valueText(value)} ${unit.symbol}`}
                </Text>
                <CopyButton text={valueText(value)} label={t('common.copyValue', { value: `${valueText(value)} ${unit.symbol}` })} />
              </Row>
            </View>
          ))}
        </Card>
      ) : null}
    </ToolScreen>
  );
}
