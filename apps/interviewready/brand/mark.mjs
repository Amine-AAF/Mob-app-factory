/**
 * InterviewReady mark: a briefcase (the job) whose body carries a check mark (ready).
 * Drawn on a 100x100 grid; `bubble` = main shape, `glyph` = detail colour.
 */
export function mark({ bubble, glyph }) {
  // Monochrome/mask rendering passes a black glyph: keep one silhouette with the check cut out.
  const mask = glyph === '#000000';
  const handle = mask ? bubble : glyph;
  const check = mask ? glyph : '#FFFFFF';
  return `
  <path d="M36 22 Q36 14 44 14 H56 Q64 14 64 22 V27 H57 V22 Q57 21 56 21 H44 Q43 21 43 22 V27 H36 Z" fill="${handle}"/>
  <rect x="8" y="27" width="84" height="58" rx="12" fill="${bubble}"/>
  <polyline points="31,56 44,68 70,42" fill="none" stroke="${check}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
}

export function featureGraphic({ primary, accent, ink, name, mark: draw }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ink}"/><stop offset="1" stop-color="#12234A"/></linearGradient></defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <g opacity="0.08" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="22" fill="${accent}">
    <text x="520" y="70">Situation · Task · Action · Result</text>
    <text x="560" y="450">“Tell me about yourself.”</text>
    <text x="40" y="470">“Why should we hire you?”</text>
  </g>
  <g transform="translate(70 120) scale(2.6)">${draw({ bubble: primary, glyph: accent })}</g>
  <text x="380" y="235" font-family="Segoe UI, Roboto, Arial, sans-serif" font-weight="800" font-size="78" fill="#FFFFFF">${name}</text>
  <text x="384" y="292" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="32" fill="#C9D3EA">Job Interview Prep</text>
  <text x="384" y="350" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="26" fill="${accent}">Prepare Better. Interview Smarter. Get Hired.</text>
</svg>`;
}
