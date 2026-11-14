# PlantCare — botanical content: sources, method and review status

This file documents where the bundled plant library (`species/*.ts`) and the plant-problem
guide (`healthGuide.ts` + `i18n/locales/*.json › healthGuide`) come from, how they were
compiled, and what must be checked before a production release.

## 1. Reference sources

| Code | Source | Used for |
| --- | --- | --- |
| POWO | Royal Botanic Gardens, Kew — *Plants of the World Online* (powo.science.kew.org) | Accepted scientific names, synonyms, botanical family, native range |
| RHS | Royal Horticultural Society — plant finder & advice pages (rhs.org.uk) | Light, water, soil, hardiness, flowering period, pests & problems guidance |
| MBG | Missouri Botanical Garden — *Plant Finder* (missouribotanicalgarden.org) | Light/water needs, temperature/hardiness, bloom time, care difficulty |
| ASPCA | ASPCA Animal Poison Control — *Toxic and Non-Toxic Plant List* (aspca.org) | Pet toxicity for cats and dogs |
| EXT | University extension services (e.g. UF/IFAS, NC State Extension Gardener Plant Toolbox, UMN Extension) | Houseplant care ranges, common causes of yellowing/browning/wilting, pests |

## 2. Method and editorial rules

1. **Structured data only.** Each sheet is a row of enums and numbers (light, water,
   humidity, soil, temperature range, bloom seasons, difficulty, pet status, origin). The
   description shown in the app is *composed* from these attributes (`localize.ts`); no
   free-text botanical claim is generated or invented.
2. **Scientific names** follow POWO's accepted names (e.g. *Dracaena trifasciata*,
   *Goeppertia orbifolia*, *Salvia rosmarinus*, *Curio rowleyanus*); well-known former names
   are kept as `synonyms` so search still finds "Sansevieria", "Calathea", "Rosmarinus"…
   Scientific names are never translated.
3. **Temperatures** are *indicative comfort ranges* in °C: the minimum is the lowest
   temperature generally tolerated without damage (for hardy outdoor plants: approximate
   winter minimum once established). They are rounded and conservative.
4. **Bloom seasons** are given for temperate cultivation; the app tells the user that they
   shift with the region (southern hemisphere / tropics).
5. **Pet toxicity is never guessed.** `toxic` / `non_toxic` is set only when the plant is
   explicitly listed by the ASPCA. Anything not explicitly listed is `unknown`, and the
   "Pet safe" filter only shows `non_toxic` plants. During compilation, entries whose ASPCA
   listing could not be matched to the exact species were downgraded to `unknown`
   (e.g. *Zamioculcas*, *Ficus lyrata*, *Agave americana*, *Echeveria elegans*).
6. **No universal watering frequency.** Water needs are qualitative (low / moderate / high)
   with a soil-moisture hint. Suggested intervals in the app (`WATERING_SUGGESTIONS`) are
   presented as editable starting points, never applied automatically.
7. **No dosage.** Fertilizer records are free text; the app always says to follow the
   manufacturer's label.
8. **Health guide = possible causes, not a diagnosis.** Every screen repeats that one
   symptom can have several causes; photos are never analysed.

## 3. Coverage

`SPECIES.length` ≥ 150 (enforced by `src/__tests__/library.test.ts`), across all 10 app
categories: tropical & indoor foliage, ferns, palms, indoor flowering plants, succulents,
cacti, garden flowers, climbers & shrubs, herbs, vegetables & fruit, trees. Sheets flagged
`core: 1` (≥ 40) form the free "basic library"; the others need Premium.

## 4. Review status — REQUIRED before production

The dataset was compiled from the references above by the development session, without
live access to each source page. Before `releaseStatus` moves to `closed-testing`:

- [ ] A horticulture-literate reviewer checks each sheet against POWO + RHS/MBG
      (scientific name, family, origin, light, water, temperature, bloom).
- [ ] Every `toxic` / `non_toxic` value is re-checked on the live ASPCA list (the list is
      updated over time). When in doubt, set `U`.
- [ ] Bump `LIBRARY_VERSION` in `species/index.ts` after any correction (re-seeds the
      bundled copy; user plants stay linked because ids are stable).
- [ ] Record the review date and reviewer below.

| Date | Reviewer | Scope | Notes |
| --- | --- | --- | --- |
| — | — | — | Not reviewed yet |
