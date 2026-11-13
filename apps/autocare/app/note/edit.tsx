import { Button } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { Field, FormScreen, ToggleRow } from '@/components/ui';
import { repos } from '@/database';
import { useAsync } from '@/hooks';
import { useEditorParams } from '@/hooks/data';
import { afterWrite } from '@/services/boot';
import { clock } from '@/services/clock';
import { feedback } from '@/services/feedback';
import { cleanText } from '@/utils';

export default function NoteEdit() {
  const { t } = useTranslation();
  const { id, vehicleId } = useEditorParams();
  const { data } = useAsync(() => (id ? repos().notes.get(id) : Promise.resolve(null)), [id]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [loaded, setLoaded] = useState(false);
  if (data && !loaded) {
    setLoaded(true);
    setTitle(data.title);
    setBody(data.body ?? '');
    setPinned(data.pinned);
  }

  const vId = data?.vehicleId ?? vehicleId;
  const save = async () => {
    setSubmitted(true);
    if (!title.trim() || !vId) return;
    await repos().notes.save({ id: id ?? undefined, vehicleId: vId, title: title.trim().slice(0, 120), body: cleanText(body, 5000), pinned }, clock.now());
    afterWrite();
    feedback.success();
    router.back();
  };

  return (
    <>
      <RouterStack.Screen options={{ title: id ? t('common.edit') : t('notes.new') }} />
      <FormScreen
        onSave={() => void save()}
        extra={
          id ? (
            <Button
              label={t('common.delete')}
              variant="danger"
              size="md"
              icon="trash-outline"
              onPress={() =>
                Alert.alert(t('common.deleteConfirmTitle'), t('common.deleteConfirmBody'), [
                  { text: t('common.cancel'), style: 'cancel' },
                  {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                      await repos().notes.remove(id);
                      afterWrite();
                      router.back();
                    },
                  },
                ])
              }
            />
          ) : null
        }
      >
        <Field label={t('notes.titleField')} value={title} onChangeText={setTitle} error={submitted && !title.trim() ? t('common.required') : null} />
        <Field label={t('notes.body')} value={body} onChangeText={setBody} multiline style={{ minHeight: 200 }} />
        <ToggleRow label={t('notes.pinned')} value={pinned} onChange={setPinned} />
      </FormScreen>
    </>
  );
}
