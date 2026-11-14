import { Card, FadeIn, Icon, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, ScrollView, View } from 'react-native';

import { ErrorNotice, ImportHero, ToolTile } from '@/components/common';
import { AdBanner, PremiumCard } from '@/components/monetization';
import { findTool, QUICK_TOOLS, type ToolId } from '@/constants/tools';
import { repos } from '@/database';
import type { Project } from '@/database/repositories/projectsRepository';
import { useOpenTool } from '@/features/navigation';
import { fmt } from '@/i18n';
import { useSession } from '@/store/session';

/** Dashboard: one-tap import, quick tools, social presets, collage, recent projects. */
export default function HomeScreen() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const { open, importAndEdit, busy, error } = useOpenTool('home');
  const dataVersion = useSession((s) => s.dataVersion);
  const [recent, setRecent] = useState<Project[]>([]);
  const [topTools, setTopTools] = useState<ToolId[]>([]);

  useEffect(() => {
    let alive = true;
    Promise.all([repos().projects.list(6), repos().toolUsage.top(4)])
      .then(([projects, top]) => {
        if (!alive) return;
        setRecent(projects);
        setTopTools(top.map((x) => x.toolId).filter((id): id is ToolId => Boolean(findTool(id))));
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [dataVersion]);

  const tile = (id: ToolId) => {
    const tool = findTool(id);
    if (!tool) return null;
    return <ToolTile key={id} icon={tool.icon} title={tr(`tools.${id}.title`)} subtitle={tr(`tools.${id}.short`)} premium={tool.premium} onPress={() => void open(id)} testID={`quick-${id}`} />;
  };

  return (
    <Screen testID="home-screen">
      <Stack gap={1}>
        <Text variant="display" accessibilityRole="header">
          {tr('app.name')}
        </Text>
        <Text tone="muted">{tr('app.slogan')}</Text>
      </Stack>
      <FadeIn>
        <ImportHero onPress={() => void importAndEdit()} busy={busy} />
      </FadeIn>
      {error ? <ErrorNotice code={error} /> : null}
      <Row gap={2}>
        <Icon name="shield-checkmark-outline" size={16} color={t.colors.success} />
        <Text variant="caption" tone="muted" style={{ flex: 1 }}>
          {tr('privacy.badge')}
        </Text>
      </Row>

      <SectionHeader title={tr('home.quickTools')} />
      <Row gap={3} wrap>
        {QUICK_TOOLS.map(tile)}
      </Row>

      <Card onPress={() => void open('social')} accessibilityLabel={tr('tools.social.title')} testID="home-social">
        <Row gap={3}>
          <Icon name="share-social" size={24} color={t.colors.accent} />
          <Stack gap={0} style={{ flex: 1 }}>
            <Text variant="subheading">{tr('tools.social.title')}</Text>
            <Text variant="caption" tone="muted">
              {tr('home.socialSubtitle')}
            </Text>
          </Stack>
          <Icon name="chevron-forward" size={18} color={t.colors.textSubtle} />
        </Row>
        <Row gap={3} style={{ marginTop: 4 }}>
          {(['logo-instagram', 'logo-tiktok', 'logo-youtube', 'logo-facebook', 'logo-linkedin', 'logo-pinterest', 'logo-whatsapp'] as const).map((n) => (
            <Icon key={n} name={n} size={18} color={t.colors.textMuted} />
          ))}
        </Row>
      </Card>
      <Card onPress={() => void open('collage')} accessibilityLabel={tr('tools.collage.title')} testID="home-collage">
        <Row gap={3}>
          <Icon name="grid" size={24} color={t.colors.primary} />
          <Stack gap={0} style={{ flex: 1 }}>
            <Text variant="subheading">{tr('tools.collage.title')}</Text>
            <Text variant="caption" tone="muted">
              {tr('home.collageSubtitle')}
            </Text>
          </Stack>
          <Icon name="chevron-forward" size={18} color={t.colors.textSubtle} />
        </Row>
      </Card>

      {topTools.length > 0 ? (
        <>
          <SectionHeader title={tr('home.mostUsed')} />
          <Row gap={3} wrap>
            {topTools.map(tile)}
          </Row>
        </>
      ) : null}

      <SectionHeader title={tr('home.recent')} action={recent.length ? tr('common.seeAll') : undefined} onAction={() => router.navigate('/(tabs)/projects')} />
      {recent.length === 0 ? (
        <Text variant="bodySmall" tone="muted">
          {tr('home.noRecent')}
        </Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: t.spacing(3) }}>
          {recent.map((p) => (
            <Pressable key={p.id} onPress={() => router.navigate('/(tabs)/projects')} accessibilityRole="button" accessibilityLabel={p.title} style={{ width: 120, gap: 4 }}>
              <View style={{ width: 120, height: 120, borderRadius: t.radius.md, backgroundColor: t.colors.surfaceAlt, overflow: 'hidden' }}>
                {p.outputUri ? <Image source={{ uri: p.outputUri }} resizeMethod="resize" style={{ flex: 1 }} /> : null}
              </View>
              <Text variant="caption" numberOfLines={1}>
                {tr(`projects.kinds.${p.kind}`)}
              </Text>
              <Text variant="caption" tone="muted" numberOfLines={1}>
                {fmt.day(new Date(p.updatedAt))}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <PremiumCard source="home" />
      <AdBanner />
    </Screen>
  );
}
