import { Button, Card, Chip, EmptyState, Row, SectionHeader, Stack, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { DepartureTasks } from '@/components/DepartureTasks';
import { PackingListCard } from '@/components/PackingList';
import { TextField } from '@/components/TextField';
import { TripScaffold } from '@/components/TripScaffold';
import { PACKING_TEMPLATES, templateItems, type PackingTemplateKey } from '@/content/packingCatalog';
import { repos } from '@/database';
import { isPackingTemplateFree } from '@/features/premium/limits';
import { usePremiumGate } from '@/features/premium/usePremiumGate';
import { createPackingFromTemplate, createPackingFromUserTemplate, createPackingList } from '@/features/packing/actions';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { recordError } from '@/services/analytics';

/** Trip checklist section: packing lists, pre-departure tasks with reminders, weather notes. */
export default function TripChecklistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { isPremium, openPaywall } = usePremiumGate();
  const { data } = useAsync(async () => {
    const [lists, userTemplates] = await Promise.all([repos().packing.listsForTrip(id), repos().packing.userTemplates()]);
    return { lists, userTemplates };
  }, [id]);
  const [template, setTemplate] = useState<PackingTemplateKey | null>(null);
  const [name, setName] = useState('');

  const openList = (listId: string) => router.push({ pathname: '/trip/[id]/packing', params: { id, listId } });
  const fail = (e: unknown) => {
    recordError(e, 'packing');
    Alert.alert(t('tripForm.errors.generic'));
  };

  const create = () => {
    const listName = name.trim() || (template ? t(`packing.templates.${template}`) : t('packing.defaultName'));
    const p = template ? createPackingFromTemplate(id, template, listName, i18n.language) : createPackingList(id, listName);
    p.then((list) => {
      setName('');
      setTemplate(null);
      openList(list.id);
    }).catch(fail);
  };

  const all = data?.lists ?? [];
  const packed = all.reduce((s, l) => s + l.packed, 0);
  const total = all.reduce((s, l) => s + l.total, 0);

  return (
    <TripScaffold tripId={id} section="checklist">
      {({ trip }) => (
        <Stack gap={3}>
          <SectionHeader title={t('packing.title')} />
          {total ? (
            <Text variant="bodySmall" tone="muted">
              {t('packing.progress', { percent: fmt.percent(packed / total) })}
            </Text>
          ) : null}
          {data && all.length === 0 ? <EmptyState icon="briefcase-outline" title={t('packing.emptyTitle')} message={t('packing.emptyMessage')} /> : null}
          {all.map((l) => (
            <PackingListCard key={l.id} list={l} onPress={() => openList(l.id)} />
          ))}

          <Card tone="alt">
            <Text variant="subheading">{t('packing.newList')}</Text>
            <Text variant="label">{t('packing.startFrom')}</Text>
            <Row gap={2} wrap>
              <Chip label={t('packing.blank')} selected={template === null} onPress={() => setTemplate(null)} testID="packing-template-blank" />
              {PACKING_TEMPLATES.map((k) => (
                <Chip key={k} label={`${t(`packing.templates.${k}`)} (${templateItems(k).length})${isPremium || isPackingTemplateFree(k) ? '' : ' · Premium'}`} selected={template === k} onPress={() => (isPremium || isPackingTemplateFree(k) ? setTemplate(k) : openPaywall('all_templates'))} testID={`packing-template-${k}`} />
              ))}
            </Row>
            <TextField label={t('packing.listName')} placeholder={template ? t(`packing.templates.${template}`) : t('packing.defaultName')} value={name} onChangeText={setName} />
            <Button label={t('packing.create')} icon="add" onPress={create} testID="packing-create" />
            {data?.userTemplates.length ? (
              <Stack gap={2}>
                <Text variant="label">{t('packing.myTemplates')}</Text>
                <Row gap={2} wrap>
                  {data.userTemplates.map((tpl) => (
                    <Chip key={tpl.id} label={`${tpl.name} (${tpl.total})`} selected={false} onPress={() => createPackingFromUserTemplate(id, tpl.id).then((l) => openList(l.id)).catch(fail)} />
                  ))}
                </Row>
              </Stack>
            ) : null}
          </Card>

          <SectionHeader title={t('packing.tasksTitle')} />
          <DepartureTasks trip={trip} />

          <SectionHeader title={t('weather.title')} />
          <Card onPress={() => router.push({ pathname: '/trip/[id]/weather', params: { id } })} accessibilityLabel={t('weather.title')} testID="weather-card">
            <Text variant="bodySmall">{t('weather.cardHint')}</Text>
          </Card>
        </Stack>
      )}
    </TripScaffold>
  );
}
