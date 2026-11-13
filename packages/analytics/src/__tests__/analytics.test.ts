import { createAnalytics, createMemoryProvider, sanitizeParams } from '../index';

describe('analytics', () => {
  it('drops events until consent is granted', () => {
    const mem = createMemoryProvider();
    const a = createAnalytics({ providers: [mem] });
    a.track('lesson_started', { lesson_id: 'wp-01' });
    expect(mem.events).toHaveLength(0);
    a.setConsent(true);
    a.track('lesson_started', { lesson_id: 'wp-01' });
    expect(mem.events).toEqual([{ name: 'lesson_started', params: { lesson_id: 'wp-01' } }]);
  });

  it('strips PII-like keys and non-primitive values', () => {
    expect(sanitizeParams({ email: 'a@b.c', user_name: 'x', score: 90, ok: true, bad: Number.NaN })).toEqual({ score: 90, ok: true });
  });

  it('validates event names', () => {
    const a = createAnalytics({ providers: [], consent: true });
    expect(() => a.track('Bad Name', {})).toThrow();
  });

  it('isolates provider failures', () => {
    const errors: string[] = [];
    const a = createAnalytics({
      providers: [{ name: 'boom', logEvent: () => { throw new Error('x'); } }],
      consent: true,
      onProviderError: (p) => errors.push(p),
    });
    expect(() => a.track('quiz_completed', { score: 1 })).not.toThrow();
    expect(errors).toEqual(['boom']);
  });
});
