/**
 * Pure entitlement logic: no SDK imports, fully unit-testable.
 */

export type EntitlementSource = 'store' | 'cache' | 'none';

export interface EntitlementState {
  isPremium: boolean;
  /** ISO date; null for lifetime or unknown. */
  expiresAt: string | null;
  productId: string | null;
  willRenew: boolean;
  /** When the store last confirmed this state (ISO). */
  verifiedAt: string | null;
  source: EntitlementSource;
  /**
   * Every active entitlement id reported by the store (e.g. "premium", "no_ads").
   * Optional: lets an app sell secondary products such as a one-time ad removal.
   */
  activeEntitlements?: string[];
}

export const FREE_STATE: EntitlementState = {
  isPremium: false,
  expiresAt: null,
  productId: null,
  willRenew: false,
  verifiedAt: null,
  source: 'none',
};

/** How long a cached premium state is trusted while offline. */
export const OFFLINE_GRACE_DAYS = 7;

/**
 * Resolves the effective state from the store result (may be unavailable
 * offline) and the locally cached state.
 *
 * Rules:
 * - A fresh store answer always wins.
 * - Offline, a cached premium state is honoured until its expiry date, and
 *   for at most OFFLINE_GRACE_DAYS after the last verification.
 */
export function resolveEntitlement(
  storeState: EntitlementState | null,
  cached: EntitlementState | null,
  now: Date,
): EntitlementState {
  if (storeState) return { ...storeState, source: 'store' };
  if (!cached || !cached.isPremium) return FREE_STATE;

  if (cached.expiresAt && new Date(cached.expiresAt).getTime() <= now.getTime()) return FREE_STATE;
  if (!cached.verifiedAt) return FREE_STATE;
  const ageDays = (now.getTime() - new Date(cached.verifiedAt).getTime()) / 86_400_000;
  if (ageDays > OFFLINE_GRACE_DAYS) return FREE_STATE;

  return { ...cached, source: 'cache' };
}

export interface PlanOption {
  id: string;
  period: 'monthly' | 'annual' | 'lifetime' | 'unknown';
  /** Localized price string from the store, e.g. "3,99 €". Never hard-coded. */
  priceString: string;
  /** Price per month as a localized string for annual plans, when computable. */
  pricePerMonthString?: string;
  /** Numeric price in the store currency (for computing savings only). */
  price: number;
  currencyCode: string;
  hasFreeTrial: boolean;
}

/** Percentage saved by the annual plan vs. 12 monthly payments. */
export function annualSavingsPercent(plans: PlanOption[]): number | null {
  const monthly = plans.find((p) => p.period === 'monthly');
  const annual = plans.find((p) => p.period === 'annual');
  if (!monthly || !annual || monthly.price <= 0 || monthly.currencyCode !== annual.currencyCode) return null;
  const saving = 1 - annual.price / (monthly.price * 12);
  return saving > 0 ? Math.round(saving * 100) : null;
}

export type PurchaseOutcome =
  | { status: 'success'; state: EntitlementState }
  | { status: 'cancelled' }
  | { status: 'pending' }
  | { status: 'error'; message: string };

/** The contract every subscription backend implements. */
export interface SubscriptionProvider {
  readonly name: string;
  readonly isConfigured: boolean;
  initialize(): Promise<void>;
  /** Returns null if the store can't be reached. */
  fetchEntitlement(): Promise<EntitlementState | null>;
  getPlans(): Promise<PlanOption[]>;
  purchase(planId: string): Promise<PurchaseOutcome>;
  restore(): Promise<EntitlementState | null>;
  onChange(listener: (state: EntitlementState) => void): () => void;
}

/**
 * Used when no store key is configured (local dev, CI, open-source builds).
 * It never grants premium and never fakes a purchase.
 */
export function createUnconfiguredProvider(): SubscriptionProvider {
  return {
    name: 'unconfigured',
    isConfigured: false,
    initialize: async () => undefined,
    fetchEntitlement: async () => null,
    getPlans: async () => [],
    purchase: async () => ({ status: 'error', message: 'store_not_configured' }),
    restore: async () => null,
    onChange: () => () => undefined,
  };
}
