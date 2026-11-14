import { Badge, Button, Card, Chip, EmptyState, Icon, Row, Stack, Text, useTheme } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LibraryBrowser } from '@/components/LibraryBrowser';
import { AdBanner, ChipScroller, PremiumBadge, Segmented } from '@/components/ui';
import { FREE_LIMITS } from '@/config/limits';
import { TEMPLATES } from '@/content/templates';
import { LEVELS, type Level, type ProgramType } from '@/content/types';
import { useData } from '@/hooks';
import { currentLanguage } from '@/i18n';
import { useIsPremium } from '@/store/session';

type Tab = 'programs' | 'library' | 'templates';

export default function Workouts() {
  const { t } = useTranslation();
  const theme = useTheme();
  const params = useLocalSearchParams<{ tab?: Tab }>();
  const [tab, setTab] = useState<Tab>(params.tab ?? 'programs');
  // A deep link (e.g. "Browse templates" on Home) switches the tab — derived during render.
  const [lastParam, setLastParam] = useState(params.tab);
  if (params.tab !== lastParam) {
    setLastParam(params.tab);
    if (params.tab) setTab(params.tab);
  }

  const segmented = (
    <Segmented
      value={tab}
      onChange={setTab}
      testID="workouts-tabs"
      options={[
        { value: 'programs', label: t('workouts.programs') },
        { value: 'library', label: t('workouts.library') },
        { value: 'templates', label: t('workouts.templates') },
      ]}
    />
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.background }} testID="workouts">
      {tab === 'library' ? (
        <LibraryBrowser
          header={
            <Stack gap={3}>
              <Text variant="title" accessibilityRole="header">
                {t('tabs.workouts')}
              </Text>
              {segmented}
            </Stack>
          }
          onSelect={(e) => router.push({ pathname: '/exercise/[id]', params: { id: e.id } })}
          footer={
            <Stack gap={2}>
              <Button label={t('library.createCustom')} variant="secondary" icon="add" onPress={() => router.push('/exercise/new')} />
              <AdBanner screen="library" />
            </Stack>
          }
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
          <Text variant="title" accessibilityRole="header">
            {t('tabs.workouts')}
          </Text>
          {segmented}
          {tab === 'programs' ? <ProgramsList /> : <TemplatesList />}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function ProgramsList() {
  const { t } = useTranslation();
  const theme = useTheme();
  const premium = useIsPremium();
  const { data } = useData(async (r) => ({ programs: await r.programs.list(), own: await r.programs.countOwn(), archived: (await r.programs.list({ includeArchived: true })).filter((p) => p.archivedAt) }));
  const [showArchived, setShowArchived] = useState(false);
  if (!data) return null;
  const atLimit = !premium && data.own >= FREE_LIMITS.ownPrograms;
  const list = showArchived ? data.archived : data.programs;
  return (
    <Stack gap={3}>
      <Row>
        <View style={{ flex: 1 }}>
          <Button
            label={t('workouts.newProgram')}
            icon="add"
            onPress={() => (atLimit ? router.push({ pathname: '/paywall', params: { source: 'program_limit' } }) : router.push('/program/new'))}
            testID="new-program"
          />
        </View>
      </Row>
      {!premium ? (
        <Text variant="caption" tone="subtle">
          {t('workouts.freeLimit', { used: Math.min(data.own, FREE_LIMITS.ownPrograms), max: FREE_LIMITS.ownPrograms })}
        </Text>
      ) : null}
      {list.length === 0 ? (
        <EmptyState
          icon="clipboard-outline"
          title={showArchived ? t('workouts.noArchived') : t('workouts.noProgramsTitle')}
          message={showArchived ? undefined : t('workouts.noProgramsBody')}
        />
      ) : (
        list.map((p) => (
          <Card key={p.id} onPress={() => router.push({ pathname: '/program/[id]', params: { id: p.id } })} accessibilityLabel={p.name} testID={`program-${p.id}`}>
            <Row gap={2}>
              <Icon name="clipboard" size={20} color={theme.colors.primary} />
              <Text variant="subheading" style={{ flex: 1 }} numberOfLines={1}>
                {p.name}
              </Text>
              <Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} />
            </Row>
            <Row wrap gap={2}>
              <Badge label={t(`programTypes.${p.type}`)} tone="neutral" />
              <Badge label={t(`levels.${p.level}`)} tone="neutral" />
              <Badge label={t('workouts.dayCount', { count: p.days.length })} tone="primary" />
            </Row>
          </Card>
        ))
      )}
      {data.archived.length ? <Chip label={showArchived ? t('workouts.showActive') : t('workouts.showArchived', { count: data.archived.length })} selected={showArchived} onPress={() => setShowArchived((v) => !v)} /> : null}
      <AdBanner screen="programs" />
    </Stack>
  );
}

const TYPE_FILTERS: ProgramType[] = ['full_body', 'upper_lower', 'push_pull_legs', 'strength', 'hypertrophy', 'bodyweight', 'home', 'cardio', 'mobility', 'core'];

function TemplatesList() {
  const { t } = useTranslation();
  const premium = useIsPremium();
  const lng = currentLanguage();
  const [type, setType] = useState<ProgramType | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const list = useMemo(() => TEMPLATES.filter((x) => (!type || x.type === type) && (!level || x.level === level)), [type, level]);
  return (
    <Stack gap={3}>
      <Text variant="bodySmall" tone="muted">
        {t('templates.intro')}
      </Text>
      <ChipScroller>
        {TYPE_FILTERS.filter((ty) => TEMPLATES.some((x) => x.type === ty)).map((ty) => (
          <Chip key={ty} label={t(`programTypes.${ty}`)} selected={type === ty} onPress={() => setType(type === ty ? null : ty)} />
        ))}
      </ChipScroller>
      <Row wrap gap={2}>
        {LEVELS.map((l) => (
          <Chip key={l} label={t(`levels.${l}`)} selected={level === l} onPress={() => setLevel(level === l ? null : l)} />
        ))}
      </Row>
      {list.map((tpl) => (
        <Card key={tpl.id} onPress={() => router.push({ pathname: '/template/[id]', params: { id: tpl.id } })} accessibilityLabel={tpl.i18n[lng].name} testID={`template-${tpl.id}`}>
          <Row gap={2}>
            <Text variant="subheading" style={{ flex: 1 }}>
              {tpl.i18n[lng].name}
            </Text>
            {tpl.premium && !premium ? <PremiumBadge /> : null}
          </Row>
          <Text variant="bodySmall" tone="muted" numberOfLines={2}>
            {tpl.i18n[lng].description}
          </Text>
          <Row wrap gap={2}>
            <Badge label={t(`levels.${tpl.level}`)} tone="neutral" />
            <Badge label={t('templates.perWeek', { count: tpl.daysPerWeek })} tone="neutral" icon="calendar-outline" />
            <Badge label={t('units.minutesShort', { count: tpl.estMinutes })} tone="neutral" icon="time-outline" />
          </Row>
        </Card>
      ))}
      <Text variant="caption" tone="subtle">
        {t('templates.disclaimer')}
      </Text>
    </Stack>
  );
}
