import { Button, Card, Row, Screen, Stack as UIStack, Text } from '@factory/design-system';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { SelectChips, TextField } from '@/components/fields';
import { repos } from '@/database';
import { canAddDocument } from '@/domain/limits';
import { DOCUMENT_CATEGORIES, type DocumentCategory } from '@/domain/types';
import { createId } from '@/domain/units';
import { useData } from '@/hooks/useData';
import { recordError, track } from '@/services/analytics';
import { deleteFile, extensionFor, importFile } from '@/services/files';
import { mutate } from '@/services/mutations';
import { useIsPremium } from '@/store/session';

interface Picked {
  uri: string;
  name: string | null;
  mimeType: string | null;
}

/**
 * Imports a document or photo into private storage. Uses the system pickers only
 * (Storage Access Framework / Android photo picker): no storage permission is requested,
 * and the file never leaves the device.
 */
export default function NewDocument() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ petId?: string; healthRecordId?: string; vaccinationId?: string }>();
  const isPremium = useIsPremium();
  const { data: pets } = useData((r) => r.pets.listActive());
  const [petId, setPetId] = useState<string | null>(params.petId ?? null);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('other');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true, multiple: false });
      if (res.canceled || !res.assets[0]) return;
      const a = res.assets[0];
      setPicked({ uri: a.uri, name: a.name, mimeType: a.mimeType ?? null });
      if (!title) setTitle(a.name.replace(/\.[^.]+$/, '').slice(0, 60));
    } catch (e) {
      recordError(e, 'doc_pick');
    }
  };

  const pickPhoto = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
      if (res.canceled || !res.assets[0]) return;
      const a = res.assets[0];
      setPicked({ uri: a.uri, name: a.fileName ?? null, mimeType: a.mimeType ?? 'image/jpeg' });
    } catch (e) {
      recordError(e, 'doc_photo');
    }
  };

  const save = async () => {
    if (!picked) return setError(t('documents.pickFirst'));
    if (!petId) return setError(t('errors.pickPet'));
    if (!title.trim()) return setError(t('errors.required'));
    setSaving(true);
    let fileName: string | null = null;
    try {
      const r = repos();
      if (!canAddDocument(await r.documents.countForPet(petId), isPremium)) {
        router.replace('/paywall?source=documents');
        return;
      }
      const id = createId('doc');
      const imported = await importFile('documents', picked.uri, id, extensionFor(picked.mimeType, picked.name));
      fileName = imported.fileName;
      await mutate(t, () =>
        r.create('documents', {
          id,
          petId,
          category,
          title: title.trim(),
          fileName: imported.fileName,
          mimeType: picked.mimeType,
          sizeBytes: imported.sizeBytes,
          healthRecordId: params.healthRecordId ?? null,
          vaccinationId: params.vaccinationId ?? null,
          notes: notes.trim() || null,
        }),
      );
      track('record_added', { kind: 'document' });
      router.back();
    } catch (e) {
      // Never leave an orphan file when the metadata insert failed.
      if (fileName) deleteFile('documents', fileName);
      recordError(e, 'doc_save');
      Alert.alert(t('errors.saveFailedTitle'), t('errors.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={save} loading={saving} disabled={!picked} testID="save-document" />}>
      <Stack.Screen options={{ title: t('documents.add') }} />
      <Card tone="alt">
        <Text variant="bodySmall" tone="muted">
          {t('documents.localOnly')}
        </Text>
        <Row gap={2}>
          <UIStack style={{ flex: 1 }}>
            <Button label={t('documents.pickFile')} icon="document-outline" variant="secondary" size="md" onPress={pickFile} />
          </UIStack>
          <UIStack style={{ flex: 1 }}>
            <Button label={t('documents.pickPhoto')} icon="image-outline" variant="secondary" size="md" onPress={pickPhoto} />
          </UIStack>
        </Row>
        {picked ? <Text variant="bodySmall">{t('documents.selected', { name: picked.name ?? t('documents.photo') })}</Text> : null}
      </Card>
      {!params.petId ? (
        <SelectChips label={t('fields.pet')} value={petId} options={(pets ?? []).map((p) => p.id)} onChange={setPetId} labelFor={(id) => pets?.find((p) => p.id === id)?.name ?? ''} required />
      ) : null}
      <TextField label={t('fields.title')} value={title} onChange={setTitle} required error={error} maxLength={80} testID="doc-title" />
      <SelectChips label={t('fields.category')} value={category} options={DOCUMENT_CATEGORIES} onChange={(c) => c && setCategory(c)} labelFor={(c) => t(`options.documentCategory.${c}`)} required />
      <TextField label={t('fields.notes')} value={notes} onChange={setNotes} multiline />
    </Screen>
  );
}
