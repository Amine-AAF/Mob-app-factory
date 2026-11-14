import { Card, Divider, EmptyState, Icon, IconButton, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { AdBanner, PremiumCard, QuotaCard } from '@/components/monetization';
import { matchesTool, TOOLS, type ToolDefinition } from '@/config/tools';
import { repos } from '@/database';
import type { FileOperation } from '@/database/repositories/operationsRepository';
import { OperationRow } from '@/features/file-history/OperationRow';
import { fmt } from '@/i18n';
import { recordError, track } from '@/services/analytics';
import { useSession } from '@/store/session';

function ToolTile({ tool }: { tool: ToolDefinition }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Card
      onPress={() => {
        track('tool_opened', { tool: tool.id });
        router.push(tool.href);
      }}
      accessibilityLabel={`${t(`tools.${tool.id}.title`)}. ${t(`tools.${tool.id}.subtitle`)}`}
      style={{ flexBasis: '47%', flexGrow: 1, minHeight: 128 }}
      testID={`tool-${tool.id}`}
    >
      <View style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: tool.group === 'pdf' ? theme.colors.accentSoft : theme.colors.primarySoft }}>
        <Icon name={tool.icon} size={22} color={tool.group === 'pdf' ? theme.colors.accent : theme.colors.primary} />
      </View>
      <Text variant="subheading">{t(`tools.${tool.id}.title`)}</Text>
      <Text variant="caption" tone="muted">
        {t(`tools.${tool.id}.subtitle`)}
      </Text>
    </Card>
  );
}

export default function DashboardScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const dataVersion = useSession((s) => s.dataVersion);
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<FileOperation[]>([]);
  const [saved, setSaved] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([repos().operations.list({ limit: 3 }), repos().operations.bytesSaved()])
        .then(([ops, bytes]) => {
          if (!active) return;
          setRecent(ops);
          setSaved(bytes);
        })
        .catch((e) => recordError(e, 'dashboard_load'));
      return () => {
        active = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when data changes
    }, [dataVersion]),
  );

  const visible = useMemo(
    () => TOOLS.filter((tool) => matchesTool(query, [t(`tools.${tool.id}.title`), t(`tools.${tool.id}.subtitle`), t(`tools.${tool.id}.keywords`)])),
    [query, t],
  );
  const groups = (['images', 'pdf'] as const).map((g) => ({ group: g, tools: visible.filter((tool) => tool.group === g) })).filter((g) => g.tools.length);

  return (
    <Screen testID="dashboard">
      <Row style={{ justifyContent: 'space-between' }}>
        <Stack gap={0} style={{ flex: 1 }}>
          <Text variant="title" accessibilityRole="header">
            {t('dashboard.welcome')}
          </Text>
          <Text variant="bodySmall" tone="muted">
            {t('dashboard.tagline')}
          </Text>
        </Stack>
        <IconButton icon="settings-outline" label={t('tabs.settings')} onPress={() => router.push('/(tabs)/settings')} />
      </Row>

      <Row gap={2} style={{ minHeight: 48, paddingHorizontal: 12, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}>
        <Icon name="search" size={18} color={theme.colors.textSubtle} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('dashboard.search')}
          placeholderTextColor={theme.colors.textSubtle}
          accessibilityLabel={t('dashboard.search')}
          style={{ flex: 1, color: theme.colors.text, fontSize: 16, minHeight: 46 }}
          returnKeyType="search"
          testID="tool-search"
        />
        {query ? <IconButton icon="close-circle" size={18} label={t('common.clear')} onPress={() => setQuery('')} /> : null}
      </Row>

      <Row gap={2}>
        <Icon name="shield-checkmark" size={16} color={theme.colors.success} />
        <Text variant="caption" tone="muted" style={{ flex: 1 }}>
          {t('dashboard.privacyLine')}
        </Text>
      </Row>

      {groups.length === 0 ? <EmptyState icon="search" title={t('dashboard.noTools')} message={t('dashboard.noToolsHint')} /> : null}
      {groups.map(({ group, tools }) => (
        <Stack key={group} gap={3}>
          <SectionHeader title={t(`dashboard.group.${group}`)} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {tools.map((tool) => (
              <ToolTile key={tool.id} tool={tool} />
            ))}
          </View>
        </Stack>
      ))}

      <QuotaCard compact />
      <PremiumCard />

      <SectionHeader title={t('dashboard.recent')} action={recent.length ? t('dashboard.seeAll') : undefined} onAction={() => router.push('/(tabs)/history')} />
      {recent.length === 0 ? (
        <Text variant="bodySmall" tone="muted">
          {t('dashboard.noRecent')}
        </Text>
      ) : (
        <Card style={{ paddingVertical: 4 }}>
          {recent.map((op, i) => (
            <View key={op.id}>
              {i > 0 ? <Divider /> : null}
              <OperationRow op={op} />
            </View>
          ))}
        </Card>
      )}
      {saved > 0 ? (
        <Row gap={2}>
          <Icon name="trending-down" size={16} color={theme.colors.success} />
          <Text variant="caption" tone="muted">
            {t('dashboard.saved', { size: fmt.size(saved) })}
          </Text>
        </Row>
      ) : null}
      <AdBanner />
    </Screen>
  );
}
