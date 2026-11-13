import { Button, Card, EmptyState, Screen } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Fab, Field, HScroll, InfoNote, ItemRow, StatusBadge } from '@/components/ui';
import { DOCUMENT_ICONS } from '@/constants/icons';
import { repos } from '@/database';
import { documentExpiryStatus } from '@/features/deadlines/deadlines';
import { useAsync, useFormat, useToday } from '@/hooks';
import { fileExists } from '@/services/fileStore';
import { DOCUMENT_CATEGORIES, type DocumentCategory } from '@/types';

const formatSize = (bytes: number) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

export function DocumentsView({ vehicleId }: { vehicleId?: string }) {
  const { t } = useTranslation();
  const f = useFormat();
  const today = useToday();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<DocumentCategory | null>(null);
  const { data } = useAsync(async () => ({ docs: await repos().documents.list(vehicleId), vehicles: await repos().vehicles.list({ includeArchived: true }) }), [vehicleId]);
  const names = new Map((data?.vehicles ?? []).map((v) => [v.id, v.name]));
  const q = query.trim().toLowerCase();
  const docs = (data?.docs ?? []).filter((d) => (!category || d.category === category) && (!q || [d.title, d.notes, t(`documentCategories.${d.category}`)].filter(Boolean).join(' ').toLowerCase().includes(q)));
  const used = DOCUMENT_CATEGORIES.filter((c) => data?.docs.some((d) => d.category === c));

  return (
    <View style={{ flex: 1 }}>
      <Screen edges={[]}>
        <InfoNote icon="lock-closed-outline" text={t('documents.privacy')} />
        <Field label={t('common.search')} value={query} onChangeText={setQuery} placeholder={t('documents.searchPlaceholder')} />
        {used.length > 1 ? (
          <HScroll>
            {[null, ...used].map((c) => (
              <Button key={c ?? 'all'} label={c ? t(`documentCategories.${c}`) : t('common.all')} size="md" variant={category === c ? 'primary' : 'secondary'} onPress={() => setCategory(c)} />
            ))}
          </HScroll>
        ) : null}
        {data && docs.length === 0 ? <EmptyState icon="folder-open-outline" title={t('documents.empty')} /> : null}
        {docs.length ? (
          <Card>
            {docs.map((d) => {
              const status = documentExpiryStatus(d, today);
              return (
                <ItemRow
                  key={d.id}
                  icon={DOCUMENT_ICONS[d.category]}
                  tone={status === 'expired' ? 'danger' : status === 'expiring' ? 'warning' : 'primary'}
                  title={d.title}
                  subtitle={[
                    t(`documentCategories.${d.category}`),
                    !vehicleId && d.vehicleId ? names.get(d.vehicleId) : null,
                    d.expiryDay ? (status === 'expired' ? t('documents.expired', { date: f.day(d.expiryDay) }) : t('documents.expires', { date: f.day(d.expiryDay) })) : null,
                    fileExists(d.fileName) ? formatSize(d.sizeBytes) : t('documents.fileMissing'),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                  badge={status === 'expired' || status === 'expiring' ? <StatusBadge status={status} /> : null}
                  onPress={() => router.push({ pathname: '/document/edit', params: { id: d.id } })}
                />
              );
            })}
          </Card>
        ) : null}
        <View style={{ height: 72 }} />
      </Screen>
      <Fab label={t('documents.add')} onPress={() => router.push({ pathname: '/document/edit', params: vehicleId ? { vehicleId } : {} })} />
    </View>
  );
}

export { formatSize };
