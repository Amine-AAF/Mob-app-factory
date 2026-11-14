import { Badge, Button, Card, Icon, Row, Screen, SectionHeader, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { ToggleRow } from '@/components/forms';
import { Notice, PremiumCard, ScreenTitle } from '@/components/ui';
import { exportUserData } from '@/services/backupService';
import { exportReport } from '@/features/exporter';
import { useSnapshot } from '@/hooks/useData';
import type { CsvKind } from '@/reports/csv';
import type { ReportKind } from '@/reports/html';
import { shareJson } from '@/services/sharing';
import { repos } from '@/database';
import { useIsPremium } from '@/store/session';

const REPORTS: { kind: ReportKind; icon: IconName; csv?: CsvKind }[] = [
  { kind: 'final', icon: 'ribbon' },
  { kind: 'guests', icon: 'people', csv: 'guests' },
  { kind: 'rsvp', icon: 'checkmark-done' },
  { kind: 'budget', icon: 'pie-chart' },
  { kind: 'expenses', icon: 'receipt', csv: 'expenses' },
  { kind: 'tasks', icon: 'checkbox', csv: 'tasks' },
  { kind: 'timeline', icon: 'time', csv: 'timeline' },
  { kind: 'vendors', icon: 'storefront', csv: 'vendors' },
  { kind: 'seating', icon: 'grid', csv: 'seating' },
  { kind: 'gifts', icon: 'gift', csv: 'gifts' },
];

/** Professional PDF / CSV exports (Premium) and the free JSON backup. */
export default function Reports() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: snap } = useSnapshot(id);
  const [contacts, setContacts] = useState(false);
  if (!snap) return null;

  const backup = async () => {
    const { json, fileName } = await exportUserData(repos().db);
    const outcome = await shareJson(json, fileName, t('settings.backup'));
    if (outcome !== 'shared') Alert.alert(t('share.failed'));
  };

  return (
    <Screen edges={[]}>
      <ScreenTitle title={t('modules.reports')} />
      {!isPremium ? <PremiumCard feature="advancedReports" source="reports" /> : null}
      <Card>
        <ToggleRow label={t('reports.includeContacts')} hint={t('reports.includeContactsHint')} value={contacts} onChange={setContacts} />
      </Card>
      {contacts ? <Notice tone="warning" icon="lock-open-outline">{t('reports.contactsWarning')}</Notice> : null}
      <Stack gap={2}>
        {REPORTS.map((r) => (
          <Card key={r.kind}>
            <Row gap={3}>
              <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primarySoft }}>
                <Icon name={r.icon} size={20} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="subheading">{t(`reports.kinds.${r.kind}`)}</Text>
                <Text variant="caption" tone="muted">
                  {t(`reports.desc.${r.kind}`)}
                </Text>
              </View>
              {!isPremium ? <Badge label="Premium" tone="accent" icon="diamond" /> : null}
            </Row>
            <Row gap={2}>
              <Button size="md" variant="secondary" icon="document-outline" label="PDF" onPress={() => void exportReport({ t, snap, kind: r.kind, format: 'pdf', includeContacts: contacts, isPremium })} />
              {r.csv ? <Button size="md" variant="secondary" icon="grid-outline" label="CSV" onPress={() => void exportReport({ t, snap, kind: r.csv!, format: 'csv', includeContacts: contacts, isPremium })} /> : null}
            </Row>
          </Card>
        ))}
      </Stack>
      <SectionHeader title={t('settings.backup')} />
      <Card>
        <Text variant="bodySmall" tone="muted">
          {t('reports.backupHint')}
        </Text>
        <Button size="md" variant="secondary" icon="cloud-download-outline" label={t('settings.exportJson')} onPress={() => void backup()} />
      </Card>
    </Screen>
  );
}
