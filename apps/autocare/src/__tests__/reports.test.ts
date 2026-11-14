import { createFormatter } from '@/features/format/format';
import { escapeCell, toCsv } from '@/features/reports/csv';
import { buildCsv, buildReport, REPORT_KINDS } from '@/features/reports/build';
import { pdfString, renderPdf, toWinAnsi } from '@/features/reports/pdf';
import { DEFAULT_UNITS } from '@/features/units/units';

import { fill, vehicle } from './fixtures';

const t = ((key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key)) as never;
const f = createFormatter('fr', DEFAULT_UNITS);

describe('CSV export', () => {
  it('escapes separators, quotes and newlines', () => {
    expect(escapeCell('a,b')).toBe('"a,b"');
    expect(escapeCell('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCell('line\nbreak')).toBe('"line\nbreak"');
    expect(escapeCell(null)).toBe('');
    expect(escapeCell(12.5)).toBe('12.5');
  });

  it('neutralises spreadsheet formula injection', () => {
    expect(escapeCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(escapeCell('+33 1 23')).toBe("'+33 1 23");
    expect(escapeCell('@SUM')).toBe("'@SUM");
  });

  it('starts with a UTF-8 BOM and uses CRLF', () => {
    const csv = toCsv(['a', 'b'], [['é', 1]]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('a,b\r\né,1\r\n');
  });

  it('exports raw fill-ups in metric units', () => {
    const csv = buildCsv('fuel', { vehicle: vehicle(), readings: [], fuel: [fill({ day: '2026-01-05', odometerKm: 1000, station: 'Total, A6' })], expenses: [], maintenance: [], tires: [] }, { from: '2026-01-01', to: '2026-12-31' }, t);
    const lines = csv.trim().split('\r\n');
    expect(lines[0]).toContain('odometer_km');
    expect(lines[1]).toContain('"Total, A6"');
    expect(lines[1]).toContain('72');
  });
});

describe('PDF writer', () => {
  it('maps accents and the euro sign to WinAnsi', () => {
    expect(toWinAnsi('é€ñ')).toEqual([0xe9, 0x80, 0xf1]);
    expect(toWinAnsi('日')).toEqual([0x3f]);
    expect(pdfString('(a) é')).toBe('(\\(a\\) \\351)');
  });

  it('produces a structurally valid PDF with exact xref offsets', () => {
    const pdf = renderPdf([{ type: 'title', text: 'Rapport annuel' }, { type: 'text', text: 'Entretien réalisé — 1 234,56 €' }, { type: 'table', columns: ['A', 'B'], rows: Array.from({ length: 120 }, (_, i) => [`ligne ${i}`, String(i)]) }], { footer: (p, n) => `${p}/${n}` });
    expect(pdf.startsWith('%PDF-1.4')).toBe(true);
    expect(pdf.trimEnd().endsWith('%%EOF')).toBe(true);
    // pure ASCII so byte offsets == string offsets
    expect(/^[\x00-\x7f]*$/.test(pdf)).toBe(true);
    const xrefAt = Number(pdf.match(/startxref\n(\d+)/)![1]);
    expect(pdf.slice(xrefAt, xrefAt + 4)).toBe('xref');
    const offsets = [...pdf.slice(xrefAt).matchAll(/^(\d{10}) 00000 n $/gm)].map((m) => Number(m[1]));
    offsets.forEach((o, i) => expect(pdf.slice(o, o + `${i + 1} 0 obj`.length)).toBe(`${i + 1} 0 obj`));
    // 120 rows don't fit on one A4 page
    expect(Number(pdf.match(/\/Count (\d+)/)![1])).toBeGreaterThan(1);
  });

  it('builds every report kind with data and without', () => {
    const input = {
      vehicle: vehicle(),
      readings: [
        { day: '2026-01-01', odometerKm: 30000 },
        { day: '2026-03-01', odometerKm: 31000 },
      ],
      fuel: [fill({ day: '2026-01-01', odometerKm: 30000 }), fill({ day: '2026-02-01', odometerKm: 30600, quantity: 36 })],
      expenses: [],
      maintenance: [],
      tires: [],
    };
    for (const kind of REPORT_KINDS) {
      const blocks = buildReport(kind, input, { from: '2026-01-01', to: '2026-12-31' }, t, f, '2026-03-02');
      expect(blocks[0]).toMatchObject({ type: 'title' });
      expect(renderPdf(blocks).length).toBeGreaterThan(500);
      const empty = buildReport(kind, { ...input, fuel: [], readings: [] }, { from: '2026-01-01', to: '2026-12-31' }, t, f, '2026-03-02');
      expect(empty.length).toBeGreaterThan(2);
    }
  });

  it('never claims a consumption without two full tanks', () => {
    const blocks = buildReport('consumption', { vehicle: vehicle(), readings: [], fuel: [fill({ day: '2026-01-01', odometerKm: 100 })], expenses: [], maintenance: [], tires: [] }, { from: '2026-01-01', to: '2026-12-31' }, t, f, '2026-03-02');
    expect(JSON.stringify(blocks)).toContain('fuel.notReliable');
  });
});
