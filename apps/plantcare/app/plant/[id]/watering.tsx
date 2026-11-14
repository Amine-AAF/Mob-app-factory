import { Card, EmptyState, Icon, IconButton, Row, Screen, Stack, Stat, Text, useTheme } from '@factory/design-system';
import { addDays, diffDays } from '@factory/app-core';
import { Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { PremiumCard } from '@/components/care';
import { useLeaf } from '@/components/leaf';
import { historyCutoff } from '@/domain/limits';
import { volumeFromMl, volumeUnit } from '@/domain/units';
import { useData, useMutation } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

export default function WateringHistory() {
  const { t } = useTranslation();
  const theme = useTheme();
  const tokens = useLeaf();
  const mutate = useMutation();
  const isPremium = useIsPremium();
  const units = usePreferences((s) => s.units) ?? 'metric';
  const { id } = useLocalSearchParams<{ id: string }>();
  const cutoff = historyCutoff(isPremium, clock.today(), addDays);

  const { data } = useData(async (r) => ({ plant: await r.plants.get(id), records: await r.watering.forPlant(id), skipped: (await r.history.forPlant(id)).filter((h) => h.type === 'watering') }), [id]);
  const all = data?.records ?? [];
  const records = cutoff ? all.filter((w) => w.date >= cutoff) : all;
  const hidden = all.length - records.length;
  const gaps = all.slice(0, -1).map((w, i) => diffDays(all[i + 1]!.date, w.date));
  const avg = gaps.length ? Math.round(gaps.reduce((s, g) => s + g, 0) / gaps.length) : null;

  const remove = (recId: string) =>
    Alert.alert(t('watering.deleteTitle'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => void mutate((r) => r.watering.remove(recId), { reminders: false }) },
    ]);

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('watering.history') }} />
      <Text variant="subheading">{data?.plant?.nickname}</Text>
      <Row gap={2}>
        <Stat value={String(all.length)} label={t('watering.total')} icon="water" />
        <Stat value={avg !== null ? t('tasks.everyDays', { count: avg }) : '—'} label={t('watering.averageGap')} icon="time-outline" tone="accent" />
      </Row>
      <Text variant="caption" tone="muted">
        {t('watering.averageHint')}
      </Text>
      {records.length === 0 ? (
        <EmptyState icon="water-outline" title={t('watering.noHistory')} />
      ) : (
        <Stack gap={2}>
          {records.map((w) => (
            <Card key={w.id}>
              <Row gap={3}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: tokens.waterSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="water" size={18} color={tokens.water} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text>{fmt.day(w.date, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                  {w.amountMl ? <Text variant="caption" tone="muted">{`${fmt.number(volumeFromMl(w.amountMl, units))} ${volumeUnit(units)}`}</Text> : null}
                  {w.notes ? <Text variant="bodySmall" tone="muted">{w.notes}</Text> : null}
                </View>
                <IconButton icon="trash-outline" label={t('common.delete')} onPress={() => remove(w.id)} />
              </Row>
            </Card>
          ))}
        </Stack>
      )}
      {(data?.skipped.length ?? 0) > 0 ? (
        <Text variant="caption" tone="muted">
          {t('watering.skippedCount', { count: data!.skipped.filter((h) => h.action === 'skipped').length })}
        </Text>
      ) : null}
      {hidden > 0 ? <PremiumCard title={t('premium.historyTitle')} message={t('premium.historyBody', { count: hidden })} source="history" /> : null}
      <View style={{ height: theme.spacing(4) }} />
    </Screen>
  );
}
