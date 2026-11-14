import { Button, Card, Icon, IconButton, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';

import type { SelectionIssue } from '@/hooks/useSelection';
import { currentLanguage, fmt } from '@/i18n';
import { formatDimensions } from '@/utils/format';

/** Empty selection state: one clear action, plus what is accepted. */
export function PickArea({ icon, title, hint, actionLabel, onPick, loading, testID }: { icon: IconName; title: string; hint: string; actionLabel: string; onPick: () => void; loading?: boolean; testID?: string }) {
  const t = useTheme();
  return (
    <View
      style={{ alignItems: 'center', gap: 12, paddingVertical: 28, paddingHorizontal: 16, borderRadius: t.radius.lg, borderWidth: 1.5, borderStyle: 'dashed', borderColor: t.colors.border, backgroundColor: t.colors.surface }}
      testID={testID}
    >
      <View style={{ width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.primarySoft }}>
        <Icon name={icon} size={30} color={t.colors.primary} />
      </View>
      <Text variant="heading" center>
        {title}
      </Text>
      <Text variant="bodySmall" tone="muted" center>
        {hint}
      </Text>
      <Button label={actionLabel} icon="folder-open-outline" onPress={onPick} loading={loading} testID={testID ? `${testID}-button` : undefined} />
    </View>
  );
}

export interface FileRowModel {
  key: string;
  name: string;
  size: number;
  thumbnailUri?: string;
  width?: number;
  height?: number;
  pageCount?: number;
}

/** Selected file with metadata; optional reorder/remove controls (buttons, no drag: accessible). */
export function FileRow({ file, index, count, onRemove, onMove }: { file: FileRowModel; index: number; count: number; onRemove?: () => void; onMove?: (delta: -1 | 1) => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const meta = [
    fmt.size(file.size),
    file.width && file.height ? formatDimensions(file.width, file.height, currentLanguage()) : null,
    file.pageCount ? t('common.pages', { count: file.pageCount }) : null,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10 }}>
      {file.thumbnailUri ? (
        <Image source={{ uri: file.thumbnailUri }} resizeMethod="resize" resizeMode="cover" style={{ width: 52, height: 52, borderRadius: 10, backgroundColor: theme.colors.surfaceAlt }} accessibilityIgnoresInvertColors />
      ) : (
        <View style={{ width: 52, height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.dangerSoft }}>
          <Icon name="document-text" size={24} color={theme.colors.danger} />
        </View>
      )}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodySmall" style={{ fontWeight: '700' }} numberOfLines={1} ellipsizeMode="middle">
          {count > 1 ? `${index + 1}. ` : ''}
          {file.name}
        </Text>
        <Text variant="caption" tone="muted">
          {meta}
        </Text>
      </View>
      {onMove && count > 1 ? (
        <Row gap={0}>
          <IconButton icon="arrow-up" size={18} label={t('common.moveUp', { name: file.name })} onPress={() => onMove(-1)} />
          <IconButton icon="arrow-down" size={18} label={t('common.moveDown', { name: file.name })} onPress={() => onMove(1)} />
        </Row>
      ) : null}
      {onRemove ? <IconButton icon="close" size={18} label={t('common.removeFile', { name: file.name })} onPress={onRemove} /> : null}
    </Card>
  );
}

export function SelectionIssues({ issues, onDismiss }: { issues: SelectionIssue[]; onDismiss: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  if (!issues.length) return null;
  return (
    <Card tone="alt" testID="selection-issues">
      <Row style={{ justifyContent: 'space-between' }}>
        <Row gap={2}>
          <Icon name="alert-circle" size={18} color={theme.colors.danger} />
          <Text variant="subheading">{t('selection.rejected', { count: issues.length })}</Text>
        </Row>
        <IconButton icon="close" size={18} label={t('common.dismiss')} onPress={onDismiss} />
      </Row>
      <Stack gap={1}>
        {issues.map((issue, i) => (
          <Text key={`${issue.name}-${i}`} variant="bodySmall" tone="muted">
            {issue.name ? `${issue.name}: ` : ''}
            {t(`errors.${issue.code}`)}
          </Text>
        ))}
      </Stack>
    </Card>
  );
}
