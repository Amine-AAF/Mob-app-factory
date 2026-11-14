import { Alert } from 'react-native';

import { confirmDelete } from '@/components/forms';
import { repos } from '@/database';
import type { OutfitSchedule } from '@/domain/types';
import { recordError } from '@/services/analytics';
import { afterWrite } from '@/services/data';

type T = (k: string) => string;

/** Logs (or un-logs) the planned outfit as worn on the plan's date. */
export async function togglePlanWorn(t: T, plan: OutfitSchedule): Promise<void> {
  try {
    if (plan.wornLogged) await repos().schedules.unmarkWorn(plan.id);
    else await repos().schedules.markWorn(plan.id);
    afterWrite({ notifications: true });
  } catch (e) {
    recordError(e, 'plan_toggle_worn');
    Alert.alert(t('common.error'));
  }
}

export function deletePlan(t: T, plan: OutfitSchedule, onDone?: () => void): void {
  confirmDelete(
    t,
    () => {
      repos()
        .schedules.remove(plan.id)
        .then(() => {
          afterWrite({ notifications: true });
          onDone?.();
        })
        .catch((e) => {
          recordError(e, 'plan_delete');
          Alert.alert(t('common.error'));
        });
    },
    t('calendar.plan.deleteTitle'),
    t('calendar.plan.deleteMessage'),
  );
}
