import { Button, Screen, Stack } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PremiumCard } from '@/components/care';
import { JOURNAL_ICON } from '@/components/icons';
import { ChipSelect, DateField, PhotoField, TextField } from '@/components/forms';
import { canAttachJournalPhoto } from '@/domain/limits';
import { JOURNAL_KINDS, type JournalKind } from '@/domain/types';
import { useMutation } from '@/hooks/useData';
import { clock } from '@/services/clock';
import { useIsPremium } from '@/store/session';

export default function NewJournalEntry() {
  const { t } = useTranslation();
  const router = useRouter();
  const mutate = useMutation();
  const isPremium = useIsPremium();
  const { plantId } = useLocalSearchParams<{ plantId: string }>();
  const [date, setDate] = useState<string | null>(clock.today());
  const [kind, setKind] = useState<JournalKind>('observation');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!title.trim() && !body.trim() && !photo) {
      setError(t('journal.emptyError'));
      return;
    }
    await mutate((r) => r.journal.create({ plantId, date: date ?? clock.today(), kind, title: title.trim(), body: body.trim(), photoPath: photo }), { reminders: false });
    router.back();
  };

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={() => void save()} testID="save-journal" />}>
      <RouterStack.Screen options={{ title: t('journal.add') }} />
      <Stack gap={4}>
        <ChipSelect label={t('journal.kind')} options={JOURNAL_KINDS} value={kind} onChange={setKind} render={(k) => t(`journalKinds.${k}`)} icons={JOURNAL_ICON} />
        <DateField label={t('common.date')} value={date} onChange={setDate} allowFuture={false} />
        <TextField label={t('journal.entryTitle')} value={title} onChangeText={(v) => (setTitle(v), setError(null))} optional maxLength={100} error={error} />
        <TextField label={t('journal.body')} value={body} onChangeText={(v) => (setBody(v), setError(null))} multiline optional maxLength={4000} testID="field-journal-body" />
        <PhotoField
          label={t('journal.photo')}
          value={photo}
          onChange={setPhoto}
          disabled={!canAttachJournalPhoto(isPremium)}
          disabledHint={<PremiumCard title={t('premium.photoJournalTitle')} message={t('premium.photoJournalBody')} source="journal_photo" />}
        />
      </Stack>
    </Screen>
  );
}
