import { Button, Card, EmptyState, IconButton, Row, Screen, Stack, Text } from '@factory/design-system';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ChoiceChips, TextField } from '@/components/forms';
import { confirmDelete, ScreenTitle } from '@/components/ui';
import { sumHeadcount } from '@/domain/guests';
import { GROUP_KINDS, type GroupKind } from '@/domain/types';
import { mutate, useSnapshot } from '@/hooks/useData';

/** Families / households / circles. Deleting a group keeps its guests (they become ungrouped). */
export default function Groups() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: snap } = useSnapshot(id);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<GroupKind>('family');
  const [editing, setEditing] = useState<string | null>(null);

  const save = async () => {
    if (!name.trim()) return;
    if (editing) await mutate((r) => r.groups.update(editing, { name: name.trim(), kind }));
    else await mutate((r) => r.groups.add({ eventId: id, name: name.trim(), kind, notes: '' }));
    setName('');
    setEditing(null);
  };

  return (
    <Screen edges={[]}>
      <ScreenTitle title={t('guests.groups')} />
      <Card>
        <TextField label={editing ? t('groups.rename') : t('groups.newName')} value={name} onChangeText={setName} placeholder={t('groups.placeholder')} />
        <ChoiceChips value={kind} onChange={setKind} options={GROUP_KINDS.map((k) => ({ value: k, label: t(`groupKind.${k}`) }))} />
        <Row gap={2}>
          <Stack style={{ flex: 1 }}>
            <Button size="md" label={editing ? t('common.save') : t('groups.create')} onPress={save} disabled={!name.trim()} />
          </Stack>
          {editing ? (
            <Button
              size="md"
              variant="ghost"
              label={t('common.cancel')}
              onPress={() => {
                setEditing(null);
                setName('');
              }}
            />
          ) : null}
        </Row>
      </Card>
      {!snap?.groups.length ? (
        <EmptyState icon="people-circle-outline" title={t('groups.emptyTitle')} message={t('groups.emptyBody')} />
      ) : (
        <Card>
          {snap.groups.map((g) => {
            const members = snap.guests.filter((x) => x.groupId === g.id);
            const hc = sumHeadcount(members);
            return (
              <Row key={g.id} gap={2} style={{ minHeight: 56 }}>
                <View style={{ flex: 1 }}>
                  <Text>{g.name}</Text>
                  <Text variant="caption" tone="muted">
                    {`${t(`groupKind.${g.kind}`)} · ${t('groups.members', { count: members.length })} · ${t('groups.people', { adults: hc.adults, children: hc.children })}`}
                  </Text>
                </View>
                <IconButton
                  icon="create-outline"
                  label={t('groups.rename')}
                  onPress={() => {
                    setEditing(g.id);
                    setName(g.name);
                    setKind(g.kind);
                  }}
                />
                <IconButton icon="trash-outline" tone="danger" label={t('common.delete')} onPress={() => confirmDelete(t, g.name, () => void mutate((r) => r.groups.remove(g.id)), t('groups.deleteBody'))} />
              </Row>
            );
          })}
        </Card>
      )}
    </Screen>
  );
}
