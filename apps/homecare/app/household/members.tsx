import { Button, IconButton, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { TextField } from '@/components/forms';
import { PremiumLock } from '@/components/media';
import { Notice, ScreenHeader } from '@/components/ui';
import { canCreate } from '@/config/limits';
import { repos } from '@/database';
import { MEMBER_COLORS } from '@/domain/types';
import { useData } from '@/hooks/useData';
import { useActiveHome } from '@/hooks/useHome';
import { mutate } from '@/services/mutations';
import { useIsPremium } from '@/store/session';

/** Optional, local-only household members (names for task assignment). No accounts, nothing shared. */
export default function Members() {
  const { t } = useTranslation();
  const theme = useTheme();
  const home = useActiveHome();
  const isPremium = useIsPremium();
  const [name, setName] = useState('');
  const { data: members } = useData(() => (home ? repos().household.listMembers(home.id) : Promise.resolve([])), [home?.id]);
  const allowed = canCreate('householdMembers', members?.length ?? 0, isPremium);

  const add = async () => {
    if (!home || !name.trim()) return;
    const color = MEMBER_COLORS[(members?.length ?? 0) % MEMBER_COLORS.length] as string;
    await mutate(() => repos().household.addMember(home.id, name, color));
    setName('');
  };

  return (
    <Screen>
      <ScreenHeader title={t('members.title')} back />
      <Notice icon="people-outline">{t('members.hint')}</Notice>
      <Stack gap={2}>
        {members?.map((m) => (
          <Row key={m.id} gap={3} style={{ padding: 12, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: m.color, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>{m.name.slice(0, 1).toUpperCase()}</Text>
            </View>
            <Text style={{ flex: 1 }}>{m.name}</Text>
            <IconButton
              icon="trash-outline"
              tone="danger"
              label={t('common.delete')}
              onPress={() =>
                Alert.alert(t('common.deleteTitle'), t('members.deleteMessage'), [
                  { text: t('common.cancel'), style: 'cancel' },
                  { text: t('common.delete'), style: 'destructive', onPress: () => void mutate(() => repos().household.removeMember(m.id)) },
                ])
              }
            />
          </Row>
        ))}
      </Stack>
      {allowed ? (
        <>
          <TextField label={t('members.name')} value={name} onChangeText={setName} maxLength={40} />
          <Button label={t('members.add')} icon="person-add-outline" onPress={() => void add()} disabled={!name.trim()} />
        </>
      ) : (
        <PremiumLock feature="members" message={t('limits.members')} />
      )}
    </Screen>
  );
}
