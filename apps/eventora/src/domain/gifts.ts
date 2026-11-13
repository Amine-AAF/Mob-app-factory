import { sumByCurrency, type CurrencyTotals } from './money';
import type { Gift, Vendor, VendorStatus } from './types';

/** Gifts & contributions, vendors pipeline. */

export interface GiftSummary {
  gifts: number;
  contributions: number;
  contributionTotals: CurrencyTotals;
  toThank: number;
  thanked: number;
}

export function giftSummary(gifts: readonly Gift[]): GiftSummary {
  const contributions = gifts.filter((g) => g.kind === 'contribution');
  return {
    gifts: gifts.filter((g) => g.kind === 'gift').length,
    contributions: contributions.length,
    contributionTotals: sumByCurrency(contributions.map((g) => ({ amountMinor: g.amountMinor, currency: g.currency }))),
    toThank: gifts.filter((g) => !g.thanked).length,
    thanked: gifts.filter((g) => g.thanked).length,
  };
}

export function validateGift(g: Pick<Gift, 'kind' | 'description' | 'contributor' | 'guestId' | 'amountMinor' | 'currency'>): string[] {
  const errors: string[] = [];
  if (!g.guestId && !g.contributor.trim()) errors.push('contributor');
  if (g.kind === 'gift' && !g.description.trim()) errors.push('description');
  if (g.kind === 'contribution' && g.amountMinor <= 0) errors.push('amount');
  if (g.kind === 'contribution' && !/^[A-Z]{3}$/.test(g.currency)) errors.push('currency');
  return errors;
}

const PIPELINE: readonly VendorStatus[] = ['to_contact', 'contacted', 'quoted', 'selected', 'contracted'];

export function nextVendorStatus(status: VendorStatus): VendorStatus | null {
  const i = PIPELINE.indexOf(status);
  return i >= 0 && i < PIPELINE.length - 1 ? (PIPELINE[i + 1] ?? null) : null;
}

export function vendorTotals(vendors: readonly Vendor[]): { committed: CurrencyTotals; quoted: CurrencyTotals; byStatus: Record<VendorStatus, number> } {
  const byStatus = { to_contact: 0, contacted: 0, quoted: 0, selected: 0, contracted: 0, cancelled: 0 } as Record<VendorStatus, number>;
  for (const v of vendors) byStatus[v.status]++;
  return {
    committed: sumByCurrency(vendors.filter((v) => v.status === 'contracted' || v.status === 'selected').map((v) => ({ amountMinor: v.amountMinor, currency: v.currency }))),
    quoted: sumByCurrency(vendors.filter((v) => v.status === 'quoted').map((v) => ({ amountMinor: v.amountMinor, currency: v.currency }))),
    byStatus,
  };
}

export function validateVendor(v: Pick<Vendor, 'name' | 'email' | 'website' | 'amountMinor'>): string[] {
  const errors: string[] = [];
  if (!v.name.trim()) errors.push('name');
  if (v.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) errors.push('email');
  if (v.website.trim() && !/^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(v.website.trim())) errors.push('website');
  if (v.amountMinor < 0) errors.push('amount');
  return errors;
}

/** Website as an openable URL (adds https:// when missing; refuses other schemes). */
export function websiteUrl(website: string): string | null {
  const w = website.trim();
  if (!w) return null;
  if (/^https?:\/\//i.test(w)) return w;
  if (/^[a-z][a-z0-9+.-]*:/i.test(w)) return null;
  return `https://${w}`;
}
