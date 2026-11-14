# SpendWise — financial calculation rules

All rules below are implemented as pure functions and covered by tests (`src/__tests__/`).

## Money representation
- Every amount is an **integer number of minor units** (`amount`, `initial_balance`, `limit_amount`, `price`, `target`…) stored next to an **ISO 4217** currency code.
- Minor-unit exponents come from ISO 4217 (`src/utils/money.ts` → `CURRENCIES`): JPY/KRW/CLP/VND/XOF/XAF = 0, KWD/BHD/OMR/JOD/TND = 3, others = 2.
- User input is parsed **from the string** (`parseAmount`), never through `parseFloat`. Accepted: `1234.5`, `1 234,50`, `1,234.50`, `1.234,50`. A single `.` is always decimal; a single `,` followed by exactly 3 digits is a thousands separator (except for 3-digit currencies).
- Max single amount: `MAX_MINOR` = 10¹³ minor units (100 billion with 2 digits), keeping all sums far below `Number.MAX_SAFE_INTEGER`.
- Display (`formatMoney`) formats the integer part with `Intl.NumberFormat` and injects the exact fraction digits — no precision loss even for very large amounts.
- Multiplications/divisions (exchange rates, normalisation, percentages, interest) use **BigInt rationals** and are rounded **once**, half away from zero (`roundDiv`).
- Splits use the largest-remainder method (`allocate`) so parts always add up to the total.

## Transaction types and what they affect
| Type | Account balance | Income | Spending |
| --- | --- | --- | --- |
| expense | −amount | — | +amount |
| income | +amount | +amount | — |
| refund | +amount | — | −amount (in its category) |
| transfer | source −amount, destination +to_amount | **excluded** | **excluded** |
| adjustment (signed) | +amount | **excluded** | **excluded** |

- `balance = initial_balance + Σ effects` (computed in SQL, cross-checked against a reference implementation in tests).
- Transfers are **one row** (`account_id` → `to_account_id`, `to_amount` for cross-currency transfers), so they can never be double-counted.
- A transaction's currency is always its account's currency.

## Currencies
- Amounts in different currencies are **never added**. Totals are per currency.
- Dashboard/budgets/reports use the user's main currency. Other currencies are included **only** when the user saved a manual exchange rate (`exchange_rates`, source = `manual`, with update date); otherwise they are excluded and the UI says how many transactions were left out. No automatic conversion, no network rates.

## Budgets
- One budget per month (`budgets.month` unique) with an optional global limit and category limits. A month without a global limit uses the sum of its category limits.
- Spent = spending (expenses − refunds) of that month in the budget currency.
- Percent = round(spent × 100 / limit). Threshold reached when `spent × 100 ≥ limit × threshold` (integer comparison). Thresholds 50/75/90/100 are configurable.
- "Copy previous month" never modifies the source month and never overwrites an existing budget. Deleting a month's budget only deletes that month.

## Recurring transactions
- Occurrence *n* is computed from the **start date** (not from the previous occurrence): monthly from Jan 31 → Feb 28/29 → Mar 31; yearly from Feb 29 → Feb 28 on non-leap years.
- Idempotency: table `recurring_occurrences` (primary key `rule_id + occurrence_date`) is claimed with `INSERT OR IGNORE` **before** the transaction is written, inside one DB transaction. A date can therefore never produce two transactions, even with concurrent runs.
- Only due dates (≤ today) are ever recorded. Future occurrences are **planned** projections shown separately and never stored. Rules with "record automatically" off wait for the user to confirm or skip.
- Deleting a generated transaction keeps its ledger entry: it is not re-created. Deleting a rule keeps past transactions.

## Subscriptions
- A tracked subscription is a projection, not a payment. A payment exists only when the user records it.
- yearly cost = price × periods per year; monthly cost = yearly cost / 12, with 365 days, 52 weeks, 12 months per year (exact rational, one rounding per currency).

## Savings goals
- saved = Σ contributions (withdrawals are negative and can't make it negative). The "already saved" amount at creation is stored as the first contribution.
- monthsLeft = max(1, months from the current month to the target month); recommended monthly = ceil(remaining / monthsLeft).
- Contributions are tracking only: they are never counted as spending.

## Reports & insights
- Everything is computed from recorded transactions only. Insights need ≥ 3 transactions in the period (and in the previous period for comparisons) and a change of at least 5 %. Savings rate = (income − spending) / income, shown only when there is income.

## Calculators (estimates, not advice)
- Monthly budget: available = income − planned expenses − income × savings %. Reference 50/30/20 split.
- Savings goal: monthly = ceil(remaining / months) or months = ceil(remaining / monthly), no interest.
- Expense split: tip = round(total × tip %); shares = allocate(total + tip, weights).
- Salary: 12 months, 26 bi-weeks, 52 weeks, 260 working days, user hours/week; net = gross × (1 − user's deduction %).
- Debt: interest_m = round(balance × APR / 12); payment covers interest first; last payment reduced to what's left; minimum payment for N months found by binary search on the same simulation.
