import { Button, EmptyState, Icon, IconButton, Row, Screen, Text, useTheme } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { JOURNAL_ICON } from '@/components/icons';
import { useLeaf } from '@/components/leaf';
import { PlantPhoto } from '@/components/PlantPhoto';
import type { JournalEntry } from '@/domain/types';
import { useData, useMutation } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { deletePhotos } from '@/services/photos';

/** Visual timeline of the plant's journal, newest first. */
export default function Journal() {
  const { t } = useTranslation();
  const theme = useTheme();
  const tokens = useLeaf();
  const router = useRouter();
  const mutate = useMutation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useData(async (r) => ({ plant: await r.plants.get(id), entries: await r.journal.forPlant(id) }), [id]);
  const entries = data?.entries ?? [];

  const remove = (e: JournalEntry) =>
    Alert.alert(t('journal.deleteTitle'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => void mutate((r) => r.journal.remove(e.id), { reminders: false }).then((p) => deletePhotos([p])) },
    ]);

  return (
    <Screen edges={[]} footer={<Button label={t('journal.add')} icon="add" onPress={() => router.push({ pathname: '/record/journal', params: { plantId: id } })} testID="add-journal" />}>
      <RouterStack.Screen options={{ title: t('journal.title') }} />
      <Text variant="subheading">{data?.plant?.nickname}</Text>
      {entries.length === 0 ? (
        <EmptyState icon="book-outline" title={t('journal.empty')} message={t('journal.emptyBody')} />
      ) : (
        <View>
          {entries.map((e, i) => (
            <View key={e.id} style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ alignItems: 'center', width: 36 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: tokens.sage, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={JOURNAL_ICON[e.kind]} size={18} color={theme.colors.primary} />
                </View>
                {i < entries.length - 1 ? <View style={{ flex: 1, width: 2, backgroundColor: theme.colors.border, marginVertical: 2 }} /> : null}
              </View>
              <View style={{ flex: 1, paddingBottom: 18, gap: 4 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="caption" tone="muted">{`${fmt.day(e.date)} · ${t(`journalKinds.${e.kind}`)}`}</Text>
                    {e.title ? <Text variant="subheading">{e.title}</Text> : null}
                  </View>
                  <IconButton icon="trash-outline" label={t('common.delete')} onPress={() => remove(e)} />
                </Row>
                {e.body ? <Text>{e.body}</Text> : null}
                {e.photoPath ? <PlantPhoto path={e.photoPath} height={180} label={e.title || t(`journalKinds.${e.kind}`)} /> : null}
              </View>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}
