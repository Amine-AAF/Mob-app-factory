import { Button, Chip, Icon, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useBookTheme } from '@/components/theme';
import { BookCover, Empty, Field, Page, Paper, Section } from '@/components/ui';
import { COLLECTION_ICONS, COLLECTION_PRESETS } from '@/config/presets';
import { FREE_LIMITS } from '@/config/limits';
import { repos } from '@/database';
import { useAction, useData } from '@/hooks';
import { createCollection } from '@/services/contentService';
import { useIsPremium } from '@/store/session';

export default function Collections() {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const run = useAction(t);
  const premium = useIsPremium();
  const { data } = useData((r) => Promise.all([r.organize.collections(), r.organize.customCollectionCount()]), []);
  const [collections, custom] = data ?? [[], 0];
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string>('bookmark');
  const usedPresets = new Set(collections.map((c) => c.presetKey).filter(Boolean));
  const presets = COLLECTION_PRESETS.filter((p) => !usedPresets.has(p.key));

  return (
    <Page edges={['bottom']}>
      {collections.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {collections.map((c) => (
            <Pressable key={c.id} onPress={() => router.push(`/collections/${c.id}`)} accessibilityRole="button" accessibilityLabel={c.presetKey ? t(`collections.presets.${c.presetKey}`) : c.name} style={{ width: '47%' }} testID={`collection-${c.id}`}>
              <Paper tone="alt" style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', height: 66 }}>
                  {c.coverThumbs.length ? (
                    c.coverThumbs.map((u, i) => <BookCover key={u} uri={u} title="" width={44} style={{ marginLeft: i ? -14 : 0, transform: [{ rotate: `${(i - 1) * 4}deg` }] }} />)
                  ) : (
                    <Icon name={c.icon as never} size={36} color={theme.colors.primary} />
                  )}
                </View>
                <Text style={{ fontWeight: '700' }} numberOfLines={1}>
                  {c.presetKey ? t(`collections.presets.${c.presetKey}`) : c.name}
                </Text>
                <Text variant="caption" tone="subtle">
                  {t('collections.bookCount', { count: c.bookCount })}
                  {c.isPinned ? ' · 📌' : ''}
                </Text>
              </Paper>
            </Pressable>
          ))}
        </View>
      ) : (
        <Empty icon="albums-outline" title={t('collections.emptyTitle')} message={t('collections.emptyBody')} />
      )}

      {presets.length ? (
        <Section title={t('collections.suggested')}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {presets.map((p) => (
              <Chip key={p.key} label={t(`collections.presets.${p.key}`)} icon={p.icon} selected={false} onPress={() => void run(() => createCollection(repos(), { name: t(`collections.presets.${p.key}`), icon: p.icon, presetKey: p.key }))} testID={`preset-${p.key}`} />
            ))}
          </View>
        </Section>
      ) : null}

      <Section title={t('collections.create')}>
        <Field label={t('collections.newName')} value={name} onChangeText={setName} placeholder={t('collections.newPlaceholder')} hint={premium ? undefined : t('collections.freeLimit', { used: custom, max: FREE_LIMITS.customCollections })} testID="collection-name" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {COLLECTION_ICONS.map((i) => (
            <Pressable key={i} onPress={() => setIcon(i)} accessibilityRole="radio" accessibilityState={{ checked: icon === i }} accessibilityLabel={i} style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: icon === i ? theme.colors.primarySoft : theme.colors.surface, borderWidth: 1, borderColor: icon === i ? theme.colors.primary : theme.colors.border }}>
              <Icon name={i} size={18} color={icon === i ? theme.colors.primary : theme.colors.textMuted} />
            </Pressable>
          ))}
        </View>
        <Button
          label={t('collections.create')}
          icon="add"
          disabled={!name.trim()}
          onPress={() =>
            void run(async () => {
              await createCollection(repos(), { name, icon });
              setName('');
            })
          }
          testID="create-collection"
        />
      </Section>
    </Page>
  );
}
