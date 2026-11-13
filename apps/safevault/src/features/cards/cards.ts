import type { CardBrand } from '@/vault/types';

/**
 * Payment-card helpers. SafeVault stores cardholder, card name, number and expiry only.
 * It deliberately has NO field for CVV/CVC or PIN (PCI DSS forbids storing them, and a
 * stolen phone + vault would otherwise be enough to pay).
 */

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/** Luhn checksum — used to warn about typos, never to block saving. */
export function luhnValid(number: string): boolean {
  const d = digitsOnly(number);
  if (d.length < 12 || d.length > 19) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

export function detectBrand(number: string): CardBrand {
  const d = digitsOnly(number);
  if (/^4/.test(d)) return 'visa';
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(d)) return 'mastercard';
  if (/^3[47]/.test(d)) return 'amex';
  if (/^3(0[0-5]|[689])/.test(d)) return 'diners';
  if (/^(6011|65|64[4-9])/.test(d)) return 'discover';
  if (/^35(2[89]|[3-8])/.test(d)) return 'jcb';
  if (/^62/.test(d)) return 'unionpay';
  if (/^(5[06-9]|6\d)/.test(d)) return 'maestro';
  return 'other';
}

/** Groups digits for display ("4111 1111 1111 1111", Amex "3782 822463 10005"). */
export function formatCardNumber(number: string): string {
  const d = digitsOnly(number).slice(0, 19);
  if (detectBrand(d) === 'amex') return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean).join(' ');
  return d.replace(/(.{4})/g, '$1 ').trim();
}

/** Masked representation for lists: only the last four digits. */
export function maskCard(last4: string): string {
  return `•••• ${last4 || '••••'}`;
}

export function last4Of(number: string): string {
  return digitsOnly(number).slice(-4);
}

/** Normalises user input to "MM/YY"; returns '' if invalid. */
export function normalizeExpiry(input: string): string {
  const d = digitsOnly(input);
  if (d.length !== 4 && d.length !== 6) return '';
  const mm = Number(d.slice(0, 2));
  const yy = d.length === 6 ? d.slice(4, 6) : d.slice(2, 4);
  if (mm < 1 || mm > 12) return '';
  return `${String(mm).padStart(2, '0')}/${yy}`;
}

/** Expired after the last day of the expiry month. */
export function isExpired(expiry: string, now: Date): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!m) return false;
  const end = new Date(2000 + Number(m[2]), Number(m[1]), 1); // first day of the following month
  return now.getTime() >= end.getTime();
}

/** Heuristic: refuse note content that looks like a CVV / PIN label followed by digits. */
export function looksLikeCvvOrPin(text: string): boolean {
  return /\b(cvv2?|cvc2?|cid|csc|pin)\b\s*[:=#-]?\s*\d{3,6}\b/i.test(text);
}
