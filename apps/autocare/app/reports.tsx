import { Button, Card, Row, Screen, Stack, Text } from '@factory/design-system';
import { Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { DateField, InfoNote, PremiumGate, VehicleChooser } from '@/components/ui';
import { loadVehicleBundle, repos } from '@/database';
import { hasFeature } from '@/features/premium/limits';
import { buildCsv, buildReport, REPORT_KINDS, type CsvKind, type ReportKind } from '@/features/reports/build';
import { renderPdf } from '@/features/reports/pdf';
import { useAsync, useFormat, useToday } from '@/hooks';
import { pickVehicleId } from '@/hooks/data';
import { recordError, track } from '@/services/analytics';
import { shareTemporary } from '@/services/fileStore';
import { useIsPremium } from '@/store/session';
import { isValidDay } from '@/utils/dates';

/** PDF and CSV generated on the device, shared through the Android share sheet. */
export default function Reports() {
  const { t } = useTranslation();
  const f = useFormat();
  const today = useToday();
  const premium = useIsPremium();
  const { data: vehicles } = useAsync(() => repos().vehicles.list({ includeArchived: true }), []);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const vId = vehicleId ?? pickVehicleId(vehicles);
  const [from, setFrom] = useState(`${today.slice(0, 4)}-01-01`);
  const [to, setTo] = useState(today);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!hasFeature(premium, 'reports')) {
    return (
      <Screen edges={[]}>
        <RouterStack.Screen options={{ title: t('reports.title') }} />
        <Text tone="muted">{t('reports.intro')}</Text>
        <PremiumGate reason="reports" />
        <InfoNote text={t('paywall.freeKeeps')} />
      </Screen>
    );
  }

  const valid = isValidDay(from) && isValidDay(to) && from <= to && !!vId;

  const run = async (key: string, task: (input: NonNullable<Awaited<ReturnType<typeof loadVehicleBundle>>>) => Promise<void>) => {
    if (!valid || !vId) return;
    setBusy(key);
    setMessage(null);
    try {
      const bundle = await loadVehicleBundle(repos(), vId);
      if (!bundle) return;
      await task(bundle);
      setMessage(t('reports.done'));
    } catch (e) {
      recordError(e, 'report_export');
      setMessage(t('common.error'));
    } finally {
      setBusy(null);
    }
  };

  const slug = (s: string) => s.normalize('NFD').replace(/[^\w-]+/g, '-').replace(/-+/g, '-').toLowerCase().slice(0, 30) || 'vehicle';

  const exportPdf = (kind: ReportKind) =>
    run(`pdf-${kind}`, async (b) => {
      const blocks = buildReport(kind, b, { from, to }, t, f, today);
      const pdf = renderPdf(blocks, { footer: (p, n) => `AutoCare · ${b.vehicle.name} · ${p}/${n}` });
      await shareTemporary(`autocare-${slug(b.vehicle.name)}-${kind}-${from}_${to}.pdf`, pdf, 'application/pdf', t(`reports.kinds.${kind}`));
      track('report_exported', { format: 'pdf' });
    });

  const exportCsv = (kind: CsvKind) =>
    run(`csv-${kind}`, async (b) => {
      const csv = buildCsv(kind, b, { from, to }, t);
      await shareTemporary(`autocare-${slug(b.vehicle.name)}-${kind}-${from}_${to}.csv`, csv, 'text/csv', t(`reports.csvKinds.${kind}`));
      track('report_exported', { format: 'csv' });
    });

  return (
    <>
      <RouterStack.Screen options={{ title: t('reports.title') }} />
      <Screen edges={[]}>
        <Text tone="muted">{t('reports.intro')}</Text>
        <VehicleChooser vehicles={vehicles ?? []} value={vId} onChange={(v) => v && setVehicleId(v)} />
        <Row gap={2} style={{ alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <DateField label={t('reports.from')} value={from} onChange={setFrom} />
          </View>
          <View style={{ flex: 1 }}>
            <DateField label={t('reports.to')} value={to} onChange={setTo} />
          </View>
        </Row>
        <Row gap={2} wrap>
          {[0, 1, 2].map((i) => {
            const y = Number(today.slice(0, 4)) - i;
            return (
              <Button
                key={y}
                label={String(y)}
                size="md"
                variant={from === `${y}-01-01` && (to === `${y}-12-31` || (i === 0 && to === today)) ? 'primary' : 'secondary'}
                onPress={() => {
                  setFrom(`${y}-01-01`);
                  setTo(i === 0 ? today : `${y}-12-31`);
                }}
              />
            );
          })}
        </Row>
        <Card>
          <Text variant="subheading">{t('reports.pdf')}</Text>
          <Stack gap={2}>
            {REPORT_KINDS.map((k) => (
              <Button key={k} label={t(`reports.kinds.${k}`)} icon="document-text-outline" variant="secondary" size="md" disabled={!valid} loading={busy === `pdf-${k}`} onPress={() => void exportPdf(k)} testID={`pdf-${k}`} />
            ))}
          </Stack>
        </Card>
        <Card>
          <Text variant="subheading">{t('reports.csv')}</Text>
          <Stack gap={2}>
            {(['costs', 'fuel', 'maintenance'] as const).map((k) => (
              <Button key={k} label={t(`reports.csvKinds.${k}`)} icon="grid-outline" variant="secondary" size="md" disabled={!valid} loading={busy === `csv-${k}`} onPress={() => void exportCsv(k)} />
            ))}
          </Stack>
        </Card>
        {message ? (
          <Text variant="bodySmall" tone="primary" accessibilityLiveRegion="polite">
            {message}
          </Text>
        ) : null}
        <InfoNote icon="lock-closed-outline" text={t('documents.privacy')} />
      </Screen>
    </>
  );
}
