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
 * Subscription orchestration (same pattern as DevSpeak). The RevenueCat SDK is only loaded
 * when EXPO_PUBLIC_REVENUECAT_ANDROID_KEY is set. Without it the app runs as a free app:
 * no fake purchase, the paywall says the store is unavailable. Prices always come from Google Play.
 */
let provider: SubscriptionProvider = createUnconfiguredProvider();
let unsubscribe: (() => void) | null = null;

export function subscriptionsConfigured(): boolean {
  return provider.isConfigured;
}

async function readCache(db: SqlDatabase): Promise<EntitlementState | null> {
  const r = await db.getFirstAsync<{ state: string }>('SELECT state FROM subscription_cache WHERE id = 1', []);
  return r ? fromJson<EntitlementState | null>(r.state, null) : null;
}

async function writeCache(db: SqlDatabase, state: EntitlementState): Promise<void> {
  await db.runAsync(
    'INSERT INTO subscription_cache (id, state, updated_at) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET state = excluded.state, updated_at = excluded.updated_at',
    [toJson(state), clock.now().toISOString()],
  );
}

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

export function resetLocalEntitlement(): void {
  useSession.getState().setEntitlement(FREE_STATE);
}
