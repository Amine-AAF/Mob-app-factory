import { addDays, fromDayKey } from '@factory/app-core';
import { Badge, Button, Card, Icon, IconButton, Row, Screen, SectionHeader, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { BUILTIN_TEMPLATES } from '@/content/templates';
import { repos } from '@/database';
import { applyTemplate, canPlanDay, weekStart } from '@/domain/planner';
import type { MealTemplate } from '@/domain/types';
import { useAsync } from '@/hooks/useAsync';
import { useLang } from '@/hooks/useLang';
import { fmt } from '@/i18n';
import { track } from '@/services/analytics';
import { clock } from '@/services/clock';
import { defaultServings, scheduleSync } from '@/services/planning';
import { builtinRecipe } from '@/services/recipeCatalog';
import { usePreferences } from '@/store/preferences';
import { dataChanged, useIsPremium } from '@/store/session';

/** Ready-made weekly plans (built-in) and the user's own saved menus. */
export default function Templates() {
  const { t, lng } = useLang();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const firstDay = usePreferences((s) => s.firstDayOfWeek);
  const params = useLocalSearchParams<{ start?: string }>();
  const today = clock.today();
  const [target, setTarget] = useState(params.start ?? weekStart(today, firstDay));
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data: mine } = useAsync(() => repos().templates.list(), []);

  const builtins: MealTemplate[] = BUILTIN_TEMPLATES.map((b) => ({
    id: b.id,
    builtin: true,
    premium: b.premium,
    name: t(`templates.builtin.${b.id}.name`),
    description: t(`templates.builtin.${b.id}.description`),
    icon: b.icon,
    entries: b.entries,
  }));

  const apply = (tpl: MealTemplate) => {
    if (tpl.premium && !isPremium) return router.push({ pathname: '/paywall', params: { source: `template_${tpl.id}` } });
    if (!canPlanDay(target, today, firstDay, isPremium)) return router.push({ pathname: '/paywall', params: { source: 'planner_weeks' } });
    Alert.alert(t('templates.applyTitle'), t('templates.applyBody', { name: tpl.name, week: fmt.date(fromDayKey(target), { day: 'numeric', month: 'long' }) }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('templates.addToWeek'),
        onPress: async () => {
          await repos().plan.addMany(applyTemplate(tpl, target, defaultServings()));
          track('template_applied', { template_id: tpl.builtin ? tpl.id : 'user' });
          dataChanged();
          scheduleSync(t, lng);
          router.navigate('/(tabs)/planner');
        },
      },
      {
        text: t('templates.replaceWeek'),
        style: 'destructive',
        onPress: async () => {
          await repos().plan.clearRange(target, addDays(target, 6));
          await repos().plan.addMany(applyTemplate(tpl, target, defaultServings()));
          track('template_applied', { template_id: tpl.builtin ? tpl.id : 'user' });
          dataChanged();
          scheduleSync(t, lng);
          router.navigate('/(tabs)/planner');
        },
      },
    ]);
  };

  const removeMine = (tpl: MealTemplate) =>
    Alert.alert(t('templates.deleteTitle'), tpl.name, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await repos().templates.remove(tpl.id);
          dataChanged();
        },
      },
    ]);

  const renderCard = (tpl: MealTemplate) => {
    const open = expanded === tpl.id;
    const dinners = tpl.entries.filter((e) => e.slot === 'dinner').map((e) => (e.recipeId ? builtinRecipe(e.recipeId, lng)?.title : e.customTitle) ?? '');
    return (
      <Card key={tpl.id} testID={`template-${tpl.id}`}>
        <Row gap={3}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={(tpl.icon as IconName) ?? 'calendar'} size={22} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Row gap={2}>
              <Text variant="subheading" style={{ flexShrink: 1 }}>
                {tpl.name}
              </Text>
              {tpl.premium ? <Badge label={t('premium.badge')} tone="warning" icon="sparkles" /> : null}
            </Row>
            {tpl.description ? (
              <Text variant="bodySmall" tone="muted">
                {tpl.description}
              </Text>
            ) : null}
            <Text variant="caption" tone="subtle">
              {t('templates.mealsCount', { count: tpl.entries.length })}
            </Text>
          </View>
          <IconButton icon={open ? 'chevron-up' : 'chevron-down'} label={t('templates.preview')} onPress={() => setExpanded(open ? null : tpl.id)} />
        </Row>
        {open ? (
          <Stack gap={1}>
            {dinners.map((d, i) => (
              <Text key={i} variant="bodySmall" tone="muted">
                {t('templates.dinnerDay', { day: i + 1, title: d })}
              </Text>
            ))}
          </Stack>
        ) : null}
        <Row gap={2}>
          <View style={{ flex: 1 }}>
            <Button label={tpl.premium && !isPremium ? t('premium.unlock') : t('templates.use')} size="md" icon={tpl.premium && !isPremium ? 'lock-closed-outline' : 'add'} onPress={() => apply(tpl)} testID={`apply-${tpl.id}`} />
          </View>
          {!tpl.builtin ? <IconButton icon="trash-outline" tone="danger" label={t('common.delete')} onPress={() => removeMine(tpl)} /> : null}
        </Row>
      </Card>
    );
  };

  return (
    <Screen edges={[]}>
      <Card tone="alt">
        <Text variant="label" tone="muted">
          {t('templates.targetWeek')}
        </Text>
        <Row style={{ justifyContent: 'space-between' }}>
          <IconButton icon="chevron-back" label={t('planner.previousWeek')} onPress={() => setTarget(addDays(target, -7))} />
          <Text variant="subheading">
            {fmt.date(fromDayKey(target), { day: 'numeric', month: 'short' })} – {fmt.date(fromDayKey(addDays(target, 6)), { day: 'numeric', month: 'short' })}
          </Text>
          <IconButton icon="chevron-forward" label={t('planner.nextWeekA11y')} onPress={() => setTarget(addDays(target, 7))} />
        </Row>
      </Card>
      <SectionHeader title={t('templates.mine')} />
      {mine?.length ? mine.map(renderCard) : <Text tone="muted">{t('templates.mineEmpty')}</Text>}
      <SectionHeader title={t('templates.ready')} />
      {builtins.map(renderCard)}
    </Screen>
  );
}
