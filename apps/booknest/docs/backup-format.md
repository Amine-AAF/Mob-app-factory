# BookNest — backup and CSV formats

## JSON backup (versioned)

Produced by `exportBackup()` in `src/services/transferService.ts`, shared through the Android share sheet.

```jsonc
{
  "format": "factory-backup",      // factory envelope (@factory/storage)
  "formatVersion": 1,               // envelope version
  "appId": "booknest",              // other apps' backups are rejected
  "schemaVersion": 1,               // SQLite user_version at export time
  "createdAt": "2026-11-13T10:00:00.000Z",
  "booknest": { "backupVersion": 1, "includesCovers": false },
  "tables": {
    "authors": [...], "genres": [...], "books": [...], "reading_records": [...], "reading_sessions": [...],
    "reading_goals": [...], "quotes": [...], "reading_notes": [...], "reviews": [...], "collections": [...],
    "collection_books": [...], "wishlist_items": [...], "audiobook_progress": [...], "progress_updates": [...],
    "notification_settings": [...]
  },
  "covers": { "lx3k2a9f0b.jpg": "<base64 JPEG>" }   // only in the Premium "backup with covers"
}
```

Rules:
- Rows are raw table rows (snake_case columns). Unknown columns are ignored on restore, so older backups restore
  into newer schemas. A backup with a **newer** `schemaVersion` is refused (`newer_schema`).
- Never exported: `subscription_cache`, `session_timer` (device state).
- **Restore modes** (the UI always shows a summary first):
  - *Merge* — keeps current data, inserts only rows whose id doesn't exist; authors/genres are matched by name.
  - *Replace* — deletes current data then restores, in one transaction; requires two explicit confirmations.
- Covers: files are written to `<documents>/covers/` (names validated); cover URIs pointing to files that don't
  exist on the device are cleared, so books fall back to generated covers.

## CSV export

UTF-8 with BOM, comma-separated, RFC 4180 quoting, CRLF. Columns:
`Title, Subtitle, Original Title, Author, ISBN, Publisher, Year, Pages, Language, Format, Genre, Status,
Current Page, Started, Finished, Rating, Review, Favorite, Archived, Acquired, Price, Currency, Notes, Description`.
Cells starting with `= + - @` (non-numeric) are prefixed with `'` to prevent spreadsheet formula injection.
Quotes and journal entries are not part of the CSV (they are in the JSON backup and the Markdown journal export).

## CSV import

- Delimiter `,` or `;` auto-detected, quoted fields, BOM, CRLF/LF; max 20,000 rows.
- Header aliases (EN/FR/ES and common reading-app exports): `Title`, `Author`/`Author l-f`, `ISBN`/`ISBN13`
  (also `="…"` wrapped), `Number of Pages`, `Exclusive Shelf`/`Status` (`to-read`, `currently-reading`, `read`, `dnf`…),
  `My Rating` (0 = not rated), `Date Read`, `Date Started`, `Date Added`, `Publisher`, `Year Published`, `Binding`/`Format`,
  `Genre`, `Language`, `Price`, `Currency`, `Notes`, `Description`, `Favorite`.
- Dates: `YYYY-MM-DD`, `YYYY/MM/DD`, `DD/MM/YYYY`; future dates are ignored.
- Each row gets **errors** (row skipped: missing title) and **warnings** (value ignored: bad pages, year, rating, date,
  price, finish before start). Duplicates (ISBN or title+author, against the library *and* earlier rows of the file)
  are skipped unless the user opts in. The free plan imports up to its remaining quota and reports skipped rows.
- Import never modifies or deletes existing books.
