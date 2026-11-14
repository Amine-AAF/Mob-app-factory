import { contrastRatio } from '@factory/design-system';

import { createClosetTheme, PALETTE_NAMES } from '@/ui/theme';

/** WCAG AA: 4.5:1 for body text, 3:1 for large text / UI components. */
describe('ClosetWise theme contrast', () => {
  for (const palette of PALETTE_NAMES) {
    for (const scheme of ['light', 'dark'] as const) {
      it(`${palette} / ${scheme} keeps text readable`, () => {
        const { colors: c } = createClosetTheme(scheme, palette);
        expect(contrastRatio(c.text, c.background)).toBeGreaterThanOrEqual(7);
        expect(contrastRatio(c.text, c.surface)).toBeGreaterThanOrEqual(7);
        expect(contrastRatio(c.textMuted, c.background)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(c.textSubtle, c.surface)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(c.onPrimary, c.primary)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(c.primary, c.background)).toBeGreaterThanOrEqual(3);
        expect(contrastRatio(c.accent, c.background)).toBeGreaterThanOrEqual(3);
        expect(contrastRatio(c.text, c.accentSoft)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(c.danger, c.dangerSoft)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(c.success, c.successSoft)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(c.warning, c.warningSoft)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});
