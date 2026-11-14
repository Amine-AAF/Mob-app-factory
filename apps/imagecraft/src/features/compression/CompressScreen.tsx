import { Button, Card, Chip, Row, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CompressionPanel } from '@/components/CompressionPanel';
import { LockMark, ToggleRow } from '@/components/controls';
import type { ExportedFile } from '@/components/ExportDialog';
import { FormatSelector } from '@/components/FormatSelector';
import { ImagePreview } from '@/components/ImagePreview';
import { PremiumGate } from '@/components/monetization';
import { ToolScaffold } from '@/components/ToolScaffold';
import { recordProject } from '@/features/projects/projectsService';
import { ensureExportAllowed, processAndExport } from '@/features/editor/exportFlow';
import { exportPixelCap, qualityRange, type PremiumReason } from '@/features/premium/gating';
import { useEstimate } from '@/hooks/useEstimate';
import { useJob } from '@/hooks/useJob';
import { useSingleSource } from '@/hooks/useSingleSource';
import { fmt } from '@/i18n';
import { percentBucket, track } from '@/services/analytics';
import { processingEnv } from '@/services/env';
import { onResultDone, onResultShown } from '@/services/finish';
import { extensionOf } from '@/services/files/formats';
import { outputFileName } from '@/services/files/naming';
import { exportResult } from '@/services/image/engine';
import { buildRecipe } from '@/services/image/recipe';
import { useIsPremium, useSession } from '@/store/session';
import { initialEditState, type OutputFormat } from '@/types/image';
import { savedRatio } from '@/utils/estimate';

import { compressToTarget } from './compress';

const TARGETS = [100_000, 250_000, 500_000, 1_000_000, 2_000_000];

/**
 * Real compression: JPEG / WebP with adjustable quality (PNG is lossless and offered for
 * completeness). Shows the original size, an ESTIMATED result before processing and the
 * exact result after. Target-size mode and the full quality range are Premium.
 */
export default function CompressScreen() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const prefs = useSession((s) => s.preferences);
  const { source, choose, busy, error } = useSingleSource('compress');
  const [format, setFormat] = useState<OutputFormat>(prefs.defaultFormat === 'png' ? 'jpeg' : prefs.defaultFormat);
  const [quality, setQuality] = useState(75);
  const [useTarget, setUseTarget] = useState(false);
  const [target, setTarget] = useState(500_000);
  const [result, setResult] = useState<{ file: ExportedFile; note: string | null } | null>(null);
  const job = useJob<{ file: ExportedFile }>('compress');
  const [qMin, qMax] = qualityRange(isPremium);
  const q = Math.min(qMax, Math.max(qMin, quality));
  const targetMode = useTarget && format !== 'png';
  const reasons: PremiumReason[] = targetMode ? ['target_size'] : [];

  const built = source ? buildRecipe(source, initialEditState(), { outputUri: '', encode: { format, quality: q, flattenBackground: '#FFFFFF' }, maxOutputPixels: exportPixelCap(isPremium) }) : null;
  const { estimate, estimating } = useEstimate(source, targetMode ? null : (built?.recipe ?? null));

  const run = async () => {
    if (!source || !built) return;
    const value = await job.run(async (j, progress) => {
      if (!targetMode) {
        return processAndExport({ job: j, recipe: built.recipe, source, suffix: 'compressed', kind: 'compress', operations: ['compress'], premiumReasons: reasons, progress });
      }
      await ensureExportAllowed(reasons);
      const env = processingEnv();
      const r = await compressToTarget(env, j, built.recipe, source, target, progress);
      const file = await exportResult(env, j, r.result, outputFileName(source.name, 'compressed', extensionOf(format)));
      await recordProject({ kind: 'compress', output: file, operations: ['compress'], inputBytes: source.bytes, source: { uri: source.uri, name: source.name } });
      return { file, reached: r.reached, quality: r.quality };
    });
    if (value) {
      const reached = 'reached' in value ? (value as { reached: boolean }).reached : true;
      track('image_compressed', { format, quality: q, saved_percent: percentBucket(savedRatio(source.bytes, value.file.bytes)), target_size: targetMode });
      setResult({ file: value.file, note: reached ? null : t('compress.targetNotReached', { size: fmt.size(target) }) });
      void onResultShown();
    }
  };

  return (
    <ToolScaffold
      tool="compress"
      source={source}
      onChoose={() => void choose()}
      choosing={busy}
      importError={error}
      actionLabel={t('tools.compress.action')}
      onAction={() => void run()}
      actionDisabled={!built}
      job={job.state}
      onCancel={job.cancel}
      onRetry={() => void run()}
      result={result && source ? { files: [result.file], inputBytes: source.bytes } : null}
      notice={result?.note ?? (result && result.file.bytes >= (source?.bytes ?? 0) ? t('compress.noGainResult') : null)}
      onDone={() => {
        setResult(null);
        job.reset();
        void onResultDone();
      }}
      footer={<Button variant="ghost" icon="layers-outline" label={t('compress.batchLink')} onPress={() => router.push('/tools/batch')} />}
    >
      {source ? (
        <>
          <ImagePreview uri={result?.file.uri ?? source.uri} originalUri={result ? source.uri : null} aspect={source.width / source.height} label={t('editor.previewLabel')} height={240} />
          <Card>
            <FormatSelector value={format} onChange={setFormat} hasAlpha={source.hasAlpha} />
          </Card>
          <Card>
            <CompressionPanel
              format={format}
              quality={q}
              range={[qMin, qMax]}
              onQuality={(v) => setQuality(Math.round(v))}
              originalBytes={source.bytes}
              estimate={targetMode ? null : estimate}
              estimating={!targetMode && estimating}
              premiumRange={!isPremium}
            />
            {format !== 'png' ? (
              <>
                <Row gap={2}>
                  <LockMark />
                  <Text variant="label" tone="muted">
                    {t('compress.targetTitle')}
                  </Text>
                </Row>
                <ToggleRow label={t('compress.useTarget')} hint={t('compress.targetHint')} value={useTarget} onChange={setUseTarget} testID="target-toggle" />
                {useTarget ? (
                  <Row gap={2} wrap>
                    {TARGETS.map((b) => (
                      <Chip key={b} label={fmt.size(b)} selected={target === b} onPress={() => setTarget(b)} />
                    ))}
                  </Row>
                ) : null}
              </>
            ) : null}
          </Card>
          <PremiumGate source="compress_target" reasons={reasons} />
        </>
      ) : null}
    </ToolScaffold>
  );
}
