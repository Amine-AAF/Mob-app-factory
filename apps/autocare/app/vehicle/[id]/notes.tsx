import { Card, EmptyState, Screen } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Fab, ItemRow } from '@/components/ui';
import { repos } from '@/database';
import { useAsync, useFormat } from '@/hooks';

export default function VehicleNotes() {
  const { t } = useTranslation();
  const f = useFormat();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useAsync(() => repos().notes.list(id), [id]);
  return (
    <>
      <RouterStack.Screen options={{ title: t('notes.title') }} />
      <View style={{ flex: 1 }}>
        <Screen edges={[]}>
          {data && data.length === 0 ? <EmptyState icon="create-outline" title={t('notes.empty')} /> : null}
          {data?.length ? (
            <Card>
              {data.map((n) => (
                <ItemRow key={n.id} icon={n.pinned ? 'pin' : 'document-text-outline'} title={n.title} subtitle={[f.day(n.updatedAt.slice(0, 10)), n.body?.slice(0, 80)].filter(Boolean).join(' · ')} onPress={() => router.push({ pathname: '/note/edit', params: { id: n.id } })} />
              ))}
            </Card>
          ) : null}
        </Screen>
        <Fab label={t('notes.add')} onPress={() => router.push({ pathname: '/note/edit', params: { vehicleId: id } })} />
      </View>
    </>
  );
}
