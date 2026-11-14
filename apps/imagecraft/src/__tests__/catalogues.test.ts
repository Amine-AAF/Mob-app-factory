import { collageCanvas, collageCells, COLLAGE_TEMPLATES, findTemplate } from '@/constants/collageTemplates';
import { SOCIAL_PRESETS } from '@/constants/socialPresets';
import { TOOLS } from '@/constants/tools';
import { buildCollageInput, emptyCells } from '@/features/collage/collageBuilder';
import type { SourceImage } from '@/types/image';

describe('social presets', () => {
  it('cover every required network with documented, positive dimensions', () => {
    const ids = SOCIAL_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const required of [
      'instagram_post',
      'instagram_portrait',
      'instagram_story',
      'instagram_reel_cover',
      'tiktok',
      'youtube_thumbnail',
      'youtube_shorts_cover',
      'facebook_post',
      'facebook_cover',
      'linkedin_post',
      'linkedin_banner',
      'pinterest_pin',
      'whatsapp_status',
    ]) {
      expect(ids).toContain(required);
    }
    for (const p of SOCIAL_PRESETS) {
      expect(p.size.width).toBeGreaterThan(0);
      expect(p.size.height).toBeGreaterThan(0);
    }
  });

  it('declares ratios that match their pixel sizes', () => {
    for (const p of SOCIAL_PRESETS) {
      const [w, h] = p.ratio.split(':').map(Number) as [number, number];
      expect(p.size.width / p.size.height).toBeCloseTo(w / h, 1);
    }
  });

  it('keeps the classic formats free', () => {
    expect(SOCIAL_PRESETS.filter((p) => !p.premium).map((p) => p.id)).toEqual(expect.arrayContaining(['instagram_post', 'instagram_story', 'youtube_thumbnail']));
  });
});

describe('collage templates', () => {
  it('provides at least 15 original layouts for 2 to 9 photos', () => {
    expect(COLLAGE_TEMPLATES.length).toBeGreaterThanOrEqual(15);
    const counts = new Set(COLLAGE_TEMPLATES.map((t) => t.cells.length));
    for (const n of [2, 3, 4]) expect(counts.has(n)).toBe(true);
    expect(Math.max(...counts)).toBeGreaterThanOrEqual(6);
    expect(new Set(COLLAGE_TEMPLATES.map((t) => t.id)).size).toBe(COLLAGE_TEMPLATES.length);
  });

  it.each(COLLAGE_TEMPLATES.map((t) => [t.id, t] as const))('%s tiles the canvas exactly, without overlap', (_id, tpl) => {
    const area = tpl.cells.reduce((s, c) => s + c.width * c.height, 0);
    expect(area).toBeCloseTo(1, 6);
    for (const c of tpl.cells) {
      expect(c.x).toBeGreaterThanOrEqual(-1e-9);
      expect(c.y).toBeGreaterThanOrEqual(-1e-9);
      expect(c.x + c.width).toBeLessThanOrEqual(1 + 1e-9);
      expect(c.y + c.height).toBeLessThanOrEqual(1 + 1e-9);
    }
    for (let i = 0; i < tpl.cells.length; i++) {
      for (let j = i + 1; j < tpl.cells.length; j++) {
        const a = tpl.cells[i]!;
        const b = tpl.cells[j]!;
        const ox = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
        const oy = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
        expect(ox > 1e-9 && oy > 1e-9).toBe(false);
      }
    }
  });

  it('applies equal gaps between cells and at the border', () => {
    const tpl = findTemplate('duo_columns');
    const canvas = collageCanvas(tpl, 1000);
    const [a, b] = collageCells(tpl, canvas, 20) as [ReturnType<typeof collageCells>[number], ReturnType<typeof collageCells>[number]];
    expect(a.x).toBeCloseTo(20, 6);
    expect(b.x - (a.x + a.width)).toBeCloseTo(20, 6);
    expect(canvas.width - (b.x + b.width)).toBeCloseTo(20, 6);
    expect(collageCanvas(findTemplate('story_trio'), 1920)).toEqual({ width: 1080, height: 1920 });
  });

  it('builds a native spec where every picture covers its cell without distortion', () => {
    const img: SourceImage = { uri: 'file:///a.jpg', name: 'a.jpg', bytes: 1, format: 'jpeg', width: 4000, height: 3000, hasAlpha: false };
    const tpl = findTemplate('quad_feature_left');
    const cells = emptyCells(tpl).map((c, i) => (i < 3 ? { ...c, image: img } : c));
    const spec = buildCollageInput({ template: tpl, cells, longEdge: 2048, spacing: 10, radius: 12, background: '#FFFFFF', format: 'jpeg', quality: 90 }, 'file:///c.jpg');
    expect(spec.cells).toHaveLength(4);
    expect(spec.cells[3]?.uri).toBeNull();
    for (const c of spec.cells.slice(0, 3)) {
      expect(c.image.width / c.image.height).toBeCloseTo(4 / 3, 6);
      expect(c.image.x).toBeLessThanOrEqual(c.rect.x + 1e-6);
      expect(c.image.x + c.image.width).toBeGreaterThanOrEqual(c.rect.x + c.rect.width - 1e-6);
      expect(c.image.y + c.image.height).toBeGreaterThanOrEqual(c.rect.y + c.rect.height - 1e-6);
    }
    expect(spec.radius).toBeCloseTo(12 * 2.048, 6);
  });
});

describe('tool catalogue', () => {
  it('has unique ids and covers every feature of the brief', () => {
    expect(TOOLS.map((t) => t.id).sort()).toEqual(['batch', 'collage', 'compress', 'convert', 'crop', 'edit', 'filters', 'resize', 'social', 'text', 'watermark']);
  });
});
