/**
 * HabitFlow mark: a rounded tile holding a segmented progress ring (the app's
 * "dial") almost complete, with a check mark in the middle.
 * Drawn on a 100×100 grid. Used by factory/scripts/generate-brand-assets.mjs.
 *   bubble = main shape color, glyph = detail color
 */
const SEGMENTS = 24;
const FILLED = 19;

export function mark({ bubble, glyph }) {
  const ticks = Array.from({ length: SEGMENTS }, (_, i) => {
    const a = (i / SEGMENTS) * Math.PI * 2 - Math.PI / 2;
    const r1 = 26;
    const r2 = 33;
    const x1 = 50 + r1 * Math.cos(a);
    const y1 = 50 + r1 * Math.sin(a);
    const x2 = 50 + r2 * Math.cos(a);
    const y2 = 50 + r2 * Math.sin(a);
    return `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${glyph}" stroke-width="4.2" stroke-linecap="round" opacity="${i < FILLED ? 1 : 0.3}"/>`;
  }).join('');
  return `
  <rect x="8" y="8" width="84" height="84" rx="24" fill="${bubble}"/>
  ${ticks}
  <polyline points="39,51 47,59 62,43" fill="none" stroke="${glyph}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** Play Store feature graphic (1024×500): product name, tagline and the mark only. */
export function featureGraphic({ primary, accent, ink, name, mark: m }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ink}"/><stop offset="1" stop-color="${primary}"/></linearGradient></defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <g transform="translate(96 110) scale(2.8)">${m({ bubble: '#FFFFFF', glyph: primary })}</g>
  <text x="430" y="238" font-family="Segoe UI, Roboto, sans-serif" font-size="78" font-weight="800" fill="#FFFFFF">${name}</text>
  <text x="432" y="300" font-family="Segoe UI, Roboto, sans-serif" font-size="32" fill="${accent}">Build Better Habits. One Day at a Time.</text>
</svg>`;
}
