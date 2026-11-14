import { Button, Card, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdjustmentSlider } from '@/components/AdjustmentSlider';
import { ColorSwatches } from '@/components/controls';
import type { ExportedFile } from '@/components/ExportDialog';
import { FormatSelector } from '@/components/FormatSelector';
import { ImagePreview } from '@/components/ImagePreview';
import { ToolScaffold } from '@/components/ToolScaffold';
import { processAndExport } from '@/features/editor/exportFlow';
import { exportPixelCap, qualityRange } from '@/features/premium/gating';
import { useJob } from '@/hooks/useJob';
import { useSingleSource } from '@/hooks/useSingleSource';
import { track } from '@/services/analytics';
import { onResultDone, onResultShown } from '@/services/finish';
import { hasQuality } from '@/services/files/formats';
import { buildRecipe } from '@/services/image/recipe';
import { useIsPremium } from '@/store/session';
import { initialEditState, type OutputFormat } from '@/types/image';

/**
 * Format conversion between the formats the pipeline really supports (JPEG, PNG, WebP).
 * Transparency: kept by PNG and WebP; JPEG has no alpha, so transparent areas are filled
 * with the chosen background colour (the user is told before converting).
 */
export default function ConvertScreen() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const { source, choose, busy, error } = useSingleSource('convert');
  const [format, setFormat] = useState<OutputFormat>(source?.format === 'png' ? 'jpeg' : 'png');
  const [quality, setQuality] = useState(90);
  const [background, setBackground] = useState('#FFFFFF');
  const [result, setResult] = useState<ExportedFile | null>(null);
  const job = useJob<{ file: ExportedFile }>('convert');
  const [qMin, qMax] = qualityRange(isPremium);
  const q = Math.min(qMax, Math.max(qMin, quality));

  const run = async () => {
    if (!source) return;
    const { recipe } = buildRecipe(source, initialEditState(), { outputUri: '', encode: { format, quality: q, flattenBackground: background }, maxOutputPixels: exportPixelCap(isPremium) });
    const value = await job.run((j, progress) => processAndExport({ job: j, recipe, source, suffix: '', kind: 'convert', operations: ['convert'], premiumReasons: [], progress }));
    if (value) {
      track('image_converted', { from: source.format, to: format });
      setResult(value.file);
      void onResultShown();
    }
  };

  return (
    <ToolScaffold
      tool="convert"
      source={source}
      onChoose={() => void choose()}
      choosing={busy}
      importError={error}
      actionLabel={t('tools.convert.action', { format: t(`format.names.${format}`) })}
      onAction={() => void run()}
      job={job.state}
      onCancel={job.cancel}
      onRetry={() => void run()}
      result={result && source ? { files: [result], inputBytes: source.bytes } : null}
      onDone={() => {
        setResult(null);
        job.reset();
        void onResultDone();
      }}
      footer={<Button variant="ghost" icon="layers-outline" label={t('convert.batchLink')} onPress={() => router.push('/tools/batch')} />}
    >
      {source ? (
        <>
          <ImagePreview uri={source.uri} aspect={source.width / source.height} label={t('editor.previewLabel')} height={220} />
          <Card>
            <Text variant="bodySmall" tone="muted">
              {t('convert.from', { format: t(`format.names.${source.format}`), alpha: source.hasAlpha ? t('convert.hasAlpha') : t('convert.noAlpha') })}
            </Text>
            <FormatSelector value={format} onChange={setFormat} hasAlpha={source.hasAlpha} />
            {hasQuality(format) ? (
              <AdjustmentSlider label={t('compress.quality')} value={q} min={qMin} max={qMax} neutral={q} onChange={(v) => setQuality(Math.round(v))} format={(v) => `${Math.round(v)} %`} />
            ) : null}
            {format === 'webp' && q >= 100 ? (
              <Text variant="caption" tone="muted">
                {t('convert.webpLossless')}
              </Text>
            ) : null}
            {format === 'jpeg' && source.hasAlpha ? <ColorSwatches label={t('convert.background')} value={background} onChange={setBackground} /> : null}
          </Card>
        </>
      ) : null}
    </ToolScaffold>
  );
}
