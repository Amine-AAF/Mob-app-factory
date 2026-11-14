import { addDays } from '@factory/app-core';
import { Button, Chip, IconButton, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DayField, SubjectPicker } from '@/components/pickers';
import { Stepper, TextField, ToggleRow } from '@/components/ui';
import { repos } from '@/database';
import type { GoalMetric, GoalPeriod } from '@/features/goals/goals';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { afterLearningWrite } from '@/services/progress';

const METRICS: GoalMetric[] = ['minutes', 'sessions', 'chapters', 'flashcards', 'quizzes'];
const DEFAULT_TARGET: Record<GoalMetric, number> = { minutes: 60, sessions: 3, chapters: 2, flashcards: 20, quizzes: 2 };

export default function GoalEdit() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string; challenge?: string }>();
  const [period, setPeriod] = useState<GoalPeriod>(params.challenge ? 'challenge' : 'daily');
  const [metric, setMetric] = useState<GoalMetric>('minutes');
  const [target, setTarget] = useState(60);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [startDay, setStartDay] = useState(clock.today());
  const [endDay, setEndDay] = useState(addDays(clock.today(), 29));
  const [active, setActive] = useState(true);
  const { data: subjects = [] } = useAsync(() => repos().subjects.list('active'), []);

  useEffect(() => {
    if (!params.id) return;
    void repos()
      .goals.list(false)
      .then((all) => {
        const g = all.find((x) => x.id === params.id);
        if (!g) return;
        setPeriod(g.period);
        setMetric(g.metric);
        setTarget(g.target);
        setTitle(g.title);
        setSubjectId(g.subjectId);
        if (g.startDay) setStartDay(g.startDay);
        if (g.endDay) setEndDay(g.endDay);
        setActive(g.active);
      });
  }, [params.id]);

  const save = async () => {
    const input = { title, period, metric, target, subjectId, startDay: period === 'challenge' ? startDay : null, endDay: period === 'challenge' ? (endDay < startDay ? startDay : endDay) : null };
    if (params.id) {
      await repos().goals.update(params.id, input);
      await repos().goals.setActive(params.id, active);
    } else await repos().goals.create(input);
    await afterLearningWrite(repos());
    router.back();
  };

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={save} testID="goal-save" />}>
      <RouterStack.Screen
        options={{
          title: params.id ? t('goals.edit') : period === 'challenge' ? t('goals.addChallenge') : t('goals.add'),
          headerRight: params.id
            ? () => (
                <IconButton
                  icon="trash-outline"
                  label={t('common.delete')}
                  onPress={async () => {
                    await repos().goals.remove(params.id!);
                    await afterLearningWrite(repos());
                    router.back();
                  }}
                />
              )
            : undefined,
        }}
      />
      <Stack gap={2}>
        <Text variant="bodySmall" style={{ fontWeight: '600' }}>
          {t('goals.period')}
        </Text>
        <Row gap={2} wrap>
          {(['daily', 'weekly', 'monthly', 'challenge'] as const).map((p) => (
            <Chip key={p} label={t(`goals.periods.${p}`)} selected={period === p} onPress={() => setPeriod(p)} />
          ))}
        </Row>
      </Stack>
      <Stack gap={2}>
        <Text variant="bodySmall" style={{ fontWeight: '600' }}>
          {t('goals.metric')}
        </Text>
        <Row gap={2} wrap>
          {METRICS.map((m) => (
            <Chip key={m} label={t(`goals.metrics.${m}`)} selected={metric === m} onPress={() => (setMetric(m), setTarget(DEFAULT_TARGET[m]))} />
          ))}
        </Row>
      </Stack>
      <Stepper label={t('goals.target')} value={target} onChange={setTarget} min={1} max={metric === 'minutes' ? 6000 : 1000} step={metric === 'minutes' ? 15 : 1} format={metric === 'minutes' ? fmt.duration : undefined} />
      <TextField label={t('goals.titleLabel')} placeholder={t(`goals.metrics.${metric}`)} value={title} onChangeText={setTitle} maxLength={60} />
      <SubjectPicker label={t('goals.subjectOptional')} subjects={subjects} value={subjectId} onChange={setSubjectId} />
      {period === 'challenge' ? (
        <>
          <DayField label={t('goals.start')} value={startDay} onChange={(d) => d && setStartDay(d)} />
          <DayField label={t('goals.end')} value={endDay} onChange={(d) => d && setEndDay(d)} />
        </>
      ) : null}
      {params.id ? <ToggleRow title={t('goals.activeLabel')} value={active} onChange={setActive} /> : null}
    </Screen>
  );
}
