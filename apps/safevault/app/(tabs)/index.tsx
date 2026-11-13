import { Card, Chip, EmptyState, Icon, IconButton, Row, Screen, SectionHeader, Stack, Stat, Text, useTheme } from '@factory/design-system';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { SearchBar } from '@/components/inputs';
import { ItemRow } from '@/components/vault';
import { healthLevel, issueCount } from '@/features/audit/audit';
import { filterItems, recentlyViewed } from '@/features/search/search';
import { fmt } from '@/i18n';
import { lockVault, runAudit, toggleFavorite, useVault } from '@/store/vault';
import { ENTRY_TYPES, type EntryType } from '@/vault/types';

export default function VaultDashboard() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const items = useVault((s) => s.items);
  const categories = useVault((s) => s.categories);
  const corrupted = useVault((s) => s.corrupted);
  const audit = useVault((s) => s.audit);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<EntryType | 'all'>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // The health indicator is computed locally (decrypts passwords one by one, keeps only counts).
  useEffect(() => {
    if (!audit && items.some((i) => i.type === 'login')) void runAudit().catch(() => undefined);
  }, [audit, items]);

  const counts = useMemo(() => Object.fromEntries(ENTRY_TYPES.map((k) => [k, items.filter((i) => i.type === k).length])) as Record<EntryType, number>, [items]);
  const favorites = items.filter((i) => i.meta.favorite).length;
  const searching = query.trim().length > 0 || type !== 'all' || favoritesOnly;
  const results = useMemo(() => filterItems(items, { query, type, favoritesOnly }, 'title'), [items, query, type, favoritesOnly]);
  const recent = useMemo(() => recentlyViewed(items, 5), [items]);
  const catById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const level = healthLevel(audit);
  const levelTone = { good: 'success', fair: 'warning', poor: 'danger', empty: 'primary' } as const;

  const open = (id: string) => router.push({ pathname: '/item/[id]', params: { id } });

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="title" accessibilityRole="header">
          {t('vault.title')}
        </Text>
        <Row gap={0}>
          <IconButton icon="add-circle" tone="primary" label={t('vault.add')} onPress={() => router.push('/edit')} size={26} />
          <IconButton icon="lock-closed" label={t('vault.lockNow')} onPress={lockVault} />
        </Row>
      </Row>
      <SearchBar value={query} onChangeText={setQuery} placeholder={t('vault.search')} />
      <Row gap={2} wrap>
        <Chip label={t('vault.filters.all')} selected={type === 'all'} onPress={() => setType('all')} />
        {ENTRY_TYPES.map((k) => (
          <Chip key={k} label={t(`types.${k}_plural`)} selected={type === k} onPress={() => setType(type === k ? 'all' : k)} />
        ))}
        <Chip label={t('vault.filters.favorites')} icon="star" selected={favoritesOnly} onPress={() => setFavoritesOnly((f) => !f)} />
      </Row>

      {corrupted.length > 0 ? (
        <Card tone="alt" onPress={() => router.push('/settings/backup')}>
          <Row>
            <Icon name="warning" size={20} color={theme.colors.danger} />
            <Text variant="bodySmall" style={{ flex: 1 }}>
              {t('vault.corrupted', { count: corrupted.length })}
            </Text>
          </Row>
        </Card>
      ) : null}

      {searching ? (
        <Stack gap={1}>
          <Text variant="caption" tone="muted" accessibilityLiveRegion="polite">
            {t('vault.results', { count: results.length })}
          </Text>
          {results.map((i) => (
            <ItemRow key={i.id} item={i} category={catById.get(i.meta.categoryId)} onPress={() => open(i.id)} onToggleFavorite={() => void toggleFavorite(i.id)} />
          ))}
          {results.length === 0 ? <EmptyState icon="search" title={t('vault.noResults')} /> : null}
        </Stack>
      ) : items.length === 0 ? (
        <EmptyState icon="shield-checkmark" title={t('vault.empty.title')} message={t('vault.empty.body')} />
      ) : (
        <>
          <Row gap={2}>
            <Stat value={fmt.number(counts.login)} label={t('types.login_plural')} icon="key" />
            <Stat value={fmt.number(counts.note)} label={t('types.note_plural')} icon="document-lock" tone="accent" />
          </Row>
          <Row gap={2}>
            <Stat value={fmt.number(counts.card)} label={t('types.card_plural')} icon="card" tone="success" />
            <Stat value={fmt.number(counts.identity)} label={t('types.identity_plural')} icon="id-card" tone="warning" />
          </Row>
          <Row gap={2}>
            <Pressable style={{ flex: 1 }} onPress={() => router.push('/(tabs)/categories')} accessibilityRole="button">
              <Stat value={fmt.number(categories.length)} label={t('tabs.categories')} icon="folder" />
            </Pressable>
            <Pressable style={{ flex: 1 }} onPress={() => setFavoritesOnly(true)} accessibilityRole="button">
              <Stat value={fmt.number(favorites)} label={t('vault.filters.favorites')} icon="star" tone="warning" />
            </Pressable>
          </Row>

          <Card onPress={() => router.push('/(tabs)/security')} accessibilityLabel={t('vault.health.title')}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text variant="subheading">{t('vault.health.title')}</Text>
              <Text variant="heading" tone={levelTone[level]}>
                {audit && audit.total > 0 ? `${audit.score}/100` : '—'}
              </Text>
            </Row>
            <Text variant="bodySmall" tone="muted">
              {audit && audit.total > 0 ? t(`vault.health.${level}`, { count: issueCount(audit) }) : t('vault.health.empty')}
            </Text>
          </Card>

          {recent.length > 0 ? (
            <View>
              <SectionHeader title={t('vault.recent')} />
              {recent.map((i) => (
                <ItemRow key={i.id} item={i} category={catById.get(i.meta.categoryId)} onPress={() => open(i.id)} />
              ))}
            </View>
          ) : null}

          <View>
            <SectionHeader title={t('vault.all')} action={t('vault.seeAll')} onAction={() => router.push('/items')} />
            {filterItems(items, {}, 'updated')
              .slice(0, 8)
              .map((i) => (
                <ItemRow key={i.id} item={i} category={catById.get(i.meta.categoryId)} onPress={() => open(i.id)} onToggleFavorite={() => void toggleFavorite(i.id)} />
              ))}
          </View>
        </>
      )}
    </Screen>
  );
}
