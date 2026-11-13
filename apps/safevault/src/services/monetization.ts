import { createUnconfiguredProvider, resolveEntitlement, type EntitlementState, type PurchaseOutcome, type SubscriptionProvider } from '@factory/monetization';
import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

import manifest from '../../app.manifest.json';
import { useApp } from '@/store/app';

import { logEvent } from './log';

/**
 * Google Play Billing through RevenueCat (via @factory/monetization). Only purchase data
 * goes to the store — never vault content. Without EXPO_PUBLIC_REVENUECAT_ANDROID_KEY the
 * app runs on the free plan and never fakes a purchase.
 */
let provider: SubscriptionProvider = createUnconfiguredProvider();
let unsubscribe: (() => void) | null = null;

async function readCache(db: SqlDatabase): Promise<EntitlementState | null> {
  const r = await db.getFirstAsync<{ state: string }>('SELECT state FROM subscription_cache WHERE id = 1', []);
  return r ? fromJson<EntitlementState | null>(r.state, null) : null;
}

async function writeCache(db: SqlDatabase, state: EntitlementState): Promise<void> {
  await db.runAsync(
    'INSERT INTO subscription_cache (id, state, updated_at) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET state = excluded.state, updated_at = excluded.updated_at',
    [toJson(state), new Date().toISOString()],
  );
}

async function apply(db: SqlDatabase, store: EntitlementState | null): Promise<EntitlementState> {
  const effective = resolveEntitlement(store, await readCache(db), new Date());
  if (store) await writeCache(db, store);
  useApp.getState().setEntitlement(effective);
  return effective;
}

export function subscriptionsConfigured(): boolean {
  return provider.isConfigured;
}

export async function initMonetization(db: SqlDatabase, override?: SubscriptionProvider): Promise<void> {
  const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
  const subs = manifest.monetization.subscriptions;
  if (override) provider = override;
  else if (apiKey && subs) {
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
    useApp.getState().setPlans(plans, plans.length > 0);
  } catch (e) {
    logEvent('monetization_init_failed', e);
  }
}

export async function loadPlans(): Promise<void> {
  if (!provider.isConfigured) return useApp.getState().setPlans([], false);
  const plans = await provider.getPlans();
  useApp.getState().setPlans(plans, plans.length > 0);
}

export async function purchase(db: SqlDatabase, planId: string): Promise<PurchaseOutcome> {
  const outcome = await provider.purchase(planId);
  if (outcome.status === 'success') await apply(db, outcome.state);
  return outcome;
}

export async function restorePurchases(db: SqlDatabase): Promise<EntitlementState | null> {
  const state = await provider.restore();
  return state ? apply(db, state) : null;
}
