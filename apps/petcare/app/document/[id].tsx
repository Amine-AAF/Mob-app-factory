import { Badge, Button, Card, EmptyState, Row, Screen, Text } from '@factory/design-system';
import { File } from 'expo-file-system';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useTranslation } from 'react-i18next';
import { Alert, Image } from 'react-native';

import { SelectChips } from '@/components/fields';
import { repos } from '@/database';
import { DOCUMENT_CATEGORIES } from '@/domain/types';
import { useData } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import { deleteFile, fileExists, fileFor } from '@/services/files';
import { mutate } from '@/services/mutations';

/**
 * Document viewer. Medical-content screen: no advertising is ever shown here.
 * Images render in-app; PDFs open in the system viewer through a content:// grant.
 */
export default function DocumentScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useData(async (r) => {
    const doc = await r.documents.get(id);
    return doc ? { doc, pet: await r.pets.get(doc.petId) } : null;
  }, [id]);

  if (!data) return <Screen>{null}</Screen>;
  const { doc } = data;
  const present = fileExists('documents', doc.fileName);
  const isImage = doc.mimeType?.startsWith('image/') ?? /\.(jpe?g|png|webp)$/i.test(doc.fileName);

  const open = async () => {
    try {
      const f: File = fileFor('documents', doc.fileName);
      if (await f.canPreview()) await f.preview({ mimeType: doc.mimeType ?? undefined, title: doc.title });
      else if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(f.uri, { mimeType: doc.mimeType ?? undefined });
    } catch (e) {
      recordError(e, 'doc_open');
      Alert.alert(t('documents.openFailedTitle'), t('documents.openFailed'));
    }
  };

  // Sharing an existing document stays free; the free limit only applies to adding documents.
  const share = async () => {
    try {
      await Sharing.shareAsync(fileFor('documents', doc.fileName).uri, { mimeType: doc.mimeType ?? undefined, dialogTitle: doc.title });
    } catch (e) {
      recordError(e, 'doc_share');
    }
  };

  const remove = () =>
    Alert.alert(t('common.deleteTitle'), t('documents.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await mutate(t, () => repos().remove('documents', doc.id));
          deleteFile('documents', doc.fileName);
          router.back();
        },
      },
    ]);

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: doc.title }} />
      <Card>
        <Text variant="heading">{doc.title}</Text>
        <Row wrap gap={2}>
          <Badge label={t(`options.documentCategory.${doc.category}`)} tone="primary" />
          {data.pet ? <Badge label={data.pet.name} tone="neutral" /> : null}
          <Badge label={fmt.day(doc.createdAt.slice(0, 10))} tone="neutral" />
          {doc.sizeBytes ? <Badge label={`${fmt.number(doc.sizeBytes / 1024 / 1024, 1)} MB`} tone="neutral" /> : null}
        </Row>
        {doc.notes ? <Text tone="muted">{doc.notes}</Text> : null}
      </Card>
      {!present ? (
        <EmptyState icon="alert-circle-outline" title={t('documents.missingTitle')} message={t('documents.missingBody')} />
      ) : isImage ? (
        <Image source={{ uri: fileFor('documents', doc.fileName).uri }} style={{ width: '100%', aspectRatio: 0.75, borderRadius: 12 }} resizeMode="contain" accessibilityLabel={doc.title} />
      ) : null}
      {present ? <Button label={t('documents.open')} icon="open-outline" onPress={open} testID="open-document" /> : null}
      {present ? <Button label={t('documents.share')} icon="share-outline" variant="secondary" onPress={share} /> : null}
      <SelectChips
        label={t('fields.category')}
        value={doc.category}
        options={DOCUMENT_CATEGORIES}
        onChange={(c) => c && mutate(t, () => repos().tables.documents.update(doc.id, { category: c }))}
        labelFor={(c) => t(`options.documentCategory.${c}`)}
      />
      <Button label={t('common.delete')} variant="danger" icon="trash-outline" onPress={remove} />
    </Screen>
  );
}
