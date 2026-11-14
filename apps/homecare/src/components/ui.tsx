import { Badge, Icon, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { diffDays, type DayKey } from '@/domain/dates';
import type { DueStatus } from '@/domain/recurrence';
import type { Priority } from '@/domain/types';
import type { ExpiryStatus } from '@/domain/warranty';
import { fmt } from '@/i18n';

/* ----------------------------------------------------------------- Header */

export function ScreenHeader({ title, subtitle, right, back }: { title: string; subtitle?: string; right?: ReactNode; back?: boolean }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Row gap={2} style={{ flex: 1, alignItems: 'flex-start' }}>
        {back ? (
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))} accessibilityRole="button" accessibilityLabel={t('common.back')} hitSlop={10} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: -8 }}>
            <Icon name="arrow-back" size={24} color={theme.colors.text} />
          </Pressable>
        ) : null}
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="title" accessibilityRole="header" numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="bodySmall" tone="muted" numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </Row>
      {right ? <Row gap={1}>{right}</Row> : null}
    </Row>
  );
}

/* ----------------------------------------------------------------- Icon tile */

export function IconTile({ icon, tint, size = 40 }: { icon: IconName; tint?: string; size?: number }) {
  const theme = useTheme();
  const color = tint ?? theme.colors.primary;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 3.2, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.scheme === 'dark' ? `${color}33` : `${color}1A` }}>
      <Icon name={icon} size={size * 0.5} color={theme.scheme === 'dark' ? theme.colors.text : color} />
    </View>
  );
}

/* ----------------------------------------------------------------- Item row */

export function ItemRow({ icon, tint, title, subtitle, meta, right, onPress, testID, thumbnail }: { icon: IconName; tint?: string; title: string; subtitle?: string | null; meta?: ReactNode; right?: ReactNode; onPress?: () => void; testID?: string; thumbnail?: ReactNode }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={[title, subtitle].filter(Boolean).join(', ')}
      testID={testID}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: theme.radius.md, backgroundColor: pressed ? theme.colors.surfaceAlt : theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border })}
    >
      {thumbnail ?? <IconTile icon={icon} tint={tint} />}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="subheading" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodySmall" tone="muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        {meta}
      </View>
      {right ?? (onPress ? <Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} /> : null)}
    </Pressable>
  );
}

/* ----------------------------------------------------------------- Badges */

export function DueBadge({ status, date, today }: { status: DueStatus; date: DayKey | null; today: DayKey }) {
  const { t } = useTranslation();
  if (!date || status === 'none') return <Badge label={t('due.none')} tone="neutral" />;
  const d = diffDays(today, date);
  if (status === 'overdue') return <Badge label={t('due.overdue', { count: -d })} tone="danger" icon="alert-circle" />;
  if (status === 'today') return <Badge label={t('due.today')} tone="warning" icon="time" />;
  if (status === 'soon') return <Badge label={t('due.inDays', { count: d })} tone="warning" />;
  return <Badge label={fmt.day(date, 'medium')} tone="neutral" icon="calendar-outline" />;
}

export function ExpiryBadge({ status, date, today }: { status: ExpiryStatus; date: DayKey | null; today: DayKey }) {
  const { t } = useTranslation();
  if (!date || status === 'none') return null;
  const d = diffDays(today, date);
  if (status === 'expired') return <Badge label={t('expiry.expired')} tone="danger" icon="close-circle" />;
  if (status === 'expiring') return <Badge label={t('expiry.inDays', { count: d })} tone="warning" icon="hourglass-outline" />;
  return <Badge label={t('expiry.until', { date: fmt.day(date, 'medium') })} tone="success" icon="shield-checkmark-outline" />;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { t } = useTranslation();
  const tone = { low: 'neutral', medium: 'primary', high: 'warning', urgent: 'danger' } as const;
  return <Badge label={t(`priorities.${priority}`)} tone={tone[priority]} />;
}

/* ----------------------------------------------------------------- Search */

export function SearchBar({ value, onChangeText, placeholder }: { value: string; onChangeText: (v: string) => void; placeholder: string }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Row gap={2} style={{ minHeight: 46, borderRadius: theme.radius.pill, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 14 }}>
      <Icon name="search" size={18} color={theme.colors.textSubtle} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSubtle}
        accessibilityLabel={placeholder}
        returnKeyType="search"
        maxLength={80}
        style={{ flex: 1, color: theme.colors.text, fontSize: 16, paddingVertical: 8 }}
      />
      {value ? (
        <Pressable onPress={() => onChangeText('')} accessibilityRole="button" accessibilityLabel={t('common.clear')} hitSlop={10}>
          <Icon name="close-circle" size={18} color={theme.colors.textSubtle} />
        </Pressable>
      ) : null}
    </Row>
  );
}

/* ----------------------------------------------------------------- FAB */

/** Floating action button. `bottomInset` for stack screens (tab screens already sit above the tab bar). */
export function Fab({ label, onPress, icon = 'add', testID, bottomInset }: { label: string; onPress: () => void; icon?: IconName; testID?: string; bottomInset?: boolean }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      style={({ pressed }) => ({
        position: 'absolute',
        right: 20,
        bottom: 20 + (bottomInset ? insets.bottom : 0),
        minHeight: 56,
        paddingHorizontal: 20,
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: theme.colors.primary,
        opacity: pressed ? 0.9 : 1,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      })}
    >
      <Icon name={icon} size={22} color={theme.colors.onPrimary} />
      <Text variant="subheading" style={{ color: theme.colors.onPrimary }}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ----------------------------------------------------------------- Info lines */

export function InfoLine({ icon, label, value }: { icon: IconName; label: string; value: string | null | undefined }) {
  const theme = useTheme();
  if (!value) return null;
  return (
    <Row gap={3} style={{ alignItems: 'flex-start', paddingVertical: 4 }}>
      <Icon name={icon} size={18} color={theme.colors.textMuted} style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text variant="caption" tone="subtle">
          {label}
        </Text>
        <Text variant="body" selectable>
          {value}
        </Text>
      </View>
    </Row>
  );
}

export function Notice({ tone = 'primary', icon = 'information-circle-outline', children }: { tone?: 'primary' | 'warning' | 'danger' | 'success'; icon?: IconName; children: ReactNode }) {
  const theme = useTheme();
  const bg = { primary: theme.colors.primarySoft, warning: theme.colors.warningSoft, danger: theme.colors.dangerSoft, success: theme.colors.successSoft }[tone];
  const fg = { primary: theme.colors.primary, warning: theme.colors.warning, danger: theme.colors.danger, success: theme.colors.success }[tone];
  return (
    <Row gap={3} style={{ alignItems: 'flex-start', backgroundColor: bg, borderRadius: theme.radius.md, padding: 12 }}>
      <Icon name={icon} size={20} color={fg} />
      <View style={{ flex: 1 }}>{typeof children === 'string' ? <Text variant="bodySmall">{children}</Text> : children}</View>
    </Row>
  );
}

/* ----------------------------------------------------------------- Bar chart */

export interface Bar {
  key: string;
  label: string;
  value: number;
  display: string;
  highlight?: boolean;
}

/** Simple accessible bar chart (no native chart library needed). */
export function BarChart({ bars, height = 140, limit }: { bars: Bar[]; height?: number; limit?: number | null }) {
  const theme = useTheme();
  const max = Math.max(1, limit ?? 0, ...bars.map((b) => b.value));
  return (
    <Stack gap={2}>
      <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
        {limit ? <View style={{ position: 'absolute', left: 0, right: 0, bottom: (limit / max) * height, borderTopWidth: 1, borderStyle: 'dashed', borderColor: theme.colors.warning }} /> : null}
        {bars.map((b) => (
          <View key={b.key} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height }} accessible accessibilityLabel={`${b.label}: ${b.display}`}>
            <View
              style={{
                width: '70%',
                height: Math.max(b.value > 0 ? 4 : 0, (b.value / max) * height),
                borderTopLeftRadius: 6,
                borderTopRightRadius: 6,
                backgroundColor: b.highlight ? theme.colors.primary : theme.colors.primarySoft,
                borderWidth: b.highlight ? 0 : 1,
                borderColor: theme.colors.primary,
              }}
            />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {bars.map((b) => (
          <Text key={b.key} variant="caption" tone={b.highlight ? 'primary' : 'subtle'} center numberOfLines={1} style={{ flex: 1, textTransform: 'capitalize' }}>
            {b.label}
          </Text>
        ))}
      </View>
    </Stack>
  );
}

/** Horizontal share bars (spending by category). */
export function ShareBars({ items }: { items: { key: string; label: string; value: number; display: string; color: string }[] }) {
  const theme = useTheme();
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  return (
    <Stack gap={3}>
      {items.map((i) => (
        <View key={i.key} style={{ gap: 4 }} accessible accessibilityLabel={`${i.label}: ${i.display}`}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text variant="bodySmall">{i.label}</Text>
            <Text variant="bodySmall" tone="muted">
              {i.display}
            </Text>
          </Row>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: theme.colors.surfaceAlt, overflow: 'hidden' }}>
            <View style={{ width: `${Math.max(2, (i.value / total) * 100)}%`, height: 8, borderRadius: 4, backgroundColor: i.color }} />
          </View>
        </View>
      ))}
    </Stack>
  );
}
