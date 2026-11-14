import { Button, Screen, Stack, Text } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChipSelect, DateField, PhotoField, TextField } from '@/components/forms';
import { PLANT_CONDITIONS, type PlantCondition } from '@/domain/types';
import { lengthToCm, lengthUnit, parseDecimal } from '@/domain/units';
import { useMutation } from '@/hooks/useData';
import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';

/** New growth observation. No ads on data-entry screens. */
export default function NewGrowth() {
  const { t } = useTranslation();
  const router = useRouter();
  const mutate = useMutation();
  const units = usePreferences((s) => s.units) ?? 'metric';
  const { plantId } = useLocalSearchParams<{ plantId: string }>();
  const [date, setDate] = useState<string | null>(clock.today());
  const [height, setHeight] = useState('');
  const [leaves, setLeaves] = useState('');
  const [condition, setCondition] = useState<PlantCondition>('good');
  const [photo, setPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const h = parseDecimal(height);
    const l = parseDecimal(leaves);
    if ((height.trim() && h === null) || (leaves.trim() && (l === null || !Number.isInteger(l)))) {
      setError(t('validation.number'));
      return;
    }
    await mutate((r) => r.growth.create({ plantId, date: date ?? clock.today(), heightCm: h === null ? null : lengthToCm(h, units), leafCount: l, condition, photoPath: photo, notes: notes.trim() }), { reminders: false });
    router.back();
  };

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={() => void save()} testID="save-growth" />}>
      <RouterStack.Screen options={{ title: t('growth.add') }} />
      <Stack gap={4}>
        <DateField label={t('common.date')} value={date} onChange={setDate} allowFuture={false} />
        <TextField label={`${t('growth.height')} (${lengthUnit(units)})`} value={height} onChangeText={(v) => (setHeight(v), setError(null))} keyboardType="decimal-pad" optional error={error} maxLength={7} testID="field-height" />
        <TextField label={t('growth.leafCount')} value={leaves} onChangeText={(v) => (setLeaves(v), setError(null))} keyboardType="number-pad" optional maxLength={4} />
        <Text variant="caption" tone="muted">
          {t('growth.measureHint')}
        </Text>
        <ChipSelect label={t('growth.condition')} options={PLANT_CONDITIONS} value={condition} onChange={setCondition} render={(c) => t(`condition.${c}`)} />
        <PhotoField label={t('growth.photo')} value={photo} onChange={setPhoto} />
        <TextField label={t('common.notes')} value={notes} onChangeText={setNotes} multiline optional />
      </Stack>
    </Screen>
  );
}
