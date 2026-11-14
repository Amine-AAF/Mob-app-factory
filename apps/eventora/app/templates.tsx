import { Badge, Card, Icon, IconButton, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ChoiceChips } from '@/components/forms';
import { AdBanner, confirmDelete, limitAlert, ScreenTitle } from '@/components/ui';
import { canCreateEvent } from '@/config/limits';
import { eventType, THEME_COLORS } from '@/content/eventTypes';
import { EVENT_TEMPLATES, type EventTemplate } from '@/content/templates';
import { countActive } from '@/domain/events';
import { EVENT_THEMES, type EventTheme } from '@/domain/types';
import { mutate, useRepo } from '@/hooks/useData';
import { useIsPremium } from '@/store/session';

/** Planning templates (bundled + saved by the user). Picking one opens the event form pre-filled. */
export default function Templates() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const { pick } = useLocalSearchParams<{ pick?: string }>();
  const [family, setFamily] = useState<EventTheme | 'all'>('all');
  const { data } = useRepo(async (r) => ({ custom: await r.templates.list(), active: countActive(await r.events.list()) }), []);

  const open = (tpl: EventTemplate) => {
    if (tpl.premium && !isPremium) return limitAlert(t, 'premiumTemplates', 0, 'template');
    const check = canCreateEvent(isPremium, data?.active ?? 0);
    if (!check.allowed) return limitAlert(t, check.feature, check.limit, 'events_limit');
    const target = { pathname: '/event/new' as const, params: { templateId: tpl.id } };
    if (pick) router.replace(target);
    else router.push(target);
  };

  const list = EVENT_TEMPLATES.filter((x) => family === 'all' || eventType(x.typeId).theme === family);

  return (
    <Screen edges={[]}>
      <ScreenTitle title={t('templates.title')} />
      <Text tone="muted">{t('templates.subtitle', { count: EVENT_TEMPLATES.length })}</Text>
      <ChoiceChips value={family} onChange={setFamily} options={[{ value: 'all' as const, label: t('common.all') }, ...EVENT_THEMES.map((x) => ({ value: x, label: t(`themes.${x}`) }))]} />
      <Stack gap={2}>
        {list.map((tpl) => {
          const palette = THEME_COLORS[eventType(tpl.typeId).theme];
          return (
            <Card key={tpl.id} onPress={() => open(tpl)} accessibilityLabel={t(`templates.items.${tpl.id}.name`)}>
              <Row gap={3}>
                <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={tpl.icon} size={22} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="subheading">{t(`templates.items.${tpl.id}.name`)}</Text>
                  <Text variant="caption" tone="muted">
                    {t(`templates.items.${tpl.id}.desc`)}
                  </Text>
                  <Text variant="caption" tone="subtle">
                    {t('templates.contents', { tasks: tpl.tasks.length, activities: tpl.timeline.length, categories: Object.keys(tpl.budgetSplit).length })}
                  </Text>
                </View>
                {tpl.premium && !isPremium ? <Badge label="Premium" tone="accent" icon="diamond" /> : <Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} />}
              </Row>
            </Card>
          );
        })}
      </Stack>
      <SectionHeader title={t('templates.mine')} />
      {data?.custom.length ? (
        <Stack gap={2}>
          {data.custom.map((c) => (
            <Card key={c.id} onPress={() => router.push({ pathname: '/event/new', params: { customTemplateId: c.id, typeId: c.baseType } })}>
              <Row gap={3}>
                <Icon name="bookmark" size={20} color={theme.colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text variant="subheading">{c.name}</Text>
                  <Text variant="caption" tone="muted">
                    {t('templates.contents', { tasks: c.payload.tasks.length, activities: c.payload.timeline.length, categories: Object.keys(c.payload.budgetSplit).length })}
                  </Text>
                </View>
                <IconButton icon="trash-outline" tone="danger" label={t('common.delete')} onPress={() => confirmDelete(t, c.name, () => void mutate((r) => r.templates.remove(c.id)))} />
              </Row>
            </Card>
          ))}
        </Stack>
      ) : (
        <Text variant="bodySmall" tone="muted">
          {t('templates.mineEmpty')}
        </Text>
      )}
      <AdBanner />
    </Screen>
  );
}
