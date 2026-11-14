import { Badge, Button, Card, Chip, Icon, ListRow, Row, Screen, SectionHeader, Text, useTheme } from '@factory/design-system';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView } from 'react-native';

import { MedicalDisclaimer } from '@/components/pet';
import { repos } from '@/database';
import { TEMPLATES, templateItems, templateTitle, type TemplateCategory } from '@/content/templates';
import { canAddChecklist, isTemplateLocked } from '@/domain/limits';
import { useData } from '@/hooks/useData';
import { currentLanguage } from '@/i18n';
import { track } from '@/services/analytics';
import { mutate } from '@/services/mutations';
import { useIsPremium } from '@/store/session';

const CATEGORIES: TemplateCategory[] = ['essentials', 'routine', 'health', 'travel', 'seasonal', 'life_events', 'habitat'];

/** Care templates catalogue + the user's own checklists. */
export default function Templates() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { petId } = useLocalSearchParams<{ petId?: string }>();
  const isPremium = useIsPremium();
  const lng = currentLanguage();
  const [category, setCategory] = useState<TemplateCategory | null>(null);
  const { data } = useData(async (r) => ({ checklists: await r.checklists.list(), custom: await r.customTemplates.list(), pets: await r.pets.listActive() }));
  const pet = data?.pets.find((p) => p.id === petId);

  const start = async (templateId: string | null, title: string, labels: string[]) => {
    if (!canAddChecklist(data?.checklists.length ?? 0, isPremium)) {
      router.push('/paywall?source=checklists');
      return;
    }
    const id = await mutate(t, () => repos().checklists.create({ title, petId: petId ?? null, templateId, labels }));
    if (templateId) track('template_used', { template_id: templateId });
    router.push(`/checklist/${id}`);
  };

  const visible = TEMPLATES.map((tpl, index) => ({ tpl, index })).filter(({ tpl }) => (!category || tpl.category === category) && (!pet || !tpl.species || tpl.species.includes(pet.species)));

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('templates.title') }} />
      <MedicalDisclaimer compact />
      {data && data.checklists.length > 0 ? (
        <Card>
          <SectionHeader title={t('templates.myChecklists')} />
          {data.checklists.map((c) => {
            const done = c.items.filter((i) => i.done).length;
            return (
              <ListRow key={c.id} icon="checkbox-outline" title={c.title} subtitle={t('templates.progress', { done, total: c.items.length })} onPress={() => router.push(`/checklist/${c.id}`)} />
            );
          })}
        </Card>
      ) : null}
      <Button label={t('templates.createOwn')} icon="add" variant="secondary" onPress={() => start(null, t('templates.myChecklist'), [])} />
      {data && data.custom.length > 0 ? (
        <Card>
          <SectionHeader title={t('templates.myTemplates')} />
          {data.custom.map((c) => (
            <ListRow
              key={c.id}
              icon="bookmark-outline"
              title={c.title}
              subtitle={t('templates.items', { count: c.items.length })}
              onPress={() =>
                Alert.alert(c.title, undefined, [
                  { text: t('common.cancel'), style: 'cancel' },
                  { text: t('common.delete'), style: 'destructive', onPress: () => mutate(t, () => repos().customTemplates.remove(c.id)) },
                  { text: t('templates.use'), onPress: () => start(null, c.title, c.items) },
                ])
              }
            />
          ))}
        </Card>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip label={t('templates.all')} selected={!category} onPress={() => setCategory(null)} />
        {CATEGORIES.map((c) => (
          <Chip key={c} label={t(`templates.categories.${c}`)} selected={category === c} onPress={() => setCategory(category === c ? null : c)} />
        ))}
      </ScrollView>
      {pet ? (
        <Text variant="caption" tone="subtle">
          {t('templates.filteredFor', { name: pet.name })}
        </Text>
      ) : null}
      {visible.map(({ tpl, index }) => {
        const locked = isTemplateLocked(index, isPremium);
        const items = templateItems(tpl, lng);
        return (
          <Card
            key={tpl.id}
            onPress={() => (locked ? router.push('/paywall?source=templates') : start(tpl.id, templateTitle(tpl, lng), items))}
            accessibilityLabel={templateTitle(tpl, lng)}
            testID={`template-${tpl.id}`}
          >
            <Row gap={3}>
              <Icon name={tpl.icon} size={22} color={theme.colors.primary} />
              <Text variant="subheading" style={{ flex: 1 }}>
                {templateTitle(tpl, lng)}
              </Text>
              {locked ? <Badge icon="lock-closed" label={t('premium.badge')} tone="accent" /> : null}
            </Row>
            <Text variant="bodySmall" tone="muted" numberOfLines={2}>
              {items.slice(0, 3).join(' · ')}
            </Text>
          </Card>
        );
      })}
    </Screen>
  );
}
