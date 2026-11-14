import { shouldShowBanner, shouldShowInterstitial } from '@factory/monetization';
import fs from 'node:fs';
import path from 'node:path';

import manifest from '../../app.manifest.json';
import { batchCap, editPremiumReasons, exportDecision, exportPixelCap, qualityRange, unlockStatus } from '@/features/premium/gating';
import { isSafeValue, percentBucket, sizeBucket } from '@/services/analytics';
import { initialEditState, NEUTRAL_ADJUSTMENTS } from '@/types/image';

const usage = (rewardedUnlocks: number, unlocksUsed: number) => ({ day: '2026-11-13', rewardedUnlocks, unlocksUsed });

describe('free vs premium', () => {
  it('detects Premium items in an edit', () => {
    expect(editPremiumReasons(initialEditState())).toEqual([]);
    expect(editPremiumReasons({ ...initialEditState(), filterId: 'vivid' })).toEqual([]);
    expect(editPremiumReasons({ ...initialEditState(), filterId: 'noir' })).toEqual(['filter']);
    expect(editPremiumReasons({ ...initialEditState(), adjustments: { ...NEUTRAL_ADJUSTMENTS, vignette: 20 } })).toEqual(['advanced_adjustment']);
    expect(editPremiumReasons({ ...initialEditState(), adjustments: { ...NEUTRAL_ADJUSTMENTS, brightness: 20 } })).toEqual([]);
  });

  it('lets free users export Premium items only with an unlocked export', () => {
    expect(exportDecision(false, [], usage(0, 0))).toBe('allowed');
    expect(exportDecision(false, ['filter'], usage(0, 0))).toBe('premium_required');
    expect(exportDecision(false, ['filter'], usage(1, 0))).toBe('use_unlock');
    expect(exportDecision(false, ['filter'], usage(1, 1))).toBe('premium_required');
    expect(exportDecision(true, ['filter', 'watermark'], usage(0, 0))).toBe('allowed');
    expect(unlockStatus(usage(3, 1))).toEqual({ available: 2, canEarn: false });
  });

  it('uses plan caps for export resolution, batch size and quality range', () => {
    expect(exportPixelCap(true)).toBeGreaterThan(exportPixelCap(false));
    expect(batchCap(false)).toBe(3);
    expect(batchCap(true)).toBe(100);
    expect(qualityRange(true)).toEqual([1, 100]);
  });

  it('declares localized store plans; prices are only indicative and never shown', () => {
    const plans = manifest.monetization.subscriptions?.plans ?? [];
    expect(plans.map((p) => p.productId)).toEqual(['imagecraft_premium_monthly', 'imagecraft_premium_annual', 'imagecraft_premium_lifetime']);
    expect(plans.map((p) => p.indicativePriceUsd)).toEqual([2.99, 14.99, 24.99]);
    const paywall = fs.readFileSync(path.join(__dirname, '../features/premium/PaywallScreen.tsx'), 'utf8');
    expect(paywall).not.toMatch(/2\.99|14\.99|24\.99|indicativePrice/);
  });
});

describe('ads policy', () => {
  const base = { isPremium: false, consentObtained: true, sessionCount: 5, graceSessions: 1, screenAllowsAds: true };
  it('never shows banners to Premium users, without consent or while processing', () => {
    expect(shouldShowBanner(base)).toBe(true);
    expect(shouldShowBanner({ ...base, isPremium: true })).toBe(false);
    expect(shouldShowBanner({ ...base, consentObtained: false })).toBe(false);
    expect(shouldShowBanner({ ...base, screenAllowsAds: false })).toBe(false); // processing → idle() false
    expect(shouldShowBanner({ ...base, sessionCount: 1 })).toBe(false); // grace session
  });

  it('caps interstitials and allows them only at a natural break', () => {
    const i = { isPremium: false, consentObtained: true, sessionCount: 5, graceSessions: 1, atNaturalBreak: true, activitiesSinceLast: 3, msSinceLast: Infinity };
    expect(shouldShowInterstitial(i)).toBe(true);
    expect(shouldShowInterstitial({ ...i, atNaturalBreak: false })).toBe(false);
    expect(shouldShowInterstitial({ ...i, activitiesSinceLast: 1 })).toBe(false);
    expect(shouldShowInterstitial({ ...i, msSinceLast: 30_000 })).toBe(false);
  });

  it('places ads only on browsing screens, never on editor, tool, export or processing UI', () => {
    const root = path.join(__dirname, '..');
    const withBanner = ['features/home/HomeScreen.tsx', 'features/home/ToolsScreen.tsx', 'features/projects/ProjectsScreen.tsx'];
    const files: string[] = [];
    const walk = (d: string) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) {
          if (e.name !== '__tests__') walk(p);
        } else if (/\.tsx$/.test(e.name)) files.push(p);
      }
    };
    walk(root);
    const users = files.filter((f) => /<AdBanner\b/.test(fs.readFileSync(f, 'utf8'))).map((f) => path.relative(root, f).replace(/\\/g, '/'));
    expect(users.sort()).toEqual(withBanner.sort());
    const interstitialCallers = files.filter((f) => /maybeShowInterstitial\(/.test(fs.readFileSync(f, 'utf8')));
    expect(interstitialCallers).toEqual([]); // only services/finish.ts (after "Done") may call it
  });

  it('uses Google test ad units outside production builds', () => {
    const config = fs.readFileSync(path.join(__dirname, '../../app.config.ts'), 'utf8');
    expect(config).toContain('ca-app-pub-3940256099942544~3347511713');
    expect(config).toMatch(/isProd \? process\.env\.ADMOB_ANDROID_APP_ID/);
  });
});

describe('privacy', () => {
  it('analytics refuses anything that looks like a path, URI or file name', () => {
    expect(isSafeValue('jpeg')).toBe(true);
    expect(isSafeValue(42)).toBe(true);
    expect(isSafeValue('file:///data/user/0/x.jpg')).toBe(false);
    expect(isSafeValue('content://media/external/images/1')).toBe(false);
    expect(isSafeValue('IMG_2024.jpg')).toBe(false);
    expect(isSafeValue('/storage/emulated/0')).toBe(false);
    expect(sizeBucket(3_000_000)).toBe('lt_5mb');
    expect(percentBucket(0.437)).toBe(40);
  });

  it('never calls the network from app code (offline-first, no upload)', () => {
    const root = path.join(__dirname, '..');
    const offenders: string[] = [];
    const walk = (d: string) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) {
          if (e.name !== '__tests__') walk(p);
        } else if (/\.tsx?$/.test(e.name) && /\bfetch\(|XMLHttpRequest|axios|uploadAsync|\beval\(|new Function\(/.test(fs.readFileSync(p, 'utf8'))) offenders.push(p);
      }
    };
    walk(root);
    expect(offenders).toEqual([]);
  });

  it('requests no storage, media or camera permission', () => {
    const config = fs.readFileSync(path.join(__dirname, '../../app.config.ts'), 'utf8');
    for (const p of ['READ_MEDIA_IMAGES', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'CAMERA', 'RECORD_AUDIO']) expect(config).toContain(`android.permission.${p}`);
    expect(config).toMatch(/blockedPermissions/);
    expect(config).toMatch(/allowBackup: false/);
  });
});
