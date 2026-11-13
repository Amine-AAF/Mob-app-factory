import { Screen } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Fab, ScreenTitle } from '@/components/ui';
import { TaskBoard } from '@/features/TaskBoard';
import { useSnapshot } from '@/hooks/useData';

export default function EventTasks() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: snap } = useSnapshot(id);
  return (
    <>
      <Screen edges={[]}>
        <ScreenTitle title={t('modules.tasks')} />
        {snap ? <TaskBoard tasks={snap.tasks} /> : null}
      </Screen>
      <Fab label={t('tasks.add')} onPress={() => router.push({ pathname: '/event/[id]/task', params: { id } })} testID="task-add" />
    </>
  );
}
