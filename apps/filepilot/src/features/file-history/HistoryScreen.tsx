import { Button, Card, Divider, EmptyState, Row, Screen, Text } from '@factory/design-system';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { AdBanner } from '@/components/monetization';
import { repos } from '@/database';
import type { FileOperation } from '@/database/repositories/operationsRepository';
import { recordError } from '@/services/analytics';
import { featureCap } from '@/services/quota';
import { clearHistory } from '@/services/settingsActions';
import { useIsPremium, useSession } from '@/store/session';

import { OperationRow } from './OperationRow';

const PAGE = 30;

export default function HistoryScreen() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const dataVersion = useSession((s) => s.dataVersion);
  const cap = featureCap(isPremium, 'historyEntries');
  const [ops, setOps] = useState<FileOperation[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(PAGE);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([repos().operations.list({ limit: Math.min(limit, cap) }), repos().operations.count()])
        .then(([list, count]) => {
          if (!active) return;
          setOps(list);
          setTotal(count);
        })
        .catch((e) => recordError(e, 'history_load'));
      return () => {
        active = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when data changes
    }, [dataVersion, limit, cap]),
  );

  const confirmClear = () =>
    Alert.alert(t('history.clearTitle'), t('history.clearBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('history.clearKeepFiles'), onPress: () => void clearHistory(false).catch((e) => recordError(e, 'clear_history')) },
      { text: t('history.clearWithFiles'), style: 'destructive', onPress: () => void clearHistory(true).catch((e) => recordError(e, 'clear_history_files')) },
    ]);

  const hiddenByPlan = !isPremium && total > cap;

  return (
    <Screen testID="history">
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="title" accessibilityRole="header">
          {t('history.title')}
        </Text>
        {ops.length ? <Button label={t('history.clear')} variant="ghost" size="md" icon="trash-outline" onPress={confirmClear} /> : null}
      </Row>
      <Text variant="bodySmall" tone="muted">
        {t('history.privacyNote')}
      </Text>
      {ops.length === 0 ? (
        <EmptyState icon="time-outline" title={t('history.emptyTitle')} message={t('history.emptyBody')} action={<Button label={t('history.openTools')} onPress={() => router.push('/(tabs)')} size="md" />} />
      ) : (
        <Card style={{ paddingVertical: 4 }}>
          {ops.map((op, i) => (
            <View key={op.id}>
              {i > 0 ? <Divider /> : null}
              <OperationRow op={op} />
            </View>
          ))}
        </Card>
      )}
      {hiddenByPlan ? (
        <Card tone="primary" onPress={() => router.push({ pathname: '/paywall', params: { source: 'history' } })} accessibilityLabel={t('history.premiumMore', { count: total - cap })}>
          <Text variant="bodySmall">{t('history.premiumMore', { count: total - cap })}</Text>
        </Card>
      ) : null}
      {!hiddenByPlan && ops.length < Math.min(total, cap) ? <Button label={t('history.loadMore')} variant="secondary" onPress={() => setLimit((l) => l + PAGE)} /> : null}
      <AdBanner />
    </Screen>
  );
}
