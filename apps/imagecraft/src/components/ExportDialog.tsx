import { Badge, Button, Card, Icon, Row, Stack, Text, useTheme } from '@factory/design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Modal, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fmt } from '@/i18n';
import { recordError, track } from '@/services/analytics';
import { toErrorCode } from '@/services/files/errors';
import { mimeTypeOf } from '@/services/files/formats';
import { exportToFolder, saveToGallery, shareImage } from '@/services/share';
import type { RenderResult } from '@/types/image';
import { savedRatio } from '@/utils/estimate';

export type ExportedFile = RenderResult & { name: string };

/**
 * Result sheet shown after processing: what was produced (exact size, dimensions, format,
 * lossy/lossless) and how to get it out. No ad is ever shown on this sheet.
 */
export function ExportDialog({
  visible,
  files,
  inputBytes,
  tool,
  onDone,
  notice,
}: {
  visible: boolean;
  files: ExportedFile[];
  inputBytes: number | null;
  tool: string;
  onDone: () => void;
  notice?: string | null;
}) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const [message, setMessage] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const first = files[0];
  if (!first) return null;
  const outputBytes = files.reduce((n, f) => n + f.bytes, 0);
  const saved = inputBytes ? savedRatio(inputBytes, outputBytes) : null;

  const act = async (kind: 'gallery' | 'share' | 'folder') => {
    setBusy(kind);
    setMessage(null);
    try {
      if (kind === 'share') {
        const r = await shareImage(first.uri, mimeTypeOf(first.format), tr('export.shareTitle'));
        if (r === 'unavailable') setMessage({ tone: 'danger', text: tr('export.shareUnavailable') });
      } else if (kind === 'gallery') {
        for (const f of files) await saveToGallery(f.uri, f.name, mimeTypeOf(f.format));
        setMessage({ tone: 'success', text: tr('export.savedToGallery', { count: files.length }) });
      } else {
        const r = await exportToFolder(files.map((f) => ({ uri: f.uri, fileName: f.name, mimeType: mimeTypeOf(f.format) })));
        if (r) setMessage(r.failed ? { tone: 'danger', text: tr('export.folderPartial', { saved: r.saved, failed: r.failed }) } : { tone: 'success', text: tr('export.savedToFolder', { count: r.saved }) });
      }
      track('export_completed', { tool, format: first.format, destination: kind });
    } catch (e) {
      recordError(e, `export_${kind}`);
      setMessage({ tone: 'danger', text: tr(`errors.${toErrorCode(e)}`) });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onDone} transparent={false}>
      <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }} testID="export-dialog">
        <ScrollView contentContainerStyle={{ padding: t.spacing(5), gap: t.spacing(4) }}>
          <Row gap={2}>
            <Icon name="checkmark-circle" size={26} color={t.colors.success} />
            <Text variant="title" accessibilityRole="header">
              {tr('export.title')}
            </Text>
          </Row>
          <View style={{ height: 260, borderRadius: t.radius.lg, backgroundColor: t.colors.surfaceAlt, overflow: 'hidden' }}>
            <Image source={{ uri: first.uri }} resizeMode="contain" resizeMethod="resize" style={{ flex: 1 }} accessibilityLabel={tr('export.previewLabel')} />
          </View>
          <Card>
            <Text variant="subheading" numberOfLines={2}>
              {files.length > 1 ? tr('export.fileCount', { count: files.length }) : first.name}
            </Text>
            <Row gap={2} wrap>
              <Badge label={tr(`format.names.${first.format}`)} tone="primary" />
              <Badge label={first.lossless ? tr('export.lossless') : tr('export.lossy')} tone={first.lossless ? 'success' : 'neutral'} />
              {files.length === 1 ? <Badge label={fmt.dims(first.width, first.height)} tone="neutral" /> : null}
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text variant="bodySmall" tone="muted">
                {tr('export.finalSize')}
              </Text>
              <Text variant="subheading">{fmt.size(outputBytes)}</Text>
            </Row>
            {inputBytes ? (
              <Row style={{ justifyContent: 'space-between' }}>
                <Text variant="bodySmall" tone="muted">
                  {tr('export.originalSize')}
                </Text>
                <Text variant="bodySmall">{fmt.size(inputBytes)}</Text>
              </Row>
            ) : null}
            {saved !== null ? (
              <Text variant="bodySmall" tone={saved > 0 ? 'success' : 'warning'} testID="saved-percent">
                {saved > 0 ? tr('export.saved', { percent: fmt.percent(saved) }) : tr('export.larger', { percent: fmt.percent(-saved) })}
              </Text>
            ) : null}
          </Card>
          {notice ? (
            <Card tone="alt">
              <Text variant="bodySmall" tone="muted">
                {notice}
              </Text>
            </Card>
          ) : null}
          <Stack gap={2}>
            <Button label={tr('export.saveGallery')} icon="images-outline" onPress={() => act('gallery')} loading={busy === 'gallery'} disabled={busy !== null} testID="save-gallery" />
            {files.length === 1 ? <Button label={tr('export.share')} icon="share-social-outline" variant="secondary" onPress={() => act('share')} loading={busy === 'share'} disabled={busy !== null} testID="share" /> : null}
            <Button label={tr('export.saveFolder')} icon="folder-open-outline" variant="secondary" onPress={() => act('folder')} loading={busy === 'folder'} disabled={busy !== null} testID="save-folder" />
          </Stack>
          {message ? (
            <Text variant="bodySmall" tone={message.tone} accessibilityLiveRegion="polite">
              {message.text}
            </Text>
          ) : null}
          <Text variant="caption" tone="muted">
            {tr('export.keptPrivately')}
          </Text>
          <Button label={tr('common.done')} variant="ghost" onPress={onDone} testID="export-done" />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
