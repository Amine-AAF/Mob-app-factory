import { Button, Card, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from 'react-native';

import { Notice, QualitySlider, SegmentedControl } from '@/components/controls';
import { FileRow, PickArea, SelectionIssues } from '@/components/files';
import { ToolScaffold } from '@/components/ToolScaffold';
import { useOperation } from '@/hooks/useOperation';
import { usePdfSelection } from '@/hooks/useSelection';
import { countBucket, track } from '@/services/analytics';
import { processingEnv } from '@/services/env';
import type { ImageFormat } from '@/services/files/formats';
import { formatPageRanges, parsePageRanges } from '@/services/pdf/pageRanges';
import { pdfToImagesSpec, type RenderResolution } from '@/services/operations/tools';
import { featureCap } from '@/services/quota';
import { useIsPremium } from '@/store/session';

export default function PdfToImagesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const maxPages = featureCap(isPremium, 'pdfToImagesPages');
  const available = processingEnv().renderer.available;
  const selection = usePdfSelection('pdf_to_images', false, 1);
  const op = useOperation();
  const pdf = selection.items[0];
  const [scope, setScope] = useState<'all' | 'range'>('all');
  const [ranges, setRanges] = useState('1');
  const [format, setFormat] = useState<ImageFormat>('jpeg');
  const [quality, setQuality] = useState(85);
  const [resolution, setResolution] = useState<RenderResolution>('standard');

  const pages = useMemo(() => {
    if (!pdf) return null;
    if (scope === 'all') return Array.from({ length: pdf.pageCount }, (_, i) => i);
    const r = parsePageRanges(ranges, pdf.pageCount);
    return r.ok ? r.pages : null;
  }, [pdf, ranges, scope]);
  const rangeError = pdf && scope === 'range' ? parsePageRanges(ranges, pdf.pageCount) : null;
  const overLimit = pages !== null && pages.length > maxPages;

  const start = async () => {
    if (!pdf || !pages || overLimit) return;
    await op.run(pdfToImagesSpec(processingEnv(), pdf, pages, { format, quality: format === 'png' ? 1 : quality / 100, resolution }), undefined, () =>
      track('pdf_to_images_completed', { pages: countBucket(pages.length), format }),
    );
  };

  if (!available) {
    return (
      <ToolScaffold state={op.state} processingTitle="" onCancel={op.cancel} testID="pdf-to-images-unavailable">
        <Notice tone="warning">{t('errors.native_unavailable')}</Notice>
      </ToolScaffold>
    );
  }

  return (
    <ToolScaffold
      state={op.state}
      processingTitle={t('pdfToImages.processing')}
      unit="page"
      onCancel={op.cancel}
      actionLabel={pdf ? t('pdfToImages.action', { count: pages?.length ?? 0 }) : undefined}
      actionIcon="image-outline"
      onAction={() => void start()}
      actionDisabled={!pages || pages.length === 0 || overLimit}
      onRetry={() => void start()}
      testID="pdf-to-images-screen"
    >
      <SelectionIssues issues={selection.issues} onDismiss={selection.dismissIssues} />
      {!pdf ? (
        <PickArea icon="document-outline" title={t('pdfToImages.pickTitle')} hint={t('selection.pdfHint')} actionLabel={t('selection.choosePdf')} onPick={() => void selection.pick('replace')} loading={selection.loading} testID="pick-pdf" />
      ) : (
        <Stack gap={2}>
          <FileRow index={0} count={1} file={{ key: pdf.uri, name: pdf.name, size: pdf.size, pageCount: pdf.pageCount }} onRemove={() => selection.remove(0)} />
          <Button size="md" variant="secondary" icon="swap-horizontal" label={t('selection.replace')} onPress={() => void selection.pick('replace')} />
        </Stack>
      )}

      <Card>
        <SegmentedControl<'all' | 'range'>
          label={t('pdfToImages.pages')}
          value={scope}
          onChange={setScope}
          options={[
            { value: 'all', label: pdf ? t('pdfToImages.allPages', { count: pdf.pageCount }) : t('pdfToImages.allPagesShort') },
            { value: 'range', label: t('pdfToImages.selectPages') },
          ]}
        />
        {scope === 'range' ? (
          <Stack gap={1}>
            <TextInput
              value={ranges}
              onChangeText={setRanges}
              placeholder={t('pdf.split.placeholder')}
              placeholderTextColor={theme.colors.textSubtle}
              keyboardType="numbers-and-punctuation"
              accessibilityLabel={t('pdfToImages.selectPages')}
              style={{ minHeight: 48, borderRadius: theme.radius.md, borderWidth: 1.5, borderColor: rangeError && !rangeError.ok ? theme.colors.danger : theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text, paddingHorizontal: 12, fontSize: 16 }}
              testID="render-ranges"
            />
            {rangeError && !rangeError.ok ? (
              <Text variant="caption" tone="danger">
                {t(`pdf.split.rangeError.${rangeError.error}`, { count: pdf?.pageCount ?? 0 })}
              </Text>
            ) : pages ? (
              <Text variant="caption" tone="success">
                {t('pdf.split.willExtract', { pages: formatPageRanges(pages), count: pages.length })}
              </Text>
            ) : null}
          </Stack>
        ) : null}
        {overLimit ? (
          <Notice tone="warning">
            <Stack gap={2}>
              <Text variant="bodySmall">{t('pdfToImages.limit', { count: maxPages })}</Text>
              {!isPremium ? <Button size="md" variant="accent" icon="diamond" label={t('premium.unlock')} onPress={() => router.push({ pathname: '/paywall', params: { source: 'pdf_to_images_limit' } })} /> : null}
            </Stack>
          </Notice>
        ) : null}
      </Card>

      <Card>
        <SegmentedControl<ImageFormat>
          label={t('common.outputFormat')}
          value={format}
          onChange={setFormat}
          options={[
            { value: 'jpeg', label: 'JPEG' },
            { value: 'png', label: 'PNG' },
            { value: 'webp', label: 'WebP' },
          ]}
        />
        <SegmentedControl<RenderResolution>
          label={t('pdfToImages.resolution')}
          value={resolution}
          onChange={setResolution}
          options={(['screen', 'standard', 'high'] as const).map((r) => ({ value: r, label: t(`pdfToImages.res.${r}`) }))}
        />
        {format !== 'png' ? <QualitySlider value={quality} onChange={setQuality} label={t('common.quality')} /> : null}
        <Text variant="caption" tone="muted">
          {t('pdfToImages.hint')}
        </Text>
      </Card>
    </ToolScaffold>
  );
}
