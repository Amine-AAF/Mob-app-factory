# Screenshots plan (genuine captures only)

Capture from a **preview build** on a 1080×2400 device/emulator, light and dark variants, with
realistic data typed in by hand for the shoot (never shipped in the app). No fake ratings, awards or
other brands' device frames. Make sure no test ad is visible.

| # | Screen | Caption (en) |
| --- | --- | --- |
| 1 | Home dashboard (balance, month, budget left) | Understand your money at a glance |
| 2 | Add expense form | Add an expense in seconds |
| 3 | Budgets tab with category progress | Budgets that keep you on track |
| 4 | Reports — spending by category + insight | See where your money goes |
| 5 | Savings goal detail | Reach your savings goals |
| 6 | Subscriptions with monthly/yearly estimate | Know what your subscriptions cost |
| 7 | Dashboard in privacy mode (amounts hidden) | Hide amounts with one tap |
| 8 | Data & backup | Your data stays on your phone |

Captions FR/ES: adapt from `listing-fr.md` / `listing-es.md`.

Capture: `adb shell settings put global sysui_demo_allowed 1` (demo mode for a clean status bar), then
`adb exec-out screencap -p > shot-01.png`.
