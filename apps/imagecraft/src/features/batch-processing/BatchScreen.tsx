import { Badge, Button, Card, Chip, Divider, Icon, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdjustmentSlider } from '@/components/AdjustmentSlider';
import { ErrorNotice } from '@/components/common';
import { TextField, ToggleRow } from '@/components/controls';
import { EmptyState } from '@/components/EmptyState';
import { ExportDialog } from '@/components/ExportDialog';
import { FormatSelector } from '@/components/FormatSelector';
import { PremiumGate } from '@/components/monetization';
import { ProcessingProgress } from '@/components/ProcessingProgress';
import { RESIZE_PRESETS } from '@/constants/tools';
import { ensureExportAllowed } from '@/features/editor/exportFlow';
import { batchCap, exportPixelCap, qualityRange, type PremiumReason } from '@/features/premium/gating';
import { recordProject } from '@/features/projects/projectsService';
import { defaultWatermark } from '@/features/watermark/WatermarkPanel';
import { useJob } from '@/hooks/useJob';
import { fmt } from '@/i18n';
import { countBucket, recordError, track } from '@/services/analytics';
import { processingEnv } from '@/services/env';
import { onResultDone, onResultShown } from '@/services/finish';
import { toErrorCode, type ProcessingErrorCode } from '@/services/files/errors';
import { hasQuality } from '@/services/files/formats';
import { importPicked, type PickedAsset } from '@/services/image/engine';
import { pickImages } from '@/services/picker';
import { useIsPremium, useSession } from '@/store/session';
import type { OutputFormat } from '@/types/image';
import type { ResizeRequest } from '@/utils/geometry';

import { runBatch, type BatchSummary } from './batchRunner';

type Operation = 'compress' | 'resize' | 'convert';

/**
 * Batch: the same settings applied to many pictures, one at a time (stable on every device),
 * with progress, cancellation, per-file errors and a final summary.
 */
export default function BatchScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const prefs = useSession((s) => s.preferences);
  const [assets, setAssets] = useState<PickedAsset[]>([]);
  const [operation, setOperation] = useState<Operation>('compress');
  const [format, setFormat] = useState<OutputFormat>(prefs.defaultFormat === 'png' ? 'jpeg' : prefs.defaultFormat);
  const [quality, setQuality] = useState(75);
  const [longEdge, setLongEdge] = useState(1920);
  const [watermarkOn, setWatermarkOn] = useState(false);
  const [watermarkText, setWatermarkText] = useState('');
  const [pickError, setPickError] = useState<ProcessingErrorCode | null>(null);
  const [summary, setSummary] = useState<BatchSummary | null>(null);
  const [showExport, setShowExport] = useState(false);
  const job = useJob<BatchSummary>('batch');
  const cap = batchCap(isPremium);
  const [qMin, qMax] = qualityRange(isPremium);
  const q = Math.min(qMax, Math.max(qMin, quality));
  const reasons: PremiumReason[] = watermarkOn ? ['watermark'] : [];

  const choose = async () => {
    setPickError(null);
    setSummary(null);
    try {
      const picked = await pickImages({ multiple: true, limit: cap });
      if (picked.length > cap) setPickError('premium_required');
      if (picked.length) setAssets(picked.slice(0, cap));
    } catch (e) {
      recordError(e, 'batch_pick');
      setPickError(toErrorCode(e));
    }
  };

  const run = async () => {
    const resize: ResizeRequest | null = operation === 'resize' ? { mode: 'preset', longEdge } : null;
    const value = await job.run(async (j, progress) => {
      await ensureExportAllowed(reasons);
      const env = processingEnv();
      const s = await runBatch(
        env,
        j,
        assets.map((a, i) => ({ name: a.name ?? t('batch.fileN', { index: i + 1 }), bytes: 0, load: () => importPicked(env, a) })),
        {
          format,
          quality: q,
          resize,
          watermark: watermarkOn && watermarkText.trim() ? { ...defaultWatermark(watermarkText.trim()), tiled: false } : null,
          maxOutputPixels: exportPixelCap(isPremium),
          suffix: operation === 'compress' ? 'compressed' : operation === 'resize' ? `${longEdge}px` : '',
        },
        progress,
      );
      const first = s.items.find((i) => i.status === 'done');
      if (first && first.status === 'done') {
        await recordProject({ kind: 'batch', output: first.output, operations: ['batch', operation], inputBytes: s.inputBytes, itemCount: s.done });
      }
      return s;
    });
    if (value) {
      track('batch_completed', { operation, files: countBucket(value.done), failed: countBucket(value.failed) });
      setSummary(value);
      void onResultShown();
    }
  };

  const doneFiles = summary ? summary.items.flatMap((i) => (i.status === 'done' ? [i.output] : [])) : [];

  return (
    <Screen edges={[]} testID="tool-batch">
      {assets.length === 0 ? (
        <EmptyState icon="layers-outline" title={t('tools.batch.emptyTitle')} message={t('batch.limit', { count: cap })} actionLabel={t('batch.select')} onAction={() => void choose()} testID="batch-select" />
      ) : (
        <>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text variant="subheading">{t('batch.selected', { count: assets.length })}</Text>
            <Button size="md" variant="ghost" icon="images-outline" label={t('common.change')} onPress={() => void choose()} disabled={job.running} />
          </Row>
          <Text variant="caption" tone="muted">
            {t('batch.limit', { count: cap })}
          </Text>
        </>
      )}
      {pickError === 'premium_required' ? (
        <Text variant="bodySmall" tone="warning">
          {t('batch.capReached', { count: cap })}
        </Text>
      ) : pickError ? (
        <ErrorNotice code={pickError} />
      ) : null}

      {assets.length > 0 ? (
        <>
          <Card>
            <Text variant="label" tone="muted">
              {t('batch.operation')}
            </Text>
            <Row gap={2} wrap accessibilityRole="radiogroup">
              {(['compress', 'resize', 'convert'] as Operation[]).map((op) => (
                <Chip key={op} label={t(`tools.${op}.title`)} selected={operation === op} onPress={() => setOperation(op)} testID={`batch-op-${op}`} />
              ))}
            </Row>
            {operation === 'resize' ? (
              <Row gap={2} wrap>
                {RESIZE_PRESETS.map((p) => (
                  <Chip key={p.id} label={`${p.longEdge} px`} selected={longEdge === p.longEdge} onPress={() => setLongEdge(p.longEdge)} />
                ))}
              </Row>
            ) : null}
            <FormatSelector value={format} onChange={setFormat} />
            {hasQuality(format) ? <AdjustmentSlider label={t('compress.quality')} value={q} min={qMin} max={qMax} neutral={q} onChange={(v) => setQuality(Math.round(v))} format={(v) => `${Math.round(v)} %`} /> : null}
            <Divider />
            <ToggleRow label={t('batch.watermark')} hint={t('watermark.premiumHint')} value={watermarkOn} onChange={setWatermarkOn} />
            {watermarkOn ? <TextField label={t('watermark.text')} value={watermarkText} onChangeText={setWatermarkText} maxLength={80} /> : null}
          </Card>
          <PremiumGate source="batch" reasons={reasons} />
          {job.state.status === 'running' ? <ProcessingProgress done={job.state.done} total={job.state.total} onCancel={job.cancel} label={t('batch.processing')} /> : null}
          {job.state.status === 'error' ? <ErrorNotice code={job.state.code} onRetry={() => void run()} /> : null}
          {job.state.status === 'cancelled' ? (
            <Text variant="bodySmall" tone="muted">
              {t('processing.cancelled')}
            </Text>
          ) : null}
          <Button label={t('batch.start', { count: assets.length })} icon="flash-outline" onPress={() => void run()} disabled={job.running} testID="batch-start" />
        </>
      ) : null}

      {summary ? (
        <Card testID="batch-summary">
          <Text variant="heading">{t('batch.summaryTitle')}</Text>
          <Row gap={2} wrap>
            <Badge label={t('batch.done', { count: summary.done })} tone="success" />
            {summary.failed ? <Badge label={t('batch.failed', { count: summary.failed })} tone="danger" /> : null}
            {summary.cancelled ? <Badge label={t('batch.cancelledCount', { count: summary.cancelled })} tone="neutral" /> : null}
          </Row>
          {summary.done ? (
            <Text variant="bodySmall" tone="muted">
              {t('batch.sizes', { before: fmt.size(summary.inputBytes), after: fmt.size(summary.outputBytes) })}
            </Text>
          ) : null}
          <Stack gap={1}>
            {summary.items.map((i) => (
              <Row key={i.index} gap={2}>
                <Icon
                  name={i.status === 'done' ? 'checkmark-circle' : i.status === 'failed' ? 'alert-circle' : 'remove-circle-outline'}
                  size={16}
                  color={i.status === 'done' ? theme.colors.success : i.status === 'failed' ? theme.colors.danger : theme.colors.textSubtle}
                />
                <Text variant="caption" style={{ flex: 1 }} numberOfLines={1}>
                  {i.status === 'done' ? i.output.name : i.name}
                </Text>
                <Text variant="caption" tone="muted">
                  {i.status === 'done' ? fmt.size(i.output.bytes) : i.status === 'failed' ? t(`errorsShort.${i.code}`) : t('batch.skipped')}
                </Text>
              </Row>
            ))}
          </Stack>
          {doneFiles.length ? <Button label={t('batch.exportAll', { count: doneFiles.length })} icon="download-outline" onPress={() => setShowExport(true)} testID="batch-export" /> : null}
        </Card>
      ) : null}
      {showExport && summary ? (
        <ExportDialog
          visible
          files={doneFiles}
          inputBytes={summary.inputBytes}
          tool="batch"
          onDone={() => {
            setShowExport(false);
            void onResultDone();
          }}
        />
      ) : null}
    </Screen>
  );
}
