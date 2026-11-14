import { Button, OptionCard } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Field, Page } from '@/components/ui';
import { repos } from '@/database';
import { useAction, useData } from '@/hooks';
import { createCollection, setBookCollections } from '@/services/contentService';

export default function BookCollections() {
  const { t } = useTranslation();
  const run = useAction(t);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useData((r) => Promise.all([r.organize.collections(), r.organize.collectionsOfBook(id)]), [id]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [name, setName] = useState('');
  // Reset the selection each time fresh data is loaded (derived during render, no effect needed).
  const [syncedData, setSyncedData] = useState<typeof data>(undefined);
  if (data && data !== syncedData) {
    setSyncedData(data);
    setSelected(new Set(data[1]));
  }

  const toggle = (cid: string) => {
    const next = new Set(selected);
    if (next.has(cid)) next.delete(cid);
    else next.add(cid);
    setSelected(next);
  };

  return (
    <Page edges={['bottom']} footer={<Button label={t('common.save')} size="lg" onPress={() => void run(() => setBookCollections(repos(), id, [...selected]).then(() => router.back()))} testID="save-collections" />}>
      {(data?.[0] ?? []).map((c) => (
        <OptionCard key={c.id} title={c.presetKey ? t(`collections.presets.${c.presetKey}`) : c.name} subtitle={t('collections.bookCount', { count: c.bookCount })} icon={c.icon as never} selected={selected.has(c.id)} onPress={() => toggle(c.id)} role="checkbox" />
      ))}
      <Field label={t('collections.newName')} value={name} onChangeText={setName} placeholder={t('collections.newPlaceholder')} />
      <Button
        label={t('collections.create')}
        variant="secondary"
        icon="add"
        disabled={!name.trim()}
        onPress={() =>
          void run(async () => {
            const cid = await createCollection(repos(), { name });
            setSelected(new Set([...selected, cid]));
            setName('');
          })
        }
      />
    </Page>
  );
}
