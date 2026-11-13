import { Chip, EmptyState, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { FilterChips } from '@/components/forms';
import { AdBanner, openPaywall, PremiumLock } from '@/components/media';
import { ExpiryBadge, Fab, ItemRow, ScreenHeader, SearchBar } from '@/components/ui';
import { DOCUMENT_ICONS } from '@/config/icons';
import { canCreate, FREE_LIMITS } from '@/config/limits';
import { repos } from '@/database';
import { DOCUMENT_TYPES, type DocumentType } from '@/domain/types';
import { expiryStatus } from '@/domain/warranty';
import { useData } from '@/hooks/useData';
import { useActiveHome, useToday } from '@/hooks/useHome';
import { fmt } from '@/i18n';
import { fileExists } from '@/services/files';
import { useIsPremium } from '@/store/session';

export default function DocumentsTab() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ expiring?: string }>();
  const home = useActiveHome();
  const today = useToday();
  const isPremium = useIsPremium();
  const [search, setSearch] = useState('');
  const [type, setType] = useState<DocumentType | null>(null);
  const [expiring, setExpiring] = useState(params.expiring === '1');

  const { data } = useData(async () => {
    if (!home) return null;
    const r = repos();
    const [docs, total, assets] = await Promise.all([r.documents.list(home.id, { search, type, expiringOnly: expiring }), r.documents.count(home.id), r.assets.list(home.id)]);
    return { docs, total, assetNames: new Map(assets.map((a) => [a.id, a.name])) };
  }, [home?.id, search, type, expiring]);

  if (!home) return null;
  const allowed = canCreate('documents', data?.total ?? 0, isPremium);

  return (
    <View style={{ flex: 1 }}>
      <Screen testID="documents-tab">
        <ScreenHeader title={t('documents.title')} subtitle={t('documents.subtitle')} />
        <SearchBar value={search} onChangeText={setSearch} placeholder={t('documents.search')} />
        <FilterChips options={DOCUMENT_TYPES} value={type} onChange={setType} renderLabel={(v) => t(`documentTypes.${v}`)} allLabel={t('common.all')} />
        <Row>
          <Chip label={t('documents.withExpiry')} icon="hourglass-outline" selected={expiring} onPress={() => setExpiring((v) => !v)} />
        </Row>
        {!isPremium && data ? (
          <Text variant="caption" tone="subtle">
            {t('limits.documents', { used: data.total, max: FREE_LIMITS.documents })}
          </Text>
        ) : null}
        {data && data.docs.length === 0 ? (
          <EmptyState icon="folder-open-outline" title={search || type || expiring ? t('common.noResults') : t('documents.emptyTitle')} message={search || type || expiring ? undefined : t('documents.emptyMessage')} />
        ) : null}
        <Stack gap={2}>
          {data?.docs.map((d) => {
            const missing = !!d.filePath && !fileExists(d.filePath);
            return (
              <ItemRow
                key={d.id}
                icon={DOCUMENT_ICONS[d.type]}
                title={d.title}
                subtitle={[t(`documentTypes.${d.type}`), d.assetId ? data.assetNames.get(d.assetId) : null, d.sizeBytes ? fmt.fileSize(d.sizeBytes) : null].filter(Boolean).join(' · ')}
                meta={missing ? <Text variant="caption" tone="danger">{t('files.missingShort')}</Text> : undefined}
                right={<ExpiryBadge status={expiryStatus(d.expiryDate, today)} date={d.expiryDate} today={today} />}
                onPress={() => router.push(`/documents/${d.id}`)}
              />
            );
          })}
        </Stack>
        {!allowed ? <PremiumLock feature="documents_limit" message={t('limits.documentsReached')} /> : null}
        <AdBanner />
        <View style={{ height: 72 }} />
      </Screen>
      <Fab label={t('documents.add')} icon="document-attach-outline" testID="add-document" onPress={() => (allowed ? router.push('/documents/edit') : openPaywall('documents_limit'))} />
    </View>
  );
}
