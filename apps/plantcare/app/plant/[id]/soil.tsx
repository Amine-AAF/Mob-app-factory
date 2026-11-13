import { Button, Card, EmptyState, IconButton, Row, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import type { Repositories } from '@/database';
import { lengthFromCm, lengthUnit } from '@/domain/units';
import { useData, useMutation } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { usePreferences } from '@/store/preferences';

/** Fertilizer & Soil manager for one plant. Doses are never suggested by the app. */
export default function Soil() {
  const { t } = useTranslation();
  const router = useRouter();
  const mutate = useMutation();
  const units = usePreferences((s) => s.units) ?? 'metric';
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useData(async (r) => ({ plant: await r.plants.get(id), fert: await r.fertilizer.forPlant(id), soil: await r.soil.forPlant(id), tasks: (await r.tasks.listForPlant(id)).filter((x) => x.active && x.type === 'fertilizing') }), [id]);

  const confirmDelete = (fn: (r: Repositories) => Promise<void>) =>
    Alert.alert(t('common.deleteConfirm'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => void mutate(fn, { reminders: false }) },
    ]);

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('soil.title') }} />
      <Text variant="subheading">{data?.plant?.nickname}</Text>
      <Card tone="alt">
        <Text variant="bodySmall" tone="muted">
          {t('soil.dosageWarning')}
        </Text>
      </Card>

      <SectionHeader title={t('soil.fertilizer')} action={t('common.add')} onAction={() => router.push({ pathname: '/record/fertilizer', params: { plantId: id } })} />
      {data?.tasks.length ? (
        <Text variant="caption" tone="muted">
          {t('soil.scheduled', { count: data.tasks[0]!.intervalDays ?? 0 })}
        </Text>
      ) : (
        <Button size="md" variant="ghost" icon="calendar-outline" label={t('soil.planFeeding')} onPress={() => router.push({ pathname: '/task/edit', params: { plantId: id, type: 'fertilizing' } })} />
      )}
      {(data?.fert.length ?? 0) === 0 ? (
        <EmptyState icon="flask-outline" title={t('soil.noFertilizer')} />
      ) : (
        <Stack gap={2}>
          {data!.fert.map((f) => (
            <Card key={f.id}>
              <Row gap={2}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="subheading">{[t(`fertilizerTypes.${f.fertilizerType}`), f.brand].filter(Boolean).join(' · ')}</Text>
                  <Text variant="caption" tone="muted">
                    {fmt.day(f.appliedOn)}
                  </Text>
                  {f.composition ? <Text variant="bodySmall">{`${t('soil.composition')}: ${f.composition}`}</Text> : null}
                  {f.quantity ? <Text variant="bodySmall">{`${t('soil.quantity')}: ${f.quantity}`}</Text> : null}
                  {f.notes ? <Text variant="bodySmall" tone="muted">{f.notes}</Text> : null}
                </View>
                <IconButton icon="trash-outline" label={t('common.delete')} onPress={() => confirmDelete((r) => r.fertilizer.remove(f.id))} />
              </Row>
            </Card>
          ))}
        </Stack>
      )}

      <SectionHeader title={t('soil.substrate')} action={t('common.add')} onAction={() => router.push({ pathname: '/record/soil', params: { plantId: id } })} />
      {(data?.soil.length ?? 0) === 0 ? (
        <EmptyState icon="cube-outline" title={t('soil.noSoil')} />
      ) : (
        <Stack gap={2}>
          {data!.soil.map((s, i) => (
            <Card key={s.id} tone={i === 0 ? 'primary' : 'default'}>
              <Row gap={2}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="subheading">{t(`substrates.${s.substrate}`)}</Text>
                  <Text variant="caption" tone="muted">{`${t('soil.repottedOn')} ${fmt.day(s.repottedOn)}${i === 0 ? ` · ${t('soil.current')}` : ''}`}</Text>
                  {s.potSizeCm ? <Text variant="bodySmall">{`${t('soil.potSize')}: ${fmt.number(lengthFromCm(s.potSizeCm, units))} ${lengthUnit(units)}`}</Text> : null}
                  {s.notes ? <Text variant="bodySmall" tone="muted">{s.notes}</Text> : null}
                </View>
                <IconButton icon="trash-outline" label={t('common.delete')} onPress={() => confirmDelete((r) => r.soil.remove(s.id))} />
              </Row>
            </Card>
          ))}
        </Stack>
      )}
    </Screen>
  );
}
