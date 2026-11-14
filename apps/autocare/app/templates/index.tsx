import { Card, Screen, SectionHeader, Text, type IconName } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { InfoNote, ItemRow } from '@/components/ui';
import { templatesByGroup } from '@/features/templates/data';

export default function Templates() {
  const { t } = useTranslation();
  return (
    <>
      <RouterStack.Screen options={{ title: t('templates.title') }} />
      <Screen edges={[]}>
        <Text tone="muted">{t('templates.intro')}</Text>
        <InfoNote icon="alert-circle-outline" text={t('templates.disclaimer')} />
        {templatesByGroup().map(({ group, templates }) => (
          <Card key={group}>
            <SectionHeader title={t(`templates.groups.${group}`)} />
            {templates.map((tpl) => (
              <ItemRow
                key={tpl.id}
                icon={tpl.icon as IconName}
                title={t(`templates.items.${tpl.id}.name`)}
                subtitle={`${t(`templates.items.${tpl.id}.desc`)} · ${t('templates.count', { count: tpl.items.length })}`}
                onPress={() => router.push(`/templates/${tpl.id}`)}
              />
            ))}
          </Card>
        ))}
      </Screen>
    </>
  );
}
