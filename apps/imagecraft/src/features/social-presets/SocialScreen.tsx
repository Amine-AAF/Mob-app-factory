import { Card, Chip, Row, Stack, Text, useTheme } from '@factory/design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { AdjustmentSlider } from '@/components/AdjustmentSlider';
import { NativeRequiredNotice } from '@/components/common';
import { ColorSwatches, TextField } from '@/components/controls';
import type { ExportedFile } from '@/components/ExportDialog';
import { FormatSelector } from '@/components/FormatSelector';
import { ImagePreview, type PreviewFrame } from '@/components/ImagePreview';
import { PremiumGate } from '@/components/monetization';
import { SocialPresetCard } from '@/components/SocialPresetCard';
import { ToolScaffold } from '@/components/ToolScaffold';
import { BACKGROUND_SWATCHES, CUSTOM_CANVAS_LIMITS, SOCIAL_PRESETS, type SocialPreset } from '@/constants/socialPresets';
import { operationsOf, processAndExport } from '@/features/editor/exportFlow';
import { editPremiumReasons, exportPixelCap, type PremiumReason } from '@/features/premium/gating';
import { useDrag } from '@/hooks/useDrag';
import { useJob } from '@/hooks/useJob';
import { usePreview } from '@/hooks/usePreview';
import { useSingleSource } from '@/hooks/useSingleSource';
import { track } from '@/services/analytics';
import { processingEnv } from '@/services/env';
import { onResultDone, onResultShown } from '@/services/finish';
import { buildRecipe } from '@/services/image/recipe';
import { useEditor } from '@/store/editor';
import { useIsPremium } from '@/store/session';
import { initialEditState, type OutputFormat, type Size } from '@/types/image';
import { clamp, geometrySize, panToOffset, placeOnCanvas, type FitMode } from '@/utils/geometry';

/**
 * Social media presets: the picture is placed on the platform's canvas with a UNIFORM scale
 * (never stretched). Fill crops the overflow (drag to choose what stays), Fit shows the whole
 * picture on a background colour. Edits made in the editor (filters, text…) are kept.
 */
export default function SocialScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const { source, choose, busy, error, editorSource } = useSingleSource('social');
  const editorEdit = useEditor((s) => s.history.present);
  const [preset, setPreset] = useState<SocialPreset>(SOCIAL_PRESETS[0] as SocialPreset);
  const [custom, setCustom] = useState<{ w: string; h: string } | null>(null);
  const [fit, setFit] = useState<FitMode>(preset.defaultFit);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [background, setBackground] = useState('#FFFFFF');
  const [format, setFormat] = useState<OutputFormat>('jpeg');
  const [result, setResult] = useState<ExportedFile | null>(null);
  const job = useJob<{ file: ExportedFile }>('social');

  const edit = source && editorSource && source.uri === editorSource.uri ? editorEdit : initialEditState();
  const customSize: Size | null = custom
    ? { width: clamp(Number(custom.w) || 0, CUSTOM_CANVAS_LIMITS.min, CUSTOM_CANVAS_LIMITS.max), height: clamp(Number(custom.h) || 0, CUSTOM_CANVAS_LIMITS.min, CUSTOM_CANVAS_LIMITS.max) }
    : null;
  const canvasSize = customSize ?? preset.size;
  const reasons: PremiumReason[] = [...editPremiumReasons(edit), ...(preset.premium && !custom ? (['social_preset'] as const) : []), ...(custom ? (['social_preset'] as const) : [])];

  const built = source
    ? buildRecipe(source, edit, {
        outputUri: '',
        encode: { format, quality: 92, flattenBackground: background },
        canvas: { size: canvasSize, background, fit, zoom, offset },
        maxOutputPixels: exportPixelCap(isPremium),
      })
    : null;
  const preview = usePreview(source, built?.recipe ?? null);
  const nativeMissing = processingEnv().renderer.name !== 'native';

  const choosePreset = (p: SocialPreset) => {
    setCustom(null);
    setPreset(p);
    setFit(p.defaultFit);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const run = async () => {
    if (!source || !built) return;
    const value = await job.run((j, progress) =>
      processAndExport({ job: j, recipe: built.recipe, source, suffix: custom ? `${canvasSize.width}x${canvasSize.height}` : preset.id.replace(/_/g, '-'), kind: 'social', operations: ['social', ...operationsOf(edit)], premiumReasons: reasons, progress }),
    );
    if (value) {
      track('social_preset_used', { preset: custom ? 'custom' : preset.id });
      setResult(value.file);
      void onResultShown();
    }
  };

  const picture = source ? geometrySize(source, edit.geometry) : null;
  const overlay = (frame: PreviewFrame) =>
    picture ? <PanLayer frame={frame} canvas={canvasSize} placement={placeOnCanvas(picture, canvasSize, fit, zoom, offset)} offset={offset} onOffset={setOffset} /> : null;

  return (
    <ToolScaffold
      tool="social"
      source={source}
      onChoose={() => void choose()}
      choosing={busy}
      importError={error}
      actionLabel={t('tools.social.action')}
      onAction={() => void run()}
      actionDisabled={!built || nativeMissing}
      job={job.state}
      onCancel={job.cancel}
      onRetry={() => void run()}
      result={result && source ? { files: [result], inputBytes: null } : null}
      onDone={() => {
        setResult(null);
        job.reset();
        void onResultDone();
      }}
    >
      {source ? (
        <>
          {nativeMissing ? <NativeRequiredNotice /> : null}
          <ImagePreview uri={preview.uri} aspect={canvasSize.width / canvasSize.height} rendering={preview.rendering} label={t('social.previewLabel')} overlay={overlay} height={320} />
          <Text variant="caption" tone="muted">
            {t('social.dragHint')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing(3) }} accessibilityRole="radiogroup">
            {SOCIAL_PRESETS.map((p) => (
              <SocialPresetCard key={p.id} preset={p} selected={!custom && preset.id === p.id} locked={p.premium && !isPremium} onPress={() => choosePreset(p)} />
            ))}
          </ScrollView>
          <Card>
            <Row gap={2} wrap>
              <Chip label={t('social.fit.cover')} selected={fit === 'cover'} onPress={() => setFit('cover')} icon="scan-outline" />
              <Chip label={t('social.fit.contain')} selected={fit === 'contain'} onPress={() => setFit('contain')} icon="contract-outline" />
              <Chip label={t('social.custom')} selected={custom !== null} onPress={() => setCustom(custom ? null : { w: String(preset.size.width), h: String(preset.size.height) })} icon="create-outline" />
            </Row>
            {custom ? (
              <Row gap={3}>
                <TextField label={t('resize.width')} value={custom.w} onChangeText={(w) => setCustom({ ...custom, w: w.replace(/[^0-9]/g, '') })} keyboardType="number-pad" maxLength={4} />
                <TextField label={t('resize.height')} value={custom.h} onChangeText={(h) => setCustom({ ...custom, h: h.replace(/[^0-9]/g, '') })} keyboardType="number-pad" maxLength={4} />
              </Row>
            ) : null}
            <AdjustmentSlider label={t('social.zoom')} icon="search-outline" value={zoom} min={1} max={3} step={0.05} neutral={1} onChange={setZoom} format={(v) => `${v.toFixed(2)}×`} />
            {fit === 'contain' || zoom < 1.001 ? <ColorSwatches label={t('social.background')} value={background} onChange={setBackground} colors={BACKGROUND_SWATCHES} /> : null}
            <Text variant="caption" tone="muted">
              {t('social.output', { w: canvasSize.width, h: canvasSize.height })}
            </Text>
          </Card>
          <Card>
            <FormatSelector value={format} onChange={setFormat} />
          </Card>
          <PremiumGate source="social" reasons={reasons} />
        </>
      ) : null}
    </ToolScaffold>
  );
}

/** Drag the picture inside the frame; converted to the placement offset used by the export. */
function PanLayer({ frame, canvas, placement, offset, onOffset }: { frame: PreviewFrame; canvas: Size; placement: { x: number; y: number; width: number; height: number }; offset: { x: number; y: number }; onOffset: (o: { x: number; y: number }) => void }) {
  const { t } = useTranslation();
  const drag = useDrag({
    capture: () => offset,
    onMove: (dx, dy, start) => {
      const d = panToOffset(dx, dy, placement, canvas, frame.width / canvas.width);
      onOffset({ x: clamp(start.x + d.x, -1, 1), y: clamp(start.y + d.y, -1, 1) });
    },
  });
  return <View {...drag} accessibilityLabel={t('social.dragArea')} style={{ position: 'absolute', left: frame.x, top: frame.y, width: frame.width, height: frame.height }} />;
}
