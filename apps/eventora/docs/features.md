# Eventora — functional scope (v1.0)

Legend: ✅ implemented & unit-tested logic · 🟢 implemented (UI, verified by typecheck only) · 🟡 needs device verification · ⬜ not in v1

| Module | Scope | State |
| --- | --- | --- |
| Dashboard | upcoming / in-preparation events, guests, confirmations, open & overdue tasks, budget used, urgent tasks, next deadlines, recently completed, shortcuts | 🟢 (aggregations ✅) |
| Events | 14 types, cover image, description, date/start/end, time zone, venue, address, attendance, budget + currency, notes, 6 statuses, theme; duplicate (config only or with guests); suggested status when the date passes | ✅ / 🟢 |
| Guest manager | first/last name, phone, e-mail, group/family, category, adult companions, children, child flag, dietary, notes, RSVP; search (accent-insensitive, phone), filters (status, group, children), sort; groups; duplicate detection + merge; headcount; CSV import (EN/FR/ES headers, `,`/`;`, row-level issues, duplicate skipping) | ✅ / 🟢 |
| RSVP tracker | invited, confirmed, declined, pending, expected people, companions, response rate; quick status buttons; response date + note; history with source; bulk "mark invited"; export | ✅ / 🟢 |
| Invitations | 24 designs (8 free), colours, 5 typefaces, 5 layouts, background image, texts, show/hide date/time/venue, live preview; share PDF / text (WhatsApp, e-mail… via share sheet); copy text | 🟢 🟡 (PDF rendering) |
| Budget | initial budget, envelopes per category (13 categories), estimated vs actual, vendor link, due/paid date, payment status, receipt/invoice, notes; totals, remaining, unpaid, by category, spending over time; multi-currency with explicit rates | ✅ / 🟢 |
| Tasks | title, description, assignee, due date, priority, category, status, notes, vendor link; list (overdue/today/7 days/later/no date/done), calendar view, priority filter, overall progress, cross-event tab | ✅ / 🟢 |
| Programme | activities with start/end/place/owner/notes, after-midnight support, overlap detection, free-time gaps, move up/down (slot swap), shift all, share as text / PDF / CSV | ✅ / 🟢 |
| Seating plan | round, rectangular, head, custom tables; seats; tap-to-place; move/unseat; group placement; auto-place keeping families together; free/over seats; unseated list; export PDF/CSV | ✅ / 🟢 |
| Vendors | 9 categories, contact, phone, e-mail, address, website, quote, amount, 6-step status pipeline, next appointment, contracts (files), linked expenses/tasks, call/e-mail/website actions | ✅ / 🟢 |
| Gifts | gifts and contributions (amount + currency), from a guest or someone else, received date, thank-you tracking | ✅ / 🟢 |
| Templates | 20 planning templates (6 free) with checklist, programme, budget split; save any event as a custom template (Premium) | ✅ |
| Reports & export | 10 report kinds in PDF, 7 in CSV, JSON backup/restore, share via Android | ✅ (builders) 🟡 (PDF output) |
| Notifications | 6 configurable kinds, lead days + hour, master switch, opt-in event names, test notification | ✅ / 🟡 |
| i18n | EN default, FR, ES; Intl dates/times/currencies; event time zones | ✅ |
| Monetization | free limits, paywall (monthly/annual/lifetime), restore, banner policy, UMP consent | ✅ (policy) 🟡 (store) |
| Privacy | local storage, no contacts permission, share warnings, delete all data, in-app privacy summary | 🟢 |

## Not in v1 (by design)

- ⬜ Sending invitations or collecting RSVPs automatically (WhatsApp, e-mail…): the user shares manually.
- ⬜ Real-time collaboration / sync: requires a backend.
- ⬜ Image (PNG) export of invitations and seating plan: needs `react-native-view-shot` (to be validated
  as a factory dependency). PDF covers printing and sharing.
- ⬜ Device contacts import: deliberately not requested (privacy, permissions). CSV covers bulk import.
- ⬜ Drag-and-drop seating canvas with free positions: tap-to-place is used (accessible, reliable).
- ⬜ Online payments for contributions.
- ⬜ Currency conversion rates from the internet: rates are entered explicitly by the user.
