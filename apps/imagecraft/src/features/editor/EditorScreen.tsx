import { Button, Card, Row, Screen, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AdjustmentSlider } from '@/components/AdjustmentSlider';
import { ErrorNotice, NativeRequiredNotice, SourceSummary } from '@/components/common';
import { CropOverlay } from '@/components/CropControls';
import { EditorToolbar } from '@/components/EditorToolbar';
import { EmptyState } from '@/components/EmptyState';
import { ExportDialog, type ExportedFile } from '@/components/ExportDialog';
import { FormatSelector } from '@/components/FormatSelector';
import { ImagePreview, type PreviewFrame } from '@/components/ImagePreview';
import { PremiumGate } from '@/components/monetization';
import { ProcessingProgress } from '@/components/ProcessingProgress';
import { CropPanel, ratioValue } from '@/features/crop/CropPanel';
import { AdjustPanel, FiltersPanel } from '@/features/filters/AdjustPanel';
import { useOpenTool } from '@/features/navigation';
import { editPremiumReasons, exportPixelCap, qualityRange } from '@/features/premium/gating';
import { TextPanel } from '@/features/watermark/TextPanel';
import { WatermarkPanel } from '@/features/watermark/WatermarkPanel';
import { useDrag } from '@/hooks/useDrag';
import { useJob } from '@/hooks/useJob';
import { usePreview } from '@/hooks/usePreview';
import { fmt } from '@/i18n';
import { processingEnv } from '@/services/env';
import { onResultDone, onResultShown } from '@/services/finish';
import { hasQuality } from '@/services/files/formats';
import { buildRecipe } from '@/services/image/recipe';
import { assertSupported } from '@/services/image/renderer';
import { useCanRedo, useCanUndo, useEditor, useEditState } from '@/store/editor';
import { useIsPremium, useSession } from '@/store/session';
import { type EditState, type NormRect, type OutputFormat } from '@/types/image';
import { FULL_RECT, geometrySize, rotatedSize } from '@/utils/geometry';

import { operationsOf, processAndExport } from './exportFlow';

/**
 * The editor: one picture, a large preview rendered by the export pipeline, one options
 * panel at a time, undo/redo, and export. The original photo is never modified.
 */
export default function EditorScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const source = useEditor((s) => s.source);
  const panel = useEditor((s) => s.panel);
  const projectId = useEditor((s) => s.projectId);
  const { apply, undo, redo, reset, setPanel, setProjectId } = useEditor.getState();
  const edit = useEditState();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const isPremium = useIsPremium();
  const usage = useSession((s) => s.usage);
  const defaults = useSession((s) => s.preferences);
  const { importAndEdit, busy: importing, error: importError } = useOpenTool('editor');

  const [format, setFormat] = useState<OutputFormat>(defaults.defaultFormat);
  const [quality, setQuality] = useState(defaults.defaultQuality);
  const [ratioId, setRatioId] = useState('free');
  const [draftCrop, setDraftCrop] = useState<NormRect | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [result, setResult] = useState<{ file: ExportedFile; capped: boolean } | null>(null);
  const job = useJob<{ file: ExportedFile; projectId: string }>('editor');
  const renderer = processingEnv().renderer;

  const cropping = panel === 'crop';
  // In crop mode, the preview shows the whole (rotated) picture so the crop can be adjusted.
  const previewEdit: EditState = useMemo(
    () => (cropping ? { ...edit, geometry: { ...edit.geometry, crop: null }, texts: [], watermark: null } : edit),
    [edit, cropping],
  );
  const [qMin, qMax] = qualityRange(isPremium);
  const effectiveQuality = Math.min(qMax, Math.max(qMin, quality));

  const built = useMemo(() => {
    if (!source) return null;
    return buildRecipe(source, previewEdit, { outputUri: '', encode: { format, quality: effectiveQuality, flattenBackground: '#FFFFFF' }, maxOutputPixels: exportPixelCap(isPremium) });
  }, [source, previewEdit, format, effectiveQuality, isPremium]);
  const preview = usePreview(source, built?.recipe ?? null);

  const reasons = editPremiumReasons(edit);

  if (!source) {
    return (
      <Screen testID="editor-empty">
        <Text variant="title" accessibilityRole="header">
          {t('tabs.edit')}
        </Text>
        <EmptyState icon="brush-outline" title={t('editor.emptyTitle')} message={t('editor.emptyMessage')} actionLabel={t('home.import')} onAction={() => void importAndEdit()} testID="editor-import" />
        {importError ? <ErrorNotice code={importError} /> : null}
        {importing ? <Text tone="muted">{t('home.importing')}</Text> : null}
      </Screen>
    );
  }

  const turned = rotatedSize(source, edit.geometry.rotation);
  const out = geometrySize(source, edit.geometry);
  const aspect = cropping ? turned.width / turned.height : built ? built.output.width / built.output.height : out.width / out.height;
  const crop = draftCrop ?? edit.geometry.crop ?? FULL_RECT;
  const selected = edit.texts.find((l) => l.id === selectedText) ?? null;
  let unsupported = false;
  try {
    if (built) assertSupported(built.recipe, renderer.capabilities);
  } catch {
    unsupported = true;
  }

  const textOverlay = (frame: PreviewFrame) => <TextDragHandle frame={frame} x={selected?.x ?? 0.5} y={selected?.y ?? 0.5} onMove={(x, y) => selected && apply({ ...edit, texts: edit.texts.map((l) => (l.id === selected.id ? { ...l, x, y } : l)) }, `txt-${selected.id}-drag`)} />;

  const overlay = cropping
    ? (frame: PreviewFrame) => (
        <CropOverlay
          frame={frame}
          rect={crop}
          aspect={ratioValue(ratioId, source)}
          imageAspect={turned.width / turned.height}
          onChange={setDraftCrop}
          onCommit={(r) => {
            setDraftCrop(null);
            apply({ ...edit, geometry: { ...edit.geometry, crop: r } });
          }}
        />
      )
    : panel === 'text' && selected
      ? textOverlay
      : undefined;

  const doExport = async () => {
    const exportBuilt = buildRecipe(source, edit, { outputUri: '', encode: { format, quality: effectiveQuality, flattenBackground: '#FFFFFF' }, maxOutputPixels: exportPixelCap(isPremium) });
    const value = await job.run((j, progress) =>
      processAndExport({ job: j, recipe: exportBuilt.recipe, source, suffix: 'edited', kind: 'edit', operations: operationsOf(edit), premiumReasons: reasons, editState: edit, projectId, progress }),
    );
    if (value) {
      setProjectId(value.projectId);
      setResult({ file: value.file, capped: exportBuilt.capped });
      void onResultShown();
    }
  };

  return (
    <Screen testID="editor-screen">
      <SourceSummary
        source={source}
        action={<Button size="md" variant="ghost" icon="images-outline" label={t('editor.newImage')} onPress={() => void importAndEdit()} />}
      />
      <ImagePreview
        uri={preview.supported ? preview.uri : source.uri}
        aspect={aspect}
        originalUri={cropping ? null : source.uri}
        rendering={preview.rendering}
        label={t('editor.previewLabel')}
        overlay={overlay}
        zoomable={!overlay}
        testID="editor-preview"
      />
      {preview.error ? <ErrorNotice code={preview.error} /> : null}
      {unsupported ? <NativeRequiredNotice /> : null}
      <Text variant="caption" tone="muted">
        {t('editor.outputInfo', { dims: fmt.dims(built?.output.width ?? out.width, built?.output.height ?? out.height) })}
      </Text>
      <EditorToolbar
        panel={panel}
        onPanel={setPanel}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onReset={() => {
          reset();
          setRatioId('free');
          setSelectedText(null);
        }}
        locked={isPremium ? undefined : { watermark: true }}
      />
      <Card>
        {panel === 'crop' ? <CropPanel source={source} edit={edit} ratioId={ratioId} onRatioId={setRatioId} apply={apply} /> : null}
        {panel === 'adjust' ? <AdjustPanel edit={edit} apply={apply} /> : null}
        {panel === 'filters' ? <FiltersPanel edit={edit} apply={apply} /> : null}
        {panel === 'text' ? <TextPanel edit={edit} apply={apply} selectedId={selectedText} onSelect={setSelectedText} /> : null}
        {panel === 'watermark' ? <WatermarkPanel edit={edit} apply={apply} /> : null}
      </Card>

      <Card>
        <Text variant="heading">{t('editor.exportTitle')}</Text>
        <FormatSelector value={format} onChange={setFormat} hasAlpha={source.hasAlpha} />
        {hasQuality(format) ? (
          <AdjustmentSlider label={t('compress.quality')} value={effectiveQuality} min={qMin} max={qMax} neutral={effectiveQuality} onChange={(v) => setQuality(Math.round(v))} format={(v) => `${Math.round(v)} %`} />
        ) : null}
        {built?.capped ? (
          <Text variant="caption" tone="warning">
            {t('editor.capped', { dims: fmt.dims(built.output.width, built.output.height) })}
          </Text>
        ) : null}
      </Card>
      <PremiumGate source="editor" reasons={reasons} />
      {job.state.status === 'running' ? <ProcessingProgress done={job.state.done} total={job.state.total} onCancel={job.cancel} label={t('processing.exporting')} /> : null}
      {job.state.status === 'error' ? <ErrorNotice code={job.state.code} onRetry={() => void doExport()} /> : null}
      {job.state.status === 'cancelled' ? (
        <Text variant="bodySmall" tone="muted">
          {t('processing.cancelled')}
        </Text>
      ) : null}
      <Button
        label={t('editor.export')}
        icon="download-outline"
        onPress={() => void doExport()}
        disabled={job.running || unsupported || (!isPremium && reasons.length > 0 && usage.rewardedUnlocks - usage.unlocksUsed <= 0)}
        testID="editor-export"
      />
      <Text variant="caption" tone="muted" center>
        {t('editor.originalSafe')}
      </Text>
      <Row gap={2} wrap style={{ justifyContent: 'center' }}>
        <Button size="md" variant="ghost" label={t('tools.social.title')} icon="share-social-outline" onPress={() => router.push('/tools/social')} />
        <Button size="md" variant="ghost" label={t('tools.compress.title')} icon="contract-outline" onPress={() => router.push('/tools/compress')} />
      </Row>
      {result ? (
        <ExportDialog
          visible
          files={[result.file]}
          inputBytes={source.bytes}
          tool="editor"
          notice={result.capped ? t('editor.cappedNotice') : null}
          onDone={() => {
            setResult(null);
            job.reset();
            void onResultDone();
          }}
        />
      ) : null}
    </Screen>
  );
}

/** Draggable marker positioning the selected text layer (normalised to the output). */
function TextDragHandle({ frame, x, y, onMove }: { frame: PreviewFrame; x: number; y: number; onMove: (x: number, y: number) => void }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const drag = useDrag({
    capture: () => ({ x, y }),
    onMove: (dx, dy, start) => {
      const nx = Math.min(1, Math.max(0, start.x + dx / frame.width));
      const ny = Math.min(1, Math.max(0, start.y + dy / frame.height));
      onMove(Math.round(nx * 1000) / 1000, Math.round(ny * 1000) / 1000);
    },
  });
  return (
    <View
      {...drag}
      accessibilityLabel={t('text.dragHandle')}
      style={{
        position: 'absolute',
        left: frame.x + x * frame.width - 22,
        top: frame.y + y * frame.height - 22,
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: theme.colors.primary,
        backgroundColor: 'rgba(255,255,255,0.25)',
      }}
    />
  );
}
