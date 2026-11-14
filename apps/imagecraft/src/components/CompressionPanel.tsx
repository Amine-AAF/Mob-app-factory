import { Card, Icon, Row, Stack, Text, useTheme } from '@factory/design-system';
import { useTranslation } from 'react-i18next';

import { fmt } from '@/i18n';
import type { OutputFormat } from '@/types/image';
import type { SizeEstimate } from '@/utils/estimate';
import { savedRatio } from '@/utils/estimate';

import { AdjustmentSlider } from './AdjustmentSlider';

/**
 * Quality setting + honest size information: the ESTIMATED range before processing,
 * the exact size only after. PNG has no quality (lossless) and says so.
 */
export function CompressionPanel({
  format,
  quality,
  range,
  onQuality,
  originalBytes,
  estimate,
  estimating,
  premiumRange,
}: {
  format: OutputFormat;
  quality: number;
  range: [number, number];
  onQuality: (q: number) => void;
  originalBytes: number;
  estimate: SizeEstimate | null;
  estimating?: boolean;
  /** Shows a Premium hint when the full 1–100 range is locked. */
  premiumRange?: boolean;
}) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const saved = estimate ? savedRatio(originalBytes, estimate.bytes) : null;
  return (
    <Stack gap={3}>
      {format === 'png' ? (
        <Card tone="alt">
          <Row gap={2}>
            <Icon name="information-circle-outline" size={18} color={t.colors.textMuted} />
            <Text variant="bodySmall" tone="muted" style={{ flex: 1 }}>
              {tr('compress.pngLossless')}
            </Text>
          </Row>
        </Card>
      ) : (
        <AdjustmentSlider label={tr('compress.quality')} icon="speedometer-outline" value={quality} min={range[0]} max={range[1]} neutral={quality} onChange={onQuality} format={(v) => `${Math.round(v)} %`} testID="quality-slider" />
      )}
      {premiumRange ? (
        <Text variant="caption" tone="muted">
          {tr('compress.rangeHint', { min: range[0], max: range[1] })}
        </Text>
      ) : null}
      <Card testID="size-estimate">
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="bodySmall" tone="muted">
            {tr('compress.original')}
          </Text>
          <Text variant="subheading">{fmt.size(originalBytes)}</Text>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="bodySmall" tone="muted">
            {tr('compress.estimated')}
          </Text>
          <Text variant="subheading" tone="primary">
            {estimating || !estimate ? tr('compress.estimating') : tr('compress.estimateRange', { low: fmt.size(estimate.low), high: fmt.size(estimate.high) })}
          </Text>
        </Row>
        {saved !== null && !estimating ? (
          <Text variant="caption" tone={saved > 0 ? 'success' : 'warning'}>
            {saved > 0 ? tr('compress.estimatedSaving', { percent: fmt.percent(saved) }) : tr('compress.noGainExpected')}
          </Text>
        ) : null}
        <Text variant="caption" tone="subtle">
          {tr('compress.estimateDisclaimer')}
        </Text>
      </Card>
    </Stack>
  );
}
