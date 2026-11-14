/**
 * CalcWise mark: a rounded tile holding four keys — plus, minus, times — and a
 * highlighted "equals" key (the answer). Bold strokes so it stays legible at 48 px.
 * Drawn on a 100×100 grid. Used by factory/scripts/generate-brand-assets.mjs.
 *   bubble = main shape color, glyph = symbol/detail color
 */
export function mark({ bubble, glyph }) {
  const s = `stroke="${glyph}" stroke-width="7" stroke-linecap="round"`;
  return `
  <rect x="10" y="10" width="80" height="80" rx="22" fill="${bubble}"/>
  <line x1="25" y1="34" x2="43" y2="34" ${s}/>
  <line x1="34" y1="25" x2="34" y2="43" ${s}/>
  <line x1="57" y1="34" x2="75" y2="34" ${s}/>
  <line x1="27.5" y1="59.5" x2="40.5" y2="72.5" ${s}/>
  <line x1="40.5" y1="59.5" x2="27.5" y2="72.5" ${s}/>
  <circle cx="66" cy="66" r="14" fill="${glyph}"/>
  <line x1="59" y1="61.5" x2="73" y2="61.5" stroke="${bubble}" stroke-width="5" stroke-linecap="round"/>
  <line x1="59" y1="70.5" x2="73" y2="70.5" stroke="${bubble}" stroke-width="5" stroke-linecap="round"/>`;
}

/** Play Store feature graphic (1024×500). Text is the product name and tagline only. */
export function featureGraphic({ primary, accent, ink, name, mark: m }) {
  const symbols = [
    ['%', 540, 95], ['√', 880, 120], ['π', 960, 410], ['÷', 610, 455], ['∑', 760, 70], ['=', 930, 280],
  ]
    .map(([g, x, y]) => `<text x="${x}" y="${y}" font-size="56" font-weight="700" fill="${accent}" opacity="0.10" font-family="Segoe UI, Roboto, Arial, sans-serif">${g}</text>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ink}"/><stop offset="1" stop-color="#2A140B"/></linearGradient></defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  ${symbols}
  <g transform="translate(64 110) scale(2.8)">${m({ bubble: primary, glyph: '#FFFFFF' })}</g>
  <text x="390" y="230" font-family="Segoe UI, Roboto, Arial, sans-serif" font-weight="800" font-size="88" fill="#FFFFFF">${name}</text>
  <text x="394" y="290" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="32" fill="#E8D9D2">A smarter calculator</text>
  <text x="394" y="334" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="32" fill="#E8D9D2">for everyday life.</text>
  <text x="394" y="392" font-family="Segoe UI, Roboto, Arial, sans-serif" font-weight="600" font-size="24" fill="${accent}">Maths · Shopping · Bills · Loans · Savings · Units</text>
</svg>`;
}
