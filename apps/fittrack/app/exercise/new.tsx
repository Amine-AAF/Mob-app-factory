import { Button, Chip, Row, Screen, Stack, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Field, PremiumGate } from '@/components/ui';
import { FREE_LIMITS } from '@/config/limits';
import { EQUIPMENT, EXERCISE_CATEGORIES, MUSCLE_GROUPS, TRACKING_TYPES, type Equipment, type ExerciseCategory, type MuscleGroup, type TrackingType } from '@/content/types';
import { repos } from '@/database';
import { useData } from '@/hooks';
import { useIsPremium, useSession } from '@/store/session';
import { cleanText } from '@/utils';

/** Create a personal exercise (free: up to FREE_LIMITS.customExercises). */
export default function NewExercise() {
  const { t } = useTranslation();
  const premium = useIsPremium();
  const { data: count } = useData((r) => r.exercises.countCustom());
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExerciseCategory>('full_body');
  const [primary, setPrimary] = useState<MuscleGroup>('full_body');
  const [equipment, setEquipment] = useState<Equipment[]>(['bodyweight']);
  const [tracking, setTracking] = useState<TrackingType>('weight_reps');
  const [error, setError] = useState<string | null>(null);
  const limited = !premium && (count ?? 0) >= FREE_LIMITS.customExercises;

  const save = async () => {
    const n = cleanText(name, 60);
    if (!n) return setError(t('customExercise.nameRequired'));
    const id = await repos().exercises.createCustom({ name: n, description: cleanText(description, 400), category, primary, secondary: [], equipment: equipment.length ? equipment : ['other'], tracking, level: 'beginner' });
    useSession.getState().bump();
    router.replace({ pathname: '/exercise/[id]', params: { id } });
  };

  if (limited) return <Screen edges={[]}><PremiumGate title={t('premium.customExercisesTitle')} message={t('premium.customExercisesBody', { max: FREE_LIMITS.customExercises })} source="custom_exercise" /></Screen>;

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={() => void save()} testID="save-exercise" />}>
      <Field label={t('customExercise.name')} value={name} onChangeText={(s) => { setName(s); setError(null); }} maxLength={60} error={error} testID="exercise-name" />
      <Field label={t('customExercise.description')} value={description} onChangeText={setDescription} multiline maxLength={400} />
      <Stack gap={2}>
        <Text variant="label" tone="muted">{t('customExercise.category')}</Text>
        <Row wrap gap={2}>
          {EXERCISE_CATEGORIES.map((c) => <Chip key={c} label={t(`categories.${c}`)} selected={category === c} onPress={() => setCategory(c)} />)}
        </Row>
        <Text variant="label" tone="muted">{t('customExercise.primary')}</Text>
        <Row wrap gap={2}>
          {MUSCLE_GROUPS.map((m) => <Chip key={m} label={t(`muscles.${m}`)} selected={primary === m} onPress={() => setPrimary(m)} />)}
        </Row>
        <Text variant="label" tone="muted">{t('customExercise.equipment')}</Text>
        <Row wrap gap={2}>
          {EQUIPMENT.map((e) => (
            <Chip key={e} label={t(`equipment.${e}`)} selected={equipment.includes(e)} onPress={() => setEquipment((l) => (l.includes(e) ? l.filter((x) => x !== e) : [...l, e]))} />
          ))}
        </Row>
        <Text variant="label" tone="muted">{t('customExercise.tracking')}</Text>
        <Row wrap gap={2}>
          {TRACKING_TYPES.map((k) => <Chip key={k} label={t(`tracking.${k}`)} selected={tracking === k} onPress={() => setTracking(k)} />)}
        </Row>
      </Stack>
    </Screen>
  );
}
