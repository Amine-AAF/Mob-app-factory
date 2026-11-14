import { normalizeText, validateGuest } from './guests';
import { GUEST_CATEGORIES, RSVP_STATUSES, type GuestCategory, type GuestInput, type RsvpStatus } from './types';

/**
 * CSV import / export (RFC 4180: quoted fields, escaped quotes, CRLF/LF,
 * comma or semicolon delimiter — Excel in FR/ES locales writes ";").
 */

export function detectDelimiter(text: string): ',' | ';' | '\t' {
  const firstLine = text.replace(/^﻿/, '').split(/\r?\n/, 1)[0] ?? '';
  const count = (c: string) => firstLine.split(c).length - 1;
  const candidates = [',', ';', '\t'] as const;
  return candidates.reduce((best, c) => (count(c) > count(best) ? c : best), ',' as ',' | ';' | '\t');
}

export function parseCsv(text: string, delimiter = detectDelimiter(text), opts: { keepEmpty?: boolean } = {}): string[][] {
  const src = text.replace(/^﻿/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
      continue;
    }
    if (c === '"' && field === '') inQuotes = true;
    else if (c === delimiter) {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return opts.keepEmpty ? rows : rows.filter((r) => !isEmptyRow(r));
}

const isEmptyRow = (r: readonly string[]) => r.every((cell) => cell.trim() === '');

/** Prevents spreadsheet formula injection (=, +, -, @ at the start of a cell). */
export function sanitizeCell(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

export function toCsv(rows: readonly (readonly (string | number | null | undefined)[])[], delimiter = ','): string {
  const esc = (v: string | number | null | undefined) => {
    const s = sanitizeCell(v == null ? '' : String(v));
    return /[",;\t\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  // BOM so Excel opens UTF-8 accents correctly.
  return `﻿${rows.map((r) => r.map(esc).join(delimiter)).join('\r\n')}\r\n`;
}

/* --------------------------------------------------------- Guest import */

export type GuestField = 'firstName' | 'lastName' | 'fullName' | 'phone' | 'email' | 'group' | 'category' | 'plusOnes' | 'children' | 'dietary' | 'notes' | 'rsvp';

/** Header synonyms in EN / FR / ES (normalised, accent-free). */
const HEADER_SYNONYMS: Record<GuestField, string[]> = {
  firstName: ['first name', 'firstname', 'given name', 'prenom', 'nombre'],
  lastName: ['last name', 'lastname', 'surname', 'family name', 'nom de famille', 'apellido', 'apellidos', 'nom'],
  fullName: ['name', 'full name', 'guest', 'nom complet', 'invite', 'nombre completo', 'invitado'],
  phone: ['phone', 'mobile', 'telephone', 'tel', 'portable', 'telefono', 'movil', 'celular'],
  email: ['email', 'e-mail', 'mail', 'courriel', 'correo', 'correo electronico'],
  group: ['group', 'family', 'household', 'groupe', 'famille', 'grupo', 'familia'],
  category: ['category', 'type', 'categorie', 'categoria'],
  plusOnes: ['plus ones', 'plus one', 'plus-ones', 'companions', 'accompagnants', 'acompanantes', 'adults', 'adultes', 'adultos'],
  children: ['children', 'kids', 'enfants', 'ninos', 'hijos'],
  dietary: ['dietary', 'diet', 'allergies', 'regime', 'regime alimentaire', 'dieta', 'alergias'],
  notes: ['notes', 'note', 'comment', 'comments', 'commentaire', 'remarques', 'notas', 'comentarios'],
  rsvp: ['rsvp', 'status', 'statut', 'reponse', 'estado', 'respuesta'],
};

export function mapHeaders(header: readonly string[]): Partial<Record<GuestField, number>> {
  const out: Partial<Record<GuestField, number>> = {};
  header.forEach((raw, index) => {
    const h = normalizeText(raw).replace(/[_]/g, ' ');
    for (const [field, names] of Object.entries(HEADER_SYNONYMS) as [GuestField, string[]][]) {
      if (out[field] === undefined && names.includes(h)) {
        out[field] = index;
        return;
      }
    }
  });
  return out;
}

const RSVP_SYNONYMS: Record<string, RsvpStatus> = {
  yes: 'confirmed', confirmed: 'confirmed', oui: 'confirmed', confirme: 'confirmed', si: 'confirmed', confirmado: 'confirmed',
  no: 'declined', non: 'declined', declined: 'declined', refuse: 'declined', rechaza: 'declined', rechazado: 'declined',
  maybe: 'maybe', 'peut-etre': 'maybe', 'peut etre': 'maybe', quizas: 'maybe', 'tal vez': 'maybe',
  invited: 'invited', invite: 'invited', invitado: 'invited',
  'no response': 'no_response', 'sans reponse': 'no_response', 'sin respuesta': 'no_response',
};

function parseRsvp(raw: string): RsvpStatus | null {
  const v = normalizeText(raw);
  if (!v) return null;
  if ((RSVP_STATUSES as readonly string[]).includes(v.replace(/ /g, '_'))) return v.replace(/ /g, '_') as RsvpStatus;
  return RSVP_SYNONYMS[v] ?? null;
}

function parseCount(raw: string | undefined): number | null {
  const v = (raw ?? '').trim();
  if (!v) return 0;
  if (!/^\d{1,2}$/.test(v)) return null;
  return Number(v);
}

export interface ImportedGuest {
  row: number; // 1-based line in the file (header = 1)
  guest: Omit<GuestInput, 'eventId' | 'groupId'>;
  groupName: string;
}

export interface ImportIssue {
  row: number;
  code: 'missingName' | 'invalidEmail' | 'invalidCount' | 'unknownRsvp' | 'tooLong';
}

export interface GuestImportResult {
  guests: ImportedGuest[];
  issues: ImportIssue[];
  /** True when no usable header was found. */
  unrecognized: boolean;
  totalRows: number;
}

const MAX_FIELD = 200;

/**
 * Turns a CSV file into guest candidates. Rows with a fatal problem (no name,
 * bad counts) are skipped and reported; soft problems (unknown RSVP value,
 * invalid email) keep the row with a safe default and are reported too.
 */
export function importGuestsCsv(text: string, maxRows = 2000): GuestImportResult {
  // Keep blank records so reported row numbers match what the user sees in a spreadsheet.
  const all = parseCsv(text, detectDelimiter(text), { keepEmpty: true });
  const headerIndex = all.findIndex((r) => !isEmptyRow(r));
  const header = all[headerIndex] ?? [];
  const body = all.slice(headerIndex + 1).map((cells, i) => ({ cells, row: headerIndex + i + 2 })).filter((r) => !isEmptyRow(r.cells));
  const map = mapHeaders(header);
  const hasName = map.firstName !== undefined || map.lastName !== undefined || map.fullName !== undefined;
  if (!hasName) return { guests: [], issues: [], unrecognized: true, totalRows: body.length };

  const guests: ImportedGuest[] = [];
  const issues: ImportIssue[] = [];
  body.slice(0, maxRows).forEach(({ cells, row }) => {
    const get = (f: GuestField) => {
      const idx = map[f];
      return idx === undefined ? '' : (cells[idx] ?? '').trim();
    };
    if (cells.some((c) => c.length > MAX_FIELD)) {
      issues.push({ row, code: 'tooLong' });
      return;
    }
    let firstName = get('firstName');
    let lastName = get('lastName');
    if (!firstName && !lastName && get('fullName')) {
      const parts = get('fullName').split(/\s+/);
      firstName = parts.shift() ?? '';
      lastName = parts.join(' ');
    }
    const plusOnes = parseCount(get('plusOnes'));
    const children = parseCount(get('children'));
    if (plusOnes === null || children === null) {
      issues.push({ row, code: 'invalidCount' });
      return;
    }
    let email = get('email');
    const rawRsvp = get('rsvp');
    let rsvpStatus = parseRsvp(rawRsvp);
    if (rawRsvp && !rsvpStatus) issues.push({ row, code: 'unknownRsvp' });
    rsvpStatus ??= 'not_invited';

    const errors = validateGuest({ firstName, lastName, email, plusOnes, children });
    if (errors.includes('name')) {
      issues.push({ row, code: 'missingName' });
      return;
    }
    if (errors.includes('email')) {
      issues.push({ row, code: 'invalidEmail' });
      email = '';
    }
    const cat = normalizeText(get('category'));
    const category: GuestCategory = (GUEST_CATEGORIES as readonly string[]).includes(cat) ? (cat as GuestCategory) : 'other';
    guests.push({
      row,
      groupName: get('group'),
      guest: {
        firstName,
        lastName,
        phone: get('phone'),
        email,
        category,
        plusOnes,
        children,
        isChild: false,
        dietary: get('dietary'),
        notes: get('notes'),
        rsvpStatus,
        rsvpRespondedAt: null,
        rsvpNote: '',
      },
    });
  });
  return { guests, issues, unrecognized: false, totalRows: body.length };
}

/** Template the user can fill in a spreadsheet. */
export const GUEST_CSV_TEMPLATE = 'first name,last name,phone,email,group,category,plus ones,children,dietary,notes,rsvp\r\n';
