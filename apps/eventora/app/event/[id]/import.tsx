import { Button, Card, Row, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ToggleRow } from '@/components/forms';
import { limitAlert, Notice, ScreenTitle } from '@/components/ui';
import { canAddGuests } from '@/config/limits';
import { GUEST_CSV_TEMPLATE, importGuestsCsv, type GuestImportResult } from '@/domain/csv';
import { findDuplicates, fullName } from '@/domain/guests';
import { mutate, useSnapshot } from '@/hooks/useData';
import { track } from '@/services/analytics';
import { pickTextFile, shareCsv } from '@/services/sharing';
import { useIsPremium } from '@/store/session';

/**
 * CSV guest import. The file is read locally after the user picks it; nothing
 * is uploaded. The device address book is never accessed.
 */
export default function ImportGuests() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: snap } = useSnapshot(id);
  const [file, setFile] = useState<string | null>(null);
  const [result, setResult] = useState<GuestImportResult | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [busy, setBusy] = useState(false);

  const pick = async () => {
    try {
      const f = await pickTextFile('csv');
      if (!f) return;
      setFile(f.name);
      setResult(importGuestsCsv(f.text));
    } catch (e) {
      Alert.alert(t('import.readError'), e instanceof Error && e.message === 'file_too_large' ? t('import.tooLarge') : undefined);
    }
  };

  const existing = snap?.guests ?? [];
  const rows = result?.guests ?? [];
  const dupRows = rows.filter((r) => findDuplicates({ ...r.guest }, existing).length > 0);
  const toImport = skipDuplicates ? rows.filter((r) => !dupRows.includes(r)) : rows;

  const run = async () => {
    const check = canAddGuests(isPremium, existing.length, toImport.length);
    if (!check.allowed) return limitAlert(t, check.feature, check.limit, 'csv_import');
    setBusy(true);
    try {
      const n = await mutate((r) => r.guests.importMany(id, toImport));
      track('guests_imported', { count: n });
      Alert.alert(t('import.done', { count: n }));
      router.back();
    } catch {
      Alert.alert(t('errors.saveFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={[]} footer={result && !result.unrecognized ? <Button label={t('import.importN', { count: toImport.length })} onPress={run} loading={busy} disabled={toImport.length === 0} /> : null}>
      <ScreenTitle title={t('guests.import')} />
      <Notice icon="lock-closed" title={t('import.privacyTitle')}>
        {t('import.privacyBody')}
      </Notice>
      <Text tone="muted">{t('import.howTo')}</Text>
      <Row gap={2} wrap>
        <Button size="md" icon="folder-open-outline" label={t('import.pick')} onPress={pick} testID="import-pick" />
        <Button size="md" variant="secondary" icon="download-outline" label={t('import.template')} onPress={() => void shareCsv(`﻿${GUEST_CSV_TEMPLATE}`, 'eventora-guests-template')} />
      </Row>

      {result ? (
        <Stack gap={3}>
          <Text variant="caption" tone="subtle">
            {file}
          </Text>
          {result.unrecognized ? (
            <Notice tone="danger" icon="alert-circle" title={t('import.unrecognizedTitle')}>
              {t('import.unrecognizedBody')}
            </Notice>
          ) : (
            <>
              <Card tone="alt">
                <Text>{t('import.summary', { valid: rows.length, total: result.totalRows })}</Text>
                {dupRows.length ? <Text tone="warning">{t('import.duplicates', { count: dupRows.length })}</Text> : null}
              </Card>
              {dupRows.length ? <ToggleRow label={t('import.skipDuplicates')} value={skipDuplicates} onChange={setSkipDuplicates} /> : null}
              {result.issues.length ? (
                <>
                  <SectionHeader title={t('import.issues', { count: result.issues.length })} />
                  <Card>
                    {result.issues.slice(0, 30).map((i) => (
                      <Text key={`${i.row}-${i.code}`} variant="bodySmall" tone="muted">
                        {t('import.issueLine', { row: i.row, issue: t(`import.issue.${i.code}`) })}
                      </Text>
                    ))}
                  </Card>
                </>
              ) : null}
              <SectionHeader title={t('import.preview')} />
              <Card>
                {toImport.slice(0, 15).map((r) => (
                  <Text key={r.row} variant="bodySmall">
                    {`${fullName(r.guest)}${r.groupName ? ` · ${r.groupName}` : ''}${r.guest.plusOnes + r.guest.children ? ` · +${r.guest.plusOnes + r.guest.children}` : ''} · ${t(`rsvp.${r.guest.rsvpStatus}`)}`}
                  </Text>
                ))}
                {toImport.length > 15 ? <Text variant="caption" tone="subtle">{t('import.andMore', { count: toImport.length - 15 })}</Text> : null}
              </Card>
            </>
          )}
        </Stack>
      ) : null}
    </Screen>
  );
}
