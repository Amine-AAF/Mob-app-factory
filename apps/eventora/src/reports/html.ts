import { FONT_FAMILIES, findInvitationTemplate } from '@/content/invitationTemplates';
import type { EventSnapshot } from '@/database';
import { summarizeBudget } from '@/domain/budget';
import { giftSummary, vendorTotals } from '@/domain/gifts';
import { fullName, partySize, rsvpStats, sortGuests } from '@/domain/guests';
import { totalsToList } from '@/domain/money';
import { seatingSummary, tableUsage, unassignedGuests } from '@/domain/seating';
import { sortTasks, taskProgress } from '@/domain/tasks';
import { findOverlaps, sortTimeline, spanLabel } from '@/domain/timeline';
import type { Invitation } from '@/domain/types';

/**
 * Printable HTML (→ PDF via expo-print). Every user value is escaped. Personal
 * contact data is only included when the user explicitly asked for it.
 */
export interface ReportContext {
  t: (key: string, opts?: Record<string, unknown>) => string;
  money: (minor: number, currency: string) => string;
  day: (date: string, style?: 'short' | 'medium' | 'long' | 'full') => string;
  time: (minutes: number) => string;
  eventStart: (e: { startDate: string; startTime: string | null; timezone: string }) => string;
  percent: (ratio: number) => string;
  generatedOn: string;
}

export type ReportKind = 'guests' | 'rsvp' | 'budget' | 'expenses' | 'timeline' | 'vendors' | 'seating' | 'gifts' | 'tasks' | 'final';

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const e = escapeHtml;

const STYLE = `
  *{box-sizing:border-box} body{font-family:Roboto,'Helvetica Neue',Arial,sans-serif;color:#1F1A24;margin:32px;font-size:12px;line-height:1.45}
  h1{font-family:Georgia,serif;font-size:24px;margin:0 0 4px;color:#4A2342} h2{font-size:15px;margin:22px 0 8px;color:#7A3E6B;border-bottom:1px solid #E7DCE4;padding-bottom:4px}
  .meta{color:#6B6170;margin-bottom:16px} table{width:100%;border-collapse:collapse;margin-top:6px} th{text-align:left;background:#F6EFF4;color:#4A2342;font-weight:600}
  th,td{padding:6px 8px;border-bottom:1px solid #EEE6EC;vertical-align:top} td.num,th.num{text-align:right;white-space:nowrap}
  .kpis{display:flex;flex-wrap:wrap;gap:10px;margin:8px 0} .kpi{flex:1 1 120px;border:1px solid #E7DCE4;border-radius:8px;padding:8px 10px}
  .kpi b{display:block;font-size:17px;color:#4A2342} .kpi span{color:#6B6170;font-size:11px} .warn{color:#B42318} .muted{color:#6B6170}
  .tag{display:inline-block;padding:1px 6px;border-radius:9px;background:#F6EFF4;font-size:10px} footer{margin-top:28px;color:#8A8090;font-size:10px;text-align:center}
  .tables{display:flex;flex-wrap:wrap;gap:10px} .tbl{flex:1 1 220px;border:1px solid #E7DCE4;border-radius:8px;padding:8px;page-break-inside:avoid}
  tr{page-break-inside:avoid}
`;

function page(title: string, snap: EventSnapshot, ctx: ReportContext, body: string): string {
  const ev = snap.event;
  const where = [ev.venue, ev.address].filter(Boolean).join(' — ');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${e(title)}</title><style>${STYLE}</style></head><body>
  <h1>${e(ev.name)}</h1><div class="meta">${e(title)} · ${e(ctx.eventStart(ev))}${where ? ` · ${e(where)}` : ''}</div>
  ${body}
  <footer>${e(ctx.t('reports.footer', { date: ctx.generatedOn }))}</footer></body></html>`;
}

const kpi = (value: string, label: string, warn = false) => `<div class="kpi"><b class="${warn ? 'warn' : ''}">${e(value)}</b><span>${e(label)}</span></div>`;

function guestTable(snap: EventSnapshot, ctx: ReportContext, includeContacts: boolean, filter?: (status: string) => boolean): string {
  const groups = new Map(snap.groups.map((g) => [g.id, g.name]));
  const rows = sortGuests(snap.guests, 'name').filter((g) => !filter || filter(g.rsvpStatus));
  if (rows.length === 0) return `<p class="muted">${e(ctx.t('reports.empty'))}</p>`;
  const head = [ctx.t('guest.name'), ctx.t('guest.group'), ctx.t('guest.rsvp'), ctx.t('guest.party')]
    .concat(includeContacts ? [ctx.t('guest.phone'), ctx.t('guest.email'), ctx.t('guest.dietary')] : [])
    .map((h, i) => `<th class="${i === 3 ? 'num' : ''}">${e(h)}</th>`)
    .join('');
  const body = rows
    .map((g) => {
      const cells = [
        `<td>${e(fullName(g))}${g.isChild ? ` <span class="tag">${e(ctx.t('guest.child'))}</span>` : ''}</td>`,
        `<td>${e(g.groupId ? (groups.get(g.groupId) ?? '') : '')}</td>`,
        `<td>${e(ctx.t(`rsvp.${g.rsvpStatus}`))}</td>`,
        `<td class="num">${partySize(g)}</td>`,
      ];
      if (includeContacts) cells.push(`<td>${e(g.phone)}</td>`, `<td>${e(g.email)}</td>`, `<td>${e(g.dietary)}</td>`);
      return `<tr>${cells.join('')}</tr>`;
    })
    .join('');
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function rsvpSection(snap: EventSnapshot, ctx: ReportContext): string {
  const s = rsvpStats(snap.guests);
  return `<div class="kpis">${kpi(String(s.contacted), ctx.t('rsvp.stats.contacted'))}${kpi(String(s.confirmed), ctx.t('rsvp.stats.confirmed'))}${kpi(String(s.declined), ctx.t('rsvp.stats.declined'))}${kpi(String(s.pending), ctx.t('rsvp.stats.pending'))}${kpi(String(s.expected.total), ctx.t('rsvp.stats.expected'))}${kpi(String(s.companions), ctx.t('rsvp.stats.companions'))}</div>
  <p class="muted">${e(ctx.t('rsvp.stats.breakdown', { adults: s.expected.adults, children: s.expected.children, rate: ctx.percent(s.responseRate) }))}</p>`;
}

function budgetSection(snap: EventSnapshot, ctx: ReportContext, withExpenses: boolean): string {
  const cur = snap.event.currency;
  const b = summarizeBudget({ currency: cur, initialMinor: snap.event.budgetMinor, envelopes: snap.envelopes, expenses: snap.expenses });
  const m = (n: number) => ctx.money(n, cur);
  let html = `<div class="kpis">${kpi(m(b.initialMinor), ctx.t('budget.initial'))}${kpi(m(b.estimatedMinor), ctx.t('budget.estimated'))}${kpi(m(b.spentMinor), ctx.t('budget.spent'))}${kpi(m(b.remainingMinor), ctx.t('budget.remaining'), b.remainingMinor < 0)}</div>`;
  const unconverted = totalsToList(b.unconverted);
  if (unconverted.length) html += `<p class="warn">${e(ctx.t('budget.unconvertedNote', { amounts: unconverted.map((x) => ctx.money(x.amountMinor, x.currency)).join(', ') }))}</p>`;
  html += `<h2>${e(ctx.t('budget.byCategory'))}</h2><table><thead><tr><th>${e(ctx.t('budget.category'))}</th><th class="num">${e(ctx.t('budget.planned'))}</th><th class="num">${e(ctx.t('budget.estimated'))}</th><th class="num">${e(ctx.t('budget.spent'))}</th></tr></thead><tbody>${b.byCategory
    .map((l) => `<tr><td>${e(ctx.t(`budgetCategory.${l.category}`))}</td><td class="num">${m(l.plannedMinor)}</td><td class="num">${m(l.estimatedMinor)}</td><td class="num">${m(l.spentMinor)}</td></tr>`)
    .join('')}</tbody></table>`;
  if (withExpenses) {
    const vendors = new Map(snap.vendors.map((v) => [v.id, v.name]));
    html += `<h2>${e(ctx.t('budget.expenses'))}</h2>`;
    html += snap.expenses.length
      ? `<table><thead><tr><th>${e(ctx.t('expense.title'))}</th><th>${e(ctx.t('budget.category'))}</th><th>${e(ctx.t('expense.vendor'))}</th><th>${e(ctx.t('expense.status'))}</th><th class="num">${e(ctx.t('expense.estimated'))}</th><th class="num">${e(ctx.t('expense.actual'))}</th></tr></thead><tbody>${snap.expenses
          .map(
            (x) =>
              `<tr><td>${e(x.title)}${x.dueDate ? `<br><span class="muted">${e(ctx.t('expense.dueOn', { date: ctx.day(x.dueDate) }))}</span>` : ''}</td><td>${e(ctx.t(`budgetCategory.${x.category}`))}</td><td>${e(x.vendorId ? (vendors.get(x.vendorId) ?? '') : '')}</td><td>${e(ctx.t(`payment.${x.paymentStatus}`))}</td><td class="num">${ctx.money(x.estimatedMinor, x.currency)}</td><td class="num">${ctx.money(x.actualMinor, x.currency)}</td></tr>`,
          )
          .join('')}</tbody></table>`
      : `<p class="muted">${e(ctx.t('reports.empty'))}</p>`;
  }
  return html;
}

function timelineSection(snap: EventSnapshot, ctx: ReportContext): string {
  const items = sortTimeline(snap.timeline);
  if (!items.length) return `<p class="muted">${e(ctx.t('reports.empty'))}</p>`;
  const overlaps = new Set(findOverlaps(items).flatMap((o) => [o.a, o.b]));
  return `<table><thead><tr><th>${e(ctx.t('timeline.when'))}</th><th>${e(ctx.t('timeline.activity'))}</th><th>${e(ctx.t('timeline.location'))}</th><th>${e(ctx.t('timeline.owner'))}</th></tr></thead><tbody>${items
    .map((x) => {
      const s = spanLabel(x);
      const next = s.startNextDay ? ` <span class="tag">${e(ctx.t('timeline.nextDay'))}</span>` : '';
      return `<tr><td>${ctx.time(x.startMin)} – ${ctx.time(x.endMin)}${next}</td><td>${e(x.title)}${overlaps.has(x.id) ? ` <span class="warn">⚠ ${e(ctx.t('timeline.overlap'))}</span>` : ''}${x.description ? `<br><span class="muted">${e(x.description)}</span>` : ''}</td><td>${e(x.location)}</td><td>${e(x.owner)}</td></tr>`;
    })
    .join('')}</tbody></table>`;
}

function vendorSection(snap: EventSnapshot, ctx: ReportContext, includeContacts: boolean): string {
  if (!snap.vendors.length) return `<p class="muted">${e(ctx.t('reports.empty'))}</p>`;
  const totals = vendorTotals(snap.vendors);
  const committed = totalsToList(totals.committed, snap.event.currency).map((x) => ctx.money(x.amountMinor, x.currency)).join(' + ');
  return `${committed ? `<p>${e(ctx.t('vendors.committed'))}: <b>${e(committed)}</b></p>` : ''}<table><thead><tr><th>${e(ctx.t('vendor.name'))}</th><th>${e(ctx.t('vendor.category'))}</th><th>${e(ctx.t('vendor.status'))}</th>${includeContacts ? `<th>${e(ctx.t('vendor.contact'))}</th>` : ''}<th class="num">${e(ctx.t('vendor.amount'))}</th></tr></thead><tbody>${snap.vendors
    .map(
      (v) =>
        `<tr><td>${e(v.name)}</td><td>${e(ctx.t(`vendorCategory.${v.category}`))}</td><td>${e(ctx.t(`vendorStatus.${v.status}`))}</td>${includeContacts ? `<td>${e([v.contactName, v.phone, v.email].filter(Boolean).join(' · '))}</td>` : ''}<td class="num">${v.amountMinor ? ctx.money(v.amountMinor, v.currency) : ''}</td></tr>`,
    )
    .join('')}</tbody></table>`;
}

function seatingSection(snap: EventSnapshot, ctx: ReportContext): string {
  const usage = tableUsage(snap.tables, snap.assignments, snap.guests);
  const sum = seatingSummary(snap.tables, snap.assignments, snap.guests);
  const unseated = unassignedGuests(snap.guests, snap.assignments);
  return `<div class="kpis">${kpi(String(sum.tables), ctx.t('seating.tables'))}${kpi(`${sum.seated}/${sum.capacity}`, ctx.t('seating.seated'))}${kpi(String(sum.unseated), ctx.t('seating.unseated'), sum.unseated > 0)}${kpi(String(sum.overloadedTables), ctx.t('seating.overloaded'), sum.overloadedTables > 0)}</div>
  <div class="tables">${usage
    .map(
      (u) =>
        `<div class="tbl"><b>${e(u.table.name)}</b> <span class="muted">${e(ctx.t(`tableShape.${u.table.shape}`))} · ${u.used}/${u.table.seats}</span>${u.overloaded ? ` <span class="warn">⚠</span>` : ''}<ul>${u.guests
          .map((g) => `<li>${e(fullName(g))}${partySize(g) > 1 ? ` <span class="muted">(+${partySize(g) - 1})</span>` : ''}</li>`)
          .join('')}</ul></div>`,
    )
    .join('')}</div>${unseated.length ? `<h2>${e(ctx.t('seating.unseatedList'))}</h2><p>${unseated.map((g) => e(fullName(g))).join(', ')}</p>` : ''}`;
}

function giftSection(snap: EventSnapshot, ctx: ReportContext): string {
  if (!snap.gifts.length) return `<p class="muted">${e(ctx.t('reports.empty'))}</p>`;
  const guests = new Map(snap.guests.map((g) => [g.id, fullName(g)]));
  const s = giftSummary(snap.gifts);
  const totals = totalsToList(s.contributionTotals, snap.event.currency).map((x) => ctx.money(x.amountMinor, x.currency)).join(' + ');
  return `<div class="kpis">${kpi(String(s.gifts), ctx.t('gifts.gifts'))}${kpi(String(s.contributions), ctx.t('gifts.contributions'))}${totals ? kpi(totals, ctx.t('gifts.contributionTotal')) : ''}${kpi(String(s.toThank), ctx.t('gifts.toThank'), s.toThank > 0)}</div>
  <table><thead><tr><th>${e(ctx.t('gift.from'))}</th><th>${e(ctx.t('gift.description'))}</th><th class="num">${e(ctx.t('gift.amount'))}</th><th>${e(ctx.t('gift.thanked'))}</th></tr></thead><tbody>${snap.gifts
    .map((g) => `<tr><td>${e(g.guestId ? (guests.get(g.guestId) ?? g.contributor) : g.contributor)}</td><td>${e(g.description)}</td><td class="num">${g.kind === 'contribution' ? ctx.money(g.amountMinor, g.currency) : ''}</td><td>${g.thanked ? '✓' : ''}</td></tr>`)
    .join('')}</tbody></table>`;
}

function taskSection(snap: EventSnapshot, ctx: ReportContext): string {
  const p = taskProgress(snap.tasks);
  return `<p>${e(ctx.t('tasks.progressLine', { done: p.done, total: p.total, percent: ctx.percent(p.ratio) }))}</p><table><thead><tr><th>${e(ctx.t('task.title'))}</th><th>${e(ctx.t('task.due'))}</th><th>${e(ctx.t('task.assignee'))}</th><th>${e(ctx.t('task.status'))}</th></tr></thead><tbody>${sortTasks(snap.tasks)
    .map((x) => `<tr><td>${e(x.title)}</td><td>${x.dueDate ? e(ctx.day(x.dueDate)) : ''}</td><td>${e(x.assignee)}</td><td>${e(ctx.t(`taskStatus.${x.status}`))}</td></tr>`)
    .join('')}</tbody></table>`;
}

export function buildReportHtml(kind: ReportKind, snap: EventSnapshot, ctx: ReportContext, opts: { includeContacts?: boolean } = {}): string {
  const contacts = opts.includeContacts ?? false;
  const title = ctx.t(`reports.kinds.${kind}`);
  switch (kind) {
    case 'guests':
      return page(title, snap, ctx, `${rsvpSection(snap, ctx)}${guestTable(snap, ctx, contacts)}`);
    case 'rsvp':
      return page(title, snap, ctx, `${rsvpSection(snap, ctx)}<h2>${e(ctx.t('rsvp.awaiting'))}</h2>${guestTable(snap, ctx, contacts, (s) => s === 'invited' || s === 'no_response' || s === 'maybe')}`);
    case 'budget':
      return page(title, snap, ctx, budgetSection(snap, ctx, false));
    case 'expenses':
      return page(title, snap, ctx, budgetSection(snap, ctx, true));
    case 'timeline':
      return page(title, snap, ctx, timelineSection(snap, ctx));
    case 'vendors':
      return page(title, snap, ctx, vendorSection(snap, ctx, contacts));
    case 'seating':
      return page(title, snap, ctx, seatingSection(snap, ctx));
    case 'gifts':
      return page(title, snap, ctx, giftSection(snap, ctx));
    case 'tasks':
      return page(title, snap, ctx, taskSection(snap, ctx));
    case 'final':
      return page(
        title,
        snap,
        ctx,
        `<h2>${e(ctx.t('reports.kinds.rsvp'))}</h2>${rsvpSection(snap, ctx)}<h2>${e(ctx.t('reports.kinds.budget'))}</h2>${budgetSection(snap, ctx, false)}<h2>${e(ctx.t('reports.kinds.tasks'))}</h2>${taskSection(snap, ctx)}<h2>${e(ctx.t('reports.kinds.timeline'))}</h2>${timelineSection(snap, ctx)}<h2>${e(ctx.t('reports.kinds.vendors'))}</h2>${vendorSection(snap, ctx, false)}<h2>${e(ctx.t('reports.kinds.gifts'))}</h2>${giftSection(snap, ctx)}${snap.event.notes ? `<h2>${e(ctx.t('event.notes'))}</h2><p>${e(snap.event.notes)}</p>` : ''}`,
      );
  }
}

/* ------------------------------------------------------------ Invitation */

export interface InvitationView {
  title: string;
  hosts: string;
  message: string;
  dateLine: string;
  timeLine: string;
  venueLine: string;
  rsvpLine: string;
}

/** Card-sized PDF of an invitation (A5 portrait). The background image is embedded as data URI when provided. */
export function invitationHtml(inv: Pick<Invitation, 'design'>, view: InvitationView, backgroundDataUri?: string | null): string {
  const d = inv.design;
  const tpl = findInvitationTemplate(d.templateId);
  const font = FONT_FAMILIES[d.font].css;
  const bg = backgroundDataUri ? `background-image:linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)),url('${backgroundDataUri}');background-size:cover;background-position:center;` : '';
  const frame = d.layout === 'framed' ? `outline:2px solid ${e(d.accent)};outline-offset:-22px;` : '';
  const align = d.layout === 'split' || d.layout === 'minimal' ? 'left' : 'center';
  const banner = d.layout === 'banner' ? `<div style="height:70px;margin:-40px -40px 30px;background:${e(d.accent)}"></div>` : '';
  const line = (s: string, size: number, extra = '') => (s ? `<div style="font-size:${size}px;margin:6px 0;${extra}">${e(s)}</div>` : '');
  return `<!doctype html><html><head><meta charset="utf-8"><style>@page{margin:0}html,body{margin:0;height:100%}</style></head><body>
  <div style="box-sizing:border-box;width:100%;min-height:100%;padding:40px;background:${e(d.background)};${bg}color:${e(d.foreground)};font-family:${font};text-align:${align};${frame}display:flex;flex-direction:column;justify-content:center">
  ${banner}
  <div style="color:${e(d.accent)};font-size:26px;letter-spacing:6px">${e(tpl.ornament)}</div>
  ${line(view.hosts, 15, 'letter-spacing:2px;text-transform:uppercase;opacity:.85')}
  ${line(view.title, 38, `font-weight:700;color:${e(d.accent)};line-height:1.15;margin:16px 0`)}
  ${line(view.message, 16, 'white-space:pre-wrap;line-height:1.5')}
  <div style="height:1px;background:${e(d.accent)};opacity:.6;margin:18px ${align === 'center' ? '25%' : '0'}"></div>
  ${line(view.dateLine, 18, 'font-weight:600')}${line(view.timeLine, 16)}${line(view.venueLine, 15, 'white-space:pre-wrap')}
  ${line(view.rsvpLine, 13, 'margin-top:18px;opacity:.85')}
  <div style="color:${e(d.accent)};font-size:22px;letter-spacing:6px;margin-top:10px">${e(tpl.ornament)}</div>
  </div></body></html>`;
}

/** Plain-text invitation for WhatsApp / SMS / e-mail. */
export function invitationText(view: InvitationView): string {
  return [view.hosts, view.title.toUpperCase(), '', view.message, '', [view.dateLine, view.timeLine].filter(Boolean).join(' · '), view.venueLine, '', view.rsvpLine]
    .filter((l, i, arr) => l !== '' || (arr[i - 1] ?? '') !== '')
    .join('\n')
    .trim();
}
