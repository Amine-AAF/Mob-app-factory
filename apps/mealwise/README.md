# MealWise — Meal Planner & Grocery List

Offline-first Android app (Expo SDK 58 · React Native 0.88 · TypeScript strict) that helps people
plan the week's meals, cook from a recipe book, and turn the plan into a grocery list that adds
ingredients up correctly. No account, no backend, all data on the device. English by default,
French and Spanish included.

## Features

| Area | What it does | Where |
| --- | --- | --- |
| Dashboard | Next meal, today's slots, week summary, grocery progress, "use soon" pantry items, favorites, quick ideas, shortcuts | `app/(tabs)/index.tsx` |
| Meal planner | Week view (list or 7×4 calendar), add a recipe or a custom meal, move, duplicate a meal or a whole day, copy a week, clear a week, save a week as "my menu", ingredients for the week | `app/(tabs)/planner.tsx`, `app/plan/*`, `src/domain/planner.ts` |
| Recipe book | 108 original recipes (EN/FR/ES), search by title or ingredient (accent and plural tolerant), 9 categories, quick filters, favorites, history, personal recipes (create / edit / delete / duplicate a bundled one), manual text import | `app/(tabs)/recipes.tsx`, `app/recipe/*`, `src/domain/recipes.ts`, `src/domain/recipeImport.ts` |
| Cooking mode | One step at a time, large text, ingredient check-list, servings scaling, step timers + free timer (local notification when the screen is off), screen kept awake, no ads | `app/cook/[id].tsx` |
| Grocery list | Generated from the plan for 1/3/7/14 days, grouped by aisle, merging only compatible units, pantry subtraction, manual items (merged when compatible), edit/delete, estimated prices, history, reuse an old list, share via the Android share sheet, CSV export (Premium) | `app/(tabs)/grocery.tsx`, `app/grocery/*`, `src/domain/grocery.ts` |
| Pantry | Products with quantity, location (fridge / freezer / cupboard), optional expiry date, expiry badges and alerts, "used", missing ingredients on recipes, "what can I cook?" (Premium) | `app/pantry/*`, `src/domain/pantry.ts` |
| Nutrition insights | Per-serving estimate per recipe, day view, week averages + macro split (Premium). Clearly labelled estimates, coverage shown, never invented | `app/nutrition.tsx`, `src/domain/nutrition.ts` |
| Meal templates | 8 built-in plans (Family, Budget, Quick & Easy, Vegetarian, High Protein, Student, Mediterranean, Busy Week) + user menus, "add to week" or "replace week" | `app/templates.tsx`, `src/content/templates.ts` |
| Budget | Weekly budget, expenses (also recorded when finishing a list), budget vs. spent, monthly history and recipe cost estimates from the user's own prices (Premium) | `app/budget.tsx`, `src/domain/budget.ts` |
| Settings | Language, metric/imperial, original units, currency, week start, 12/24 h, household size, diet, theme, notifications, backup/restore, plan export, delete all data, privacy & ad consent | `app/settings/*`, `app/(tabs)/profile.tsx` |

## Architecture

```
app/                    Expo Router screens (thin: read via repositories, call domain functions)
  (tabs)/               Home · Planner · Recipes · Grocery · Profile
  recipe/ cook/ plan/ grocery/ pantry/ settings/   stacks & modals
src/
  domain/               Pure, framework-free logic (100 % unit-tested)
    units.ts            Dimensions, conversions, best unit per system
    quantity.ts         Parse ("1 1/2", "½", "1,5", "2-3"), scale, round, format
    ingredients.ts      Identity (catalog key or custom:<normalized>), matching, aisle guess
    grocery.ts          Aggregation, safe merging, pantry subtraction, regeneration plan
    planner.ts pantry.ts nutrition.ts budget.ts recipes.ts recipeImport.ts time.ts
  content/              Bundled, typed content (validated by tests)
    ingredients.ts      180 ingredients: names EN/FR/ES, aisle, reference values per 100 g
    recipes/*.ts        108 original recipes (4 files, ids prefixed bf/sn/lu/di/vg/de)
    schema.ts           zod schema + vegetarian/vegan/quick consistency rules
    templates.ts        8 weekly templates
  database/             SQLite schema (migrations via @factory/storage) + repositories
  services/             boot, recipe catalog, planning (grocery generation, notification sync),
                        notifications, monetization (RevenueCat), ads (AdMob + UMP), backup, files, share
  store/                zustand: preferences (AsyncStorage, boot-critical), session (entitlement, data version)
  components/           MealWise UI (recipe art, steppers, check rows, segmented control, cards, ad banner)
  i18n/                 i18next setup + locales/en|fr|es.json
store/                  Play Store listing, Data safety, privacy policy, release checklist
brand/mark.mjs          App mark used by `pnpm brand-assets apps/mealwise`
```

Data flow: screens → repositories (`repos()`) / domain functions → `dataChanged()` bumps a session
counter → `useAsync` reloads. Bundled recipes are read from the bundle (translated, immutable); the
database only holds user data (`user_recipes`, `plan_entries`, `grocery_lists/items`, `pantry_items`,
`price_book`, `expenses`, `favorites`, `recipe_history`, `meal_templates`, `user_preferences`).

### Units & merging rules (the tricky part)

- Mass ↔ mass and volume ↔ volume only (US cup/tbsp/tsp). Mass ↔ volume is **never** implicit.
- Every count unit (piece, clove, slice, can, bunch, pack, pinch) is its own dimension.
- Two lines merge only with the same ingredient key **and** a compatible unit; "red onion" ≠ "onion".
- "To taste" has no quantity; it is dropped when the same ingredient is bought by quantity.
- Shopping quantities round up (2 onions, not 1.5); recipe quantities round to kitchen fractions.
- Pantry stock is subtracted only when units are compatible; otherwise the line is flagged "check your pantry".

### Shared packages used

`@factory/design-system` (theme + components), `@factory/storage` (migrations, backup), `@factory/localization`,
`@factory/monetization`, `@factory/analytics`, `@factory/app-core` (dates), `@factory/app-config`, `@factory/testing`.
No shared package was modified. MealWise-specific notification scheduling (4 reminder types + timers)
lives in `src/services/notifications.ts` because `@factory/notifications` handles one daily reminder only
(candidate for mutualisation, see `factory/tracking/mealwise.md`).

## Free vs Premium

| | Free (with a small banner on browse screens) | Premium |
| --- | --- | --- |
| Recipes | 74 bundled recipes, 15 personal recipes | All 108 + unlimited personal recipes |
| Planner | This week + next week, 1 saved menu | Unlimited weeks and menus |
| Templates | Family, Budget, Quick, Vegetarian, Student | + High Protein, Mediterranean, Busy Week |
| Pantry | 40 products, expiry alerts | Unlimited + "what can I cook?" |
| Nutrition | Per recipe and per day | + weekly averages & macro split |
| Budget | Weekly budget & expenses | + monthly history & recipe costs |
| Export | Share list as text | CSV list export, plan export (text/CSV) |
| Ads | Banner on Home, Planner, Recipes list, Past lists, Profile | None |

Products (manifest): `mealwise_premium_monthly` (≈ 2.99 USD), `mealwise_premium_annual` (≈ 17.99 USD),
`mealwise_premium_lifetime` (≈ 29.99 USD), entitlement `premium`. Prices shown in the app always come
from Google Play (localized). Without `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` the app runs free and the
paywall says purchases are unavailable — it never fakes a purchase.

Ads: banner only, development/preview builds always use Google test IDs, production IDs come from
protected CI variables. Never on a recipe, in cooking mode or on the active grocery list; no
interstitials. Consent is gathered with Google UMP before any ad request; users can change it in
Settings › Privacy. No user content is passed to the ad SDK.

## Run it

Requirements: Node ≥ 20.19, pnpm 10, JDK 17 + Android SDK for local native builds.

```bash
pnpm install
pnpm --filter mealwise typecheck
pnpm --filter mealwise test
cd apps/mealwise
npx expo run:android          # development build on a device / emulator
npx expo start --dev-client   # then reload from the dev client
```

The app uses native modules (SQLite, notifications, AdMob, RevenueCat), so it runs in a **development
build**, not in Expo Go. Copy `.env.example` to `.env` for local builds.

EAS builds (profiles in `eas.json`): `eas build -p android --profile development|preview|production`.
`production` produces an `.aab` and requires `ADMOB_ANDROID_APP_ID`. Never `eas submit` without approval.

## Tests

`pnpm --filter mealwise test` — 8 suites, 161 tests (Jest + jest-expo, in-memory SQLite via sql.js):

| Suite | Covers |
| --- | --- |
| `units.test.ts` | Conversions, incompatible units, parsing edge cases, scaling, rounding, formatting |
| `grocery.test.ts` | Ingredient identity, merging rules, to-taste lines, pantry subtraction, imperial drafts, regeneration |
| `domain.test.ts` | Planner (weeks, templates, copy, limits), pantry (expiry, cookable), nutrition, budget, import parser, search |
| `database.test.ts` | Migrations, CRUD of recipes/plans/lists/pantry/budget, cascade, backup/restore/delete |
| `services.test.ts` | Notification schedule & sync, monetization (offline cache, purchase, restore), ads policy, templates, CSV/text export |
| `i18n.test.ts` | EN/FR/ES key parity, placeholders, every key used in code exists, plural unit labels, language resolution |
| `content.test.ts` | 108 recipes against the schema, category coverage, catalog nutrition plausibility |
| `ui.test.tsx` | Dashboard, recipe search, scaling/imperial, premium lock, cooking mode, grocery merge, paywall; WCAG contrast |

## Privacy

Everything is stored locally (SQLite + AsyncStorage). No account. Analytics are off by default and,
when enabled, only receive coarse anonymous events (never recipe titles, ingredients, notes, list or
pantry contents). Users can export a JSON backup, restore it, export their plan, and delete all data.
Android permissions: notifications only (Android 13+ runtime prompt when a reminder is turned on).
Storage, camera, location, microphone and exact alarms are explicitly blocked in `app.config.ts`.

## Content

All recipes, descriptions and steps were written for MealWise (no copied text). Ingredient reference
values are generic per-100 g averages used only for labelled estimates; recipes have no hard-coded
nutrition. See `src/content/schema.ts` for the rules every recipe must pass.
