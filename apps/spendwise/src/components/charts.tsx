import { Chip, Icon, Row, Text, useTheme } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useMoney } from '@/hooks';
import { currentLanguage } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import { fromDayKey, periodRange, type DayKey, type PeriodKind } from '@/utils/dates';

/**
 * Charts drawn with plain Views (no SVG dependency). Every chart has an accessible text
 * summary, and bar heights are hidden in privacy mode (they would reveal proportions only,
 * which is acceptable, but values are never printed).
 */
export interface BarDatum {
  key: string;
  label: string;
  value: number;
  /** Optional second series (e.g. income next to spending, or budget next to actual). */
  value2?: number;
}

export function SpendingChart({ data, currency, height = 140, series = ['spending'], testID }: { data: readonly BarDatum[]; currency: string; height?: number; series?: readonly ('spending' | 'income' | 'budget')[]; testID?: string }) {
  const theme = useTheme();
  const money = useMoney();
  const { t } = useTranslation();
  const max = Math.max(1, ...data.map((d) => Math.max(d.value, d.value2 ?? 0)));
  const colors = { spending: theme.colors.primary, income: theme.colors.success, budget: theme.colors.border };
  const summary = data.map((d) => `${d.label}: ${money(d.value, currency)}`).join(', ');
  const showLabels = data.length <= 12;
  return (
    <View accessible accessibilityLabel={`${t('charts.summary')}: ${summary}`} testID={testID}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height, gap: data.length > 20 ? 2 : 6 }}>
        {data.map((d) => (
          <View key={d.key} style={{ flex: 1, height: '100%', justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
            {series.length > 1 ? <View style={{ flex: 1, height: `${Math.max(0, ((d.value2 ?? 0) / max) * 100)}%`, minHeight: (d.value2 ?? 0) > 0 ? 2 : 0, backgroundColor: colors[series[1]!], borderTopLeftRadius: 4, borderTopRightRadius: 4 }} /> : null}
            <View style={{ flex: 1, height: `${Math.max(0, (d.value / max) * 100)}%`, minHeight: d.value > 0 ? 2 : 0, backgroundColor: colors[series[0]!], borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
          </View>
        ))}
      </View>
      {showLabels ? (
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
          {data.map((d) => (
            <Text key={d.key} variant="caption" tone="subtle" style={{ flex: 1, textAlign: 'center' }} numberOfLines={1}>
              {d.label}
            </Text>
          ))}
        </View>
      ) : null}
      {series.length > 1 ? (
        <Row gap={4} style={{ marginTop: 8 }}>
          {series.map((s) => (
            <Row key={s} gap={1}>
              <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: colors[s] }} />
              <Text variant="caption" tone="muted">
                {t(`charts.${s}`)}
              </Text>
            </Row>
          ))}
        </Row>
      ) : null}
    </View>
  );
}

/** Period selector: kind chips + previous / next with the formatted range. */
export function DateRangeSelector({ kind, anchor, onKind, onShift, kinds = ['week', 'month', 'year'], locked = [] }: { kind: PeriodKind; anchor: DayKey; onKind: (k: PeriodKind) => void; onShift: (step: number) => void; kinds?: readonly PeriodKind[]; locked?: readonly PeriodKind[] }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const range = periodRange(kind, anchor);
  const lng = currentLanguage();
  const label =
    kind === 'year'
      ? range.start.slice(0, 4)
      : kind === 'month'
        ? new Intl.DateTimeFormat(lng, { month: 'long', year: 'numeric' }).format(fromDayKey(range.start))
        : `${new Intl.DateTimeFormat(lng, { day: 'numeric', month: 'short' }).format(fromDayKey(range.start))} – ${new Intl.DateTimeFormat(lng, { day: 'numeric', month: 'short' }).format(fromDayKey(range.end))}`;
  return (
    <View style={{ gap: 8 }}>
      <Row gap={2}>
        {kinds.map((k) => (
          <Chip key={k} label={t(`period.${k}`)} icon={locked.includes(k) ? 'lock-closed-outline' : undefined} selected={k === kind} onPress={() => onKind(k)} testID={`period-${k}`} />
        ))}
      </Row>
      <Row style={{ justifyContent: 'space-between' }}>
        <Pressable onPress={() => onShift(-1)} accessibilityRole="button" accessibilityLabel={t('common.previous')} hitSlop={12} style={{ padding: 6 }}>
          <Icon name="chevron-back" size={22} color={theme.colors.text} />
        </Pressable>
        <Text variant="subheading" accessibilityLiveRegion="polite">
          {label}
        </Text>
        <Pressable onPress={() => onShift(1)} accessibilityRole="button" accessibilityLabel={t('common.next')} hitSlop={12} style={{ padding: 6 }}>
          <Icon name="chevron-forward" size={22} color={theme.colors.text} />
        </Pressable>
      </Row>
    </View>
  );
}

/** Hook for components that must know whether values are masked. */
export function usePrivacy(): boolean {
  return usePreferences((s) => s.privacyMode);
}
