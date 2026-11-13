import { Button, Screen, Stack } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChipSelect, DateField, TextField } from '@/components/forms';
import { SUBSTRATES, type Substrate } from '@/domain/types';
import { lengthToCm, lengthUnit, parseDecimal } from '@/domain/units';
import { useMutation } from '@/hooks/useData';
import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';

export default function NewSoilRecord() {
  const { t } = useTranslation();
  const router = useRouter();
  const mutate = useMutation();
  const units = usePreferences((s) => s.units) ?? 'metric';
  const { plantId } = useLocalSearchParams<{ plantId: string }>();
  const [substrate, setSubstrate] = useState<Substrate>('universal');
  const [pot, setPot] = useState('');
  const [date, setDate] = useState<string | null>(clock.today());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const size = parseDecimal(pot);
    if (pot.trim() && (size === null || size <= 0)) {
      setError(t('validation.number'));
      return;
    }
    await mutate(async (r) => {
      const day = date ?? clock.today();
      await r.soil.create({ plantId, substrate, potSizeCm: size === null ? null : lengthToCm(size, units), repottedOn: day, notes: notes.trim() });
      await r.journal.create({ plantId, date: day, kind: 'repotting', title: t(`substrates.${substrate}`), body: notes.trim(), photoPath: null });
      const task = (await r.tasks.listForPlant(plantId)).find((x) => x.active && x.type === 'repotting');
      if (task) await r.tasks.complete(task.id, day);
    });
    router.back();
  };

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={() => void save()} testID="save-soil" />}>
      <RouterStack.Screen options={{ title: t('soil.addSoil') }} />
      <Stack gap={4}>
        <ChipSelect label={t('soil.substrateType')} options={SUBSTRATES} value={substrate} onChange={setSubstrate} render={(x) => t(`substrates.${x}`)} />
        <TextField label={`${t('soil.potSize')} (${lengthUnit(units)})`} value={pot} onChangeText={(v) => (setPot(v), setError(null))} keyboardType="decimal-pad" optional error={error} maxLength={6} />
        <DateField label={t('soil.repottedOn')} value={date} onChange={setDate} allowFuture={false} />
        <TextField label={t('common.notes')} value={notes} onChangeText={setNotes} multiline optional />
      </Stack>
    </Screen>
  );
}
