/**
 * Logic Quest mark: a rounded tile holding a 3×3 grid of nodes, with a single
 * path that visits them like a solved logic route and ends on a bright node.
 * Drawn on a 100×100 grid. Used by factory/scripts/generate-brand-assets.mjs.
 *   bubble = main shape color, glyph = path/detail color
 */
const nodes = [
  [30, 30], [50, 30], [70, 30],
  [30, 50], [50, 50], [70, 50],
  [30, 70], [50, 70], [70, 70],
];
// Path: top-left → top-middle → center → middle-left → bottom-left → bottom-middle → bottom-right (goal)
const route = [0, 1, 4, 3, 6, 7, 8];

export function mark({ bubble, glyph }) {
  const points = route.map((i) => nodes[i].join(',')).join(' ');
  const dots = nodes
    .map(([x, y], i) => (route.includes(i) ? '' : `<circle cx="${x}" cy="${y}" r="4.2" fill="${glyph}" opacity="0.45"/>`))
    .join('');
  const visited = route.slice(0, -1).map((i) => `<circle cx="${nodes[i][0]}" cy="${nodes[i][1]}" r="5" fill="${glyph}"/>`).join('');
  const [gx, gy] = nodes[route.at(-1)];
  return `
  <rect x="10" y="10" width="80" height="80" rx="22" fill="${bubble}"/>
  ${dots}
  <polyline points="${points}" fill="none" stroke="${glyph}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  ${visited}
  <circle cx="${gx}" cy="${gy}" r="9" fill="${glyph}"/>
  <circle cx="${gx}" cy="${gy}" r="4" fill="${bubble}"/>`;
}

/** Play Store feature graphic (1024×500). Text is the product name and tagline only. */
export function featureGraphic({ primary, accent, ink, name, mark: m }) {
  const glyphs = [
    ['△', 520, 90], ['○', 880, 120], ['□', 960, 400], ['◇', 610, 450], ['☆', 760, 70],
  ]
    .map(([g, x, y]) => `<text x="${x}" y="${y}" font-size="44" fill="${accent}" opacity="0.10" font-family="Segoe UI Symbol, DejaVu Sans, sans-serif">${g}</text>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ink}"/><stop offset="1" stop-color="#0E2A2A"/></linearGradient></defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  ${glyphs}
  <g opacity="0.08" font-family="Consolas, monospace" font-size="26" fill="#FFFFFF">
    <text x="470" y="160">2, 3, 5, 8, 12, ?</text>
    <text x="720" y="440">If A, then B.</text>
  </g>
  <g transform="translate(60 105) scale(2.9)">${m({ bubble: primary, glyph: accent })}</g>
  <text x="380" y="235" font-family="Segoe UI, Roboto, Arial, sans-serif" font-weight="800" font-size="84" fill="#FFFFFF">${name}</text>
  <text x="384" y="295" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="32" fill="#CFE3E1">Brain &amp; logic games</text>
  <text x="384" y="350" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="26" fill="${accent}">Train Your Brain. Challenge Your Logic.</text>
</svg>`;
}
