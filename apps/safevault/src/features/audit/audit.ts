import { auditFingerprint } from '@/crypto/keys';
import { estimateStrength } from '@/features/generator/strength';
import type { LoginMeta, LoginSecret } from '@/vault/types';

/**
 * Local password hygiene audit. Runs entirely on the device; passwords are never sent anywhere.
 *
 *  - weak       : strength score ≤ 1 (strength.ts method)
 *  - reused     : same password on ≥ 2 logins, detected with keyed HMAC fingerprints held in
 *                 memory only (no plaintext copy, nothing persisted)
 *  - incomplete : no password, or neither username nor email
 *  - old        : password not changed for more than OLD_AFTER_DAYS
 *
 * It does NOT check whether a password appeared in a data breach: that requires an external
 * service, and SafeVault never sends passwords (or their hashes) off the device.
 */
export const OLD_AFTER_DAYS = 365;

export interface AuditInput {
  id: string;
  meta: LoginMeta;
  secret: LoginSecret;
}

export interface AuditReport {
  total: number;
  weak: string[];
  reusedGroups: string[][];
  incomplete: string[];
  old: string[];
  /** 0–100. 100 = no issue found by these local checks (not "perfectly secure"). */
  score: number;
  computedAt: number;
}

export function auditLogins(entries: AuditInput[], auditKey: Uint8Array, now: number): AuditReport {
  const weak: string[] = [];
  const incomplete: string[] = [];
  const old: string[] = [];
  const byFingerprint = new Map<string, string[]>();
  const cutoff = now - OLD_AFTER_DAYS * 86_400_000;

  for (const e of entries) {
    const pw = e.secret.password;
    if (!pw || (!e.meta.username.trim() && !e.meta.email.trim())) incomplete.push(e.id);
    if (!pw) continue;
    if (estimateStrength(pw).score <= 1) weak.push(e.id);
    if (e.secret.passwordUpdatedAt < cutoff) old.push(e.id);
    const fp = auditFingerprint(auditKey, pw);
    byFingerprint.set(fp, [...(byFingerprint.get(fp) ?? []), e.id]);
  }
  const reusedGroups = [...byFingerprint.values()].filter((ids) => ids.length > 1);
  const reusedCount = reusedGroups.reduce((n, g) => n + g.length, 0);

  const total = entries.length;
  let score = 100;
  if (total > 0) {
    const penalty = (weak.length * 1.0 + reusedCount * 0.8 + old.length * 0.3 + incomplete.length * 0.2) / total;
    score = Math.max(0, Math.round(100 - Math.min(1, penalty) * 100));
  }
  return { total, weak, reusedGroups, incomplete, old, score, computedAt: now };
}

export function issueCount(r: AuditReport): number {
  return new Set([...r.weak, ...r.reusedGroups.flat(), ...r.incomplete, ...r.old]).size;
}

export type HealthLevel = 'good' | 'fair' | 'poor' | 'empty';

export function healthLevel(r: AuditReport | null): HealthLevel {
  if (!r || r.total === 0) return 'empty';
  return r.score >= 80 ? 'good' : r.score >= 50 ? 'fair' : 'poor';
}
