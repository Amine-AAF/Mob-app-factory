/** Plan kind from a store product id (e.g. "closetwise_premium_annual"). */
export function premiumPlanKind(productId: string | null | undefined): 'monthly' | 'annual' | 'lifetime' | null {
  const id = (productId ?? '').toLowerCase();
  if (id.includes('lifetime')) return 'lifetime';
  if (id.includes('annual') || id.includes('year')) return 'annual';
  if (id.includes('month')) return 'monthly';
  return null;
}
