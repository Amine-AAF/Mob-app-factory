import { Chip, Row, Stack, Text } from '@factory/design-system';
import { useTranslation } from 'react-i18next';

import { OUTPUT_FORMATS, type OutputFormat } from '@/types/image';

/**
 * Output format choice. Only formats the pipeline really encodes are offered (JPEG, PNG, WebP).
 * The hint states honestly what each format does with quality and transparency.
 */
export function FormatSelector({ value, onChange, hasAlpha, testID }: { value: OutputFormat; onChange: (f: OutputFormat) => void; hasAlpha?: boolean; testID?: string }) {
  const { t } = useTranslation();
  return (
    <Stack gap={2} testID={testID}>
      <Text variant="label" tone="muted">
        {t('format.title')}
      </Text>
      <Row gap={2} wrap accessibilityRole="radiogroup">
        {OUTPUT_FORMATS.map((f) => (
          <Chip key={f} label={t(`format.names.${f}`)} selected={value === f} onPress={() => onChange(f)} testID={`format-${f}`} />
        ))}
      </Row>
      <Text variant="caption" tone="muted">
        {t(`format.hints.${value}`)}
      </Text>
      {hasAlpha && value === 'jpeg' ? (
        <Text variant="caption" tone="warning" accessibilityLiveRegion="polite">
          {t('format.jpegTransparency')}
        </Text>
      ) : null}
    </Stack>
  );
}
