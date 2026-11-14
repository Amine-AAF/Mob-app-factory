import { Badge, Card, Icon, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { useTranslation } from 'react-i18next';

import type { DocumentType } from '@/constants/domain';
import { expiryStatus } from '@/database/repositories/documents';
import { fmt } from '@/i18n';
import type { TravelDocument } from '@/types/models';

export const DOCUMENT_ICON: Record<DocumentType, IconName> = {
  passport: 'id-card-outline',
  visa: 'document-text-outline',
  flight_ticket: 'airplane-outline',
  hotel_confirmation: 'bed-outline',
  insurance: 'medkit-outline',
  train_ticket: 'train-outline',
  car_rental: 'car-outline',
  other: 'document-outline',
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${fmt.number(Math.round(bytes / 1024))} KB`;
  return `${fmt.number(Math.round((bytes / (1024 * 1024)) * 10) / 10)} MB`;
}

export function TravelDocumentCard({ doc, today, tripName, onPress }: { doc: TravelDocument; today: string; tripName?: string; onPress: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const expiry = expiryStatus(doc.expiresOn, today);
  return (
    <Card onPress={onPress} accessibilityLabel={`${t(`enums.documentType.${doc.type}`)}: ${doc.title}`} testID={`document-${doc.id}`}>
      <Row gap={3} style={{ alignItems: 'flex-start' }}>
        <Icon name={DOCUMENT_ICON[doc.type]} size={22} color={theme.colors.primary} />
        <Stack gap={1} style={{ flex: 1 }}>
          <Text variant="subheading" numberOfLines={1}>
            {doc.title}
          </Text>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {[t(`enums.documentType.${doc.type}`), doc.mimeType === 'application/pdf' ? 'PDF' : t('documents.image'), formatBytes(doc.sizeBytes), tripName].filter(Boolean).join(' · ')}
          </Text>
          <Row gap={2} wrap>
            {doc.expiresOn ? (
              <Badge
                label={expiry === 'expired' ? t('documents.expired', { date: fmt.date(doc.expiresOn) }) : t('documents.expires', { date: fmt.date(doc.expiresOn) })}
                tone={expiry === 'expired' ? 'danger' : expiry === 'soon' ? 'warning' : 'neutral'}
                icon="time-outline"
              />
            ) : null}
            <Badge label={t('documents.offline')} tone="success" icon="cloud-offline-outline" />
          </Row>
        </Stack>
      </Row>
    </Card>
  );
}
