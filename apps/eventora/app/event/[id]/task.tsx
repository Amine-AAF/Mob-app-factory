import { Button, Screen } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ChoiceChips, DateField, SelectField, TextField } from '@/components/forms';
import { confirmDelete, ScreenTitle } from '@/components/ui';
import { repos } from '@/database';
import { TASK_CATEGORIES, TASK_PRIORITIES, TASK_STATUSES, type TaskCategory, type TaskInput, type TaskPriority, type TaskStatus } from '@/domain/types';
import { mutate, useSnapshot } from '@/hooks/useData';

export default function TaskForm() {
  const { t } = useTranslation();
  const { id, taskId, vendorId } = useLocalSearchParams<{ id: string; taskId?: string; vendorId?: string }>();
  const { data: snap } = useSnapshot(id);
  const [form, setForm] = useState<TaskInput>({ eventId: id, title: '', description: '', assignee: '', dueDate: null, priority: 'medium', category: 'other', status: 'todo', notes: '', vendorId: vendorId ?? null });
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    void repos()
      .tasks.get(taskId)
      .then((x) => {
        if (!x) return;
        const { id: _i, createdAt: _c, completedAt: _d, ...rest } = x;
        setForm(rest);
      });
  }, [taskId]);

  const patch = (p: Partial<TaskInput>) => setForm((f) => ({ ...f, ...p }));
  const save = async () => {
    if (!form.title.trim()) return setError(true);
    try {
      if (taskId) await mutate((r) => r.tasks.update(taskId, form));
      else await mutate((r) => r.tasks.add(form));
      router.back();
    } catch {
      Alert.alert(t('errors.saveFailed'));
    }
  };

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={() => void save()} testID="task-save" />}>
      <ScreenTitle title={taskId ? t('tasks.edit') : t('tasks.add')} />
      <TextField label={t('task.title')} value={form.title} onChangeText={(title) => patch({ title })} error={error ? t('errors.task.title') : null} placeholder={t('task.titlePlaceholder')} testID="task-title" />
      <ChoiceChips<TaskStatus> label={t('task.status')} value={form.status} onChange={(status) => patch({ status })} options={TASK_STATUSES.map((s) => ({ value: s, label: t(`taskStatus.${s}`) }))} />
      <DateField label={t('task.due')} value={form.dueDate} onChange={(dueDate) => patch({ dueDate })} optional />
      <ChoiceChips<TaskPriority> label={t('task.priority')} value={form.priority} onChange={(priority) => patch({ priority })} options={TASK_PRIORITIES.map((p) => ({ value: p, label: t(`priority.${p}`) }))} />
      <SelectField<TaskCategory> label={t('task.category')} value={form.category} options={TASK_CATEGORIES.map((c) => ({ value: c, label: t(`taskCategory.${c}`) }))} onChange={(c) => c && patch({ category: c })} />
      <TextField label={t('task.assignee')} value={form.assignee} onChangeText={(assignee) => patch({ assignee })} placeholder={t('task.assigneePlaceholder')} />
      <SelectField label={t('task.vendor')} value={form.vendorId} optional placeholder={t('expense.noVendor')} options={(snap?.vendors ?? []).map((v) => ({ value: v.id, label: v.name }))} onChange={(v) => patch({ vendorId: v })} icon="storefront-outline" />
      <TextField label={t('task.description')} value={form.description} onChangeText={(description) => patch({ description })} multiline />
      <TextField label={t('task.notes')} value={form.notes} onChangeText={(notes) => patch({ notes })} multiline />
      {taskId ? <Button variant="danger" label={t('tasks.delete')} onPress={() => confirmDelete(t, form.title, () => void mutate((r) => r.tasks.remove(taskId)).then(() => router.back()))} /> : null}
    </Screen>
  );
}
