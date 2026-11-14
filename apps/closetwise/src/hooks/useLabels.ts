import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { colorHex, maskToSeasons, type CategoryKey } from '@/domain/catalog';
import type { Tag } from '@/domain/types';
import { useTaxonomy } from '@/store/session';

/**
 * Localised labels for stored identifiers (category ids, tag ids, color keys…).
 * Built-in entries are translated; user-created styles/occasions show their own name.
 */
export function useLabels() {
  const { t } = useTranslation();
  const taxonomy = useTaxonomy();

  const categoryKeyById = useMemo(() => new Map(taxonomy.categories.map((c) => [c.id, c.key])), [taxonomy.categories]);
  const styleById = useMemo(() => new Map(taxonomy.styles.map((s) => [s.id, s])), [taxonomy.styles]);
  const occasionById = useMemo(() => new Map(taxonomy.occasions.map((s) => [s.id, s])), [taxonomy.occasions]);

  const tagLabel = useCallback((group: 'style' | 'occasion', tag: Tag | undefined | null) => (tag ? (tag.key ? t(`catalog.${group}.${tag.key}`) : (tag.name ?? '')) : ''), [t]);

  return useMemo(
    () => ({
      categoryKey: (categoryId: string | null | undefined): CategoryKey => (categoryKeyById.get(categoryId ?? '') ?? 'other') as CategoryKey,
      category: (categoryId: string | null | undefined) => (categoryId ? t(`catalog.category.${categoryKeyById.get(categoryId) ?? 'other'}`) : ''),
      style: (id: string | null | undefined) => (id ? tagLabel('style', styleById.get(id)) : ''),
      occasion: (id: string | null | undefined) => (id ? tagLabel('occasion', occasionById.get(id)) : ''),
      styleKey: (id: string | null) => (id ? (styleById.get(id)?.key ?? null) : null),
      occasionKey: (id: string) => occasionById.get(id)?.key ?? null,
      tag: tagLabel,
      color: (key: string | null | undefined) => (key ? t(`catalog.color.${key}`) : ''),
      colorHex,
      seasons: (mask: number) => (mask === 0 || mask === 15 ? t('catalog.season.all') : maskToSeasons(mask).map((s) => t(`catalog.season.${s}`)).join(' · ')),
      categoryOptions: taxonomy.categories.map((c) => ({ value: c.id, label: t(`catalog.category.${c.key}`) })),
      styleOptions: taxonomy.styles.filter((s) => !s.archived).map((s) => ({ value: s.id, label: tagLabel('style', s) })),
      occasionOptions: taxonomy.occasions.filter((s) => !s.archived).map((s) => ({ value: s.id, label: tagLabel('occasion', s) })),
      categoryIdForKey: (key: string) => taxonomy.categories.find((c) => c.key === key)?.id ?? null,
    }),
    [t, taxonomy, categoryKeyById, styleById, occasionById, tagLabel],
  );
}

export type Labels = ReturnType<typeof useLabels>;
