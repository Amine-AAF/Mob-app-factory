import { Card, Chip, Row, Stack, Text } from '@factory/design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CompressionPanel } from '@/components/CompressionPanel';
import { TextField, ToggleRow } from '@/components/controls';
import type { ExportedFile } from '@/components/ExportDialog';
import { FormatSelector } from '@/components/FormatSelector';
import { ImagePreview } from '@/components/ImagePreview';
import { RESIZE_PRESETS } from '@/constants/tools';
import { processAndExport } from '@/features/editor/exportFlow';
import { exportPixelCap, qualityRange } from '@/features/premium/gating';
import { useEstimate } from '@/hooks/useEstimate';
import { useJob } from '@/hooks/useJob';
import { useSingleSource } from '@/hooks/useSingleSource';
import { fmt } from '@/i18n';
import { track } from '@/services/analytics';
import { onResultDone, onResultShown } from '@/services/finish';
import { buildRecipe } from '@/services/image/recipe';
import { useIsPremium, useSession } from '@/store/session';
import { initialEditState, type OutputFormat } from '@/types/image';
import { ToolScaffold } from '@/components/ToolScaffold';
import { megapixels } from '@/utils/format';
import { resolveResize, type ResizeRequest } from '@/utils/geometry';

type Mode = 'pixels' | 'percent' | 'preset';

/** Resize by pixels (ratio lock), percentage or preset long edge, with a size estimate. */
export default function ResizeScreen() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const prefs = useSession((s) => s.preferences);
  const { source, choose, busy, error } = useSingleSource('resize');
  const [mode, setMode] = useState<Mode>('percent');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [keepAspect, setKeepAspect] = useState(true);
  const [percent, setPercent] = useState(50);
  const [presetEdge, setPresetEdge] = useState(1920);
  const [format, setFormat] = useState<OutputFormat>(source?.format ?? prefs.defaultFormat);
  const [quality, setQuality] = useState(prefs.defaultQuality);
  const [result, setResult] = useState<ExportedFile | null>(null);
  const job = useJob<{ file: ExportedFile }>('resize');
  const [qMin, qMax] = qualityRange(isPremium);

  const request: ResizeRequest =
    mode === 'percent' ? { mode, percent } : mode === 'preset' ? { mode, longEdge: presetEdge } : { mode, width: Number(width) || null, height: Number(height) || null, keepAspect };
  const target = source ? resolveResize(source, request) : null;
  const cap = exportPixelCap(isPremium);
  const tooBig = target ? target.width * target.height > cap : false;

  // Cheap and pure: recomputed on each render; consumers key on the recipe's content.
  const built =
    source && target && !tooBig
      ? buildRecipe(source, initialEditState(), { outputUri: '', size: target, encode: { format, quality: Math.min(qMax, Math.max(qMin, quality)), flattenBackground: '#FFFFFF' }, maxOutputPixels: cap })
      : null;
  const { estimate, estimating } = useEstimate(source, built?.recipe ?? null);

  const run = async () => {
    if (!source || !built) return;
    const value = await job.run((j, progress) =>
      processAndExport({ job: j, recipe: built.recipe, source, suffix: `${built.output.width}x${built.output.height}`, kind: 'resize', operations: ['resize'], premiumReasons: [], progress }),
    );
    if (value) {
      track('image_resized', { mode, format });
      setResult(value.file);
      void onResultShown();
    }
  };

  // Typing a width with the lock on fills the height (and vice versa).
  const aspect = source ? source.width / source.height : 1;
  const onWidth = (s: string) => {
    const v = s.replace(/[^0-9]/g, '');
    setWidth(v);
    if (keepAspect && v) setHeight(String(Math.max(1, Math.round(Number(v) / aspect))));
  };
  const onHeight = (s: string) => {
    const v = s.replace(/[^0-9]/g, '');
    setHeight(v);
    if (keepAspect && v) setWidth(String(Math.max(1, Math.round(Number(v) * aspect))));
  };

  return (
    <ToolScaffold
      tool="resize"
      source={source}
      onChoose={() => void choose()}
      choosing={busy}
      importError={error}
      actionLabel={t('tools.resize.action')}
      onAction={() => void run()}
      actionDisabled={!built}
      job={job.state}
      onCancel={job.cancel}
      onRetry={() => void run()}
      result={result && source ? { files: [result], inputBytes: source.bytes } : null}
      onDone={() => {
        setResult(null);
        job.reset();
        void onResultDone();
      }}
    >
      {source ? (
        <>
          <ImagePreview uri={source.uri} aspect={source.width / source.height} label={t('editor.previewLabel')} height={240} />
          <Card>
            <Row gap={2} wrap accessibilityRole="radiogroup">
              {(['percent', 'pixels', 'preset'] as Mode[]).map((m) => (
                <Chip key={m} label={t(`resize.modes.${m}`)} selected={mode === m} onPress={() => setMode(m)} testID={`resize-mode-${m}`} />
              ))}
            </Row>
            {mode === 'percent' ? (
              <Row gap={2} wrap>
                {[25, 50, 75, 150, 200].map((p) => (
                  <Chip key={p} label={`${p} %`} selected={percent === p} onPress={() => setPercent(p)} />
                ))}
              </Row>
            ) : null}
            {mode === 'pixels' ? (
              <Stack gap={2}>
                <Row gap={3}>
                  <TextField label={t('resize.width')} value={width} onChangeText={onWidth} keyboardType="number-pad" maxLength={5} placeholder={String(source.width)} testID="resize-width" />
                  <TextField label={t('resize.height')} value={height} onChangeText={onHeight} keyboardType="number-pad" maxLength={5} placeholder={String(source.height)} testID="resize-height" />
                </Row>
                <ToggleRow label={t('resize.keepAspect')} value={keepAspect} onChange={setKeepAspect} testID="keep-aspect" />
              </Stack>
            ) : null}
            {mode === 'preset' ? (
              <Row gap={2} wrap>
                {RESIZE_PRESETS.map((p) => (
                  <Chip key={p.id} label={`${t(`resize.presets.${p.id}`)} · ${p.longEdge}`} selected={presetEdge === p.longEdge} onPress={() => setPresetEdge(p.longEdge)} />
                ))}
              </Row>
            ) : null}
            <Text variant="bodySmall" tone={tooBig ? 'danger' : 'primary'} testID="resize-target">
              {target
                ? tooBig
                  ? t('resize.tooBig', { mp: megapixels(target.width, target.height) })
                  : t('resize.target', { from: fmt.dims(source.width, source.height), to: fmt.dims(target.width, target.height) })
                : t('resize.invalid')}
            </Text>
            {target && target.width > source.width ? (
              <Text variant="caption" tone="warning">
                {t('resize.upscaleWarning')}
              </Text>
            ) : null}
          </Card>
          <Card>
            <FormatSelector value={format} onChange={setFormat} hasAlpha={source.hasAlpha} />
            <CompressionPanel format={format} quality={Math.min(qMax, Math.max(qMin, quality))} range={[qMin, qMax]} onQuality={(q) => setQuality(Math.round(q))} originalBytes={source.bytes} estimate={estimate} estimating={estimating} />
          </Card>
        </>
      ) : null}
    </ToolScaffold>
  );
}
