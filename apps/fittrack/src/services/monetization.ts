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
 * Premium through the factory provider abstraction (RevenueCat over Google Play
 * Billing). Without EXPO_PUBLIC_REVENUECAT_ANDROID_KEY the app runs free: no fake
 * purchases, the paywall explains that the store is unavailable.
 *
 * RevenueCat setup: entitlement "premium" attached to the three products of the
 * manifest (monthly + annual subscriptions, lifetime non-consumable). Prices are
 * always the localized store prices, never the indicative ones of the manifest.
 */
let provider: SubscriptionProvider = createUnconfiguredProvider();
let unsubscribe: (() => void) | null = null;

export function subscriptionsConfigured(): boolean {
  return provider.isConfigured;
}

async function readCache(db: SqlDatabase): Promise<EntitlementState | null> {
  const r = await db.getFirstAsync<{ state: string }>('SELECT state FROM subscription_cache WHERE key = ?', ['entitlement']);
  return r ? fromJson<EntitlementState | null>(r.state, null) : null;
}

async function writeCache(db: SqlDatabase, value: EntitlementState): Promise<void> {
  await db.runAsync(
    'INSERT INTO subscription_cache (key, state, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET state = excluded.state, updated_at = excluded.updated_at',
    ['entitlement', toJson(value), clock.now().toISOString()],
  );
}

/** Applies a store answer (or null when offline) on top of the offline cache (7-day grace). */
async function apply(db: SqlDatabase, store: EntitlementState | null): Promise<EntitlementState> {
  const effective = resolveEntitlement(store, await readCache(db), clock.now());
  if (store) await writeCache(db, store);
  useSession.getState().setEntitlement(effective);
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
  try {
    const plans = await provider.getPlans();
    useSession.getState().setPlans(plans, plans.length > 0);
  } catch (e) {
    recordError(e, 'monetization_plans');
    useSession.getState().setPlans([], false);
  }
}

export async function purchase(db: SqlDatabase, planId: string): Promise<PurchaseOutcome> {
  track('purchase_started', { plan: planId });
  const outcome = await provider.purchase(planId);
  if (outcome.status === 'success') {
    await apply(db, outcome.state);
    if (outcome.state.isPremium) track('purchase_completed', { plan: planId });
  }
  return outcome;
}

export async function restore(db: SqlDatabase): Promise<EntitlementState | null> {
  const state = await provider.restore();
  if (!state) return null;
  return apply(db, state);
}

/** Used by "Delete all my data": store purchases are not affected (Restore brings them back). */
export function resetLocalEntitlement(): void {
  useSession.getState().setEntitlement(FREE_STATE);
}
