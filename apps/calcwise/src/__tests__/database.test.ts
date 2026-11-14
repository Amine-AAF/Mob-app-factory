import { createTestDatabase } from '@factory/testing';

import { DEFAULT_FAVORITES } from '@/constants/tools';
import { deleteAllUserData, initDatabase } from '@/database';
import { SCHEMA_VERSION } from '@/database/migrations';

async function setup() {
  const db = await createTestDatabase();
  let tick = 0;
  // Deterministic, strictly increasing timestamps.
  const now = () => new Date(Date.UTC(2026, 10, 13, 12, 0, tick++));
  const repos = await initDatabase(db, now);
  return { db, repos };
}

describe('database', () => {
  it('migrates to the current schema and seeds default shortcuts once', async () => {
    const { db, repos } = await setup();
    const v = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
    expect(v?.user_version).toBe(SCHEMA_VERSION);
    expect(await repos.favorites.list()).toEqual(DEFAULT_FAVORITES);
    // Re-running init (next app start) keeps the user's choice.
    await repos.favorites.toggle('percentage', { max: 3 });
    await initDatabase(db);
    expect(await repos.favorites.list()).toEqual(['discount', 'tip']);
  });
});

describe('CalculationHistory', () => {
  it('stores, lists newest first, and removes entries', async () => {
    const { repos } = await setup();
    await repos.history.add({ tool: 'standard', expression: '1+2', result: '3' }, { limit: null });
    await repos.history.add({ tool: 'scientific', expression: 'sin(30)', result: '0.5' }, { limit: null });
    const list = await repos.history.list();
    expect(list.map((e) => e.result)).toEqual(['0.5', '3']);
    await repos.history.remove(list[0]?.id as number);
    expect(await repos.history.count()).toBe(1);
  });

  it('does not duplicate consecutive identical entries', async () => {
    const { repos } = await setup();
    const e = { tool: 'standard' as const, expression: '2*2', result: '4' };
    expect(await repos.history.add(e, { limit: null })).not.toBeNull();
    expect(await repos.history.add(e, { limit: null })).toBeNull();
    expect(await repos.history.count()).toBe(1);
  });

  it('keeps only the latest N entries for free users and everything for Premium', async () => {
    const { repos } = await setup();
    for (let i = 0; i < 60; i++) await repos.history.add({ tool: 'standard', expression: `${i}+0`, result: String(i) }, { limit: null });
    expect(await repos.history.count()).toBe(60);
    await repos.history.add({ tool: 'standard', expression: '99+0', result: '99' }, { limit: 50 });
    expect(await repos.history.count()).toBe(50);
    const results = (await repos.history.list()).map((e) => e.result);
    expect(results[0]).toBe('99');
    expect(results).not.toContain('10'); // oldest pruned
    expect(results).toContain('59');
  });

  it('searches expressions, numbers and payload values; LIKE wildcards are literal', async () => {
    const { repos } = await setup();
    await repos.history.add({ tool: 'standard', expression: '200+10%', result: '220' }, { limit: null });
    await repos.history.add({ tool: 'standard', expression: '2000+1', result: '2001' }, { limit: null });
    await repos.history.add(
      {
        tool: 'loan',
        expression: '',
        result: '1159.92',
        payload: { currency: 'EUR', inputs: [{ label: 'loan.fields.principal', value: '200000', kind: 'money' }], outputs: [{ label: 'loan.results.monthly', value: '1159.92', kind: 'money' }] },
      },
      { limit: null },
    );
    expect((await repos.history.list({ query: '10%' })).map((e) => e.result)).toEqual(['220']);
    expect((await repos.history.list({ query: '200000' })).map((e) => e.tool)).toEqual(['loan']);
    expect((await repos.history.list({ query: 'zzz', toolIds: ['loan'] })).map((e) => e.tool)).toEqual(['loan']);
    expect(await repos.history.list({ query: "'; DROP TABLE history; --" })).toEqual([]);
    expect(await repos.history.count()).toBe(3);
    const loan = (await repos.history.list({ query: '1159' }))[0];
    expect(loan?.payload?.inputs[0]?.value).toBe('200000');
  });

  it('clear() empties the history', async () => {
    const { repos } = await setup();
    await repos.history.add({ tool: 'standard', expression: '1+1', result: '2' }, { limit: null });
    await repos.history.clear();
    expect(await repos.history.count()).toBe(0);
  });
});

describe('Favorites', () => {
  it('toggles and enforces the free limit', async () => {
    const { repos } = await setup();
    expect(await repos.favorites.toggle('loan', { max: 3 })).toBe('limit'); // 3 defaults already
    expect(await repos.favorites.toggle('tip', { max: 3 })).toBe('removed');
    expect(await repos.favorites.toggle('loan', { max: 3 })).toBe('added');
    expect(await repos.favorites.list()).toEqual(['percentage', 'discount', 'loan']);
    expect(await repos.favorites.toggle('savings', { max: null })).toBe('added'); // Premium: unlimited
    expect(await repos.favorites.list()).toHaveLength(4);
  });
});

describe('delete all my data', () => {
  it('erases history, favorites and the entitlement cache', async () => {
    const { db, repos } = await setup();
    await repos.history.add({ tool: 'standard', expression: '1+1', result: '2' }, { limit: null });
    await db.runAsync("INSERT INTO subscription_cache (key, state, updated_at) VALUES ('entitlement', '{}', 'x')", []);
    await deleteAllUserData(db);
    expect(await repos.history.count()).toBe(0);
    expect(await repos.favorites.list()).toEqual([]);
    expect(await db.getAllAsync('SELECT * FROM subscription_cache', [])).toEqual([]);
  });
});
