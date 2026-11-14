import { Badge, Card, EmptyState, FadeIn, ProgressBar, Row, Screen, SectionHeader, Stack, Stat, Text, useTheme, type IconName } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { AdBanner } from '@/components/media';
import { DueBadge, ExpiryBadge, IconTile, ItemRow, ScreenHeader } from '@/components/ui';
import { ASSET_ICONS, DOCUMENT_ICONS } from '@/config/icons';
import { repos } from '@/database';
import { expiryStatus } from '@/domain/warranty';
import { loadDashboard, type AgendaItem, type AlertKind } from '@/features/dashboard';
import { useData } from '@/hooks/useData';
import { useActiveHome, useToday } from '@/hooks/useHome';
import { fmt } from '@/i18n';

const ALERT_ICONS: Record<AlertKind, IconName> = {
  maintenance_overdue: 'construct',
  household_overdue: 'checkbox',
  warranty_expiring: 'shield-half',
  document_expiring: 'document-text',
  budget_exceeded: 'wallet',
  asset_out_of_service: 'warning',
};

const QUICK: { key: string; icon: IconName; route: string }[] = [
  { key: 'addTask', icon: 'add-circle-outline', route: '/maintenance/edit' },
  { key: 'addAsset', icon: 'cube-outline', route: '/assets/edit' },
  { key: 'addDocument', icon: 'document-attach-outline', route: '/documents/edit' },
  { key: 'addExpense', icon: 'wallet-outline', route: '/expenses/edit' },
  { key: 'addRepair', icon: 'hammer-outline', route: '/repairs/edit' },
  { key: 'addChore', icon: 'checkbox-outline', route: '/household/edit' },
];

function AgendaRow({ item, today }: { item: AgendaItem; today: string }) {
  const { t } = useTranslation();
  const icon: IconName = item.type === 'maintenance' ? 'construct-outline' : item.type === 'household' ? 'checkbox-outline' : 'hammer-outline';
  return (
    <ItemRow
      icon={icon}
      title={item.title}
      subtitle={t(`agenda.types.${item.type}`)}
      right={<DueBadge status={item.status} date={item.date} today={today} />}
      onPress={() => router.push(item.route as never)}
    />
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const theme = useTheme();
  const home = useActiveHome();
  const today = useToday();
  const { data } = useData(() => (home ? loadDashboard(repos(), home.id, today) : Promise.resolve(null)), [home?.id, today]);

  if (!home) {
    return (
      <Screen>
        <EmptyState icon="home-outline" title={t('dashboard.noHome')} />
      </Screen>
    );
  }

  const hour = new Date().getHours();
  const greeting = t(hour < 12 ? 'dashboard.morning' : hour < 18 ? 'dashboard.afternoon' : 'dashboard.evening');
  const agendaCount = data ? data.agenda.overdue.length + data.agenda.today.length + data.agenda.upcoming.length : 0;

  return (
    <Screen testID="dashboard">
      <ScreenHeader title={home.name} subtitle={greeting} right={<IconTile icon="notifications-outline" />} />

      {data?.alerts.length ? (
        <FadeIn>
          <Stack gap={2}>
            {data.alerts.map((a) => (
              <Pressable
                key={a.kind}
                onPress={() => router.push(a.route as never)}
                accessibilityRole="button"
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: theme.radius.md, backgroundColor: a.kind === 'budget_exceeded' || a.kind.endsWith('overdue') ? theme.colors.dangerSoft : theme.colors.warningSoft }}
              >
                <IconTile icon={ALERT_ICONS[a.kind]} tint={a.kind.endsWith('overdue') || a.kind === 'budget_exceeded' ? theme.colors.danger : theme.colors.warning} size={34} />
                <Text variant="bodySmall" style={{ flex: 1, fontWeight: '600' }}>
                  {t(`dashboard.alerts.${a.kind}`, { count: a.count })}
                </Text>
              </Pressable>
            ))}
          </Stack>
        </FadeIn>
      ) : data ? (
        <Card tone="primary">
          <Row gap={3}>
            <IconTile icon="checkmark-done" />
            <Text variant="bodySmall" style={{ flex: 1 }}>
              {t('dashboard.allGood')}
            </Text>
          </Row>
        </Card>
      ) : null}

      <Row gap={2}>
        <Stat icon="cube-outline" value={fmt.number(data?.counts.assets ?? 0)} label={t('dashboard.stats.assets')} />
        <Stat icon="list-outline" value={fmt.number(agendaCount)} label={t('dashboard.stats.toDo')} tone="warning" />
        <Stat icon="checkmark-circle-outline" value={fmt.number(data?.completedThisMonth ?? 0)} label={t('dashboard.stats.done')} tone="success" />
      </Row>

      <Card onPress={() => router.push('/expenses')} accessibilityLabel={t('dashboard.monthSpend')}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="label" tone="subtle">
            {t('dashboard.monthSpend')}
          </Text>
          <Text variant="caption" tone="primary">
            {t('common.seeAll')}
          </Text>
        </Row>
        <Text variant="title">{fmt.moneyList(data?.monthSpend ?? [], fmt.money({ amountMinor: 0, currency: home.currency }))}</Text>
        {data?.budget ? (
          <Stack gap={1}>
            <ProgressBar progress={data.budget.spentMinor / Math.max(1, data.budget.limitMinor)} tone={data.budget.spentMinor > data.budget.limitMinor ? 'accent' : 'primary'} label={t('expenses.budget')} />
            <Text variant="caption" tone="muted">
              {t('dashboard.budgetOf', { amount: fmt.money({ amountMinor: data.budget.limitMinor, currency: data.budget.currency }) })}
            </Text>
          </Stack>
        ) : null}
      </Card>

      <SectionHeader title={t('dashboard.agenda')} action={t('common.seeAll')} onAction={() => router.push('/(tabs)/maintenance')} />
      {data && agendaCount === 0 ? (
        <Text tone="muted" variant="bodySmall">
          {t('dashboard.agendaEmpty')}
        </Text>
      ) : null}
      {data?.agenda.overdue.length ? (
        <Stack gap={2}>
          <Badge label={t('dashboard.urgent')} tone="danger" />
          {data.agenda.overdue.slice(0, 5).map((i) => (
            <AgendaRow key={i.key} item={i} today={today} />
          ))}
        </Stack>
      ) : null}
      {data?.agenda.today.length ? (
        <Stack gap={2}>
          <Badge label={t('dashboard.today')} tone="warning" />
          {data.agenda.today.map((i) => (
            <AgendaRow key={i.key} item={i} today={today} />
          ))}
        </Stack>
      ) : null}
      {data?.agenda.upcoming.length ? (
        <Stack gap={2}>
          <Badge label={t('dashboard.next')} tone="primary" />
          {data.agenda.upcoming.slice(0, 5).map((i) => (
            <AgendaRow key={i.key} item={i} today={today} />
          ))}
        </Stack>
      ) : null}

      <SectionHeader title={t('dashboard.quick')} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {QUICK.map((q) => (
          <Pressable
            key={q.key}
            onPress={() => router.push(q.route as never)}
            accessibilityRole="button"
            accessibilityLabel={t(`dashboard.quickActions.${q.key}`)}
            style={({ pressed }) => ({ width: '31%', flexGrow: 1, alignItems: 'center', gap: 6, paddingVertical: 14, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: pressed ? theme.colors.surfaceAlt : theme.colors.surface })}
          >
            <IconTile icon={q.icon} size={36} />
            <Text variant="caption" center numberOfLines={2}>
              {t(`dashboard.quickActions.${q.key}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      {data?.warranties.length ? (
        <>
          <SectionHeader title={t('dashboard.warranties')} action={t('common.seeAll')} onAction={() => router.push('/assets?warranty=1')} />
          <Stack gap={2}>
            {data.warranties.slice(0, 3).map((a) => (
              <ItemRow key={a.id} icon={ASSET_ICONS[a.category]} title={a.name} subtitle={[a.brand, a.model].filter(Boolean).join(' ')} right={<ExpiryBadge status={expiryStatus(a.warrantyEnd, today)} date={a.warrantyEnd} today={today} />} onPress={() => router.push(`/assets/${a.id}`)} />
            ))}
          </Stack>
        </>
      ) : null}

      {data?.expiringDocuments.length ? (
        <>
          <SectionHeader title={t('dashboard.documents')} action={t('common.seeAll')} onAction={() => router.push('/(tabs)/documents?expiring=1')} />
          <Stack gap={2}>
            {data.expiringDocuments.slice(0, 3).map((d) => (
              <ItemRow key={d.id} icon={DOCUMENT_ICONS[d.type]} title={d.title} subtitle={t(`documentTypes.${d.type}`)} right={<ExpiryBadge status={expiryStatus(d.expiryDate, today)} date={d.expiryDate} today={today} />} onPress={() => router.push(`/documents/${d.id}`)} />
            ))}
          </Stack>
        </>
      ) : null}

      <SectionHeader title={t('dashboard.overview')} />
      <Row gap={2}>
        <Stat icon="grid-outline" value={fmt.number(data?.counts.rooms ?? 0)} label={t('dashboard.stats.rooms')} />
        <Stat icon="folder-outline" value={fmt.number(data?.counts.documents ?? 0)} label={t('dashboard.stats.documents')} />
        <Stat icon="hammer-outline" value={fmt.number(data?.counts.openRepairs ?? 0)} label={t('dashboard.stats.repairs')} tone="accent" />
      </Row>

      <AdBanner />
    </Screen>
  );
}
