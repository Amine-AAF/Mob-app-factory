import {
  createUnconfiguredProvider,
  FREE_STATE,
  resolveEntitlement,
  type EntitlementState,
  type PurchaseOutcome,
  type SubscriptionProvider,
} from '@factory/monetization';

import manifest from '../../app.manifest.json';
import type { Repositories } from '@/database';
import { useSession } from '@/store/session';

import { recordError, track } from './analytics';
import { clock } from './clock';

/**
 * Premium orchestration on top of @factory/monetization (RevenueCat adapter).
 * The SDK is loaded only when EXPO_PUBLIC_REVENUECAT_ANDROID_KEY is set. Without a key
 * FilePilot runs as a free app: no simulated purchase, the paywall says the store is
 * unavailable. Prices always come from the store (localized), never from the manifest.
 */
let provider: SubscriptionProvider = createUnconfiguredProvider();
let unsubscribe: (() => void) | null = null;

export function subscriptionsConfigured(): boolean {
  return provider.isConfigured;
}

async function apply(repos: Repositories, store: EntitlementState | null): Promise<EntitlementState> {
  const effective = resolveEntitlement(store, await repos.subscription.read(), clock.now());
  if (store) await repos.subscription.write(store, clock.now().toISOString());
  useSession.getState().set({ entitlement: effective });
  return effective;
}

export async function initMonetization(repos: Repositories, override?: SubscriptionProvider): Promise<void> {
  const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
  const subs = manifest.monetization.subscriptions;
  if (override) provider = override;
  else if (apiKey && subs) {
    // Lazy require keeps the SDK out of the start-up path and out of unit tests.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createRevenueCatProvider } = require('@factory/monetization/src/revenuecat') as typeof import('@factory/monetization/src/revenuecat');
    provider = createRevenueCatProvider({ apiKey, entitlementId: subs.entitlementId, offeringId: subs.offeringId });
  }

  // Offline-first: the cached (still valid) entitlement applies immediately.
  await apply(repos, null);
  if (!provider.isConfigured) return;
  try {
    await provider.initialize();
    unsubscribe?.();
    unsubscribe = provider.onChange((s) => void apply(repos, s).catch((e) => recordError(e, 'entitlement_change')));
    await apply(repos, await provider.fetchEntitlement());
    const plans = await provider.getPlans();
    useSession.getState().set({ plans, storeAvailable: plans.length > 0 });
  } catch (e) {
    recordError(e, 'monetization_init');
  }
}

export async function loadPlans(): Promise<void> {
  if (!provider.isConfigured) {
    useSession.getState().set({ plans: [], storeAvailable: false });
    return;
  }
  const plans = await provider.getPlans();
  useSession.getState().set({ plans, storeAvailable: plans.length > 0 });
}

export async function purchase(repos: Repositories, planId: string): Promise<PurchaseOutcome> {
  const outcome = await provider.purchase(planId);
  if (outcome.status === 'success') {
    await apply(repos, outcome.state);
    if (outcome.state.isPremium) track('subscription_started', { plan: planId });
  }
  return outcome;
}

export async function restore(repos: Repositories): Promise<EntitlementState | null> {
  const state = await provider.restore();
  if (!state) return null;
  return apply(repos, state);
}

/** "Delete all data": clears the local cache only; the store subscription itself is unaffected. */
export async function resetLocalEntitlement(repos: Repositories): Promise<void> {
  await repos.subscription.clear();
  useSession.getState().set({ entitlement: FREE_STATE });
}
