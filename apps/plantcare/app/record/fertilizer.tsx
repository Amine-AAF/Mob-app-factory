import { Button, Card, Screen, Stack, Text } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChipSelect, DateField, TextField } from '@/components/forms';
import { FERTILIZER_TYPES, type FertilizerType } from '@/domain/types';
import { useMutation } from '@/hooks/useData';
import { clock } from '@/services/clock';

export default function NewFertilizer() {
  const { t } = useTranslation();
  const router = useRouter();
  const mutate = useMutation();
  const { plantId } = useLocalSearchParams<{ plantId: string }>();
  const [type, setType] = useState<FertilizerType>('liquid');
  const [brand, setBrand] = useState('');
  const [composition, setComposition] = useState('');
  const [date, setDate] = useState<string | null>(clock.today());
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const save = async () => {
    await mutate(
      async (r) => {
        await r.fertilizer.create({ plantId, fertilizerType: type, brand: brand.trim(), composition: composition.trim(), appliedOn: date ?? clock.today(), quantity: quantity.trim(), notes: notes.trim() });
        // If a feeding schedule exists, recording a feeding counts as completing it.
        const task = (await r.tasks.listForPlant(plantId)).find((x) => x.active && x.type === 'fertilizing');
        if (task && task.nextDue && task.nextDue <= clock.today()) await r.tasks.complete(task.id, date ?? clock.today(), { notes: brand.trim() });
      },
    );
    router.back();
  };

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={() => void save()} testID="save-fertilizer" />}>
      <RouterStack.Screen options={{ title: t('soil.addFertilizer') }} />
      <Card tone="alt">
        <Text variant="bodySmall" tone="muted">
          {t('soil.dosageWarning')}
        </Text>
      </Card>
      <Stack gap={4}>
        <ChipSelect label={t('soil.fertilizerType')} options={FERTILIZER_TYPES} value={type} onChange={setType} render={(x) => t(`fertilizerTypes.${x}`)} />
        <TextField label={t('soil.brand')} value={brand} onChangeText={setBrand} optional maxLength={80} />
        <TextField label={t('soil.composition')} value={composition} onChangeText={setComposition} optional placeholder={t('soil.compositionPlaceholder')} maxLength={80} />
        <DateField label={t('soil.appliedOn')} value={date} onChange={setDate} allowFuture={false} />
        <TextField label={t('soil.quantity')} value={quantity} onChangeText={setQuantity} optional placeholder={t('soil.quantityPlaceholder')} maxLength={80} />
        <TextField label={t('common.notes')} value={notes} onChangeText={setNotes} multiline optional />
      </Stack>
    </Screen>
  );
}
