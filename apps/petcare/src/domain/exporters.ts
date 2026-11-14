import type { Expense, HealthRecord, Pet, Treatment, Vaccination, WeightRecord } from './types';

/**
 * Pure builders for CSV and printable HTML (rendered to PDF by expo-print).
 * Everything is generated on the device; nothing is uploaded.
 */

/** RFC 4180 field escaping + protection against spreadsheet formula injection. */
export function csvField(value: unknown): string {
  if (value === null || value === undefined) return '';
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = `'${s}`;
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(header: readonly string[], rows: readonly (readonly unknown[])[]): string {
  // BOM so Excel opens UTF-8 accents correctly.
  return `﻿${[header, ...rows].map((r) => r.map(csvField).join(',')).join('\r\n')}\r\n`;
}

export function expensesCsv(expenses: readonly Expense[], pets: readonly Pet[], labels: { header: string[]; category: (c: string) => string }): string {
  const name = new Map(pets.map((p) => [p.id, p.name]));
  return toCsv(
    labels.header,
    expenses.map((e) => [e.date, e.petId ? (name.get(e.petId) ?? '') : '', labels.category(e.category), e.amount.toFixed(2), e.currency, e.notes]),
  );
}

export function healthCsv(records: readonly HealthRecord[], header: string[]): string {
  return toCsv(
    header,
    records.map((r) => [r.date, r.reason, r.vetName, r.clinic, r.diagnosis, r.exams, r.results, r.cost?.toFixed(2) ?? '', r.currency, r.notes]),
  );
}

export function escapeHtml(s: string | null | undefined): string {
  return (s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

export interface PetReportLabels {
  title: string;
  generatedOn: string;
  disclaimer: string;
  profile: string;
  vaccinations: string;
  treatments: string;
  health: string;
  weights: string;
  none: string;
  fields: Record<string, string>;
  formatDate: (day: string | null) => string;
  formatWeight: (kg: number) => string;
  species: string;
}

/** Printable health summary for a vet visit. Values are the user's own entries. */
export function petReportHtml(
  input: { pet: Pet; vaccinations: readonly Vaccination[]; treatments: readonly Treatment[]; health: readonly HealthRecord[]; weights: readonly WeightRecord[] },
  l: PetReportLabels,
): string {
  const e = escapeHtml;
  const table = (head: string[], rows: (string | null | undefined)[][]) =>
    rows.length === 0
      ? `<p class="muted">${e(l.none)}</p>`
      : `<table><thead><tr>${head.map((h) => `<th>${e(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${e(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const { pet } = input;
  const f = l.fields;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body{font-family:-apple-system,Roboto,Arial,sans-serif;color:#2A1F1B;margin:28px;font-size:12px}
    h1{color:#B8502F;margin:0 0 4px;font-size:22px} h2{font-size:15px;margin:22px 0 6px;color:#B8502F;border-bottom:1px solid #EADBD3;padding-bottom:4px}
    table{width:100%;border-collapse:collapse} th,td{text-align:left;padding:5px 6px;border-bottom:1px solid #F0E6E0;vertical-align:top} th{background:#FBF3EE}
    .muted{color:#7A6A63} .disclaimer{margin-top:28px;font-size:10px;color:#7A6A63}
  </style></head><body>
  <h1>${e(l.title)} — ${e(pet.name)}</h1><div class="muted">${e(l.generatedOn)}</div>
  <h2>${e(l.profile)}</h2>
  ${table(
    [f.field ?? '', f.value ?? ''],
    [
      [f.species, l.species],
      [f.breed, pet.breed],
      [f.birthDate, l.formatDate(pet.birthDate)],
      [f.color, pet.color],
      [f.identification, pet.identification],
      [f.adoptionDate, l.formatDate(pet.adoptionDate)],
    ].filter((r) => r[1]),
  )}
  <h2>${e(l.vaccinations)}</h2>
  ${table([f.name ?? '', f.administeredDate ?? '', f.nextDueDate ?? '', f.vet ?? ''], input.vaccinations.map((v) => [v.name, l.formatDate(v.administeredDate), l.formatDate(v.nextDueDate), v.vetName]))}
  <h2>${e(l.treatments)}</h2>
  ${table([f.name ?? '', f.instructions ?? '', f.startDate ?? '', f.endDate ?? '', f.prescriber ?? ''], input.treatments.map((t) => [t.name, t.instructions, l.formatDate(t.startDate), l.formatDate(t.endDate), t.prescriber]))}
  <h2>${e(l.health)}</h2>
  ${table([f.date ?? '', f.reason ?? '', f.diagnosis ?? '', f.vet ?? ''], input.health.map((h) => [l.formatDate(h.date), h.reason, h.diagnosis, [h.vetName, h.clinic].filter(Boolean).join(' · ')]))}
  <h2>${e(l.weights)}</h2>
  ${table([f.date ?? '', f.weight ?? ''], input.weights.map((w) => [l.formatDate(w.date), l.formatWeight(w.weightKg)]))}
  <p class="disclaimer">${e(l.disclaimer)}</p>
  </body></html>`;
}
