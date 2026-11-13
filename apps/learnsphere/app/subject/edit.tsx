import { Button, Screen, Stack } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DayField } from '@/components/pickers';
import { ColorPicker, IconPicker, TextField } from '@/components/ui';
import { repos } from '@/database';
import { afterLearningWrite } from '@/services/progress';
import { clock } from '@/services/clock';

export default function SubjectEdit() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [objective, setObjective] = useState('');
  const [color, setColor] = useState('#1F6F8B');
  const [icon, setIcon] = useState('book');
  const [startDay, setStartDay] = useState<string | null>(clock.today());
  const [targetDay, setTargetDay] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    void repos()
      .subjects.get(id)
      .then((s) => {
        if (!s) return;
        setName(s.name);
        setDescription(s.description);
        setObjective(s.objective);
        setColor(s.color);
        setIcon(s.icon);
        setStartDay(s.startDay);
        setTargetDay(s.targetDay);
      });
  }, [id]);

  const save = async () => {
    if (!name.trim()) return setError(t('validation.required'));
    if (startDay && targetDay && targetDay < startDay) return setError(t('validation.targetAfterStart'));
    setSaving(true);
    const input = { name, description, objective, color, icon, startDay, targetDay };
    if (id) {
      await repos().subjects.update(id, input);
      await afterLearningWrite(repos());
      router.back();
    } else {
      const newId = await repos().subjects.create(input);
      await afterLearningWrite(repos());
      router.replace({ pathname: '/subject/[id]', params: { id: newId } });
    }
  };

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={save} loading={saving} testID="subject-save" />}>
      <RouterStack.Screen options={{ title: id ? t('courses.editSubject') : t('courses.newSubject') }} />
      <Stack gap={4}>
        <TextField label={t('courses.fields.name')} value={name} onChangeText={(v) => (setName(v), setError(null))} error={error} maxLength={60} testID="subject-name" autoFocus={!id} />
        <TextField label={t('courses.fields.description')} value={description} onChangeText={setDescription} multiline maxLength={500} />
        <TextField label={t('courses.fields.objective')} placeholder={t('courses.fields.objectivePlaceholder')} value={objective} onChangeText={setObjective} maxLength={200} />
        <DayField label={t('courses.fields.startDay')} value={startDay} onChange={setStartDay} allowClear />
        <DayField label={t('courses.fields.targetDay')} value={targetDay} onChange={setTargetDay} allowClear />
        <ColorPicker label={t('courses.fields.color')} value={color} onChange={setColor} />
        <IconPicker label={t('courses.fields.icon')} value={icon} onChange={setIcon} color={color} />
      </Stack>
    </Screen>
  );
}
