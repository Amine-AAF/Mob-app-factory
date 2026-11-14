import { Button, Row, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, View } from 'react-native';

import { ChoiceChips, DateField, Field, FormScreen, InfoNote, ItemRow, PremiumGate, VehicleChooser } from '@/components/ui';
import { DOCUMENT_ICONS } from '@/constants/icons';
import { repos } from '@/database';
import { canAddDocument, FREE_LIMITS } from '@/features/premium/limits';
import { useAsync } from '@/hooks';
import { useEditorParams } from '@/hooks/data';
import { recordError } from '@/services/analytics';
import { afterWrite } from '@/services/boot';
import { clock } from '@/services/clock';
import { feedback } from '@/services/feedback';
import { deleteStoredFile, fileExists, fileUri, FileTooLargeError, openStoredFile, pickAndStore, shareStoredFile, type PickedFile } from '@/services/fileStore';
import { useIsPremium } from '@/store/session';
import { DOCUMENT_CATEGORIES, type DocumentCategory } from '@/types';
import { cleanText } from '@/utils';
import { isValidDay } from '@/utils/dates';
import { formatSize } from '@/screens/DocumentsView';

export default function DocumentEdit() {
  const { t } = useTranslation();
  const premium = useIsPremium();
  const { id, vehicleId: vParam } = useEditorParams();
  const { data } = useAsync(async () => ({ vehicles: await repos().vehicles.list(), existing: id ? await repos().documents.get(id) : null, count: await repos().documents.count() }), [id]);

  const [loaded, setLoaded] = useState(false);
  const [vehicleId, setVehicleId] = useState<string | null>(vParam ?? null);
  const [file, setFile] = useState<PickedFile | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('registration');
  const [expiry, setExpiry] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const saved = useRef(false);

  // Hydrate the form once the record is loaded (render-time state adjustment, no extra effect pass).
  if (data && !loaded) {
    const e = data.existing;
    if (e) {
      setVehicleId(e.vehicleId);
      setFile({ fileName: e.fileName, mimeType: e.mimeType, sizeBytes: e.sizeBytes, originalName: e.title });
      setTitle(e.title);
      setCategory(e.category);
      setExpiry(e.expiryDay ?? '');
      setNotes(e.notes ?? '');
    }
    setLoaded(true);
  }

  // A file picked but never saved is removed from private storage when the screen closes.
  const unsaved = useRef<string | null>(null);
  const existingFile = data?.existing?.fileName;
  useEffect(() => {
    unsaved.current = file && file.fileName !== existingFile ? file.fileName : null;
  }, [file, existingFile]);
  useEffect(
    () => () => {
      if (!saved.current && unsaved.current) deleteStoredFile(unsaved.current);
    },
    [],
  );

  if (!id && data && !canAddDocument(premium, data.count)) {
    return (
      <View style={{ padding: 20 }}>
        <RouterStack.Screen options={{ title: t('documents.new') }} />
        <PremiumGate reason="documents" title={t('documents.limitTitle', { count: FREE_LIMITS.documents })} />
      </View>
    );
  }

  const pick = async () => {
    setError(null);
    try {
      const picked = await pickAndStore('document');
      if (!picked) return;
      if (file && file.fileName !== data?.existing?.fileName) deleteStoredFile(file.fileName);
      setFile(picked);
      if (!title) setTitle(picked.originalName.replace(/\.[a-z0-9]+$/i, ''));
    } catch (e) {
      setError(e instanceof FileTooLargeError ? t('documents.tooLarge') : t('common.error'));
    }
  };

  const errors = {
    file: !file ? t('documents.noFile') : null,
    title: !title.trim() ? t('common.required') : null,
    expiry: expiry && !isValidDay(expiry) ? t('common.invalidDate') : null,
  };
  const show = (e: string | null) => (submitted ? e : null);

  const save = async () => {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean) || !file) {
      feedback.warning();
      return;
    }
    setSaving(true);
    try {
      const e = data?.existing;
      await repos().documents.save(
        {
          id: id ?? undefined,
          vehicleId,
          category,
          title: title.trim().slice(0, 120),
          fileName: file.fileName,
          mimeType: file.mimeType,
          sizeBytes: file.sizeBytes,
          expiryDay: expiry || null,
          notes: cleanText(notes, 2000),
          maintenanceId: e?.maintenanceId ?? null,
          expenseId: e?.expenseId ?? null,
          insuranceId: e?.insuranceId ?? null,
          deadlineId: e?.deadlineId ?? null,
        },
        clock.now(),
      );
      saved.current = true;
      if (e && e.fileName !== file.fileName) deleteStoredFile(e.fileName);
      afterWrite();
      feedback.success();
      router.back();
    } catch (err) {
      recordError(err, 'document_save');
      Alert.alert(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const remove = () =>
    Alert.alert(t('common.deleteConfirmTitle'), t('common.deleteConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          const name = await repos().documents.remove(id!);
          deleteStoredFile(name);
          saved.current = true;
          afterWrite();
          router.back();
        },
      },
    ]);

  const available = file ? fileExists(file.fileName) : false;

  return (
    <>
      <RouterStack.Screen options={{ title: id ? t('documents.editTitle') : t('documents.new') }} />
      <FormScreen onSave={() => void save()} saving={saving} extra={id ? <Button label={t('common.delete')} variant="danger" size="md" icon="trash-outline" onPress={remove} /> : null}>
        <InfoNote icon="lock-closed-outline" text={t('documents.privacy')} />
        <Stack gap={2}>
          {file ? (
            <>
              {file.mimeType.startsWith('image/') && available ? <Image source={{ uri: fileUri(file.fileName) }} style={{ width: '100%', height: 180, borderRadius: 12 }} resizeMode="cover" accessibilityLabel={title} /> : null}
              <ItemRow icon={DOCUMENT_ICONS[category]} title={file.originalName} subtitle={available ? t('documents.picked', { name: file.mimeType, size: formatSize(file.sizeBytes) }) : t('documents.fileMissing')} />
              {available ? (
                <Row gap={2}>
                  <View style={{ flex: 1 }}>
                    <Button label={t('common.open')} icon="eye-outline" variant="secondary" size="md" onPress={() => void openStoredFile(file.fileName, file.mimeType, title)} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button label={t('common.share')} icon="share-outline" variant="secondary" size="md" onPress={() => void shareStoredFile(file.fileName, file.mimeType, title)} />
                  </View>
                </Row>
              ) : null}
            </>
          ) : null}
          <Button label={t('documents.pick')} icon="document-attach-outline" variant={file ? 'ghost' : 'primary'} size="md" onPress={() => void pick()} testID="pick-file" />
          {error || show(errors.file) ? (
            <Text variant="caption" tone="danger">
              {error ?? errors.file}
            </Text>
          ) : null}
        </Stack>
        <Field label={t('documents.titleField')} value={title} onChangeText={setTitle} error={show(errors.title)} />
        <ChoiceChips label={t('documents.category')} value={category} options={DOCUMENT_CATEGORIES.map((c) => ({ value: c, label: t(`documentCategories.${c}`), icon: DOCUMENT_ICONS[c] }))} onChange={setCategory} />
        <Text variant="label" tone="muted">
          {t('documents.linkedVehicle')}
        </Text>
        <VehicleChooser vehicles={data?.vehicles ?? []} value={vehicleId} onChange={setVehicleId} allowAll allLabel={t('documents.noVehicle')} />
        <DateField label={`${t('documents.expiry')} (${t('common.optional')})`} value={expiry} onChange={setExpiry} error={show(errors.expiry)} allowEmpty />
        <Field label={t('common.notes')} value={notes} onChangeText={setNotes} multiline />
      </FormScreen>
    </>
  );
}
