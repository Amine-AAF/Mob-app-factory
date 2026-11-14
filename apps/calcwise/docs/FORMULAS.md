# CalcWise — formulas, precision and rounding conventions

All calculations run on **decimal numbers with 50 significant digits** (`decimal.js`, configured in
`src/utils/decimal.ts`), never on JavaScript binary floats. A value is rounded **once, at display time**,
with **ROUND_HALF_UP** (2.675 → 2.68, 1.005 → 1.01). Every formula below is unit-tested in
`src/__tests__/` (engine, calculators, format).

## Mathematical engine (`src/services/MathematicalEngine.ts`)

Safe evaluator: tokenizer → recursive-descent parser → AST → decimal evaluation. **No `eval`, no
`Function`, no code execution** (a test scans the code base for both).

| Rule | Example |
| --- | --- |
| Precedence: `^` > unary sign > `× ÷` > `+ −`; `^` is right-associative | `2^3^2 = 512`, `−2^2 = −4`, `2^−1 = 0.5` |
| Implicit multiplication | `2π`, `2(3+1) = 8`, `3√16 = 12` |
| Percent: `x% = x/100`; `a ± b% = a ± a·b/100` (physical-calculator convention); `a × b% = a·b/100` | `200 + 10% = 220`, `500 − 15% = 425`, `250 × 20% = 50` |
| Missing `)` are closed automatically | `(2+3 = 5` |
| Trigonometry in degrees or radians; results below 10⁻⁴⁰ are noise from π's finite precision → 0 | `sin(180°) = 0`, `tan(90°)` = undefined |
| Additive cancellation below 10⁻⁴⁶ × the operands → 0 | `1/3×3 − 1 = 0` |
| Factorial: integers 0…3000 | `20! = 2.432902008 × 10¹⁸` |
| `root(x; n)`: real odd roots of negatives | `root(−8; 3) = −2`; `root(−16; 4)` = undefined |
| Errors are reported, never shown as a number | division by zero, domain (√−1, log 0), overflow (> 10⁹⁹⁹⁹), syntax |
| Chaining after `=` uses the exact previous result (`ans`) | `1/3 =` then `× 3 = 1` (not 0.999…) |

Display: 15 significant digits; scientific notation (`1.5 × 10²⁰`, 10-digit mantissa) at ≥ 10¹⁵ or
< 10⁻⁹. Separators follow the chosen locale (device by default): `1,234.5`, `1 234,5`, `1.234,5`, `1’234.5`.

Input parsing (`parseLocalizedNumber`) refuses ambiguous text instead of guessing: in English
`1,23` is rejected (not 1.23 nor 123); `1,000` is 1000; in French `1.5` is accepted as 1.5.

## Percentage calculator

| Mode | Formula |
| --- | --- |
| X % of | `x × p / 100` |
| Increase / decrease | `x × (1 ± p/100)` |
| Change | `(to − from) / |from| × 100` (from ≠ 0) |
| What % | `part / whole × 100` (whole ≠ 0) |
| Before discount | `final / (1 − p/100)` (p < 100) |
| Margin / markup | margin = `(price − cost) / price`; markup = `(price − cost) / cost` |

## Discount & shopping

- Successive discounts: `price × Π(1 − dᵢ/100)` — 20 % then 10 % = 28 % overall.
- VAT: `gross = net × (1 + r)`, `net = gross / (1 + r)`, `vat = gross − net`.
- Unit price: `price / (quantity × unit factor)` per kg, L or piece. Exact factors: oz = 28.349523125 g,
  lb = 453.59237 g, US fl oz = 29.5735295625 mL, US gal = 3.785411784 L. Mass vs volume is refused.

## Tip & bill split

- `tip = round(bill × p / 100)`, `total = round(bill + tip + extra)` (to the currency's minor unit).
- Exact split: the total in minor units is divided; leftover units go to the first people, so
  Σ shares = total (100.00 / 3 → 33.34 + 33.33 + 33.33).
- Rounded split: each share is rounded **up** to the step (0.10, 0.50, 1…); the surplus is displayed.

## Loan (fixed-rate annuity) — information only

- `i = annual rate / 12 / 100` (nominal rate, monthly compounding).
- `M = P·i / (1 − (1 + i)^−n)`; `M = P / n` if `i = 0`.
- `M` is rounded **up** to the cent; each month `interest = round_half_up(balance × i)`,
  `principal = M − interest`; the **last payment clears the balance** (so it is ≤ M).
- Guarantees (tested on 5 reference loans, incl. 600 months at 12.75 %): Σ principal = P exactly,
  final balance = 0, total interest = Σ payments − P, all amounts in cents.
- Reference: 200 000 at 3.5 % over 240 months → 1 159.92 / month (matches bank tables).
- Early repayment: the lump sum is applied after month k; then either the payment is kept (shorter
  term) or recomputed on the remaining balance and months (lower payment). Penalties not modelled.
- Not modelled: insurance, fees other than optional upfront fees, taxes, variable rates, APR/TAEG.

## Savings (compound interest) — projection only

- Equivalent monthly rate: monthly `r/12`; quarterly `(1 + r/4)^(1/3) − 1`; yearly `(1 + r)^(1/12) − 1`.
- Month by month: deposit (start or end of month) and `interest = balance × i`, no intermediate rounding.
- Cross-checked against the closed form `FV = C₀(1+i)ⁿ + c((1+i)ⁿ − 1)/i` (× (1+i) for start-of-month)
  to within 10⁻³⁰ for every compounding/timing combination.
- Reference: 1 000 + 100/month at 5 % for 10 years (monthly, end) → 17 175.24.
- Not modelled: taxes, fees, inflation, variable returns.

## Unit converter

Linear categories go through a base unit with exact definitions (inch = 0.0254 m, mile = 1609.344 m,
acre = 4046.8564224 m², km/h = 5/18 m/s kept as an exact fraction, kcal = 4184 J, kWh = 3.6 MJ,
BTU (IT) = 1055.05585262 J, eV = 1.602176634 × 10⁻¹⁹ J). Data units: kB = 1000 B, KiB = 1024 B.
Month = 1/12 of the mean Gregorian year (365.2425 days). Temperature uses affine formulas and refuses
values below absolute zero. Every unit pair round-trips without drift (tested).
