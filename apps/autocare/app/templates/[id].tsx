import { Button, Card, EmptyState, IconButton, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Field, InfoNote, PremiumGate } from '@/components/ui';
import { repos } from '@/database';
import { hasFeature } from '@/features/premium/limits';
import { checkLabel, customizationKey, effectiveItems, templateById, type CheckItem, type TemplateCustomization } from '@/features/templates/data';
import { useAsync } from '@/hooks';
import { afterWrite } from '@/services/boot';
import { clock } from '@/services/clock';
import { useIsPremium } from '@/store/session';



export default function TemplateDetail() {
  const { t } = useTranslation();
  const premium = useIsPremium();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tpl = templateById(id);
  const { data } = useAsync(() => repos().settings.get<TemplateCustomization | null>(customizationKey(id), null), [id]);
  const [custom, setCustom] = useState<TemplateCustomization>({ hidden: [], extra: [] });
  const [editing, setEditing] = useState(false);
  const [newItem, setNewItem] = useState('');

  const [loaded, setLoaded] = useState(false);
  if (data !== undefined && !loaded) {
    setLoaded(true);
    if (data) setCustom(data);
  }

  if (!tpl) return <EmptyState icon="help-circle-outline" title={t('common.error')} />;
  const canCustomize = hasFeature(premium, 'template_customization');
  const items = effectiveItems(tpl, custom);

  const persist = async (next: TemplateCustomization) => {
    setCustom(next);
    await repos().settings.set(customizationKey(id), next, clock.now());
    afterWrite();
  };
  const toggle = (item: CheckItem) => void persist({ ...custom, hidden: custom.hidden.includes(item) ? custom.hidden.filter((x) => x !== item) : [...custom.hidden, item] });

  return (
    <>
      <RouterStack.Screen options={{ title: t(`templates.items.${tpl.id}.name`) }} />
      <Screen edges={[]} footer={<Button label={t('templates.start')} icon="play" onPress={() => router.push({ pathname: '/inspection/run', params: { templateId: tpl.id } })} testID="start-checklist" />}>
        <Text tone="muted">{t(`templates.items.${tpl.id}.desc`)}</Text>
        <InfoNote icon="alert-circle-outline" text={t('templates.disclaimer')} />
        <Card>
          {(editing ? tpl.items.map((key) => ({ key, builtIn: true })) : items).map((item) => {
            const hidden = custom.hidden.includes(item.key as CheckItem);
            return (
              <Row key={item.key} style={{ justifyContent: 'space-between', minHeight: 40 }}>
                <Text variant="body" tone={hidden ? 'subtle' : 'default'} style={{ flex: 1, textDecorationLine: hidden ? 'line-through' : 'none' }}>
                  • {checkLabel(item.key, t)}
                </Text>
                {editing ? <Button label={hidden ? t('templates.showItem') : t('templates.hideItem')} size="md" variant="ghost" onPress={() => toggle(item.key as CheckItem)} /> : null}
              </Row>
            );
          })}
          {editing
            ? custom.extra.map((x, i) => (
                <Row key={`${x}-${i}`} style={{ justifyContent: 'space-between' }}>
                  <Text style={{ flex: 1 }}>• {x}</Text>
                  <IconButton icon="close" label={t('common.delete')} onPress={() => void persist({ ...custom, extra: custom.extra.filter((_, j) => j !== i) })} />
                </Row>
              ))
            : null}
        </Card>
        {editing ? (
          <Stack gap={2}>
            <Field label={t('templates.addItem')} value={newItem} onChangeText={setNewItem} placeholder={t('templates.addItemPlaceholder')} />
            <Button
              label={t('common.add')}
              icon="add"
              variant="secondary"
              size="md"
              disabled={!newItem.trim()}
              onPress={() => {
                void persist({ ...custom, extra: [...custom.extra, newItem.trim().slice(0, 120)] });
                setNewItem('');
              }}
            />
            <Button label={t('common.done')} size="md" onPress={() => setEditing(false)} />
          </Stack>
        ) : canCustomize ? (
          <Button label={t('templates.customize')} icon="options-outline" variant="secondary" size="md" onPress={() => setEditing(true)} />
        ) : (
          <PremiumGate reason="template_customization" />
        )}
      </Screen>
    </>
  );
}
