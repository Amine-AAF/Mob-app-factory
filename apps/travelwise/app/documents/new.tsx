import { Button, Card, Icon, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DocumentForm } from '@/components/DocumentForm';
import { DocumentsGate } from '@/components/DocumentsGate';
import { formatBytes } from '@/components/TravelDocumentCard';
import { repos } from '@/database';
import { DocumentValidationError, MAX_DOCUMENT_BYTES, checkFile } from '@/database/repositories/documents';
import { PremiumLimitError } from '@/features/premium/guard';
import { FREE_LIMITS } from '@/features/premium/limits';
import { useAsync } from '@/hooks/useAsync';
import { recordError } from '@/services/analytics';
import { importDocument, pickDocumentFile, type PickedFile } from '@/services/documents';
import { FileImportError } from '@/services/files';

export default function NewDocumentScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const { data: trips } = useAsync(() => repos().trips.list({ includeArchived: false }), []);
  const [picked, setPicked] = useState<PickedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const describe = (e: unknown) => {
    if (e instanceof PremiumLimitError) return t('premium.limitDocuments', { count: FREE_LIMITS.documents });
    if (e instanceof DocumentValidationError) return t(`documents.errors.${e.code}`, { max: formatBytes(MAX_DOCUMENT_BYTES) });
    if (e instanceof FileImportError) return t(`documents.errors.${e.code}`);
    recordError(e, 'document_import');
    return t('tripForm.errors.generic');
  };

  const pick = async () => {
    setError(null);
    try {
      const f = await pickDocumentFile();
      if (!f) return;
      const problem = checkFile(f.mimeType, f.sizeBytes < 0 ? null : f.sizeBytes);
      if (problem) {
        setError(t(`documents.errors.${problem}`, { max: formatBytes(MAX_DOCUMENT_BYTES) }));
        return;
      }
      setPicked(f);
    } catch (e) {
      setError(describe(e));
    }
  };

  return (
    <DocumentsGate>
      <Screen edges={[]} testID="new-document-screen">
        <RouterStack.Screen options={{ headerShown: true, title: t('documents.add') }} />
        {!picked ? (
          <Stack gap={3}>
            <Text tone="muted">{t('documents.pickHint', { max: formatBytes(MAX_DOCUMENT_BYTES) })}</Text>
            <Button label={t('documents.pick')} icon="document-attach-outline" size="lg" onPress={pick} testID="document-pick" />
            {error ? <Text tone="danger">{error}</Text> : null}
          </Stack>
        ) : (
          <Stack gap={4}>
            <Card tone="alt">
              <Row gap={2}>
                <Icon name={picked.mimeType === 'application/pdf' ? 'document-text-outline' : 'image-outline'} size={20} color={theme.colors.primary} />
                <Text variant="bodySmall" style={{ flex: 1 }} numberOfLines={1}>
                  {`${picked.name} · ${formatBytes(picked.sizeBytes)}`}
                </Text>
                <Button label={t('documents.change')} variant="ghost" onPress={pick} />
              </Row>
            </Card>
            <DocumentForm
              trips={trips ?? []}
              defaultTripId={tripId ?? null}
              submitLabel={t('common.save')}
              error={error}
              saving={saving}
              onSubmit={(meta) => {
                setSaving(true);
                setError(null);
                importDocument(picked, meta)
                  .then(() => router.back())
                  .catch((e) => setError(describe(e)))
                  .finally(() => setSaving(false));
              }}
            />
          </Stack>
        )}
      </Screen>
    </DocumentsGate>
  );
}
