import { Badge, Button, Card, Icon, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { addDays, fromDayKey } from '@factory/app-core';
import { router, Stack as RouterStack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { SectionTitle } from '@/components/ui';
import { repos } from '@/database';
import { DAILY_XP, describeChallenge } from '@/engine';
import { useAsync, useContentT } from '@/hooks';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { dailyFor } from '@/services/dailyService';

/** Daily challenge: same puzzle for everyone on a given local date, playable offline, once per day. */
export default function Daily() {
  const { t } = useTranslation();
  const theme = useTheme();
  const ct = useContentT();
  const today = clock.today();
  const daily = dailyFor(today);
  const text = describeChallenge(daily.challenge, ct);
  const { data } = useAsync(async () => {
    const r = repos();
    const status = await r.progress.getDaily(today);
    const week = await Promise.all(Array.from({ length: 7 }, (_, i) => addDays(today, i - 6)).map(async (day) => ({ day, record: await r.progress.getDaily(day) })));
    return { status, week };
  }, [today]);

  return (
    <>
      <RouterStack.Screen options={{ title: t('daily.title') }} />
      <Screen edges={[]} testID="daily" footer={!data?.status ? <Button label={t('daily.play')} icon="play" onPress={() => router.push({ pathname: '/game', params: { mode: 'daily' } })} testID="daily-play" /> : undefined}>
        <Text tone="muted">{fmt.date(fromDayKey(today), { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        <Card tone="accent">
          <Row style={{ justifyContent: 'space-between' }}>
            <Badge label={t(`category.${daily.challenge.category}.name`)} tone="accent" />
            <Badge label={t(`difficulty.${daily.challenge.difficulty}`)} tone="neutral" />
          </Row>
          <Text variant="title">{text.title}</Text>
          <Text variant="bodySmall">{text.instructions}</Text>
          <Row gap={2}>
            <Icon name="star" size={16} color={theme.colors.accent} />
            <Text variant="bodySmall">{t('daily.reward', { xp: DAILY_XP[daily.challenge.difficulty] })}</Text>
          </Row>
        </Card>
        {data?.status ? (
          <Card tone={data.status.status === 'completed' ? 'primary' : 'alt'} testID="daily-status">
            <Text variant="heading">{data.status.status === 'completed' ? t('daily.completedTitle') : t('daily.failedTitle')}</Text>
            <Text variant="bodySmall">{data.status.status === 'completed' ? t('daily.completedBody', { xp: data.status.xpAwarded }) : t('daily.failedBody')}</Text>
          </Card>
        ) : (
          <Text variant="bodySmall" tone="muted">
            {t('daily.rules')}
          </Text>
        )}
        <SectionTitle icon="calendar-outline">{t('daily.week')}</SectionTitle>
        <Row style={{ justifyContent: 'space-between' }} accessible accessibilityLabel={t('daily.weekA11y', { count: data?.week.filter((w) => w.record?.status === 'completed').length ?? 0 })}>
          {(data?.week ?? []).map(({ day, record }) => (
            <Stack key={day} gap={1} style={{ alignItems: 'center' }}>
              <Text variant="caption" tone="muted">
                {fmt.weekday(fromDayKey(day))}
              </Text>
              <View style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: record?.status === 'completed' ? theme.colors.success : theme.colors.surfaceAlt, borderWidth: day === today ? 2 : 0, borderColor: theme.colors.accent }}>
                {record ? <Icon name={record.status === 'completed' ? 'checkmark' : 'close'} size={16} color={record.status === 'completed' ? theme.colors.onPrimary : theme.colors.textSubtle} /> : null}
              </View>
            </Stack>
          ))}
        </Row>
      </Screen>
    </>
  );
}
