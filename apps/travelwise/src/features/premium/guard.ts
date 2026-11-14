import { repos } from '@/database';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';
import { clock } from '@/utils/clock';

import { countActiveTrips } from '../trips/status';
import { canAddDocument, canCreateActiveTrip } from './limits';

/** Thrown when a free-tier limit is reached; the UI offers Premium (or a rewarded slot). */
export class PremiumLimitError extends Error {
  constructor(public readonly limit: 'active_trips' | 'documents') {
    super(`Free limit reached: ${limit}`);
    this.name = 'PremiumLimitError';
  }
}

export const isPremiumNow = () => useSession.getState().entitlement.isPremium;

export async function activeTripCount(): Promise<number> {
  return countActiveTrips(await repos().trips.list(), clock.today());
}

/** Enforced in the actions themselves, not only in the UI. */
export async function assertCanCreateActiveTrip(): Promise<void> {
  if (!canCreateActiveTrip(isPremiumNow(), await activeTripCount(), usePreferences.getState().bonusTripSlots)) throw new PremiumLimitError('active_trips');
}

export async function assertCanAddDocument(): Promise<void> {
  if (!canAddDocument(isPremiumNow(), await repos().documents.count())) throw new PremiumLimitError('documents');
}
