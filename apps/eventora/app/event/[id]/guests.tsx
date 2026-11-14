import { Screen } from '@factory/design-system';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ScreenTitle } from '@/components/ui';
import { GuestManager } from '@/features/GuestManager';

/** Guest manager of one event (no ads on this screen). */
export default function EventGuests() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen edges={[]}>
      <ScreenTitle title={t('modules.guests')} />
      <GuestManager eventId={id} />
    </Screen>
  );
}
