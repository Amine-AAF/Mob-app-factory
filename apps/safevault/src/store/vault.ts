import { create } from 'zustand';

import type { AuditReport } from '@/features/audit/audit';
import { canCreate, historyLimit } from '@/features/monetization/plan';
import { biometricAvailability, enrollBiometric, readBiometricKey, removeBiometricKey } from '@/services/biometric';
import { clearClipboardNow } from '@/services/clipboard';
import { vaultService } from '@/services/context';
import { logEvent } from '@/services/log';
import type { Category, EntryType, ItemInput, VaultItem } from '@/vault/types';
import type { UnlockResult, VaultInfo } from '@/vault/vaultService';

import { useApp } from './app';

/**
 * React-facing mirror of the vault service. Holds only *summaries* (no passwords, note bodies
 * or card numbers) and the last audit report while unlocked; everything is dropped on lock.
 * Keys themselves never enter this store.
 */
export type VaultStatus = 'loading' | 'none' | 'locked' | 'unlocked';

interface VaultState {
  status: VaultStatus;
  items: VaultItem[];
  categories: Category[];
  corrupted: string[];
  info: VaultInfo | null;
  audit: AuditReport | null;
  auditRunning: boolean;
  sync: () => void;
  setStatus: (s: VaultStatus) => void;
}

export const useVault = create<VaultState>((set) => ({
  status: 'loading',
  items: [],
  categories: [],
  corrupted: [],
  info: null,
  audit: null,
  auditRunning: false,
  sync: () => {
    const v = vaultService();
    const unlocked = v.isUnlocked();
    set((s) => ({
      items: unlocked ? v.items() : [],
      categories: unlocked ? v.categories() : [],
      corrupted: unlocked ? v.corruptedIds() : [],
      audit: null, // any change invalidates the audit
      status: unlocked ? 'unlocked' : s.status === 'unlocked' ? 'locked' : s.status,
    }));
  },
  setStatus: (status) => set({ status }),
}));

let unsubscribe: (() => void) | null = null;

export async function initVaultStore(): Promise<void> {
  const v = vaultService();
  unsubscribe?.();
  unsubscribe = v.subscribe(() => useVault.getState().sync());
  const exists = await v.exists();
  useVault.setState({ status: exists ? 'locked' : 'none', info: await v.info() });
}

async function refreshInfo() {
  useVault.setState({ info: await vaultService().info() });
}

export async function createVault(password: string, profile?: Parameters<ReturnType<typeof vaultService>['create']>[1]) {
  await vaultService().create(password, profile);
  await refreshInfo();
  useVault.setState({ status: 'unlocked' });
}

export async function unlockWithPassword(password: string): Promise<UnlockResult> {
  const r = await vaultService().unlock(password);
  if (r.status === 'ok') {
    await refreshInfo();
    useVault.setState({ status: 'unlocked' });
  }
  return r;
}

export type BiometricResult = 'ok' | 'cancelled' | 'invalidated' | 'unavailable';

export async function unlockWithBiometrics(prompt: string): Promise<BiometricResult> {
  const info = await vaultService().info();
  if (!info?.biometricEnabled) return 'unavailable';
  if ((await biometricAvailability()) !== 'available') return 'unavailable';
  const r = await readBiometricKey(info.vaultId, prompt);
  if (r.status === 'cancelled') return 'cancelled';
  if (r.status === 'invalidated') {
    await disableBiometrics();
    return 'invalidated';
  }
  try {
    await vaultService().unlockWithVaultKey(r.vaultKey);
  } catch (e) {
    logEvent('biometric_unlock_failed', e);
    await disableBiometrics();
    return 'invalidated';
  }
  useVault.setState({ status: 'unlocked' });
  return 'ok';
}

export async function enableBiometrics(prompt: string): Promise<boolean> {
  const v = vaultService();
  const info = await v.info();
  if (!info || (await biometricAvailability()) !== 'available') return false;
  try {
    await enrollBiometric(info.vaultId, v.exportVaultKeyCopy(), prompt);
    await v.setBiometricEnabled(true);
  } catch (e) {
    logEvent('biometric_enroll_failed', e);
    await removeBiometricKey(info.vaultId);
    return false;
  }
  await refreshInfo();
  return true;
}

export async function disableBiometrics(): Promise<void> {
  const v = vaultService();
  const info = await v.info();
  if (info) await removeBiometricKey(info.vaultId);
  await v.setBiometricEnabled(false);
  await refreshInfo();
}

export function lockVault(): void {
  void clearClipboardNow();
  vaultService().lock();
  useVault.setState({ status: 'locked', items: [], categories: [], corrupted: [], audit: null });
}

export async function saveItem<K extends EntryType>(input: ItemInput<K>): Promise<VaultItem | 'limit'> {
  const premium = useApp.getState().entitlement.isPremium;
  if (!input.id && !canCreate(input.type, vaultService().items(), premium)) return 'limit';
  return vaultService().saveItem(input, { historyLimit: historyLimit(premium) });
}

export async function toggleFavorite(id: string): Promise<void> {
  const item = vaultService().item(id);
  if (item) await vaultService().patchMeta(id, { favorite: !item.meta.favorite });
}

export async function markViewed(id: string): Promise<void> {
  await vaultService().patchMeta(id, { lastViewedAt: Date.now() });
}

/** Local audit (see features/audit). The report is kept in memory until the next change/lock. */
export async function runAudit(): Promise<AuditReport> {
  useVault.setState({ auditRunning: true });
  try {
    const report = await vaultService().audit();
    useVault.setState({ audit: report });
    return report;
  } finally {
    useVault.setState({ auditRunning: false });
  }
}

export async function destroyVault(): Promise<void> {
  const v = vaultService();
  const info = await v.info();
  if (info) await removeBiometricKey(info.vaultId);
  await clearClipboardNow();
  await v.destroy();
  useVault.setState({ status: 'none', items: [], categories: [], corrupted: [], info: null, audit: null });
}
