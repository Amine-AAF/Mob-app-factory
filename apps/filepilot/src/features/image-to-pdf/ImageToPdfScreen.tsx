import { Button, Card, Row, Stack, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Notice, SegmentedControl } from '@/components/controls';
import { FileRow, PickArea, SelectionIssues } from '@/components/files';
import { ToolScaffold } from '@/components/ToolScaffold';
import { useOperation } from '@/hooks/useOperation';
import { useImageSelection } from '@/hooks/useSelection';
import { countBucket, track } from '@/services/analytics';
import { processingEnv } from '@/services/env';
import type { PageMargin, PageOrientation, PageSize } from '@/services/pdf/pageLayout';
import { imageToPdfSpec, type PdfImageQuality } from '@/services/operations/tools';
import { featureCap } from '@/services/quota';
import { useIsPremium } from '@/store/session';

export default function ImageToPdfScreen() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const max = featureCap(isPremium, 'imagesPerPdf');
  const selection = useImageSelection('image_to_pdf', true, max);
  const op = useOperation();
  const images = selection.items;
  const [size, setSize] = useState<PageSize>('a4');
  const [orientation, setOrientation] = useState<PageOrientation>('auto');
  const [margin, setMargin] = useState<PageMargin>('small');
  const [quality, setQuality] = useState<PdfImageQuality>('standard');

  const start = async () => {
    if (!images.length) return;
    await op.run(imageToPdfSpec(processingEnv(), images, { size, orientation, margin, quality }), undefined, () =>
      track('image_to_pdf_completed', { images: countBucket(images.length), page_size: size }),
    );
  };

  return (
    <ToolScaffold
      state={op.state}
      processingTitle={t('imageToPdf.processing', { count: images.length })}
      unit="page"
      onCancel={op.cancel}
      actionLabel={images.length ? t('imageToPdf.action', { count: images.length }) : undefined}
      actionIcon="document-outline"
      onAction={() => void start()}
      actionDisabled={!images.length}
      onRetry={() => void start()}
      testID="image-to-pdf-screen"
    >
      <SelectionIssues issues={selection.issues} onDismiss={selection.dismissIssues} />
      {images.length === 0 ? (
        <PickArea icon="images-outline" title={t('imageToPdf.pickTitle')} hint={t('imageToPdf.pickHint', { count: max })} actionLabel={t('selection.chooseImages')} onPick={() => void selection.pick('add')} loading={selection.loading} testID="pick-images" />
      ) : (
        <Stack gap={2}>
          <Text variant="label" tone="muted">
            {t('imageToPdf.order')}
          </Text>
          {images.map((img, i) => (
            <FileRow
              key={img.uri}
              index={i}
              count={images.length}
              file={{ key: img.uri, name: img.name, size: img.size, thumbnailUri: img.uri, width: img.header.displayWidth, height: img.header.displayHeight }}
              onRemove={() => selection.remove(i)}
              onMove={(d) => selection.move(i, d)}
            />
          ))}
          {images.length < max ? <Button size="md" variant="secondary" icon="add" label={t('selection.addMore')} onPress={() => void selection.pick('add')} loading={selection.loading} /> : null}
          {images.length >= max && !isPremium ? (
            <Notice tone="info">
              <Stack gap={2}>
                <Text variant="bodySmall">{t('imageToPdf.freeLimit', { count: max })}</Text>
                <Button size="md" variant="accent" icon="diamond" label={t('premium.unlock')} onPress={() => router.push({ pathname: '/paywall', params: { source: 'image_to_pdf_limit' } })} />
              </Stack>
            </Notice>
          ) : null}
        </Stack>
      )}

      <Card>
        <SegmentedControl<PageSize>
          label={t('imageToPdf.pageSize')}
          value={size}
          onChange={setSize}
          options={[
            { value: 'a4', label: 'A4' },
            { value: 'letter', label: t('imageToPdf.letter') },
            { value: 'fit', label: t('imageToPdf.fit') },
          ]}
          testID="page-size"
        />
        {size !== 'fit' ? (
          <SegmentedControl<PageOrientation>
            label={t('imageToPdf.orientation')}
            value={orientation}
            onChange={setOrientation}
            options={[
              { value: 'auto', label: t('imageToPdf.orientationAuto') },
              { value: 'portrait', label: t('imageToPdf.portrait') },
              { value: 'landscape', label: t('imageToPdf.landscape') },
            ]}
          />
        ) : null}
        <SegmentedControl<PageMargin>
          label={t('imageToPdf.margins')}
          value={margin}
          onChange={setMargin}
          options={(['none', 'small', 'medium', 'large'] as const).map((m) => ({ value: m, label: t(`imageToPdf.margin.${m}`) }))}
        />
        <SegmentedControl<PdfImageQuality>
          label={t('imageToPdf.imageQuality')}
          value={quality}
          onChange={setQuality}
          options={[
            { value: 'standard', label: t('imageToPdf.qualityStandard') },
            { value: 'high', label: t('imageToPdf.qualityHigh') },
          ]}
        />
        <Row>
          <Text variant="caption" tone="muted">
            {t('imageToPdf.qualityHint')}
          </Text>
        </Row>
      </Card>
    </ToolScaffold>
  );
}
