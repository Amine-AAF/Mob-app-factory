import { useEffect, useState } from 'react';

import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

/**
 * Advanced tool features (detailed amortization, comparisons, prepayment, savings table):
 * unlocked by Premium, or temporarily by a rewarded ad. Re-evaluated every 30 s so a
 * temporary unlock expires on screen.
 */
export function useAdvancedAccess(): { unlocked: boolean; premium: boolean; temporaryUntil: number | null } {
  const premium = useIsPremium();
  const until = usePreferences((s) => s.rewardedUnlockUntil);
  const [now, setNow] = useState(() => clock.now().getTime());
  useEffect(() => {
    const id = setInterval(() => setNow(clock.now().getTime()), 30_000);
    return () => clearInterval(id);
  }, []);
  const temporary = !premium && until > now;
  return { unlocked: premium || temporary, premium, temporaryUntil: temporary ? until : null };
}
