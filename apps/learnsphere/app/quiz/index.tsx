import { Icon, Row, Screen, Stack, Stat, Text, useTheme, type IconName } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Panel, SubjectIcon } from '@/components/ui';
import { QUIZ_BANKS } from '@/content';
import { repos } from '@/database';
import { quizStats } from '@/features/quiz/engine';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';

export default function QuizHub() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data } = useAsync(async () => {
    const [counts, attempts, subjects] = await Promise.all([repos().quiz.bankCounts(), repos().quiz.attempts({ limit: 50 }), repos().subjects.list('active')]);
    return { counts, attempts, subjects };
  }, []);
  if (!data) return <Screen edges={[]}>{null}</Screen>;
  const stats = quizStats(data.attempts);
  const bankName = (id: string) => (QUIZ_BANKS.some((b) => b.id === id) ? t(`quiz.banks.${id}`) : (data.subjects.find((s) => s.id === id)?.name ?? t('quiz.myQuestions')));

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('quiz.title') }} />
      <Panel title={t('quiz.stats')} icon="stats-chart-outline">
        <Row gap={3}>
          <Stat value={fmt.number(stats.attempts)} label={t('quiz.attempts')} icon="checkbox-outline" />
          <Stat value={`${stats.average}%`} label={t('quiz.average')} icon="analytics-outline" tone="accent" />
          <Stat value={`${stats.best}%`} label={t('quiz.best')} icon="trophy-outline" tone="success" />
        </Row>
      </Panel>
      <Text variant="heading" accessibilityRole="header">
        {t('quiz.demoBanks')}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {QUIZ_BANKS.map((b) => (
          <Pressable
            key={b.id}
            onPress={() => router.push({ pathname: '/quiz/bank', params: { bank: b.id } })}
            accessibilityRole="button"
            accessibilityLabel={`${t(`quiz.banks.${b.id}`)}, ${t('quiz.questionsCount', { count: data.counts[b.id] ?? 0 })}`}
            style={{ width: '47%', flexGrow: 1, backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: 14, gap: 8 }}
          >
            <SubjectIcon icon={b.icon} color={b.color} />
            <Text variant="subheading">{t(`quiz.banks.${b.id}`)}</Text>
            <Text variant="caption" tone="subtle">
              {t('quiz.questionsCount', { count: data.counts[b.id] ?? 0 })}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text variant="heading" accessibilityRole="header">
        {t('quiz.bySubject')}
      </Text>
      <Text variant="bodySmall" tone="muted">
        {t('quiz.bySubjectHelp')}
      </Text>
      <Stack gap={2}>
        {data.subjects.map((s) => (
          <Pressable key={s.id} onPress={() => router.push({ pathname: '/quiz/bank', params: { bank: s.id } })} accessibilityRole="button" accessibilityLabel={s.name}>
            <Row gap={3} style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: 12, borderWidth: 1, borderColor: theme.colors.border }}>
              <SubjectIcon icon={s.icon} color={s.color} size={32} />
              <Text style={{ flex: 1 }}>{s.name}</Text>
              <Text variant="caption" tone="subtle">
                {t('quiz.questionsCount', { count: data.counts[s.id] ?? 0 })}
              </Text>
              <Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} />
            </Row>
          </Pressable>
        ))}
      </Stack>
      <Text variant="heading" accessibilityRole="header">
        {t('quiz.history')}
      </Text>
      {data.attempts.length === 0 ? (
        <Text variant="bodySmall" tone="muted">
          {t('quiz.noHistory')}
        </Text>
      ) : (
        data.attempts.slice(0, 20).map((a) => (
          <Pressable key={a.id} onPress={() => router.push({ pathname: '/quiz/result', params: { attempt: a.id } })} accessibilityRole="button" accessibilityLabel={`${bankName(a.bankId)} ${a.score}%`}>
            <Row gap={3} style={{ paddingVertical: 6 }}>
              <Icon name={(a.mode === 'exam' ? 'school-outline' : 'barbell-outline') as IconName} size={20} color={theme.colors.textMuted} />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1}>{bankName(a.bankId)}</Text>
                <Text variant="caption" tone="subtle">
                  {t(`quiz.modes.${a.mode}`)} · {fmt.dateTime(a.finishedAt)}
                </Text>
              </View>
              <Text variant="subheading" tone={a.score >= 80 ? 'success' : a.score >= 50 ? 'default' : 'danger'}>
                {a.score}%
              </Text>
            </Row>
          </Pressable>
        ))
      )}
    </Screen>
  );
}
