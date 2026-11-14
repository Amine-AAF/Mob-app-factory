import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { FormScreen, orNull } from '@/components/FormScreen';
import { ChipSelect, TextField } from '@/components/forms';
import { ROOM_ICONS } from '@/config/icons';
import { repos } from '@/database';
import { ROOM_KINDS, type RoomKind } from '@/domain/types';
import { useActiveHome } from '@/hooks/useHome';
import { recordError } from '@/services/analytics';
import { mutate } from '@/services/mutations';

export default function RoomEdit() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const home = useActiveHome();
  const [name, setName] = useState('');
  const [kind, setKind] = useState<RoomKind>('living');
  const [notes, setNotes] = useState('');
  const [touchedName, setTouchedName] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    void repos()
      .homes.getRoom(id)
      .then((r) => {
        if (!r) return;
        setName(r.name);
        setKind(r.kind);
        setNotes(r.notes ?? '');
        setTouchedName(true);
      });
  }, [id]);

  const save = async () => {
    if (!home) return;
    const finalName = name.trim() || t(`roomKinds.${kind}`);
    setSaving(true);
    try {
      if (id) await mutate(() => repos().homes.updateRoom(id, { name: finalName, kind, notes: orNull(notes) }));
      else await mutate(() => repos().homes.createRoom(home.id, { name: finalName, kind, notes: orNull(notes) }));
      router.back();
    } catch (e) {
      recordError(e, 'room_save');
      Alert.alert(t('common.error'), t('common.saveFailed'));
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!id) return;
    await mutate(() => repos().homes.removeRoom(id));
    router.replace('/(tabs)/myhome');
  };

  return (
    <FormScreen title={id ? t('rooms.edit') : t('rooms.add')} onSave={save} saving={saving} onDelete={id ? remove : undefined} deleteMessage={t('rooms.deleteMessage')}>
      <ChipSelect
        label={t('fields.roomKind')}
        options={ROOM_KINDS}
        value={kind}
        onChange={(v) => {
          if (!v) return;
          setKind(v);
          if (!touchedName) setName(t(`roomKinds.${v}`));
        }}
        renderLabel={(v) => t(`roomKinds.${v}`)}
        icon={(v) => ROOM_ICONS[v]}
      />
      <TextField
        label={t('fields.name')}
        value={name}
        onChangeText={(v) => {
          setName(v);
          setTouchedName(true);
        }}
        placeholder={t(`roomKinds.${kind}`)}
      />
      <TextField label={t('fields.notes')} value={notes} onChangeText={setNotes} optional multiline />
    </FormScreen>
  );
}
