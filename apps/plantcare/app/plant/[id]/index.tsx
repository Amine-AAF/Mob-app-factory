import { Badge, Button, Card, Divider, EmptyState, IconButton, ListRow, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { TaskRow } from '@/components/care';
import { CATEGORY_ICON } from '@/components/icons';
import { PlantPhoto } from '@/components/PlantPhoto';
import { getSpecies } from '@/content/species';
import { speciesName } from '@/content/species/localize';
import { compareTasks } from '@/domain/schedule';
import { useData, useMutation } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { deletePhotos } from '@/services/photos';

export default function PlantDetail() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const mutate = useMutation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data } = useData(
    async (r) => {
      const plant = await r.plants.get(id);
      if (!plant) return { plant: null } as const;
      const [tasks, lastWater, location, health, journal] = await Promise.all([
        r.tasks.listForPlant(id),
        r.watering.last(id),
        plant.locationId ? r.locations.get(plant.locationId) : Promise.resolve(null),
        r.health.forPlant(id),
        r.journal.forPlant(id),
      ]);
      return { plant, tasks, lastWater, location, openHealth: health.filter((h) => h.status !== 'resolved').length, journalCount: journal.length };
    },
    [id],
  );

  if (data && !data.plant) {
    return (
      <Screen edges={[]}>
        <EmptyState icon="leaf-outline" title={t('plants.notFound')} action={<Button label={t('common.back')} onPress={() => router.back()} />} />
      </Screen>
    );
  }
  if (!data?.plant) return <Screen edges={[]}>{null}</Screen>;
  const { plant, tasks, lastWater, location, openHealth, journalCount } = data;
  const species = getSpecies(plant.speciesId);
  const active = tasks.filter((x) => x.active).sort(compareTasks);
  const hasWatering = active.some((x) => x.type === 'watering');

  const waterNow = () =>
    Alert.alert(t('watering.logTitle'), t('watering.logBody', { plant: plant.nickname }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('watering.confirm'), onPress: () => void mutate((r) => r.watering.log(plant.id, clock.today(), null)) },
    ]);

  const menu = () =>
    Alert.alert(plant.nickname, undefined, [
      { text: t('common.edit'), onPress: () => router.push({ pathname: '/plant/edit', params: { id: plant.id } }) },
      {
        text: t('plants.duplicate'),
        onPress: () =>
          void mutate((r) => r.plants.duplicate(plant.id, t('plants.copySuffix'))).then((copy) => {
            if (copy) router.replace(`/plant/${copy.id}`);
          }),
      },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () =>
          Alert.alert(t('plants.deleteTitle'), t('plants.deleteBody', { plant: plant.nickname }), [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('common.delete'),
              style: 'destructive',
              onPress: () =>
                void mutate((r) => r.plants.remove(plant.id)).then((photos) => {
                  deletePhotos(photos);
                  router.back();
                }),
            },
          ]),
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);

  return (
    <Screen edges={[]} testID="plant-detail">
      <RouterStack.Screen
        options={{
          title: plant.nickname,
          headerRight: () => (
            <Row gap={0}>
              <IconButton
                icon={plant.favorite ? 'heart' : 'heart-outline'}
                tone={plant.favorite ? 'danger' : 'default'}
                label={plant.favorite ? t('plants.unfavorite') : t('plants.favorite')}
                onPress={() => void mutate((r) => r.plants.setFavorite(plant.id, !plant.favorite), { reminders: false })}
              />
              <IconButton icon="ellipsis-vertical" label={t('common.more')} onPress={menu} />
            </Row>
          ),
        }}
      />
      <PlantPhoto path={plant.photoPath} height={220} radius={theme.radius.xl} icon={CATEGORY_ICON[plant.category]} label={plant.nickname} />
      <Stack gap={1}>
        <Text variant="title">{plant.nickname}</Text>
        {plant.commonName ? <Text tone="muted">{plant.commonName}</Text> : null}
        {plant.scientificName ? (
          <Text tone="muted" style={{ fontStyle: 'italic' }}>
            {plant.scientificName}
          </Text>
        ) : null}
        <Row wrap gap={1}>
          <Badge label={t(`categories.${plant.category}`)} icon={CATEGORY_ICON[plant.category]} tone="primary" />
          {location ? <Badge label={location.name} icon="location-outline" tone="neutral" /> : null}
          {openHealth > 0 ? <Badge label={t('health.openCount', { count: openHealth })} icon="medkit-outline" tone="warning" /> : null}
        </Row>
      </Stack>

      <Row wrap gap={2}>
        <Button size="md" icon="water" label={t('watering.waterNow')} onPress={waterNow} testID="water-now" />
        <Button size="md" variant="secondary" icon="create-outline" label={t('journal.add')} onPress={() => router.push({ pathname: '/record/journal', params: { plantId: plant.id } })} />
        <Button size="md" variant="secondary" icon="medkit-outline" label={t('health.report')} onPress={() => router.push({ pathname: '/record/health', params: { plantId: plant.id } })} />
      </Row>
      <Text variant="caption" tone="muted">
        {lastWater ? t('watering.lastOn', { date: fmt.day(lastWater.date) }) : t('watering.never')}
      </Text>

      <SectionHeader title={t('plantDetail.schedule')} action={t('tasks.add')} onAction={() => router.push({ pathname: '/task/edit', params: { plantId: plant.id } })} />
      {active.length === 0 ? (
        <Card tone="alt">
          <Text variant="bodySmall" tone="muted">
            {t('plantDetail.noSchedule')}
          </Text>
        </Card>
      ) : (
        <Stack gap={2}>
          {active.map((task) => (
            <TaskRow key={task.id} task={task} plant={plant} showPlant={false} onEdit={() => router.push({ pathname: '/task/edit', params: { plantId: plant.id, id: task.id } })} />
          ))}
          <Text variant="caption" tone="subtle">
            {t('plantDetail.editHint')}
          </Text>
        </Stack>
      )}
      {!hasWatering ? (
        <Button size="md" variant="ghost" icon="water-outline" label={t('watering.addSchedule')} onPress={() => router.push({ pathname: '/task/edit', params: { plantId: plant.id, type: 'watering' } })} />
      ) : null}

      <SectionHeader title={t('plantDetail.records')} />
      <Card>
        <ListRow icon="water-outline" title={t('watering.history')} onPress={() => router.push(`/plant/${plant.id}/watering`)} />
        <Divider />
        <ListRow icon="trending-up-outline" title={t('growth.title')} onPress={() => router.push(`/plant/${plant.id}/growth`)} />
        <Divider />
        <ListRow icon="book-outline" title={t('journal.title')} subtitle={t('journal.count', { count: journalCount })} onPress={() => router.push(`/plant/${plant.id}/journal`)} />
        <Divider />
        <ListRow icon="medkit-outline" title={t('health.title')} onPress={() => router.push(`/plant/${plant.id}/health`)} />
        <Divider />
        <ListRow icon="flask-outline" title={t('soil.title')} onPress={() => router.push(`/plant/${plant.id}/soil`)} />
        <Divider />
        <ListRow icon="notifications-outline" title={t('settings.notifications')} onPress={() => router.push({ pathname: '/settings/notifications', params: { plantId: plant.id } })} />
      </Card>

      {species ? (
        <>
          <SectionHeader title={t('plantDetail.libraryInfo')} action={t('common.seeMore')} onAction={() => router.push(`/species/${species.id}`)} />
          <Card tone="primary">
            <Text variant="subheading">{speciesName(species)}</Text>
            <Text variant="bodySmall">{`${t('library.light')}: ${species.light.map((l) => t(`light.${l}`)).join(', ')}`}</Text>
            <Text variant="bodySmall">{`${t('library.water')}: ${t(`water.${species.water}`)}`}</Text>
            <Text variant="bodySmall">{`${t('library.humidity')}: ${t(`humidity.${species.humidity}`)}`}</Text>
          </Card>
        </>
      ) : null}

      {plant.description || plant.notes || plant.acquiredOn || plant.plantedOn ? (
        <>
          <SectionHeader title={t('plantDetail.about')} />
          <Card>
            {plant.acquiredOn ? <Text variant="bodySmall">{`${t('plants.fields.acquiredOn')}: ${fmt.day(plant.acquiredOn)}`}</Text> : null}
            {plant.plantedOn ? <Text variant="bodySmall">{`${t('plants.fields.plantedOn')}: ${fmt.day(plant.plantedOn)}`}</Text> : null}
            {plant.description ? <Text>{plant.description}</Text> : null}
            {plant.notes ? (
              <View style={{ gap: 2 }}>
                <Text variant="label" tone="muted">
                  {t('plants.fields.notes')}
                </Text>
                <Text>{plant.notes}</Text>
              </View>
            ) : null}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}
