import { Badge, Button, Screen, Stack } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { PremiumLock } from '@/components/media';
import { ItemRow, ScreenHeader } from '@/components/ui';
import { HOME_TYPE_ICONS } from '@/config/icons';
import { canCreate } from '@/config/limits';
import { usePreferences } from '@/store/preferences';
import { useIsPremium, useSession } from '@/store/session';

export default function Homes() {
  const { t } = useTranslation();
  const homes = useSession((s) => s.homes);
  const activeId = usePreferences((s) => s.activeHomeId);
  const set = usePreferences((s) => s.set);
  const isPremium = useIsPremium();
  const allowed = canCreate('homes', homes.length, isPremium);

  return (
    <Screen>
      <ScreenHeader title={t('homes.title')} subtitle={t('homes.subtitle')} back />
      <Stack gap={2}>
        {homes.map((h) => (
          <ItemRow
            key={h.id}
            icon={HOME_TYPE_ICONS[h.type]}
            title={h.name}
            subtitle={`${t(`homeTypes.${h.type}`)} · ${h.currency}`}
            right={h.id === activeId ? <Badge label={t('homes.current')} tone="success" /> : undefined}
            onPress={() => {
              set({ activeHomeId: h.id });
              router.back();
            }}
          />
        ))}
      </Stack>
      {allowed ? (
        <Button label={t('homes.add')} icon="add" variant="secondary" onPress={() => router.push('/homes/edit')} />
      ) : (
        <PremiumLock feature="multiple_homes" message={t('limits.homes')} />
      )}
    </Screen>
  );
}
