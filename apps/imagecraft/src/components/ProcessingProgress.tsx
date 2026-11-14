import { Button, Card, ProgressBar, Row, Text } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';

/** Progress of a running job with a Cancel button. No ad is ever shown while this is visible. */
export function ProcessingProgress({ done, total, onCancel, label }: { done: number; total: number; onCancel: () => void; label?: string }) {
  const { t } = useTranslation();
  const ratio = total > 0 ? done / total : 0;
  return (
    <Card testID="processing-progress">
      <Row style={{ justifyContent: 'space-between' }}>
        <Row gap={2}>
          <ActivityIndicator size="small" />
          <Text variant="subheading" accessibilityLiveRegion="polite">
            {label ?? t('processing.working')}
          </Text>
        </Row>
        {total > 1 ? (
          <Text variant="bodySmall" tone="muted">
            {t('processing.count', { done, total })}
          </Text>
        ) : null}
      </Row>
      <ProgressBar progress={total > 1 ? ratio : 0.5} label={t('processing.working')} />
      <Text variant="caption" tone="muted">
        {t('processing.local')}
      </Text>
      <Button label={t('common.cancel')} variant="secondary" size="md" icon="close" onPress={onCancel} testID="cancel-job" />
    </Card>
  );
}
