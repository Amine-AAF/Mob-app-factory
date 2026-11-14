import { Badge, Button, Card, Icon, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import type { TFunction } from 'i18next';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Pressable, View } from 'react-native';

import { eventType, THEME_COLORS } from '@/content/eventTypes';
import type { PremiumFeature } from '@/config/limits';
import { daysUntil } from '@/domain/events';
import type { EventRecord, EventStatus, RsvpStatus, TaskStatus, VendorStatus } from '@/domain/types';
import { fmt } from '@/i18n';
import { adsSdk, adUnits, bannerAllowed, onAdsStateChange } from '@/services/ads';
import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

/** Sets the native header title (and optional right-side actions) of a stack screen. */
export function ScreenTitle({ title, right }: { title: string; right?: ReactNode }) {
  return <RouterStack.Screen options={{ title, headerRight: right ? () => <Row gap={1}>{right}</Row> : undefined }} />;
}

type Tone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral';

const EVENT_STATUS_TONE: Record<EventStatus, Tone> = { draft: 'neutral', planning: 'primary', confirmed: 'success', in_progress: 'accent', completed: 'neutral', cancelled: 'danger' };
const RSVP_TONE: Record<RsvpStatus, Tone> = { not_invited: 'neutral', invited: 'primary', confirmed: 'success', declined: 'danger', maybe: 'warning', no_response: 'warning' };
const TASK_TONE: Record<TaskStatus, Tone> = { todo: 'neutral', in_progress: 'primary', completed: 'success', cancelled: 'danger' };
const VENDOR_TONE: Record<VendorStatus, Tone> = { to_contact: 'neutral', contacted: 'primary', quoted: 'accent', selected: 'warning', contracted: 'success', cancelled: 'danger' };

export function StatusBadge({ kind, status }: { kind: 'event' | 'rsvp' | 'task' | 'vendor'; status: string }) {
  const { t } = useTranslation();
  const map = { event: EVENT_STATUS_TONE, rsvp: RSVP_TONE, task: TASK_TONE, vendor: VENDOR_TONE }[kind] as Record<string, Tone>;
  const prefix = { event: 'eventStatus', rsvp: 'rsvp', task: 'taskStatus', vendor: 'vendorStatus' }[kind];
  return <Badge label={t(`${prefix}.${status}`)} tone={map[status] ?? 'neutral'} />;
}

/** Cover: the user's photo, or a themed panel with the event-type icon. */
export function EventCover({ event, height = 120, rounded = true }: { event: Pick<EventRecord, 'coverUri' | 'theme' | 'typeId'>; height?: number; rounded?: boolean }) {
  const t = useTheme();
  const palette = THEME_COLORS[event.theme];
  const [failed, setFailed] = useState(false);
  const radius = rounded ? t.radius.lg : 0;
  if (event.coverUri && !failed) {
    return <Image source={{ uri: event.coverUri }} onError={() => setFailed(true)} style={{ height, borderRadius: radius, width: '100%' }} accessibilityIgnoresInvertColors resizeMode="cover" />;
  }
  return (
    <View style={{ height, borderRadius: radius, backgroundColor: palette.primary, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }} accessible={false}>
      <View style={{ position: 'absolute', width: height * 1.6, height: height * 1.6, borderRadius: height, backgroundColor: palette.accent, opacity: 0.35, right: -height * 0.6, top: -height * 0.7 }} />
      <View style={{ position: 'absolute', width: height, height: height, borderRadius: height, backgroundColor: '#FFFFFF', opacity: 0.08, left: -height * 0.3, bottom: -height * 0.5 }} />
      <Icon name={eventType(event.typeId).icon} size={Math.min(48, height * 0.4)} color="#FFFFFF" />
    </View>
  );
}

export function EventCard({ event, subtitle, onPress, testID }: { event: EventRecord; subtitle?: string; onPress: () => void; testID?: string }) {
  const { t } = useTranslation();
  const d = daysUntil(event, clock.now());
  const when = d > 0 ? t('event.inDays', { count: d }) : d === 0 ? t('event.today') : t('event.daysAgo', { count: -d });
  return (
    <Card onPress={onPress} accessibilityLabel={`${event.name}, ${fmt.day(event.startDate, 'long')}`} testID={testID} style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
      <EventCover event={event} height={96} rounded={false} />
      <Stack gap={1} style={{ padding: 14 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="subheading" numberOfLines={1} style={{ flex: 1 }}>
            {event.name}
          </Text>
          <StatusBadge kind="event" status={event.status} />
        </Row>
        <Text variant="bodySmall" tone="muted">
          {`${fmt.day(event.startDate, 'medium')} · ${when}`}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="subtle">
            {subtitle}
          </Text>
        ) : null}
      </Stack>
    </Card>
  );
}

export function Kpi({ value, label, icon, tone = 'primary', onPress }: { value: string; label: string; icon: IconName; tone?: 'primary' | 'accent' | 'warning' | 'success' | 'danger'; onPress?: () => void }) {
  const t = useTheme();
  const color = { primary: t.colors.primary, accent: t.colors.accent, warning: t.colors.warning, success: t.colors.success, danger: t.colors.danger }[tone];
  const body = (
    <View style={{ gap: 4, padding: 12, borderRadius: t.radius.md, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border, minHeight: 92 }}>
      <Icon name={icon} size={18} color={color} />
      <Text variant="heading" numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text variant="caption" tone="muted" numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
  return (
    <View style={{ flexBasis: '47%', flexGrow: 1 }}>
      {onPress ? (
        <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}: ${value}`}>
          {body}
        </Pressable>
      ) : (
        <View accessible accessibilityLabel={`${label}: ${value}`}>
          {body}
        </View>
      )}
    </View>
  );
}

export function KpiGrid({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{children}</View>;
}

/** Horizontal bars (budget by category, RSVP split). Values are pre-formatted. */
export function Bars({ rows }: { rows: { label: string; value: number; display: string; max?: number; tone?: 'primary' | 'accent' | 'danger' | 'success' }[] }) {
  const t = useTheme();
  const max = Math.max(1, ...rows.map((r) => r.max ?? r.value));
  return (
    <Stack gap={2}>
      {rows.map((r) => {
        const color = { primary: t.colors.primary, accent: t.colors.accent, danger: t.colors.danger, success: t.colors.success }[r.tone ?? 'primary'];
        return (
          <View key={r.label} accessible accessibilityLabel={`${r.label}: ${r.display}`}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text variant="bodySmall">{r.label}</Text>
              <Text variant="bodySmall" tone="muted">
                {r.display}
              </Text>
            </Row>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: t.colors.surfaceAlt, marginTop: 4, overflow: 'hidden' }}>
              <View style={{ width: `${Math.min(100, (r.value / max) * 100)}%`, height: 8, borderRadius: 4, backgroundColor: color }} />
            </View>
          </View>
        );
      })}
    </Stack>
  );
}

/** Vertical mini chart (spending evolution). */
export function ColumnChart({ points }: { points: { label: string; value: number; display: string }[] }) {
  const t = useTheme();
  const max = Math.max(1, ...points.map((p) => p.value));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 120 }} accessible accessibilityLabel={points.map((p) => `${p.label} ${p.display}`).join(', ')}>
      {points.map((p) => (
        <View key={p.label} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <View style={{ width: '70%', height: Math.max(3, (p.value / max) * 90), backgroundColor: t.colors.primary, borderRadius: 4 }} />
          <Text variant="caption" tone="subtle" numberOfLines={1}>
            {p.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function PremiumCard({ feature, source, compact }: { feature: PremiumFeature; source: string; compact?: boolean }) {
  const { t } = useTranslation();
  return (
    <Card tone="accent">
      <Row gap={2}>
        <Icon name="diamond" size={18} color={useTheme().colors.accent} />
        <Text variant="subheading" style={{ flex: 1 }}>
          {t(`premium.features.${feature}.title`)}
        </Text>
      </Row>
      {!compact ? (
        <Text variant="bodySmall" tone="muted">
          {t(`premium.features.${feature}.body`)}
        </Text>
      ) : null}
      <Button size="md" variant="accent" label={t('premium.cta')} onPress={() => openPaywall(source)} />
    </Card>
  );
}

export function openPaywall(source: string) {
  router.push({ pathname: '/paywall', params: { source } });
}

/** Shows the upsell alert when a free limit is hit. */
export function limitAlert(t: TFunction, feature: PremiumFeature, limit: number, source: string) {
  Alert.alert(t(`premium.features.${feature}.title`), t(`premium.limitReached.${feature}`, { limit }), [
    { text: t('common.notNow'), style: 'cancel' },
    { text: t('premium.cta'), onPress: () => openPaywall(source) },
  ]);
}

export function confirmDelete(t: TFunction, what: string, onConfirm: () => void, body?: string) {
  Alert.alert(t('common.deleteTitle', { what }), body ?? t('common.deleteBody'), [
    { text: t('common.cancel'), style: 'cancel' },
    { text: t('common.delete'), style: 'destructive', onPress: onConfirm },
  ]);
}

/** Floating action button. */
export function Fab({ icon = 'add', label, onPress, testID }: { icon?: IconName; label: string; onPress: () => void; testID?: string }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      style={({ pressed }) => ({ position: 'absolute', right: 20, bottom: 24, height: 56, paddingHorizontal: 20, borderRadius: 28, backgroundColor: t.colors.primary, flexDirection: 'row', alignItems: 'center', gap: 8, opacity: pressed ? 0.85 : 1, elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } })}
    >
      <Icon name={icon} size={22} color={t.colors.onPrimary} />
      <Text variant="subheading" style={{ color: t.colors.onPrimary }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Small notice box (privacy warning, overlap warning…). */
export function Notice({ icon = 'information-circle', tone = 'primary', title, children }: { icon?: IconName; tone?: 'primary' | 'warning' | 'danger' | 'success'; title?: string; children?: ReactNode }) {
  const t = useTheme();
  const [bg, fg] = {
    primary: [t.colors.primarySoft, t.colors.primary],
    warning: [t.colors.warningSoft, t.colors.warning],
    danger: [t.colors.dangerSoft, t.colors.danger],
    success: [t.colors.successSoft, t.colors.success],
  }[tone];
  return (
    <View style={{ flexDirection: 'row', gap: 10, padding: 12, borderRadius: t.radius.md, backgroundColor: bg }} accessibilityRole="summary">
      <Icon name={icon} size={20} color={fg} />
      <View style={{ flex: 1, gap: 2 }}>
        {title ? (
          <Text variant="subheading" style={{ color: fg }}>
            {title}
          </Text>
        ) : null}
        {typeof children === 'string' ? <Text variant="bodySmall">{children}</Text> : children}
      </View>
    </View>
  );
}

/**
 * Anchored adaptive banner, clearly labelled. Rendered ONLY on browse screens
 * (Home, My Events, Settings, Templates): never on guest management,
 * invitations or the seating plan.
 */
export function AdBanner() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const sessionCount = usePreferences((s) => s.sessionCount);
  const [, force] = useState(0);
  const [failed, setFailed] = useState(false);
  useEffect(() => onAdsStateChange(() => force((n) => n + 1)), []);
  const sdk = adsSdk();
  if (!sdk || failed || !adUnits.banner || !bannerAllowed({ isPremium, sessionCount, screenAllowsAds: true })) return null;
  const { BannerAd, BannerAdSize } = sdk;
  return (
    <View style={{ alignItems: 'center', paddingTop: 6, borderTopWidth: 1, borderTopColor: theme.colors.border, marginTop: 12 }}>
      <Text variant="caption" tone="subtle" style={{ marginBottom: 4 }}>
        {t('ads.label')}
      </Text>
      <BannerAd unitId={adUnits.banner} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} onAdFailedToLoad={() => setFailed(true)} requestOptions={{ requestNonPersonalizedAdsOnly: false }} />
    </View>
  );
}
