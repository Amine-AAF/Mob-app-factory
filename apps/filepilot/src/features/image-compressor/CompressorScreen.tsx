import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Row, Stack, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { NumberField, Notice, PremiumBadge, QualitySlider, SegmentedControl } from '@/components/controls';
import { FileRow, PickArea, SelectionIssues } from '@/components/files';
import { ToolScaffold } from '@/components/ToolScaffold';
import { useOperation } from '@/hooks/useOperation';
import { useImageSelection } from '@/hooks/useSelection';
import { fmt } from '@/i18n';
import { sizeBucket, track } from '@/services/analytics';
import { processingEnv } from '@/services/env';
import type { ImageFormat } from '@/services/files/formats';
import { compressSpec, type OutputFormatChoice } from '@/services/operations/tools';
import { canUse, featureCap } from '@/services/quota';
import { useIsPremium, useSession } from '@/store/session';
import { savedRatio } from '@/utils/format';

const TARGET_PRESETS_KB = [100, 200, 500, 1000] as const;

const targetSchema = z.object({ targetKb: z.number({ message: 'invalid' }).int().min(10, 'min').max(50_000, 'max') });

export default function CompressorScreen() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const defaults = useSession((s) => s.preferences);
  const selection = useImageSelection('compress', isPremium, featureCap(isPremium, 'batchImages'));
  const op = useOperation();
  const [format, setFormat] = useState<OutputFormatChoice>('original');
  const [quality, setQuality] = useState(defaults.defaultImageQuality);
  const [mode, setMode] = useState<'quality' | 'target'>('quality');
  const form = useForm<{ targetKb: number }>({ resolver: zodResolver(targetSchema), defaultValues: { targetKb: 200 }, mode: 'onChange' });

  const targetKbValue = useWatch({ control: form.control, name: 'targetKb' });
  const items = selection.items;
  const resolved = (f: ImageFormat): ImageFormat => (format === 'original' ? f : format);
  const allPng = items.length > 0 && items.every((i) => resolved(i.header.format) === 'png');
  const flattenWarning = items.some((i) => i.header.hasAlpha && resolved(i.header.format) === 'jpeg');
  const totalSize = items.reduce((n, i) => n + i.size, 0);
  const paywall = (source: string) => router.push({ pathname: '/paywall', params: { source } });

  const start = form.handleSubmit(async ({ targetKb }) => {
    const first = items[0];
    if (!first) return;
    const useTarget = mode === 'target' && canUse(isPremium, 'targetSize') && !allPng;
    const spec = compressSpec(processingEnv(), items, { format, quality: quality / 100, ...(useTarget ? { targetBytes: targetKb * 1000 } : {}) });
    await op.run(spec, { originalPreviewUri: first.uri, originalWidth: first.header.displayWidth, originalHeight: first.header.displayHeight }, (outcome) => {
      track('compression_completed', {
        format,
        size_bucket: sizeBucket(totalSize),
        saved_percent: Math.round((savedRatio(outcome.originalSize, outcome.outputSize) ?? 0) * 100),
        batch: items.length > 1,
        target_size: useTarget,
      });
    });
  });

  return (
    <ToolScaffold
      state={op.state}
      processingTitle={items.length > 1 ? t('compress.processingBatch', { count: items.length }) : t('compress.processing')}
      unit={items.length > 1 ? 'file' : 'step'}
      onCancel={op.cancel}
      actionLabel={items.length ? (items.length > 1 ? t('compress.actionBatch', { count: items.length }) : t('compress.action')) : undefined}
      actionIcon="contract-outline"
      onAction={() => void start()}
      actionDisabled={!items.length || (mode === 'target' && !form.formState.isValid)}
      onRetry={() => void start()}
      testID="compress-screen"
    >
      <SelectionIssues issues={selection.issues} onDismiss={selection.dismissIssues} />
      {items.length === 0 ? (
        <PickArea icon="image-outline" title={t('compress.pickTitle')} hint={t('selection.imageHint')} actionLabel={isPremium ? t('selection.chooseImages') : t('selection.chooseImage')} onPick={() => void selection.pick()} loading={selection.loading} testID="pick-images" />
      ) : (
        <Stack gap={2}>
          {items.map((img, i) => (
            <FileRow
              key={img.uri}
              index={i}
              count={items.length}
              file={{ key: img.uri, name: img.name, size: img.size, thumbnailUri: img.uri, width: img.header.displayWidth, height: img.header.displayHeight }}
              onRemove={() => selection.remove(i)}
            />
          ))}
          <Row gap={2} wrap>
            <Button size="md" variant="secondary" icon="add" label={isPremium ? t('selection.addMore') : t('selection.replace')} onPress={() => void selection.pick(isPremium ? 'add' : 'replace')} />
            {!isPremium ? <Button size="md" variant="ghost" icon="diamond-outline" label={t('compress.batchPremium')} onPress={() => paywall('batch')} /> : null}
          </Row>
          {items.length > 1 ? (
            <Text variant="caption" tone="muted">
              {t('compress.totalSize', { size: fmt.size(totalSize) })}
            </Text>
          ) : null}
        </Stack>
      )}

      <Card>
        <SegmentedControl<OutputFormatChoice>
          label={t('common.outputFormat')}
          value={format}
          onChange={setFormat}
          options={[
            { value: 'original', label: t('compress.keepFormat') },
            { value: 'jpeg', label: 'JPEG' },
            { value: 'webp', label: 'WebP' },
            { value: 'png', label: 'PNG' },
          ]}
          testID="format"
        />
        {allPng ? <Notice tone="info">{t('compress.pngNote')}</Notice> : null}
        {flattenWarning ? <Notice tone="warning">{t('common.transparencyToWhite')}</Notice> : null}
      </Card>

      {!allPng ? (
        <Card>
          <Row style={{ justifyContent: 'space-between' }}>
            <SegmentedControl<'quality' | 'target'>
              label={t('compress.mode')}
              value={mode}
              onChange={setMode}
              onLocked={() => paywall('target_size')}
              options={[
                { value: 'quality', label: t('compress.byQuality') },
                { value: 'target', label: t('compress.byTarget'), locked: !canUse(isPremium, 'targetSize') },
              ]}
              testID="mode"
            />
          </Row>
          {mode === 'quality' ? (
            <QualitySlider value={quality} onChange={setQuality} label={t('common.quality')} hint={t('compress.qualityHint')} />
          ) : (
            <Stack gap={3}>
              <Row gap={2} wrap>
                {TARGET_PRESETS_KB.map((kb) => (
                  <Button key={kb} size="md" variant={targetKbValue === kb ? 'primary' : 'secondary'} label={fmt.size(kb * 1000)} onPress={() => form.setValue('targetKb', kb, { shouldValidate: true })} />
                ))}
              </Row>
              <Controller
                control={form.control}
                name="targetKb"
                render={({ field, fieldState }) => (
                  <NumberField
                    label={t('compress.targetCustom')}
                    suffix="kB"
                    value={Number.isFinite(field.value) ? String(field.value) : ''}
                    onChangeText={(v) => field.onChange(v ? Number(v.replace(/\D/g, '')) : Number.NaN)}
                    onBlur={field.onBlur}
                    error={fieldState.error ? t(`compress.targetError.${fieldState.error.message === 'max' ? 'max' : 'min'}`) : undefined}
                  />
                )}
              />
              <Text variant="caption" tone="muted">
                {t('compress.targetHint')}
              </Text>
            </Stack>
          )}
          {!isPremium && mode === 'quality' ? (
            <Row gap={2}>
              <PremiumBadge />
              <Text variant="caption" tone="muted" style={{ flex: 1 }}>
                {t('compress.targetPremium')}
              </Text>
            </Row>
          ) : null}
        </Card>
      ) : null}
      <Text variant="caption" tone="subtle">
        {t('compress.metadataNote')}
      </Text>
    </ToolScaffold>
  );
}
