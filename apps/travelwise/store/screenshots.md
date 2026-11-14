# Screenshots plan (genuine captures only)

Capture from a **preview build** on a 1080×2400 device or emulator, in light and dark mode.
Use a Premium license-tester account so no ad appears.

**The trips shown must be created by hand for the capture and look like plausible personal
plans.** Do not show real people's names, real booking references or real documents. Use
obviously sample values (e.g. reference "SAMPLE1", a document titled "Sample ticket").
No fake ratings, reviews, awards, user counts or other brands' device frames.

| # | Screen | Caption (en) | FR | ES |
| --- | --- | --- | --- | --- |
| 1 | Home dashboard with an ongoing trip | Your whole trip, in one place | Tout votre voyage au même endroit | Todo tu viaje en un solo lugar |
| 2 | Itinerary timeline (2 cities) | Plan day by day | Planifiez jour par jour | Planifica día a día |
| 3 | Bookings list grouped by date | All your bookings, offline | Vos réservations, hors ligne | Tus reservas, sin conexión |
| 4 | Trip budget with categories | Stay on budget | Respectez votre budget | Cumple tu presupuesto |
| 5 | Shared expenses balances | Split costs fairly | Partagez les frais | Reparte los gastos |
| 6 | Packing list (Packing progress) | Never forget a thing | N'oubliez plus rien | No olvides nada |
| 7 | Documents (locked → unlocked) | Documents always at hand | Vos documents toujours là | Tus documentos siempre a mano |
| 8 | Travel journal with photos | Keep your memories | Gardez vos souvenirs | Guarda tus recuerdos |

Capture with `adb shell settings put global sysui_demo_allowed 1`, then system demo mode (clean
status bar), then `adb exec-out screencap -p > shot-01.png`.
