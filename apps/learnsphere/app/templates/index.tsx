import { Chip, Icon, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { Pill, SubjectIcon } from '@/components/ui';
import type { TemplateCategory } from '@/content/templates';
import { repos } from '@/database';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { useIsPremium } from '@/store/session';

const CATEGORIES: TemplateCategory[] = ['university', 'exam', 'language', 'certification', 'routine', 'weekly', 'roadmap', 'reading'];

export default function Templates() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const params = useLocalSearchParams<{ category?: TemplateCategory }>();
  const [category, setCategory] = useState<TemplateCategory | null>(params.category ?? null);
  const { data: templates = [] } = useAsync(() => repos().templates.list(), []);
  const shown = templates.filter((tpl) => !category || tpl.def.category === category);

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('templates.title') }} />
      <Text tone="muted">{t('templates.intro', { count: templates.filter((x) => x.source === 'bundle').length })}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip label={t('common.all')} selected={category === null} onPress={() => setCategory(null)} />
        {CATEGORIES.map((c) => (
          <Chip key={c} label={t(`templates.categories.${c}`)} selected={category === c} onPress={() => setCategory(c)} />
        ))}
      </ScrollView>
      <Stack gap={3}>
        {shown.map(({ def, source, name }) => {
          const locked = def.premium && !isPremium;
          const chapters = def.courses.reduce((s, c) => s + c.chapters.length, 0);
          return (
            <Pressable
              key={def.id}
              onPress={() => (locked ? router.push({ pathname: '/paywall', params: { source: 'templates' } }) : router.push({ pathname: '/templates/[id]', params: { id: def.id } }))}
              accessibilityRole="button"
              accessibilityLabel={name ?? t(`templates.items.${def.id}.name`)}
              style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: 14, gap: 8, opacity: locked ? 0.85 : 1 }}
            >
              <Row gap={3}>
                <SubjectIcon icon={def.icon} color={def.color} />
                <View style={{ flex: 1 }}>
                  <Text variant="subheading">{name ?? t(`templates.items.${def.id}.name`)}</Text>
                  <Text variant="caption" tone="subtle">
                    {t(`templates.categories.${def.category}`)} · {t('templates.weeks', { count: def.weeks })} · {t('templates.chapters', { count: chapters })}
                  </Text>
                </View>
                {locked ? <Icon name="lock-closed" size={18} color={theme.colors.accent} /> : null}
              </Row>
              {source === 'bundle' ? (
                <Text variant="bodySmall" tone="muted">
                  {t(`templates.items.${def.id}.desc`)}
                </Text>
              ) : null}
              <Row gap={2} wrap>
                <Pill label={t('templates.rhythm', { days: def.sessions.days.length, minutes: fmt.duration(def.sessions.minutes) })} color={def.color} icon="repeat" />
                {def.exam ? <Pill label={t(`agenda.kinds.${def.exam.kind}`)} color={theme.colors.danger} icon="alarm" /> : null}
                {def.premium ? <Pill label={t('premium.badge')} color={theme.colors.accent} icon="sparkles" /> : null}
                {source === 'user' ? <Pill label={t('templates.mine')} color={theme.colors.primary} /> : null}
              </Row>
            </Pressable>
          );
        })}
      </Stack>
    </Screen>
  );
}
