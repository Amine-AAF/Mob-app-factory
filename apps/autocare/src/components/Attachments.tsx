import { Button, Stack, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { repos } from '@/database';
import { canAddDocument } from '@/features/premium/limits';
import { useAsync } from '@/hooks';
import { clock } from '@/services/clock';
import { deleteStoredFile, fileExists, FileTooLargeError, openStoredFile, pickAndStore, type PickedFile } from '@/services/fileStore';
import { useIsPremium } from '@/store/session';
import type { DocumentCategory } from '@/types';

import { ItemRow } from './ui';

export type LinkField = 'maintenance_id' | 'expense_id' | 'insurance_id' | 'deadline_id';
const LINK_KEYS = { maintenance_id: 'maintenanceId', expense_id: 'expenseId', insurance_id: 'insuranceId', deadline_id: 'deadlineId' } as const;

/**
 * Invoices / photos attached to a record. Files picked before the record exists are
 * kept "pending" and committed right after the record is saved (so entry stays fast).
 */
export function useAttachments(field: LinkField, recordId: string | undefined, category: DocumentCategory) {
  const premium = useIsPremium();
  // The ref is the source of truth (read synchronously by commit/discard); state only re-renders.
  const pendingRef = useRef<PickedFile[]>([]);
  const [pending, setPendingState] = useState<PickedFile[]>([]);
  const setPending = useCallback((next: PickedFile[] | ((p: PickedFile[]) => PickedFile[])) => {
    pendingRef.current = typeof next === 'function' ? next(pendingRef.current) : next;
    setPendingState(pendingRef.current);
  }, []);
  const [error, setError] = useState<string | null>(null);
  const { data: linked, reload } = useAsync(() => (recordId ? repos().documents.linkedTo(field, recordId) : Promise.resolve([])), [field, recordId]);

  const add = useCallback(async () => {
    setError(null);
    const count = await repos().documents.count();
    if (!canAddDocument(premium, count + pending.length)) {
      router.push({ pathname: '/paywall', params: { reason: 'documents' } });
      return;
    }
    try {
      const picked = await pickAndStore('document');
      if (picked) setPending((p) => [...p, picked]);
    } catch (e) {
      setError(e instanceof FileTooLargeError ? 'documents.tooLarge' : 'common.error');
    }
  }, [premium, pending.length, setPending]);

  const commit = useCallback(
    async (id: string, vehicleId: string, title: string) => {
      const now = clock.now();
      const files = pendingRef.current;
      pendingRef.current = [];
      for (const p of files) {
        await repos().documents.save(
          {
            vehicleId,
            category: p.mimeType.startsWith('image/') && category !== 'invoice' ? 'photo' : category,
            title: title || p.originalName,
            fileName: p.fileName,
            mimeType: p.mimeType,
            sizeBytes: p.sizeBytes,
            expiryDay: null,
            notes: null,
            maintenanceId: null,
            expenseId: null,
            insuranceId: null,
            deadlineId: null,
            [LINK_KEYS[field]]: id,
          },
          now,
        );
      }
      setPending([]);
      reload();
    },
    [category, field, reload, setPending],
  );

  /** Call when the form is abandoned: picked-but-unsaved files must not linger. */
  const discard = useCallback(() => {
    pendingRef.current.forEach((p) => deleteStoredFile(p.fileName));
    pendingRef.current = [];
  }, []);

  return { linked: linked ?? [], pending, add, commit, discard, error };
}

export function AttachmentList({ state }: { state: ReturnType<typeof useAttachments> }) {
  const { t } = useTranslation();
  return (
    <Stack gap={1}>
      <Text variant="label" tone="muted">
        {t('common.attachments')}
      </Text>
      {state.linked.map((d) => (
        <ItemRow
          key={d.id}
          icon={d.mimeType === 'application/pdf' ? 'document-text' : 'image'}
          title={d.title}
          subtitle={fileExists(d.fileName) ? null : t('documents.fileMissing')}
          onPress={() => fileExists(d.fileName) && void openStoredFile(d.fileName, d.mimeType, d.title)}
        />
      ))}
      {state.pending.map((p) => (
        <ItemRow key={p.fileName} icon={p.mimeType === 'application/pdf' ? 'document-text-outline' : 'image-outline'} tone="neutral" title={p.originalName} />
      ))}
      {state.error ? (
        <Text variant="caption" tone="danger">
          {t(state.error)}
        </Text>
      ) : null}
      <Button label={t('common.addAttachment')} icon="attach" variant="secondary" size="md" onPress={() => void state.add()} />
    </Stack>
  );
}
