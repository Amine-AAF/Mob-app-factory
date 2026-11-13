import { Badge, Button, Card, Icon, Row, Stack, Text, useTheme } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MetricCard } from '@/components/charts';
import { BADGES } from '@/features/goals/goals';
import { useData, useExercises, useFormat } from '@/hooks';

/** Post-workout summary: positive recap, records beaten, badges unlocked. */
export default function Summary() {
  const { id, achievements } = useLocalSearchParams<{ id: string; achievements?: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const ex = useExercises();
  const f = useFormat();
  const { data } = useData(async (r) => ({ session: await r.sessions.get(id), records: (await r.records.all()).filter((x) => x.sessionId === id) }), [id]);
  const badges = (achievements ?? '').split(',').filter((b) => BADGES.some((x) => x.id === b));
  if (!data?.session) return <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  const s = data.session;
  const sets = s.exercises.reduce((a, e) => a + e.sets.length, 0);
  // Show only real improvements (records whose previous value existed) — baselines are hidden.
  const improvements = data.records.filter((r) => r.kind !== 'est_1rm');

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: theme.colors.background }} testID="summary">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Stack gap={2} style={{ alignItems: 'center', marginTop: 12 }}>
          <Icon name="checkmark-done-circle" size={72} color={theme.colors.success} />
          <Text variant="display" center>
            {t('summary.title')}
          </Text>
          <Text tone="muted" center>
            {s.name}
          </Text>
        </Stack>
        <Row gap={3}>
          <MetricCard icon="time" value={f.duration(s.durationSec)} label={t('summary.duration')} />
          <MetricCard icon="layers" value={String(sets)} label={t('summary.sets')} tone="accent" />
        </Row>
        <Card>
          {s.exercises
            .filter((e) => e.sets.length)
            .map((e) => (
              <Row key={e.id} style={{ justifyContent: 'space-between' }}>
                <Text variant="bodySmall" style={{ flex: 1 }} numberOfLines={1}>
                  {ex.get(e.exerciseId)?.name ?? e.exerciseId}
                </Text>
                <Text variant="bodySmall" tone="muted">
                  {t('summary.setCount', { count: e.sets.length })}
                </Text>
              </Row>
            ))}
        </Card>
        {improvements.length ? (
          <Card tone="accent">
            <Row gap={2}>
              <Icon name="trophy" size={20} color={theme.colors.accent} />
              <Text variant="subheading">{t('summary.records', { count: improvements.length })}</Text>
            </Row>
            {improvements.slice(0, 6).map((r) => (
              <Text key={r.id} variant="bodySmall">{`${ex.get(r.exerciseId)?.name ?? ''} · ${t(`records.kinds.${r.kind}`)}`}</Text>
            ))}
          </Card>
        ) : null}
        {badges.length ? (
          <Card>
            <Text variant="subheading">{t('summary.badges')}</Text>
            <Row wrap gap={2}>
              {badges.map((b) => (
                <Badge key={b} label={t(`badges.${b}.name`)} tone="warning" icon="ribbon" />
              ))}
            </Row>
          </Card>
        ) : null}
        <Text variant="caption" tone="subtle" center>
          {t('summary.recover')}
        </Text>
        <Button label={t('summary.done')} onPress={() => router.replace('/(tabs)')} testID="summary-done" />
        <Button label={t('summary.viewDetails')} variant="ghost" onPress={() => router.replace({ pathname: '/session/[id]', params: { id } })} />
      </ScrollView>
    </SafeAreaView>
  );
}
