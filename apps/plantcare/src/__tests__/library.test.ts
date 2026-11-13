import { getSpecies, LIBRARY_FILTERS, matchesFilter, searchSpecies, SPECIES } from '@/content/species';
import { HEALTH_GUIDE } from '@/content/healthGuide';
import { PLANT_CATEGORIES } from '@/domain/types';

describe('plant library content', () => {
  it('contains at least 150 sheets with unique ids and scientific names', () => {
    expect(SPECIES.length).toBeGreaterThanOrEqual(150);
    expect(new Set(SPECIES.map((s) => s.id)).size).toBe(SPECIES.length);
    expect(new Set(SPECIES.map((s) => s.scientificName)).size).toBe(SPECIES.length);
  });

  it('every sheet is complete and internally consistent', () => {
    for (const s of SPECIES) {
      expect(s.id).toMatch(/^[a-z0-9-]+$/);
      expect(PLANT_CATEGORIES).toContain(s.category);
      expect(s.family).toMatch(/aceae$/);
      expect(s.names.en && s.names.fr && s.names.es).toBeTruthy();
      expect(s.light.length).toBeGreaterThan(0);
      expect(s.soil.length).toBeGreaterThan(0);
      expect(s.origin.length).toBeGreaterThan(0);
      expect(s.tempC[0]).toBeLessThan(s.tempC[1]);
      expect(s.tempC[0]).toBeGreaterThanOrEqual(-35);
      expect(s.tempC[1]).toBeLessThanOrEqual(45);
    }
  });

  it('has a usable free basic library across categories', () => {
    const core = SPECIES.filter((s) => s.core);
    expect(core.length).toBeGreaterThanOrEqual(40);
    expect(new Set(core.map((s) => s.category)).size).toBeGreaterThanOrEqual(7);
  });

  it('never presents an unverified plant as pet-safe', () => {
    const safe = searchSpecies('', ['pet_safe']);
    expect(safe.length).toBeGreaterThan(10);
    expect(safe.every((s) => s.pets === 'non_toxic')).toBe(true);
    expect(SPECIES.some((s) => s.pets === 'unknown')).toBe(true);
  });

  it('flags well-documented toxic plants', () => {
    for (const id of ['lilium', 'cycas-revoluta', 'nerium-oleander', 'spathiphyllum-wallisii', 'aloe-vera', 'epipremnum-aureum']) {
      expect(getSpecies(id)?.pets).toBe('toxic');
    }
  });

  it('searches across languages, accents, scientific names and synonyms', () => {
    expect(searchSpecies('costilla de adan').map((s) => s.id)).toContain('monstera-deliciosa');
    expect(searchSpecies('LANGUE DE BELLE').map((s) => s.id)).toContain('dracaena-trifasciata');
    expect(searchSpecies('sansevieria').map((s) => s.id)).toContain('dracaena-trifasciata');
    expect(searchSpecies('rosmarinus').map((s) => s.id)).toContain('salvia-rosmarinus');
    expect(searchSpecies('xyz-nothing')).toEqual([]);
  });

  it('every filter matches some plants and filters combine', () => {
    for (const f of LIBRARY_FILTERS) expect(SPECIES.some((s) => matchesFilter(s, f))).toBe(true);
    const r = searchSpecies('', ['indoor', 'low_light', 'easy_care']);
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((s) => s.placement !== 'outdoor' && s.light.includes('low') && s.difficulty === 'easy')).toBe(true);
  });
});

describe('health knowledge base', () => {
  it('covers every health category with several possible causes', () => {
    for (const cat of ['yellow_leaves', 'brown_leaves', 'wilting', 'root_problems', 'pests', 'fungal', 'growth', 'other'] as const) {
      expect(HEALTH_GUIDE[cat].causes.length).toBeGreaterThanOrEqual(cat === 'other' ? 1 : 2);
    }
  });
});
