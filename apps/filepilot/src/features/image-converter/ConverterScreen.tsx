import { Button, Card, Row, Stack, Text } from '@factory/design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Notice, QualitySlider, SegmentedControl } from '@/components/controls';
import { FileRow, PickArea, SelectionIssues } from '@/components/files';
import { ToolScaffold } from '@/components/ToolScaffold';
import { useOperation } from '@/hooks/useOperation';
import { useImageSelection } from '@/hooks/useSelection';
import { track } from '@/services/analytics';
import { processingEnv } from '@/services/env';
import { IMAGE_FORMATS, type ImageFormat } from '@/services/files/formats';
import { convertSpec } from '@/services/operations/tools';
import { useSession } from '@/store/session';

const LABEL: Record<ImageFormat, string> = { jpeg: 'JPEG', png: 'PNG', webp: 'WebP' };

export default function ConverterScreen() {
  const { t } = useTranslation();
  const defaults = useSession((s) => s.preferences);
  const selection = useImageSelection('convert', false, 1);
  const op = useOperation();
  const source = selection.items[0];
  const [target, setTarget] = useState<ImageFormat>(defaults.defaultOutputFormat === 'jpeg' ? 'png' : 'jpeg');
  const [quality, setQuality] = useState(90);
  const from = source?.header.format;
  const same = from === target;
  const lossy = target !== 'png';

  const start = async () => {
    if (!source || same) return;
    await op.run(convertSpec(processingEnv(), source, { format: target, quality: lossy ? quality / 100 : 1 }), {
      originalPreviewUri: source.uri,
      originalWidth: source.header.displayWidth,
      originalHeight: source.header.displayHeight,
    }, () => track('conversion_completed', { from: source.header.format, to: target }));
  };

  return (
    <ToolScaffold
      state={op.state}
      processingTitle={t('convert.processing', { format: LABEL[target] })}
      onCancel={op.cancel}
      actionLabel={source ? t('convert.action', { format: LABEL[target] }) : undefined}
      actionIcon="swap-horizontal-outline"
      onAction={() => void start()}
      actionDisabled={!source || same}
      onRetry={() => void start()}
      testID="convert-screen"
    >
      <SelectionIssues issues={selection.issues} onDismiss={selection.dismissIssues} />
      {!source ? (
        <PickArea icon="swap-horizontal-outline" title={t('convert.pickTitle')} hint={t('selection.imageHint')} actionLabel={t('selection.chooseImage')} onPick={() => void selection.pick('replace')} loading={selection.loading} testID="pick-images" />
      ) : (
        <Stack gap={2}>
          <FileRow index={0} count={1} file={{ key: source.uri, name: source.name, size: source.size, thumbnailUri: source.uri, width: source.header.displayWidth, height: source.header.displayHeight }} onRemove={() => selection.remove(0)} />
          <Row gap={2}>
            <Text variant="bodySmall" tone="muted">
              {t('convert.detected', { format: LABEL[source.header.format] })}
            </Text>
          </Row>
          <Button size="md" variant="secondary" icon="swap-horizontal" label={t('selection.replace')} onPress={() => void selection.pick('replace')} />
        </Stack>
      )}

      <Card>
        <SegmentedControl<ImageFormat> label={t('convert.to')} value={target} onChange={setTarget} options={IMAGE_FORMATS.map((f) => ({ value: f, label: LABEL[f], disabled: f === from }))} testID="target-format" />
        <Text variant="caption" tone="muted">
          {t(`convert.about.${target}`)}
        </Text>
        {lossy ? <QualitySlider value={quality} onChange={setQuality} label={t('common.quality')} /> : null}
        {same ? <Notice tone="info">{t('convert.sameFormat')}</Notice> : null}
        {source?.header.hasAlpha && target === 'jpeg' ? <Notice tone="warning">{t('common.transparencyToWhite')}</Notice> : null}
        {source?.header.hasAlpha && target !== 'jpeg' ? <Notice tone="success">{t('convert.transparencyKept')}</Notice> : null}
      </Card>

      <Card tone="alt">
        <Text variant="subheading">{t('convert.supportedTitle')}</Text>
        <Text variant="bodySmall" tone="muted">
          {t('convert.supportedBody')}
        </Text>
      </Card>
    </ToolScaffold>
  );
}
