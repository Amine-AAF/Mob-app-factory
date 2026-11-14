import { Button, Card, Chip, Icon, IconButton, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { Stack as RouterStack, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { PremiumCard } from '@/components/care';
import { TextField } from '@/components/forms';
import { currentSeason, seasonKey } from '@/domain/seasons';
import { SEASONS, type Season } from '@/domain/types';
import { useData, useMutation } from '@/hooks/useData';
import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

/**
 * Seasonal care checklists. The "current" season depends on the user's climate profile
 * (hemisphere or tropical/no seasons); nothing assumes northern-hemisphere seasons.
 */
export default function Seasonal() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const mutate = useMutation();
  const isPremium = useIsPremium();
  const climate = usePreferences((s) => s.climate);
  const today = clock.today();
  const detected = currentSeason(today, climate);
  const [season, setSeason] = useState<Season>(detected ?? 'spring');
  const [newItem, setNewItem] = useState('');
  const key = seasonKey(today, season, climate);

  const { data } = useData(async (r) => ({ items: await r.seasonal.list(season), done: await r.seasonal.completions(key), history: await r.seasonal.history() }), [season, key]);
  const doneIds = new Set((data?.done ?? []).map((d) => d.taskId));
  const items = data?.items ?? [];

  const toggle = (taskId: string) => void mutate((r) => r.seasonal.toggle(taskId, key, today), { reminders: false });
  const add = () => {
    if (!newItem.trim()) return;
    void mutate((r) => r.seasonal.add(season, newItem), { reminders: false }).then(() => setNewItem(''));
  };
  const remove = (id: string) =>
    Alert.alert(t('seasonal.removeTitle'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => void mutate((r) => r.seasonal.remove(id), { reminders: false }) },
    ]);

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('seasonal.title') }} />
      <Card tone="alt">
        <Text variant="bodySmall">{detected ? t('seasonal.detected', { season: t(`seasons.${detected}`), climate: t(`climate.${climate}`) }) : t('seasonal.noSeasons')}</Text>
        <Pressable onPress={() => router.push('/settings/preferences')} accessibilityRole="button">
          <Text variant="bodySmall" tone="primary" style={{ fontWeight: '700' }}>
            {t('seasonal.changeClimate')}
          </Text>
        </Pressable>
      </Card>
      <Row wrap gap={2}>
        {SEASONS.map((s) => (
          <Chip key={s} label={t(`seasons.${s}`)} selected={season === s} onPress={() => setSeason(s)} />
        ))}
      </Row>
      <Text variant="caption" tone="muted">
        {t('seasonal.progress', { done: items.filter((i) => doneIds.has(i.id)).length, total: items.length })}
      </Text>
      <Stack gap={2}>
        {items.map((item) => {
          const done = doneIds.has(item.id);
          const label = item.builtInKey ? t(`seasonal.items.${item.builtInKey}`) : item.title;
          return (
            <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Pressable
                onPress={() => toggle(item.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: done }}
                accessibilityLabel={label}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: theme.radius.md, backgroundColor: done ? theme.colors.primarySoft : theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}
              >
                <Icon name={done ? 'checkbox' : 'square-outline'} size={22} color={done ? theme.colors.primary : theme.colors.textMuted} />
                <Text style={{ flex: 1, textDecorationLine: done ? 'line-through' : 'none' }}>{label}</Text>
              </Pressable>
              <IconButton icon="close" label={t('common.delete')} onPress={() => remove(item.id)} />
            </View>
          );
        })}
      </Stack>

      {isPremium ? (
        <Stack gap={2}>
          <TextField label={t('seasonal.addItem')} value={newItem} onChangeText={setNewItem} maxLength={120} />
          <Button size="md" variant="secondary" icon="add" label={t('common.add')} onPress={add} disabled={!newItem.trim()} />
          <SectionHeader title={t('seasonal.history')} />
          {(data?.history ?? []).length === 0 ? (
            <Text tone="muted">{t('seasonal.noHistory')}</Text>
          ) : (
            (data?.history ?? []).map((h) => {
              const [year, s] = h.seasonKey.split('-');
              return <Text key={h.seasonKey} variant="bodySmall">{`${t(`seasons.${s}`)} ${year} — ${t('seasonal.itemsDone', { count: h.done })}`}</Text>;
            })
          )}
        </Stack>
      ) : (
        <PremiumCard title={t('premium.seasonalTitle')} message={t('premium.seasonalBody')} source="seasonal" />
      )}
    </Screen>
  );
}
