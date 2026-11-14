import { Button, Chip, Row, Stack, Text } from '@factory/design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DOCUMENT_TYPES, type DocumentType } from '@/constants/domain';
import type { DocumentMetaInput } from '@/database/repositories/documents';
import type { Trip, TravelDocument } from '@/types/models';

import { ChoiceChips } from './Choice';
import { DateField } from './DateField';
import { TextField } from './TextField';

/** Metadata of a travel document (title, type, trip, optional expiry, notes). */
export function DocumentForm({
  initial,
  trips,
  defaultTripId,
  submitLabel,
  error,
  saving,
  onSubmit,
}: {
  initial?: TravelDocument;
  trips: Trip[];
  defaultTripId?: string | null;
  submitLabel: string;
  error: string | null;
  saving?: boolean;
  onSubmit: (meta: DocumentMetaInput) => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [type, setType] = useState<DocumentType>(initial?.type ?? 'flight_ticket');
  const [tripId, setTripId] = useState<string | null>(initial ? initial.tripId : (defaultTripId ?? null));
  const [expiresOn, setExpiresOn] = useState<string | null>(initial?.expiresOn ?? null);
  const [notes, setNotes] = useState(initial?.notes ?? '');
  return (
    <Stack gap={4}>
      <TextField label={t('documents.titleLabel')} placeholder={t('documents.titlePlaceholder')} value={title} onChangeText={setTitle} maxLength={120} testID="document-title" />
      <ChoiceChips label={t('documents.type')} options={DOCUMENT_TYPES} value={type} onChange={setType} labelOf={(v) => t(`enums.documentType.${v}`)} testID="document-type" />
      {type === 'passport' ? (
        <Text variant="caption" tone="warning">
          {t('documents.passportHint')}
        </Text>
      ) : null}
      {trips.length ? (
        <Stack gap={2}>
          <Text variant="label">{t('documents.trip')}</Text>
          <Row gap={2} wrap>
            <Chip label={t('documents.noTrip')} selected={tripId === null} onPress={() => setTripId(null)} />
            {trips.map((x) => (
              <Chip key={x.id} label={x.name} selected={tripId === x.id} onPress={() => setTripId(x.id)} />
            ))}
          </Row>
        </Stack>
      ) : null}
      <DateField label={t('documents.expiry')} value={expiresOn} onChange={setExpiresOn} optional />
      <TextField label={t('documents.notes')} value={notes} onChangeText={setNotes} multiline optional optionalLabel={t('common.optional')} />
      {error ? (
        <Text tone="danger" testID="document-error">
          {error}
        </Text>
      ) : null}
      <Button label={submitLabel} size="lg" loading={saving} onPress={() => onSubmit({ title, type, tripId, expiresOn, notes })} testID="document-save" />
    </Stack>
  );
}
