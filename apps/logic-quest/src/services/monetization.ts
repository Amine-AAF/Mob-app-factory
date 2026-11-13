import {
  createUnconfiguredProvider,
  FREE_STATE,
  resolveEntitlement,
  type EntitlementState,
  type PurchaseOutcome,
  type SubscriptionProvider,
} from '@factory/monetization';
import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

import manifest from '../../app.manifest.json';
import { useSession } from '@/store/session';

import { recordError, track } from './analytics';
import { clock } from './clock';

/**
 * Subscriptions + one-time ad removal, through the factory provider abstraction
 * (RevenueCat over Google Play Billing). Without EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
 * the app runs free: no fake purchases, the paywall explains the store is unavailable.
 *
 * RevenueCat setup: entitlement "premium" (monthly + annual subscriptions) and
 * entitlement "no_ads" (non-consumable "logicquest_remove_ads", lifetime package).
 */
export const AD_FREE_ENTITLEMENT = 'no_ads';

let provider: SubscriptionProvider = createUnconfiguredProvider();
let unsubscribe: (() => void) | null = null;

export function subscriptionsConfigured(): boolean {
  return provider.isConfigured;
}

async function readCache<T>(db: SqlDatabase, key: string, fallback: T): Promise<T> {
  const r = await db.getFirstAsync<{ state: string }>('SELECT state FROM subscription_cache WHERE key = ?', [key]);
  return r ? fromJson<T>(r.state, fallback) : fallback;
}

async function writeCache(db: SqlDatabase, key: string, value: unknown): Promise<void> {
  await db.runAsync(
    'INSERT INTO subscription_cache (key, state, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET state = excluded.state, updated_at = excluded.updated_at',
    [key, toJson(value), clock.now().toISOString()],
  );
}

/** Applies a store answer (or null when offline) on top of the offline cache. */
async function apply(db: SqlDatabase, store: EntitlementState | null): Promise<EntitlementState> {
  const effective = resolveEntitlement(store, await readCache<EntitlementState | null>(db, 'entitlement', null), clock.now());
  if (store) {
    await writeCache(db, 'entitlement', store);
    // Ad removal is a non-consumable: once confirmed by the store it is trusted offline.
    await writeCache(db, 'ads_removed', (store.activeEntitlements ?? []).includes(AD_FREE_ENTITLEMENT));
  }
  useSession.getState().setEntitlement(effective);
  useSession.getState().setAdsRemoved(await readCache<boolean>(db, 'ads_removed', false));
  return effective;
}

export async function initMonetization(db: SqlDatabase, override?: SubscriptionProvider): Promise<void> {
  const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
  const subs = manifest.monetization.subscriptions;
  if (override) provider = override;
  else if (apiKey && subs) {
    // Lazy require keeps the SDK out of the start-up path and out of unit tests.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createRevenueCatProvider } = require('@factory/monetization/src/revenuecat') as typeof import('@factory/monetization/src/revenuecat');
    provider = createRevenueCatProvider({ apiKey, entitlementId: subs.entitlementId, offeringId: subs.offeringId });
  }

  // Offline-first: apply the cached state immediately, then refresh from the store.
  await apply(db, null);
  if (!provider.isConfigured) return;
  try {
    await provider.initialize();
    unsubscribe?.();
    unsubscribe = provider.onChange((s) => void apply(db, s));
    await apply(db, await provider.fetchEntitlement());
    const plans = await provider.getPlans();
    useSession.getState().setPlans(plans, plans.length > 0);
  } catch (e) {
    recordError(e, 'monetization_init');
  }
}

export async function loadPlans(): Promise<void> {
  if (!provider.isConfigured) {
    useSession.getState().setPlans([], false);
    return;
  }
  const plans = await provider.getPlans();
  useSession.getState().setPlans(plans, plans.length > 0);
}

export async function purchase(db: SqlDatabase, planId: string): Promise<PurchaseOutcome> {
  const outcome = await provider.purchase(planId);
  if (outcome.status === 'success') {
    await apply(db, outcome.state);
    if (outcome.state.isPremium || (outcome.state.activeEntitlements ?? []).includes(AD_FREE_ENTITLEMENT)) track('subscription_started', { plan: planId });
  }
  return outcome;
}

export async function restore(db: SqlDatabase): Promise<EntitlementState | null> {
  const state = await provider.restore();
  if (!state) return null;
  return apply(db, state);
}

/** Used by "Delete all my data": the store purchases themselves are not affected (Restore brings them back). */
export function resetLocalEntitlement(): void {
  useSession.getState().setEntitlement(FREE_STATE);
  useSession.getState().setAdsRemoved(false);
}
