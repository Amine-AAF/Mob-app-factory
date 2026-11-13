import Purchases, {
  type CustomerInfo,
  type PurchasesPackage,
  PACKAGE_TYPE,
  PURCHASES_ERROR_CODE,
} from 'react-native-purchases';

import type { EntitlementState, PlanOption, PurchaseOutcome, SubscriptionProvider } from './entitlements';

export interface RevenueCatOptions {
  apiKey: string;
  entitlementId: string;
  offeringId?: string;
  now?: () => Date;
}

export function mapCustomerInfo(info: CustomerInfo, entitlementId: string, now: Date): EntitlementState {
  const ent = info.entitlements.active[entitlementId];
  return {
    isPremium: Boolean(ent?.isActive),
    expiresAt: ent?.expirationDate ?? null,
    productId: ent?.productIdentifier ?? null,
    willRenew: Boolean(ent?.willRenew),
    verifiedAt: now.toISOString(),
    source: 'store',
    activeEntitlements: Object.keys(info.entitlements.active),
  };
}

function mapPackage(pkg: PurchasesPackage): PlanOption {
  const period =
    pkg.packageType === PACKAGE_TYPE.MONTHLY
      ? 'monthly'
      : pkg.packageType === PACKAGE_TYPE.ANNUAL
        ? 'annual'
        : pkg.packageType === PACKAGE_TYPE.LIFETIME
          ? 'lifetime'
          : 'unknown';
  const plan: PlanOption = {
    id: pkg.identifier,
    period,
    priceString: pkg.product.priceString,
    price: pkg.product.price,
    currencyCode: pkg.product.currencyCode,
    hasFreeTrial: Boolean(pkg.product.introPrice && pkg.product.introPrice.price === 0),
  };
  if (period === 'annual' && pkg.product.pricePerMonthString) plan.pricePerMonthString = pkg.product.pricePerMonthString;
  return plan;
}

/** RevenueCat implementation of SubscriptionProvider (Google Play Billing underneath). */
export function createRevenueCatProvider(opts: RevenueCatOptions): SubscriptionProvider {
  const now = opts.now ?? (() => new Date());
  let configured = false;
  let packages: PurchasesPackage[] = [];

  return {
    name: 'revenuecat',
    isConfigured: true,
    async initialize() {
      if (configured) return;
      Purchases.configure({ apiKey: opts.apiKey });
      configured = true;
    },
    async fetchEntitlement() {
      try {
        return mapCustomerInfo(await Purchases.getCustomerInfo(), opts.entitlementId, now());
      } catch {
        return null;
      }
    },
    async getPlans() {
      try {
        const offerings = await Purchases.getOfferings();
        const offering = (opts.offeringId && offerings.all[opts.offeringId]) || offerings.current;
        packages = offering?.availablePackages ?? [];
        return packages.map(mapPackage);
      } catch {
        return [];
      }
    },
    async purchase(planId): Promise<PurchaseOutcome> {
      const pkg = packages.find((p) => p.identifier === planId);
      if (!pkg) return { status: 'error', message: 'plan_not_found' };
      try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        return { status: 'success', state: mapCustomerInfo(customerInfo, opts.entitlementId, now()) };
      } catch (e) {
        const err = e as { userCancelled?: boolean; code?: string; message?: string };
        if (err.userCancelled || err.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return { status: 'cancelled' };
        if (err.code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) return { status: 'pending' };
        return { status: 'error', message: err.message ?? 'purchase_failed' };
      }
    },
    async restore() {
      try {
        return mapCustomerInfo(await Purchases.restorePurchases(), opts.entitlementId, now());
      } catch {
        return null;
      }
    },
    onChange(listener) {
      const cb = (info: CustomerInfo) => listener(mapCustomerInfo(info, opts.entitlementId, now()));
      Purchases.addCustomerInfoUpdateListener(cb);
      return () => Purchases.removeCustomerInfoUpdateListener(cb);
    },
  };
}
