import { Button, EmptyState, IconButton, Row, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { TaskRow } from '@/components/care';
import { LOCATION_ICON } from '@/components/icons';
import { PlantCard } from '@/components/PlantCard';
import { PlantPhoto } from '@/components/PlantPhoto';
import { buildAgenda } from '@/domain/schedule';
import { useData, useMutation } from '@/hooks/useData';
import { clock } from '@/services/clock';
import { deletePhotos } from '@/services/photos';

/** One space: its plants and the care tasks for this zone. */
export default function LocationDetail() {
  const { t } = useTranslation();
  const router = useRouter();
  const mutate = useMutation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useData(async (r) => ({ location: await r.locations.get(id), plants: await r.plants.list({ locationId: id }), tasks: await r.tasks.listForLocation(id) }), [id]);
  const loc = data?.location;
  if (data && !loc) return <EmptyState icon="grid-outline" title={t('garden.notFound')} />;
  if (!loc) return <Screen edges={[]}>{null}</Screen>;
  const byId = new Map(data.plants.map((p) => [p.id, p]));
  const agenda = buildAgenda(data.tasks, clock.today(), 7);
  const due = [...agenda.overdue, ...agenda.today, ...agenda.upcoming];

  const remove = () =>
    Alert.alert(t('garden.deleteTitle'), t('garden.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () =>
          void mutate((r) => r.locations.remove(loc.id), { reminders: false }).then((p) => {
            deletePhotos([p]);
            router.back();
          }),
      },
    ]);

  return (
    <Screen edges={[]}>
      <RouterStack.Screen
        options={{
          title: loc.name,
          headerRight: () => (
            <Row gap={0}>
              <IconButton icon="create-outline" label={t('common.edit')} onPress={() => router.push({ pathname: '/garden/edit', params: { id: loc.id } })} />
              <IconButton icon="trash-outline" tone="danger" label={t('common.delete')} onPress={remove} />
            </Row>
          ),
        }}
      />
      <PlantPhoto path={loc.photoPath} height={160} icon={LOCATION_ICON[loc.type]} label={loc.name} />
      <Text tone="muted">{loc.description || t(`locationTypes.${loc.type}`)}</Text>

      <SectionHeader title={t('garden.zoneCare')} />
      {due.length === 0 ? (
        <Text tone="muted">{t('garden.noCare')}</Text>
      ) : (
        <Stack gap={2}>
          {due.map((task) => (
            <TaskRow key={task.id} task={task} plant={byId.get(task.plantId)} />
          ))}
        </Stack>
      )}

      <SectionHeader title={t('garden.plantsHere', { count: data.plants.length })} action={t('plants.add')} onAction={() => router.push({ pathname: '/plant/edit', params: { locationId: loc.id } })} />
      {data.plants.length === 0 ? (
        <Button variant="secondary" icon="add" label={t('plants.add')} onPress={() => router.push({ pathname: '/plant/edit', params: { locationId: loc.id } })} />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 }}>
          {data.plants.map((p) => (
            <PlantCard key={p.id} plant={p} />
          ))}
        </View>
      )}
    </Screen>
  );
}
