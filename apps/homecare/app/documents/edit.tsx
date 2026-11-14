import { Button, Card, Row, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { FormScreen, orNull } from '@/components/FormScreen';
import { ChipSelect, DateField, SelectField, Stepper, TextField } from '@/components/forms';
import { PremiumLock } from '@/components/media';
import { IconTile, Notice } from '@/components/ui';
import { DOCUMENT_ICONS } from '@/config/icons';
import { canCreate } from '@/config/limits';
import { repos } from '@/database';
import { DOCUMENT_TYPES, type Asset, type DocumentType, type Room } from '@/domain/types';
import { useActiveHome } from '@/hooks/useHome';
import { fmt } from '@/i18n';
import { recordError, track } from '@/services/analytics';
import { deleteStoredFile, importDocument, type StoredFile } from '@/services/files';
import { mutate } from '@/services/mutations';
import { useIsPremium } from '@/store/session';

/**
 * Import a file (or create a paper-only record) and describe it. The file is copied into
 * private app storage; replacing it deletes the previous private copy.
 */
export default function DocumentEdit() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string; assetId?: string; type?: string }>();
  const id = params.id;
  const home = useActiveHome();
  const isPremium = useIsPremium();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [file, setFile] = useState<StoredFile | null>(null);
  const [originalPath, setOriginalPath] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<DocumentType>((DOCUMENT_TYPES as readonly string[]).includes(params.type ?? '') ? (params.type as DocumentType) : 'invoice');
  const [assetId, setAssetId] = useState<string | null>(params.assetId ?? null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [issueDate, setIssueDate] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [daysBefore, setDaysBefore] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!home) return;
    void repos().assets.list(home.id).then(setAssets);
    void repos().homes.listRooms(home.id).then(setRooms);
    if (!id) return;
    void repos()
      .documents.get(id)
      .then((d) => {
        if (!d) return;
        setTitle(d.title);
        setType(d.type);
        setAssetId(d.assetId);
        setRoomId(d.roomId);
        setIssueDate(d.issueDate);
        setExpiryDate(d.expiryDate);
        setDaysBefore(d.reminderDaysBefore);
        setNotes(d.notes ?? '');
        setOriginalPath(d.filePath);
        if (d.filePath) setFile({ path: d.filePath, fileName: d.fileName ?? '', mimeType: d.mimeType, sizeBytes: d.sizeBytes });
      });
  }, [id, home]);

  const pick = async () => {
    const res = await importDocument();
    if (res.status === 'ok') {
      // Discard a file picked earlier in this form that was never saved.
      if (file && file.path !== originalPath) deleteStoredFile(file.path);
      setFile(res.value);
      if (!title.trim()) setTitle(res.value.fileName.replace(/\.[^.]+$/, ''));
    } else if (res.status === 'error') Alert.alert(t('common.error'), t('files.importFailed'));
  };

  const cancelPicked = () => {
    if (file && file.path !== originalPath) deleteStoredFile(file.path);
  };

  const save = async () => {
    if (!home) return;
    if (!title.trim()) {
      setError(t('validation.required'));
      return;
    }
    const input = {
      title: title.trim(),
      type,
      assetId,
      roomId,
      filePath: file?.path ?? null,
      fileName: file?.fileName ?? null,
      mimeType: file?.mimeType ?? null,
      sizeBytes: file?.sizeBytes ?? null,
      issueDate,
      expiryDate,
      reminderDaysBefore: isPremium ? daysBefore : null,
      notes: orNull(notes),
    };
    setSaving(true);
    try {
      if (id) {
        await mutate(() => repos().documents.update(id, input));
        if (originalPath && originalPath !== file?.path) deleteStoredFile(originalPath);
        router.back();
      } else {
        if (!canCreate('documents', await repos().documents.count(home.id), isPremium)) {
          cancelPicked();
          router.replace({ pathname: '/paywall', params: { source: 'documents_limit' } });
          return;
        }
        const doc = await mutate(() => repos().documents.create(home.id, input));
        track('document_imported', { type });
        router.replace(`/documents/${doc.id}`);
      }
    } catch (e) {
      recordError(e, 'document_save');
      Alert.alert(t('common.error'), t('common.saveFailed'));
      setSaving(false);
    }
  };

  return (
    <FormScreen title={id ? t('documents.edit') : t('documents.add')} onSave={save} saving={saving}>
      <Card>
        {file ? (
          <Row gap={3}>
            <IconTile icon={DOCUMENT_ICONS[type]} />
            <Text variant="bodySmall" style={{ flex: 1 }} numberOfLines={2}>
              {file.fileName} {file.sizeBytes ? `· ${fmt.fileSize(file.sizeBytes)}` : ''}
            </Text>
          </Row>
        ) : (
          <Text variant="bodySmall" tone="muted">
            {t('documents.noFileYet')}
          </Text>
        )}
        <Button label={file ? t('documents.replaceFile') : t('documents.chooseFile')} icon="attach-outline" variant="secondary" onPress={() => void pick()} testID="pick-file" />
      </Card>
      <Notice icon="lock-closed-outline">{t('documents.privateCopy')}</Notice>
      <TextField
        label={t('fields.title')}
        value={title}
        onChangeText={(v) => {
          setTitle(v);
          setError(null);
        }}
        error={error}
        testID="document-title"
      />
      <ChipSelect label={t('fields.documentType')} options={DOCUMENT_TYPES} value={type} onChange={(v) => v && setType(v)} renderLabel={(v) => t(`documentTypes.${v}`)} icon={(v) => DOCUMENT_ICONS[v]} />
      <SelectField label={t('fields.asset')} options={assets.map((a) => a.id)} value={assetId} renderLabel={(v) => assets.find((a) => a.id === v)?.name ?? ''} onChange={setAssetId} allowNone noneLabel={t('common.noAsset')} icon="cube-outline" optional />
      <SelectField label={t('fields.room')} options={rooms.map((r) => r.id)} value={roomId} renderLabel={(v) => rooms.find((r) => r.id === v)?.name ?? ''} onChange={setRoomId} allowNone noneLabel={t('common.noRoom')} icon="grid-outline" optional />
      <DateField label={t('fields.issueDate')} value={issueDate} onChange={setIssueDate} optional shortcuts="past" />
      <DateField label={t('fields.expiryDate')} value={expiryDate} onChange={setExpiryDate} optional shortcuts="none" />
      {expiryDate ? isPremium ? <Stepper label={t('notifications.daysBefore')} value={daysBefore ?? 30} onChange={setDaysBefore} min={0} max={180} /> : <PremiumLock feature="advanced_reminders" message={t('documents.reminderLocked')} /> : null}
      <TextField label={t('fields.notes')} value={notes} onChangeText={setNotes} optional multiline />
    </FormScreen>
  );
}
