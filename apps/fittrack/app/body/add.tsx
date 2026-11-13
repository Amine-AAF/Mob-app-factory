import { Button, Chip, Row, Screen, Stack, Text } from '@factory/design-system';
import { addDays, fromDayKey } from '@factory/app-core';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChipScroller, Field } from '@/components/ui';
import { FREE_LIMITS } from '@/config/limits';
import { repos } from '@/database';
import { isLength, validMeasurement } from '@/features/body/body';
import { displayToCm, displayToKg } from '@/features/units';
import { useFormat } from '@/hooks';
import { fmt } from '@/i18n';
import { evaluateAchievements } from '@/services/progressService';
import { useIsPremium, useSession } from '@/store/session';
import { MEASUREMENT_KINDS, type MeasurementKind } from '@/types';
import { cleanText, parseDecimal } from '@/utils';

export default function AddMeasurement() {
  const params = useLocalSearchParams<{ kind?: MeasurementKind; name?: string }>();
  const { t } = useTranslation();
  const premium = useIsPremium();
  const today = useSession((s) => s.today);
  const f = useFormat();
  const allowed = premium ? MEASUREMENT_KINDS : (FREE_LIMITS.measurementKinds as readonly MeasurementKind[]);
  const [kind, setKind] = useState<MeasurementKind>(params.kind && allowed.includes(params.kind) ? params.kind : 'weight');
  const [name, setName] = useState(params.name ?? '');
  const [value, setValue] = useState('');
  const [day, setDay] = useState(today);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const unit = kind === 'weight' ? t(`units.${f.units.weight}`) : isLength(kind) ? t(`units.${f.units.length}`) : '';

  const save = async () => {
    const v = parseDecimal(value);
    if (v === null) return setError(t('body.valueInvalid'));
    const metric = kind === 'weight' ? displayToKg(v, f.units.weight) : isLength(kind) ? displayToCm(v, f.units.length) : v;
    if (!validMeasurement(kind, metric)) return setError(t('body.valueOutOfRange'));
    const customName = kind === 'custom' ? cleanText(name, 40) : null;
    if (kind === 'custom' && !customName) return setError(t('body.nameRequired'));
    await repos().body.add({ day, kind, customName, value: metric, note: cleanText(note, 200) });
    await evaluateAchievements(repos());
    useSession.getState().bump();
    router.back();
  };

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={() => void save()} testID="save-measurement" />}>
      <Stack gap={2}>
        <Text variant="label" tone="muted">{t('body.kind')}</Text>
        <Row wrap gap={2}>
          {allowed.map((k) => <Chip key={k} label={t(`body.kinds.${k}`)} selected={kind === k} onPress={() => { setKind(k); setError(null); }} />)}
        </Row>
        {!premium ? <Text variant="caption" tone="subtle">{t('premium.bodyFree')}</Text> : null}
      </Stack>
      {kind === 'custom' ? <Field label={t('body.customName')} value={name} onChangeText={setName} maxLength={40} placeholder={t('body.customPlaceholder')} /> : null}
      <Field label={unit ? t('body.valueWithUnit', { unit }) : t('body.value')} value={value} onChangeText={(s) => { setValue(s); setError(null); }} keyboardType="decimal-pad" error={error} testID="measurement-value" />
      <Stack gap={2}>
        <Text variant="label" tone="muted">{t('planner.date')}</Text>
        <ChipScroller>
          {Array.from({ length: 14 }, (_, i) => addDays(today, -i)).map((d) => <Chip key={d} label={d === today ? t('home.today') : fmt.shortDay(fromDayKey(d))} selected={day === d} onPress={() => setDay(d)} />)}
        </ChipScroller>
      </Stack>
      <Field label={t('body.note')} value={note} onChangeText={setNote} maxLength={200} multiline />
    </Screen>
  );
}
