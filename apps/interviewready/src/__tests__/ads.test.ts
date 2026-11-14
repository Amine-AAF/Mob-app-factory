import { ADMOB_TEST_IDS } from '@factory/monetization';
import { createTestDatabase } from '@factory/testing';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

import { PremiumRequiredError } from '@/constants/limits';
import { initDatabase, setRepositories } from '@/database';
import { AD_SCREENS, BANNER_SCREENS, bannerAllowedOn, EXERCISE_SCREENS, grantBonusMock, MAX_BONUS_MOCKS_PER_DAY } from '@/features/ads/policy';
import { adUnits, bannerAllowed, countActivityForAds, grantRewardedMock, interstitialAllowed, markInterstitialShown, resetAdsStateForTests, rewardedAvailable } from '@/services/ads';
import { clock } from '@/services/clock';
import { finishQuiz } from '@/services/library';
import { createLearningPath, remainingFreeMocks } from '@/services/practice';
import { usePreferences } from '@/store/preferences';

const CONSENTED = { initialized: true, canRequestAds: true };
const AFTER_GRACE = 3; // manifest graceSessions = 2

describe('ad placement policy', () => {
  it('allows banners on browse screens only, never on exercise screens', () => {
    expect([...BANNER_SCREENS].sort()).toEqual(['explore', 'home', 'progress', 'questions']);
    for (const s of EXERCISE_SCREENS) expect(bannerAllowedOn(s)).toBe(false);
    for (const s of ['onboarding', 'paywall', 'mock-setup', 'mock-summary', 'builder', 'question'] as const) expect(bannerAllowedOn(s)).toBe(false);
    expect(AD_SCREENS).toEqual(expect.arrayContaining([...BANNER_SCREENS, ...EXERCISE_SCREENS]));
  });

  it('caps bonus mock interviews per day and resets them on a new day', () => {
    let bonus = grantBonusMock(null, '2026-11-14');
    expect(bonus).toEqual({ day: '2026-11-14', count: 1 });
    for (let i = 0; i < 5; i++) bonus = grantBonusMock(bonus, '2026-11-14');
    expect(bonus.count).toBe(MAX_BONUS_MOCKS_PER_DAY);
    expect(grantBonusMock(bonus, '2026-11-15')).toEqual({ day: '2026-11-15', count: 1 });
  });
});

describe('ads service', () => {
  beforeEach(async () => {
    clock.set(() => new Date('2026-11-14T10:00:00'));
    usePreferences.getState().reset();
    resetAdsStateForTests();
    setRepositories(await initDatabase(await createTestDatabase()));
  });
  afterEach(() => clock.set(null));

  it('uses Google test ad units outside production builds', () => {
    expect(adUnits).toMatchObject({ banner: ADMOB_TEST_IDS.banner, rewarded: ADMOB_TEST_IDS.rewarded, interstitial: ADMOB_TEST_IDS.interstitial, test: true });
  });

  it('shows no banner without consent, during the grace sessions, to Premium users or on exercise screens', () => {
    const base = { isPremium: false, sessionCount: AFTER_GRACE, screen: 'explore' as const };
    expect(bannerAllowed(base)).toBe(false); // consent not gathered yet
    resetAdsStateForTests(CONSENTED);
    expect(bannerAllowed(base)).toBe(true);
    expect(bannerAllowed({ ...base, sessionCount: 2 })).toBe(false);
    expect(bannerAllowed({ ...base, isPremium: true })).toBe(false);
    expect(bannerAllowed({ ...base, screen: 'mock-session' })).toBe(false);
    expect(bannerAllowed({ ...base, screen: 'builder-edit' })).toBe(false);
    expect(bannerAllowed({ ...base, screen: 'quiz' })).toBe(false);
  });

  it('frequency-caps interstitials by completed activities and time', () => {
    resetAdsStateForTests(CONSENTED);
    usePreferences.getState().set({ sessionCount: AFTER_GRACE });
    const now = clock.now().getTime();
    const ask = (at = now) => interstitialAllowed({ isPremium: false, at: 'quiz-results-exit', now: at });
    expect(ask()).toBe(false); // no activity yet
    for (let i = 0; i < 3; i++) countActivityForAds();
    expect(ask()).toBe(true);
    expect(interstitialAllowed({ isPremium: true, at: 'quiz-results-exit', now })).toBe(false);
    markInterstitialShown(now);
    for (let i = 0; i < 3; i++) countActivityForAds();
    expect(ask(now + 60_000)).toBe(false); // too soon
    expect(ask(now + 5 * 60_000)).toBe(true);
  });

  it('counts completed quizzes towards the interstitial cap', async () => {
    await finishQuiz({ mode: 'quiz', category: null, startedAt: clock.now().toISOString(), answers: [{ itemId: 'q-java-001', chosenIndex: 0, correct: true }] });
    expect(usePreferences.getState().activitiesSinceInterstitial).toBe(1);
  });

  it('grants an extra mock interview only through the reward, up to the daily cap', async () => {
    expect(rewardedAvailable(false)).toBe(false); // no consent
    resetAdsStateForTests(CONSENTED);
    expect(rewardedAvailable(true)).toBe(false); // Premium users never see ads
    expect(rewardedAvailable(false)).toBe(true);
    expect(await remainingFreeMocks()).toBe(1);
    grantRewardedMock();
    expect(await remainingFreeMocks()).toBe(2);
    grantRewardedMock();
    expect(rewardedAvailable(false)).toBe(false);
    grantRewardedMock();
    expect(await remainingFreeMocks()).toBe(1 + MAX_BONUS_MOCKS_PER_DAY);
  });
});

describe('Premium limits enforced in services', () => {
  beforeEach(async () => {
    setRepositories(await initDatabase(await createTestDatabase()));
  });

  it('refuses 30 and 60 day learning paths without Premium', async () => {
    const input = { role: 'backend-developer' as const, level: 'intermediate' as const, goal: 'new-job' };
    await expect(createLearningPath({ ...input, length: 30, isPremium: false })).rejects.toBeInstanceOf(PremiumRequiredError);
    await expect(createLearningPath({ ...input, length: 60, isPremium: false })).rejects.toBeInstanceOf(PremiumRequiredError);
    await expect(createLearningPath({ ...input, length: 14, isPremium: false })).resolves.toEqual(expect.any(Number));
    await expect(createLearningPath({ ...input, length: 30, isPremium: true })).resolves.toEqual(expect.any(Number));
  });
});

describe('no ads inside exercises (source scan)', () => {
  const appDir = join(__dirname, '..', '..', 'app');
  const files = (dir: string): string[] => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [join(dir, f)]));
  const rel = (f: string) => f.slice(appDir.length + 1).replace(/\\/g, '/');
  const AD_USAGE = /AdBanner|useInterstitial|useRewardedAd/;

  it('keeps every ad component out of exercise, onboarding and paywall screens', () => {
    const forbidden = ['mock/[id].tsx', 'builder/edit.tsx', 'flashcards.tsx', 'onboarding.tsx', 'paywall.tsx', 'question/[id].tsx', 'path.tsx'];
    for (const f of forbidden) expect({ f, ads: AD_USAGE.test(readFileSync(join(appDir, f), 'utf8')) }).toEqual({ f, ads: false });
  });

  it('only places banners on screens allowed by the policy', () => {
    const placed = files(appDir).flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/<AdBanner screen="([a-z-]+)"/g)].map((m) => ({ file: rel(f), screen: m[1]! })));
    expect(placed.length).toBeGreaterThanOrEqual(4);
    for (const p of placed) expect({ ...p, allowed: BANNER_SCREENS.has(p.screen as never) }).toEqual({ ...p, allowed: true });
  });
});
