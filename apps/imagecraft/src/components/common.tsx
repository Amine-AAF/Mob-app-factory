import { Button, Card, Icon, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { fmt } from '@/i18n';
import type { ProcessingErrorCode } from '@/services/files/errors';
import type { SourceImage } from '@/types/image';

/** Localized error with its recovery hint. Never shows file names or paths. */
export function ErrorNotice({ code, onRetry }: { code: ProcessingErrorCode; onRetry?: () => void }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  return (
    <Card style={{ backgroundColor: t.colors.dangerSoft, borderColor: 'transparent' }} testID={`error-${code}`}>
      <Row gap={2} style={{ alignItems: 'flex-start' }}>
        <Icon name="alert-circle-outline" size={20} color={t.colors.danger} />
        <Text variant="bodySmall" style={{ flex: 1, color: t.colors.danger }} accessibilityLiveRegion="assertive">
          {tr(`errors.${code}`)}
        </Text>
      </Row>
      {onRetry ? <Button label={tr('common.retry')} variant="secondary" size="md" onPress={onRetry} /> : null}
    </Card>
  );
}

/** Big one-tap import action (Home). */
export function ImportHero({ onPress, busy }: { onPress: () => void; busy: boolean }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={tr('home.import')}
      accessibilityHint={tr('home.importHint')}
      testID="import-hero"
      style={({ pressed }) => ({
        borderRadius: t.radius.xl,
        padding: t.spacing(6),
        backgroundColor: t.colors.primary,
        opacity: pressed || busy ? 0.85 : 1,
        gap: t.spacing(3),
      })}
    >
      <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="images" size={28} color={t.colors.onPrimary} />
      </View>
      <Text variant="title" tone="onPrimary">
        {busy ? tr('home.importing') : tr('home.import')}
      </Text>
      <Text variant="bodySmall" tone="onPrimary" style={{ opacity: 0.9 }}>
        {tr('home.importSubtitle')}
      </Text>
    </Pressable>
  );
}

/** Compact description of an imported picture. */
export function SourceSummary({ source, action }: { source: SourceImage; action?: ReactNode }) {
  const { t } = useTranslation();
  return (
    <Row style={{ justifyContent: 'space-between' }} testID="source-summary">
      <Stack gap={0} style={{ flex: 1 }}>
        <Text variant="bodySmall" style={{ fontWeight: '700' }} numberOfLines={1}>
          {source.name}
        </Text>
        <Text variant="caption" tone="muted">
          {t('source.summary', { dims: fmt.dims(source.width, source.height), size: fmt.size(source.bytes), format: t(`format.names.${source.format}`) })}
        </Text>
      </Stack>
      {action}
    </Row>
  );
}

/** Tool tile used on Home and in the Tools tab. */
export function ToolTile({ icon, title, subtitle, onPress, premium, testID, wide }: { icon: IconName; title: string; subtitle?: string; onPress: () => void; premium?: boolean; testID?: string; wide?: boolean }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={premium ? `${title}, ${tr('premium.badge')}` : title}
      testID={testID}
      style={({ pressed }) => ({
        flexBasis: wide ? '100%' : '47%',
        flexGrow: 1,
        minHeight: 96,
        padding: t.spacing(4),
        gap: t.spacing(2),
        borderRadius: t.radius.lg,
        borderWidth: 1,
        borderColor: t.colors.border,
        backgroundColor: pressed ? t.colors.surfaceAlt : t.colors.surface,
      })}
    >
      <Row style={{ justifyContent: 'space-between' }}>
        <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.primarySoft }}>
          <Icon name={icon} size={20} color={t.colors.primary} />
        </View>
        {premium ? <Icon name="diamond" size={14} color={t.colors.accent} /> : null}
      </Row>
      <Text variant="subheading">{title}</Text>
      {subtitle ? (
        <Text variant="caption" tone="muted" numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}

/** Notice shown when the native renderer is missing (Expo Go): never silently drop features. */
export function NativeRequiredNotice() {
  const { t } = useTranslation();
  return (
    <Card tone="alt" testID="native-required">
      <Text variant="bodySmall" tone="muted">
        {t('errors.native_unavailable')}
      </Text>
    </Card>
  );
}
