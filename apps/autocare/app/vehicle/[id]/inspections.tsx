import { Button, Card, EmptyState, Screen } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ItemRow } from '@/components/ui';
import { repos } from '@/database';
import { templateById } from '@/features/templates/data';
import { useAsync, useFormat } from '@/hooks';
import { afterWrite } from '@/services/boot';

export default function VehicleInspections() {
  const { t } = useTranslation();
  const f = useFormat();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useAsync(() => repos().inspections.list(id), [id]);

  return (
    <>
      <RouterStack.Screen options={{ title: t('inspection.history') }} />
      <Screen edges={[]}>
        <Button label={t('templates.title')} icon="checkbox-outline" onPress={() => router.push('/templates')} />
        {data && data.length === 0 ? <EmptyState icon="checkbox-outline" title={t('inspection.empty')} /> : null}
        {data?.length ? (
          <Card>
            {data.map((i) => {
              const values = Object.values(i.results);
              const attention = values.filter((v) => v === 'attention').length;
              const tpl = templateById(i.templateId);
              return (
                <ItemRow
                  key={i.id}
                  icon={attention ? 'alert-circle-outline' : 'checkmark-circle-outline'}
                  tone={attention ? 'warning' : 'success'}
                  title={tpl ? t(`templates.items.${tpl.id}.name`) : i.templateId}
                  subtitle={[f.day(i.day), t('inspection.summary', { ok: values.filter((v) => v === 'ok').length, attention }), i.notes].filter(Boolean).join(' · ')}
                  onPress={() =>
                    Alert.alert(t('common.deleteConfirmTitle'), t('common.deleteConfirmBody'), [
                      { text: t('common.cancel'), style: 'cancel' },
                      {
                        text: t('common.delete'),
                        style: 'destructive',
                        onPress: async () => {
                          await repos().inspections.remove(i.id);
                          afterWrite();
                        },
                      },
                    ])
                  }
                />
              );
            })}
          </Card>
        ) : null}
      </Screen>
    </>
  );
}
