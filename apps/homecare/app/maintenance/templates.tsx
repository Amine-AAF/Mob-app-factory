import { Badge, Screen, Stack, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FilterChips } from '@/components/forms';
import { openPaywall } from '@/components/media';
import { ItemRow, Notice, ScreenHeader, SearchBar } from '@/components/ui';
import { MAINTENANCE_TEMPLATES } from '@/content/maintenanceTemplates';
import { MAINTENANCE_ICONS } from '@/config/icons';
import { MAINTENANCE_CATEGORIES, type MaintenanceCategory } from '@/domain/types';
import { useIsPremium } from '@/store/session';

/** 60+ editable starting points. Premium unlocks the full library. */
export default function Templates() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const [category, setCategory] = useState<MaintenanceCategory | null>(null);
  const [search, setSearch] = useState('');
  const q = search.trim().toLowerCase();
  const list = MAINTENANCE_TEMPLATES.filter((tpl) => (!category || tpl.category === category) && (!q || t(`templates.${tpl.id}.title`).toLowerCase().includes(q)));

  return (
    <Screen>
      <ScreenHeader title={t('templates.title')} subtitle={t('templates.subtitle', { count: MAINTENANCE_TEMPLATES.length })} back />
      <Notice>{t('templates.disclaimer')}</Notice>
      <SearchBar value={search} onChangeText={setSearch} placeholder={t('templates.search')} />
      <FilterChips options={MAINTENANCE_CATEGORIES} value={category} onChange={setCategory} renderLabel={(v) => t(`maintenanceCategories.${v}`)} allLabel={t('common.all')} />
      {list.length === 0 ? <Text tone="muted">{t('common.noResults')}</Text> : null}
      <Stack gap={2}>
        {list.map((tpl) => {
          const locked = !tpl.free && !isPremium;
          return (
            <ItemRow
              key={tpl.id}
              icon={MAINTENANCE_ICONS[tpl.category]}
              title={t(`templates.${tpl.id}.title`)}
              subtitle={`${tpl.frequency === 'custom' ? t('templates.every', { count: tpl.intervalValue ?? 1, unit: t(`intervalUnits.${tpl.intervalUnit ?? 'month'}`, { count: tpl.intervalValue ?? 1 }) }) : t(`frequencies.${tpl.frequency}`)} · ${t('common.minutes', { count: tpl.estimatedMinutes })}`}
              right={locked ? <Badge label={t('premium.badge')} tone="accent" icon="diamond-outline" /> : undefined}
              onPress={() => (locked ? openPaywall('templates') : router.replace({ pathname: '/maintenance/edit', params: { templateId: tpl.id } }))}
            />
          );
        })}
      </Stack>
    </Screen>
  );
}
