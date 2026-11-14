import { Button, Card, Chip, ListRow, OptionCard, Row, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from 'react-native';

import { JOB_ROLE_META } from '@/content/taxonomy';
import { MOCK_DURATIONS, QUESTIONS_PER_DURATION, type MockDuration } from '@/features/mock-interview/session';
import { repos } from '@/database';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import { remainingFreeMocks, startMockInterview } from '@/services/practice';
import { usePreferences } from '@/store/preferences';
import { useIsPremium, useSession } from '@/store/session';
import { DIFFICULTIES, JOB_ROLES, type Difficulty, type JobRoleId } from '@/types/content';

export default function MockSetup() {
  const { t } = useTranslation();
  const profile = useSession((s) => s.profile);
  const isPremium = useIsPremium();
  const timerPref = usePreferences((s) => s.mockTimerEnabled);
  const [role, setRole] = useState<JobRoleId | null>(profile?.jobRole ?? null);
  const [level, setLevel] = useState<Difficulty>(profile?.level ?? 'beginner');
  const [minutes, setMinutes] = useState<MockDuration>(10);
  const [timer, setTimer] = useState(timerPref);
  const [problem, setProblem] = useState<'limit' | 'empty' | 'error' | null>(null);
  const [starting, setStarting] = useState(false);

  const { data } = useAsync(async () => {
    const [history, remaining] = await Promise.all([repos().practice.listMocks(10), remainingFreeMocks()]);
    return { history, remaining };
  }, []);

  const start = async () => {
    setStarting(true);
    setProblem(null);
    try {
      usePreferences.getState().set({ mockTimerEnabled: timer });
      const result = await startMockInterview({ role, level, minutes, timerEnabled: timer, isPremium });
      if (result.status === 'started') router.push({ pathname: '/mock/[id]', params: { id: String(result.sessionId) } });
      else setProblem(result.status === 'limit-reached' ? 'limit' : 'empty');
    } catch (e) {
      recordError(e, 'mock_start');
      setProblem('error');
    } finally {
      setStarting(false);
    }
  };

  return (
    <Screen edges={[]} testID="mock-setup">
      <RouterStack.Screen options={{ title: t('practice.mock.title') }} />
      <Text tone="muted">{t('mock.intro')}</Text>

      <SectionHeader title={t('mock.role')} />
      <Row wrap gap={2}>
        <Chip label={t('mock.generalRole')} selected={role === null} onPress={() => setRole(null)} />
        {JOB_ROLES.map((r) => (
          <Chip key={r} label={t(`roles.${r}`)} icon={JOB_ROLE_META[r].icon} selected={role === r} onPress={() => setRole(r)} testID={`mock-role-${r}`} />
        ))}
      </Row>

      <SectionHeader title={t('mock.level')} />
      <Row wrap gap={2}>
        {DIFFICULTIES.map((d) => (
          <Chip key={d} label={t(`difficulty.${d}`)} selected={level === d} onPress={() => setLevel(d)} />
        ))}
      </Row>

      <SectionHeader title={t('mock.duration')} />
      <Stack gap={2}>
        {MOCK_DURATIONS.map((m) => (
          <OptionCard
            key={m}
            title={t('common.minutes', { count: m })}
            subtitle={t('common.questions', { count: QUESTIONS_PER_DURATION[m] })}
            selected={minutes === m}
            onPress={() => setMinutes(m)}
            role="radio"
            testID={`mock-duration-${m}`}
          />
        ))}
      </Stack>

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Stack gap={1} style={{ flex: 1 }}>
            <Text variant="subheading">{t('mock.timer')}</Text>
            <Text variant="bodySmall" tone="muted">
              {t('mock.timerHint')}
            </Text>
          </Stack>
          <Switch value={timer} onValueChange={setTimer} accessibilityLabel={t('mock.timer')} />
        </Row>
      </Card>

      {!isPremium ? (
        <Text variant="caption" tone="subtle">
          {t('mock.freeRemaining', { count: data?.remaining ?? 0 })}
        </Text>
      ) : null}
      {problem ? <Text tone="danger">{problem === 'limit' ? t('mock.limitReached') : problem === 'empty' ? t('mock.noQuestions') : t('common.error')}</Text> : null}
      {problem === 'limit' ? <Button label={t('paywall.cta')} variant="secondary" onPress={() => router.push({ pathname: '/paywall', params: { source: 'mock_limit' } })} /> : null}
      <Button label={t('mock.start')} size="lg" loading={starting} onPress={start} testID="mock-start" />

      <SectionHeader title={t('mock.history')} />
      {data?.history.length ? (
        data.history.map((m) => (
          <ListRow
            key={m.id}
            title={`${m.jobRole === 'general' ? t('mock.generalRole') : t(`roles.${m.jobRole}`)} · ${t('common.minutes', { count: m.minutes })}`}
            subtitle={`${fmt.date(new Date(m.startedAt), { day: 'numeric', month: 'short' })} · ${
              m.completedAt ? (m.selfScore !== null ? t('mock.selfScore', { score: m.selfScore }) : t('mock.completed')) : t('mock.notFinished')
            }`}
            icon={m.completedAt ? 'checkmark-circle-outline' : 'time-outline'}
            onPress={m.completedAt ? () => router.push({ pathname: '/mock/[id]', params: { id: String(m.id), review: '1' } }) : undefined}
          />
        ))
      ) : (
        <Text tone="muted">{t('mock.historyEmpty')}</Text>
      )}
    </Screen>
  );
}
