# Technical Brief: Bulk Changes UI

**Status:** Draft
**Date:** 2026-05-11
**Stack:** React · TypeScript · Vite

---

## Overview

The PATCH endpoint already accepts an array of changes. The current form only submits one at a time. Add a "+" button to the drawer so users can add multiple target/replacement pairs and submit them all in one request.

---

## Behaviour

- Drawer opens with one change row (target + occurrence + replacement) — same as today
- "+" button below the rows adds another row
- Each row can be independently filled out
- "Apply" submits all rows as a single `changes` array to `PATCH /api/documents/:id`
- If any row has an empty target or replacement, disable the Apply button
- Remove button ("×") on each row — always visible when there are 2+ rows, hidden when only one row remains

---

## Data Shape

```ts
type ChangeRow = {
  id: string;         // local key for React list rendering
  target: string;
  occurrence: number;
  replacement: string;
};
```

State: `const [rows, setRows] = useState<ChangeRow[]>([initialRow])`

On submit, map rows to the API shape:
```ts
rows.map(r => ({
  operation: "replace" as const,
  target: { text: r.target, occurrence: r.occurrence },
  replacement: r.replacement,
}))
```

---

## Implementation

### ChangeForm changes

- Replace single `target` / `occurrence` / `replacement` state with `rows: ChangeRow[]`
- `addRow` — appends a new empty row
- `removeRow(id)` — filters out that row
- `updateRow(id, field, value)` — updates a single field on a row
- Render a `<ul>` of row components, each with target textarea, occurrence input, replacement textarea, and remove button
- "+" button below the list
- Apply button disabled if any row has blank target or replacement

### Occurrence indicator per row

Each row independently shows its own occurrence count using `useDebounce` + `countOccurrences` (from the occurrence indicator feature) — pass `documentContent` down the same way.

---

## Files

| File | Change |
|------|--------|
| `client/src/components/ChangeForm.tsx` | Replace single-row state with `rows` array, add/remove/update handlers |
| `client/src/styles/ChangeForm.module.css` | Add `.row`, `.addButton`, `.removeButton` styles |

No backend changes required.

---

## Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| One row — remove clicked | Remove button hidden, cannot go below 1 row |
| Any row has empty target | Apply button disabled |
| Backend rejects one change | Entire request fails (API is atomic) — show error, all rows preserved |
| Drawer closed and reopened | Rows reset to a single empty row |
