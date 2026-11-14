import { Badge, Button, Card, Chip, Icon, ProgressBar, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { repos } from '@/database';
import { currentDayIndex, PATH_LENGTHS, planProgress, type PathLength, type PathTask } from '@/features/learning-path/plan';
import { useAsync } from '@/hooks/useAsync';
import { useQuestions } from '@/hooks/useContent';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import { createLearningPath, setPathTask } from '@/services/practice';
import { useIsPremium, useSession } from '@/store/session';

export default function PathScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const profile = useSession((s) => s.profile);
  const isPremium = useIsPremium();
  const questions = useQuestions();
  const [length, setLength] = useState<PathLength>(profile?.daysAvailable && (PATH_LENGTHS as readonly number[]).includes(profile.daysAvailable) ? (profile.daysAvailable as PathLength) : 14);
  const [showDay, setShowDay] = useState<number | null>(null);

  const { data, reload } = useAsync(async () => {
    const path = await repos().practice.activePath();
    const done = path ? await repos().practice.completedTasks(path.id) : new Set<string>();
    return { path, done };
  }, []);

  const path = data?.path ?? null;
  const done = useMemo(() => data?.done ?? new Set<string>(), [data]);
  const today = clock.today();
  const todayIndex = path ? currentDayIndex(path.startDay, today, path.plan.days.length) : 0;
  const dayIndex = showDay ?? todayIndex;
  const day = path?.plan.days[dayIndex];
  const progress = useMemo(() => (path ? planProgress(path.plan, done) : null), [path, done]);
  // Free plan: short paths only. Longer, personalised paths are a Premium feature.
  const lengthAllowed = (l: PathLength) => isPremium || l <= 14;

  const create = async () => {
    try {
      await createLearningPath({ role: profile?.jobRole ?? null, level: profile?.level ?? 'beginner', goal: profile?.goal ?? 'practice', length, isPremium });
      setShowDay(null);
      reload();
    } catch (e) {
      recordError(e, 'path_create');
    }
  };

  const toggle = async (task: PathTask) => {
    if (!path || !day) return;
    const nowDone = !done.has(task.id);
    const after = new Set(done);
    if (nowDone) after.add(task.id);
    else after.delete(task.id);
    await setPathTask(path.id, day.index, task.id, nowDone, planProgress(path.plan, after).ratio === 1);
    reload();
  };

  const openTask = (task: PathTask) => {
    if (task.kind === 'quiz') router.push({ pathname: '/quiz', params: task.category ? { category: task.category } : {} });
    else if (task.kind === 'review') router.push('/flashcards');
    else if (task.kind === 'mock') router.push('/mock');
  };

  if (!path) {
    return (
      <Screen edges={[]} testID="path-setup">
        <RouterStack.Screen options={{ title: t('path.title') }} />
        <Text variant="title">{profile?.jobRole ? t('path.headlineRole', { role: t(`roles.${profile.jobRole}`), count: length }) : t('path.headline', { count: length })}</Text>
        <Text tone="muted">{t('path.intro')}</Text>
        <Row wrap gap={2}>
          {PATH_LENGTHS.map((l) => (
            <Chip key={l} label={t('common.days', { count: l })} selected={length === l} onPress={() => (lengthAllowed(l) ? setLength(l) : router.push({ pathname: '/paywall', params: { source: 'path_length' } }))} icon={lengthAllowed(l) ? undefined : 'lock-closed-outline'} />
          ))}
        </Row>
        <Text variant="caption" tone="subtle">
          {t('path.disclaimer')}
        </Text>
        <Button label={t('path.create')} size="lg" onPress={create} testID="path-create" />
      </Screen>
    );
  }

  return (
    <Screen edges={[]} testID="path">
      <RouterStack.Screen options={{ title: t('path.title') }} />
      <Card tone="primary">
        <Stack gap={2}>
          <Text variant="heading">{path.jobRole === 'general' ? t('path.generalTitle') : t('roles.' + path.jobRole)}</Text>
          <ProgressBar progress={progress?.ratio ?? 0} label={t('path.progress', { done: progress?.done ?? 0, total: progress?.total ?? 0 })} />
          <Text variant="caption" tone="muted">
            {t('path.progress', { done: progress?.done ?? 0, total: progress?.total ?? 0 })}
          </Text>
          {path.status === 'completed' ? <Badge label={t('path.completed')} tone="success" icon="trophy-outline" /> : null}
        </Stack>
      </Card>

      <Row wrap gap={2}>
        {path.plan.days.map((d) => (
          <Chip key={d.index} label={String(d.index + 1)} selected={d.index === dayIndex} onPress={() => setShowDay(d.index)} />
        ))}
      </Row>

      <SectionHeader title={dayIndex === todayIndex ? t('path.today', { day: dayIndex + 1 }) : t('path.day', { day: dayIndex + 1 })} />
      {day?.tasks.map((task) => {
        const isDone = done.has(task.id);
        return (
          <Card key={task.id}>
            <Stack gap={2}>
              <Row gap={3}>
                <Pressable onPress={() => toggle(task)} accessibilityRole="checkbox" accessibilityState={{ checked: isDone }} accessibilityLabel={t(`path.task.${task.kind}`)} hitSlop={8} testID={`task-${task.id}`}>
                  <Icon name={isDone ? 'checkbox' : 'square-outline'} size={26} color={isDone ? theme.colors.success : theme.colors.textSubtle} />
                </Pressable>
                <Stack gap={0} style={{ flex: 1 }}>
                  <Text variant="subheading">{t(`path.task.${task.kind}`)}</Text>
                  <Text variant="caption" tone="muted">
                    {task.kind === 'study'
                      ? t('common.questions', { count: task.questionIds.length })
                      : task.kind === 'quiz' && task.category
                        ? t(`categories.${task.category}`)
                        : t(`path.taskHint.${task.kind}`)}
                  </Text>
                </Stack>
                {task.kind !== 'study' ? <Button label={t('common.start')} variant="ghost" onPress={() => openTask(task)} /> : null}
              </Row>
              {task.kind === 'study'
                ? task.questionIds.map((qid) => {
                    const q = questions.find((x) => x.id === qid);
                    return q ? (
                      <Pressable key={qid} onPress={() => router.push({ pathname: '/question/[id]', params: { id: qid } })} accessibilityRole="link">
                        <Text variant="bodySmall" tone="primary">
                          • {q.question}
                        </Text>
                      </Pressable>
                    ) : null;
                  })
                : null}
            </Stack>
          </Card>
        );
      })}

      <Button label={t('path.restart')} variant="ghost" onPress={() => repos().practice.setPathStatus(path.id, 'archived').then(reload)} />
    </Screen>
  );
}
