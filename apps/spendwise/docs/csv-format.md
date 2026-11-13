# SpendWise CSV format (v1)

Header (column order free, names case-insensitive; `,` or `;` separator, UTF-8, optional BOM, RFC 4180 quoting):

```
date,type,amount,currency,account,category,to_account,to_amount,description,notes,payment_method,time
```

| Column | Required | Format |
| --- | --- | --- |
| date | yes | `YYYY-MM-DD` |
| type | yes | `expense` · `income` · `transfer` · `refund` · `adjustment` |
| amount | yes | positive decimal, e.g. `12.30` (`12,30` accepted). Adjustments may be negative. |
| currency | yes | ISO 4217 code, must match the account currency |
| account | yes | account name; created if it doesn't exist |
| category | for expense/income/refund | category name (as displayed) or built-in key (`food`, `salary`…); unknown → "Other" |
| to_account | transfers | destination account name; created if needed |
| to_amount | cross-currency transfers | amount received in the destination currency |
| description, notes | no | text |
| payment_method | no | `cash` · `card` · `bank_transfer` · `mobile` · `check` · `other` |
| time | no | `HH:MM` |

Example:

```
date,type,amount,currency,account,category,to_account,to_amount,description,notes,payment_method,time
2026-11-01,income,2500.00,EUR,Bank,Salary,,,November salary,,bank_transfer,
2026-11-02,expense,12.30,EUR,Bank,Food & Groceries,,,Bakery,,card,08:15
2026-11-03,transfer,100.00,EUR,Bank,,Cash,,ATM,,,
```

Import behaviour:
1. The whole file is parsed and validated first; a **preview** shows new rows, duplicates, invalid rows (with line numbers), accounts to create and category fallbacks.
2. Nothing is written until the user confirms. The import runs in **one database transaction** (all or nothing).
3. Duplicates (same date, type, amount, currency, account and description as an existing transaction) are skipped unless the user ticks "Import duplicates anyway".
4. Max 20,000 rows per file.

Export uses the same format; text cells starting with `= + - @` are prefixed with `'` to prevent spreadsheet formula injection (removed again on import).
