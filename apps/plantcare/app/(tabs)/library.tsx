import { Badge, Button, Chip, EmptyState, Icon, PressableScale, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { AdBanner } from '@/components/AdBanner';
import { CATEGORY_ICON } from '@/components/icons';
import { useLeaf } from '@/components/leaf';
import { LIBRARY_FILTERS, searchSpecies, type LibraryFilter, type Species } from '@/content/species';
import { speciesName } from '@/content/species/localize';
import { canOpenSpecies } from '@/domain/limits';
import { useIsPremium } from '@/store/session';

/** Plant library (150+ sheets): multilingual search, filters, paged rendering (40 at a time). */
const PAGE = 40;

export default function Library() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const tokens = useLeaf();
  const router = useRouter();
  const isPremium = useIsPremium();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<LibraryFilter[]>([]);
  const [limit, setLimit] = useState(PAGE);
  const results = useMemo(
    () => searchSpecies(query, filters).sort((a, b) => speciesName(a).localeCompare(speciesName(b), i18n.language)),
    [query, filters, i18n.language],
  );

  const toggle = (f: LibraryFilter) => {
    setLimit(PAGE);
    setFilters((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));
  };

  const renderItem = useCallback(
    ({ item: s }: { item: Species }) => {
      const locked = !canOpenSpecies(isPremium, s);
      return (
        <PressableScale
          onPress={() => router.push(locked ? { pathname: '/paywall', params: { source: 'library' } } : `/species/${s.id}`)}
          accessibilityRole="button"
          accessibilityLabel={`${speciesName(s)}, ${s.scientificName}${locked ? `, ${t('premium.badge')}` : ''}`}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}
        >
          <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: tokens.sage, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={CATEGORY_ICON[s.category]} size={22} color={tokens.moss} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="subheading" numberOfLines={1}>
              {speciesName(s)}
            </Text>
            <Text variant="bodySmall" tone="muted" style={{ fontStyle: 'italic' }} numberOfLines={1}>
              {s.scientificName}
            </Text>
            <Row gap={1} wrap>
              <Badge tone="neutral" label={t(`difficulty.${s.difficulty}`)} />
              {s.pets === 'toxic' ? <Badge tone="warning" icon="paw-outline" label={t('pets.toxicShort')} /> : s.pets === 'non_toxic' ? <Badge tone="success" icon="paw-outline" label={t('pets.safeShort')} /> : null}
            </Row>
          </View>
          <Icon name={locked ? 'lock-closed' : 'chevron-forward'} size={18} color={locked ? theme.colors.accent : theme.colors.textSubtle} />
        </PressableScale>
      );
    },
    [isPremium, router, t, theme, tokens],
  );

  const header = (
    <Stack gap={3}>
      <Text variant="title" accessibilityRole="header">
        {t('library.title')}
      </Text>
      <Text variant="bodySmall" tone="muted">
        {t('library.subtitle', { count: results.length })}
      </Text>
      <TextInput
        value={query}
        onChangeText={(v) => (setQuery(v), setLimit(PAGE))}
        placeholder={t('library.searchPlaceholder')}
        placeholderTextColor={theme.colors.textSubtle}
        accessibilityLabel={t('library.searchPlaceholder')}
        testID="library-search"
        style={{ minHeight: 46, borderRadius: theme.radius.pill, paddingHorizontal: 16, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, color: theme.colors.text, fontSize: 16 }}
      />
      <Row wrap gap={2}>
        {LIBRARY_FILTERS.map((f) => (
          <Chip key={f} label={t(`library.filters.${f}`)} selected={filters.includes(f)} onPress={() => toggle(f)} testID={`filter-${f}`} />
        ))}
      </Row>
      {filters.includes('pet_safe') ? (
        <Text variant="caption" tone="muted">
          {t('library.petSafeNote')}
        </Text>
      ) : null}
    </Stack>
  );

  const visible = results.slice(0, limit);
  return (
    <Screen testID="library-screen">
      {header}
      {results.length === 0 ? (
        <EmptyState icon="search-outline" title={t('library.noResults')} />
      ) : (
        <View>
          {visible.map((s) => (
            <View key={s.id} style={{ marginBottom: 8 }}>{renderItem({ item: s })}</View>
          ))}
        </View>
      )}
      {results.length > limit ? (
        <Button variant="secondary" label={t('library.showMore', { count: results.length - limit })} onPress={() => setLimit(limit + PAGE)} testID="library-more" />
      ) : null}
      <AdBanner />
    </Screen>
  );
}
