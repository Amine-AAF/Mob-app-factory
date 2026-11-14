import { Button, Card, Chip, EmptyState, ListRow, Screen, Text } from '@factory/design-system';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { TextField } from '@/components/fields';
import { PetFilter } from '@/components/pet';
import { FREE_LIMITS } from '@/domain/limits';
import { DOCUMENT_CATEGORIES, type DocumentCategory } from '@/domain/types';
import { useData } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { fileExists } from '@/services/files';
import { useIsPremium } from '@/store/session';

/** Pet passport: every document, searchable by title, notes and category. No ads. */
export default function Documents() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ petId?: string }>();
  const isPremium = useIsPremium();
  const [petId, setPetId] = useState<string | null>(params.petId ?? null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<DocumentCategory | null>(null);
  const { data } = useData(
    async (r) => ({ docs: query.trim() ? await r.documents.search(query, petId ?? undefined) : petId ? await r.documents.forPet(petId) : await r.documents.all(), pets: await r.pets.listAll() }),
    [query, petId],
  );
  const docs = (data?.docs ?? []).filter((d) => !category || d.category === category);
  const petName = (id: string) => data?.pets.find((p) => p.id === id)?.name ?? '';

  return (
    <Screen edges={[]} footer={<Button label={t('documents.add')} icon="add" onPress={() => router.push(`/document/new${petId ? `?petId=${petId}` : ''}`)} />}>
      <Stack.Screen options={{ title: t('documents.title') }} />
      <PetFilter pets={(data?.pets ?? []).filter((p) => !p.archived)} value={petId} onChange={setPetId} />
      <TextField label={t('common.search')} value={query} onChange={setQuery} placeholder={t('documents.searchPlaceholder')} testID="doc-search" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip label={t('documents.allCategories')} selected={!category} onPress={() => setCategory(null)} />
        {DOCUMENT_CATEGORIES.map((c) => (
          <Chip key={c} label={t(`options.documentCategory.${c}`)} selected={category === c} onPress={() => setCategory(category === c ? null : c)} />
        ))}
      </ScrollView>
      {!isPremium ? (
        <Text variant="caption" tone="subtle">
          {t('documents.freeLimit', { count: FREE_LIMITS.documentsPerPet })}
        </Text>
      ) : null}
      {docs.length === 0 ? (
        <EmptyState icon="folder-open-outline" title={t(query ? 'documents.noResults' : 'documents.empty')} message={t('documents.localOnly')} />
      ) : (
        <Card>
          {docs.map((d) => (
            <ListRow
              key={d.id}
              icon={fileExists('documents', d.fileName) ? 'document-outline' : 'alert-circle-outline'}
              title={d.title}
              subtitle={[t(`options.documentCategory.${d.category}`), petName(d.petId), fmt.day(d.createdAt.slice(0, 10))].filter(Boolean).join(' · ')}
              onPress={() => router.push(`/document/${d.id}`)}
            />
          ))}
        </Card>
      )}
    </Screen>
  );
}
