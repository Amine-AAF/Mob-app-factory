import { Button, Card, EmptyState, IconButton, Screen, Stack } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Image } from 'react-native';

import { ExpiryBadge, InfoLine, ItemRow, Notice, ScreenHeader } from '@/components/ui';
import { DOCUMENT_ICONS } from '@/config/icons';
import { repos } from '@/database';
import { expiryStatus } from '@/domain/warranty';
import { useData } from '@/hooks/useData';
import { useToday } from '@/hooks/useHome';
import { fmt } from '@/i18n';
import { deleteStoredFile, fileExists, fileUri, openStoredFile, shareStoredFile } from '@/services/files';
import { mutate } from '@/services/mutations';

/**
 * Document viewer. Images render in-app; other files open in the user's viewer through a
 * temporary read-only grant. NEVER shows ads (document consultation).
 */
export default function DocumentDetail() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const today = useToday();
  const { data } = useData(async () => {
    const r = repos();
    const doc = await r.documents.get(id);
    if (!doc) return null;
    const [asset, room] = await Promise.all([doc.assetId ? r.assets.get(doc.assetId) : null, doc.roomId ? r.homes.getRoom(doc.roomId) : null]);
    return { doc, asset, room };
  }, [id]);

  if (data === null) {
    return (
      <Screen>
        <ScreenHeader title="" back />
        <EmptyState icon="alert-circle-outline" title={t('common.notFound')} />
      </Screen>
    );
  }
  if (!data) return <Screen>{null}</Screen>;
  const { doc } = data;
  const hasFile = !!doc.filePath;
  const exists = hasFile && fileExists(doc.filePath);
  const isImage = !!doc.mimeType?.startsWith('image/');

  const explain = (res: string) => {
    if (res === 'missing') Alert.alert(t('files.missingTitle'), t('files.missing'));
    else if (res === 'no_app') Alert.alert(t('common.error'), t('files.noApp'));
    else if (res === 'error') Alert.alert(t('common.error'), t('files.openFailed'));
  };

  const remove = () =>
    Alert.alert(t('common.deleteTitle'), t('documents.deleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await mutate(() => repos().documents.remove(doc.id));
          deleteStoredFile(doc.filePath);
          router.back();
        },
      },
    ]);

  return (
    <Screen testID="document-detail">
      <ScreenHeader
        title={doc.title}
        subtitle={t(`documentTypes.${doc.type}`)}
        back
        right={
          <>
            <IconButton icon="create-outline" label={t('documents.edit')} onPress={() => router.push({ pathname: '/documents/edit', params: { id } })} />
            <IconButton icon="trash-outline" tone="danger" label={t('common.delete')} onPress={remove} />
          </>
        }
      />
      <ExpiryBadge status={expiryStatus(doc.expiryDate, today)} date={doc.expiryDate} today={today} />

      {hasFile && !exists ? (
        <Notice tone="danger" icon="alert-circle-outline">
          {t('files.missing')}
        </Notice>
      ) : null}
      {exists && isImage ? <Image source={{ uri: fileUri(doc.filePath) ?? undefined }} style={{ width: '100%', aspectRatio: 0.75, borderRadius: 12 }} resizeMode="contain" accessibilityLabel={doc.title} /> : null}

      {exists ? (
        <Stack gap={2}>
          <Button label={t('documents.open')} icon="open-outline" onPress={() => void openStoredFile(doc.filePath as string, doc.mimeType).then(explain)} testID="open-doc" />
          <Button label={t('documents.share')} icon="share-outline" variant="secondary" onPress={() => void shareStoredFile(doc.filePath as string, doc.mimeType, doc.fileName, t('documents.share')).then(explain)} />
        </Stack>
      ) : (
        <Button label={hasFile ? t('documents.reattach') : t('documents.attach')} icon="attach-outline" variant="secondary" onPress={() => router.push({ pathname: '/documents/edit', params: { id } })} />
      )}

      <Card>
        <InfoLine icon={DOCUMENT_ICONS[doc.type]} label={t('fields.fileName')} value={doc.fileName ? `${doc.fileName}${doc.sizeBytes ? ` · ${fmt.fileSize(doc.sizeBytes)}` : ''}` : null} />
        <InfoLine icon="calendar-outline" label={t('fields.issueDate')} value={doc.issueDate ? fmt.day(doc.issueDate, 'long') : null} />
        <InfoLine icon="hourglass-outline" label={t('fields.expiryDate')} value={doc.expiryDate ? fmt.day(doc.expiryDate, 'long') : null} />
        <InfoLine icon="reader-outline" label={t('fields.notes')} value={doc.notes} />
        <InfoLine icon="time-outline" label={t('documents.addedOn')} value={fmt.day(doc.createdAt.slice(0, 10), 'long')} />
      </Card>
      {data.asset ? <ItemRow icon="cube-outline" title={data.asset.name} subtitle={t('fields.asset')} onPress={() => router.push(`/assets/${data.asset!.id}`)} /> : null}
      {data.room ? <ItemRow icon="grid-outline" title={data.room.name} subtitle={t('fields.room')} onPress={() => router.push(`/rooms/${data.room!.id}`)} /> : null}
    </Screen>
  );
}
