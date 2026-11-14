import { Button, Card, EmptyState, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image } from 'react-native';

import { DocumentForm } from '@/components/DocumentForm';
import { DocumentsGate } from '@/components/DocumentsGate';
import { formatBytes } from '@/components/TravelDocumentCard';
import { repos } from '@/database';
import { DocumentValidationError } from '@/database/repositories/documents';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import { deleteDocument } from '@/services/documents';
import { fileExists, openWithSystemViewer } from '@/services/files';
import { notifyDataChanged } from '@/store/session';

/** View a document offline (images in-app, PDFs with the phone's viewer), edit its details, delete it. */
export default function DocumentDetailScreen() {
  const { docId } = useLocalSearchParams<{ docId: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const { data } = useAsync(async () => ({ doc: await repos().documents.get(docId), trips: await repos().trips.list({ includeArchived: false }) }), [docId]);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (data && !data.doc) {
    return (
      <Screen edges={[]}>
        <EmptyState icon="alert-circle-outline" title={t('documents.errors.not_found')} />
      </Screen>
    );
  }
  if (!data?.doc) return <Screen edges={[]}>{null}</Screen>;
  const doc = data.doc;
  const isImage = doc.mimeType.startsWith('image/');
  const present = fileExists(doc.fileUri);

  const open = () =>
    openWithSystemViewer(doc.fileUri)
      .then((ok) => {
        if (!ok) Alert.alert(t('documents.noViewer'));
      })
      .catch((e) => {
        recordError(e, 'document_open');
        Alert.alert(t('documents.noViewer'));
      });

  const confirmDelete = () =>
    Alert.alert(t('documents.deleteTitle'), t('documents.deleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('documents.deleteConfirm'), style: 'destructive', onPress: () => deleteDocument(doc.id).then(() => router.back()) },
    ]);

  return (
    <DocumentsGate>
      <Screen edges={[]} testID="document-detail-screen">
        <RouterStack.Screen options={{ headerShown: true, title: doc.title }} />
        {!present ? (
          <Card tone="accent">
            <Text variant="bodySmall">{t('documents.fileMissing')}</Text>
          </Card>
        ) : isImage ? (
          <Image source={{ uri: doc.fileUri }} style={{ width: '100%', aspectRatio: 3 / 4, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceAlt }} resizeMode="contain" accessibilityLabel={doc.title} />
        ) : null}
        <Text variant="caption" tone="muted">
          {[t(`enums.documentType.${doc.type}`), formatBytes(doc.sizeBytes), t('documents.addedOn', { date: fmt.date(doc.createdAt.slice(0, 10)) })].join(' · ')}
        </Text>
        {present ? <Button label={isImage ? t('documents.openExternal') : t('documents.openPdf')} icon="open-outline" onPress={open} testID="document-open" /> : null}
        {editing ? (
          <DocumentForm
            initial={doc}
            trips={data.trips}
            submitLabel={t('common.save')}
            error={error}
            onSubmit={(meta) =>
              repos()
                .documents.update(doc.id, meta)
                .then(() => {
                  notifyDataChanged();
                  setEditing(false);
                })
                .catch((e) => setError(e instanceof DocumentValidationError ? t(`documents.errors.${e.code}`) : t('tripForm.errors.generic')))
            }
          />
        ) : (
          <Stack gap={2}>
            {doc.notes ? <Text variant="bodySmall">{doc.notes}</Text> : null}
            <Button label={t('common.edit')} variant="secondary" icon="create-outline" onPress={() => setEditing(true)} />
          </Stack>
        )}
        <Button label={t('documents.delete')} variant="danger" icon="trash-outline" onPress={confirmDelete} testID="document-delete" />
      </Screen>
    </DocumentsGate>
  );
}
