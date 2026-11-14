import { Button, Chip, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Field } from '@/components/ui';
import { LEVELS, PROGRAM_GOALS, PROGRAM_TYPES, type Level, type ProgramGoal, type ProgramType } from '@/content/types';
import { repos } from '@/database';
import { track } from '@/services/analytics';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';
import { cleanText } from '@/utils';

/** Create (or edit the details of, with ?id=) a workout program. */
export default function ProgramForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { t } = useTranslation();
  const prefs = usePreferences();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [type, setType] = useState<ProgramType>('custom');
  const [goal, setGoal] = useState<ProgramGoal>(prefs.goal);
  const [level, setLevel] = useState<Level>(prefs.level);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void repos()
      .programs.get(id)
      .then((p) => {
        if (!p) return;
        setName(p.name);
        setDescription(p.description ?? '');
        setNotes(p.notes ?? '');
        setType(p.type);
        setGoal(p.goal);
        setLevel(p.level);
      });
  }, [id]);

  const save = async () => {
    const n = cleanText(name, 60);
    if (!n) return setError(t('builder.nameRequired'));
    const input = { name: n, description: cleanText(description, 400), notes: cleanText(notes, 1000), type, goal, level };
    if (id) {
      await repos().programs.update(id, input);
      useSession.getState().bump();
      router.back();
    } else {
      const { programId } = await repos().programs.create(input, t('builder.dayName', { n: 1 }));
      track('program_created', { origin: 'custom', type });
      useSession.getState().bump();
      router.replace({ pathname: '/program/[id]', params: { id: programId } });
    }
  };

  return (
    <Screen edges={[]} footer={<Button label={id ? t('common.save') : t('builder.create')} onPress={() => void save()} testID="save-program" />}>
      <Field label={t('builder.name')} value={name} onChangeText={(s) => { setName(s); setError(null); }} maxLength={60} error={error} testID="program-name" placeholder={t('builder.namePlaceholder')} />
      <Field label={t('builder.description')} value={description} onChangeText={setDescription} multiline maxLength={400} />
      <Stack gap={2}>
        <Text variant="label" tone="muted">{t('builder.type')}</Text>
        <Row wrap gap={2}>{PROGRAM_TYPES.map((p) => <Chip key={p} label={t(`programTypes.${p}`)} selected={type === p} onPress={() => setType(p)} />)}</Row>
        <Text variant="label" tone="muted">{t('builder.goal')}</Text>
        <Row wrap gap={2}>{PROGRAM_GOALS.map((g) => <Chip key={g} label={t(`goals.${g}`)} selected={goal === g} onPress={() => setGoal(g)} />)}</Row>
        <Text variant="label" tone="muted">{t('builder.level')}</Text>
        <Row wrap gap={2}>{LEVELS.map((l) => <Chip key={l} label={t(`levels.${l}`)} selected={level === l} onPress={() => setLevel(l)} />)}</Row>
      </Stack>
      <Field label={t('builder.notes')} value={notes} onChangeText={setNotes} multiline maxLength={1000} />
    </Screen>
  );
}
