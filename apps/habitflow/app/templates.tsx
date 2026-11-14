import { Card, Chip, Icon, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { HabitIcon, PremiumTag } from '@/components/ui';
import { describeFrequencyKey } from '@/features/habits/schedule';
import { TEMPLATE_GROUPS, TEMPLATES, type TemplateGroup } from '@/features/templates/data';
import { useIsPremium } from '@/store/session';

/** Template library. Picking one opens the editor pre-filled, so it can be customized before saving. */
export default function TemplatesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const premium = useIsPremium();
  const [group, setGroup] = useState<TemplateGroup | 'all'>('all');
  const list = TEMPLATES.filter((tpl) => group === 'all' || tpl.group === group);

  return (
    <>
      <RouterStack.Screen options={{ title: t('templates.title') }} />
      <Screen edges={['bottom']}>
        <Text tone="muted">{t('templates.intro')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Chip label={t('templates.all')} selected={group === 'all'} onPress={() => setGroup('all')} />
          {TEMPLATE_GROUPS.map((g) => (
            <Chip key={g} label={t(`templates.groups.${g}`)} selected={group === g} onPress={() => setGroup(g)} />
          ))}
        </View>
        <Stack gap={2}>
          {list.map((tpl) => {
            const locked = !tpl.free && !premium;
            const f = describeFrequencyKey(tpl.frequency);
            return (
              <Card
                key={tpl.id}
                testID={`template-${tpl.id}`}
                accessibilityLabel={t(`templates.items.${tpl.id}.name`)}
                onPress={() => (locked ? router.push({ pathname: '/paywall', params: { source: 'templates' } }) : router.push({ pathname: '/habit/edit', params: { templateId: tpl.id } }))}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, opacity: locked ? 0.7 : 1 }}>
                  <HabitIcon icon={tpl.icon} color={tpl.color} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="subheading">{t(`templates.items.${tpl.id}.name`)}</Text>
                    <Text variant="caption" tone="muted" numberOfLines={2}>
                      {t(`templates.items.${tpl.id}.desc`)}
                    </Text>
                    <Text variant="caption" tone="subtle">
                      {t(f.key, f.params)}
                    </Text>
                  </View>
                  {locked ? <PremiumTag /> : <Icon name="add-circle-outline" size={24} color={theme.colors.primary} />}
                </View>
              </Card>
            );
          })}
        </Stack>
      </Screen>
    </>
  );
}
