import { Button, Card, Screen, Stack, Text } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { HEALTH_ICON } from '@/components/icons';
import { ChipSelect, DateField, PhotoField, TextField } from '@/components/forms';
import { HEALTH_GUIDE } from '@/content/healthGuide';
import { HEALTH_CATEGORIES, type HealthCategory } from '@/domain/types';
import { useMutation } from '@/hooks/useData';
import { clock } from '@/services/clock';

/**
 * Records a health problem. The possible causes shown are informative only: the app does
 * not diagnose, and photos are stored for the user's own follow-up (never analysed or sent).
 */
export default function NewHealthRecord() {
  const { t } = useTranslation();
  const router = useRouter();
  const mutate = useMutation();
  const { plantId } = useLocalSearchParams<{ plantId: string }>();
  const [category, setCategory] = useState<HealthCategory>('yellow_leaves');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<string | null>(clock.today());
  const [photo, setPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const save = async () => {
    await mutate(
      (r) => r.health.create({ plantId, category, description: description.trim(), observedOn: date ?? clock.today(), status: 'open', actions: [], photoPaths: photo ? [photo] : [], notes: notes.trim(), resolvedOn: null }),
      { reminders: false },
    );
    router.back();
  };

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={() => void save()} testID="save-health" />}>
      <RouterStack.Screen options={{ title: t('health.report') }} />
      <Stack gap={4}>
        <ChipSelect label={t('health.category')} options={HEALTH_CATEGORIES} value={category} onChange={setCategory} render={(c) => t(`healthCategories.${c}`)} icons={HEALTH_ICON} />
        <Card tone="alt">
          <Text variant="label" tone="muted">
            {t('health.possibleCauses')}
          </Text>
          {HEALTH_GUIDE[category].causes.map((c) => (
            <Text key={c} variant="bodySmall">{`• ${t(`healthGuide.causes.${c}.title`)}`}</Text>
          ))}
          <Text variant="caption" tone="muted">
            {t('health.disclaimer')}
          </Text>
        </Card>
        <TextField label={t('health.description')} value={description} onChangeText={setDescription} multiline maxLength={2000} />
        <DateField label={t('health.observedOn')} value={date} onChange={setDate} allowFuture={false} />
        <PhotoField label={t('health.photo')} value={photo} onChange={setPhoto} />
        <TextField label={t('common.notes')} value={notes} onChangeText={setNotes} multiline optional />
      </Stack>
    </Screen>
  );
}
