# document-redline

A document redlining service — REST API + React UI for making targeted text changes to contracts and searching across document content.

---

## Stack

- **Server:** Node.js · Express · TypeScript · SQLite (better-sqlite3) · Drizzle ORM
- **Client:** React · TypeScript · Vite
- **Tests:** Vitest · React Testing Library

## Setup

Requires Node.js 18+.

```bash
npm install
npm run dev
```

- API: http://localhost:3001
- UI: http://localhost:5173

## Seed Data

```bash
npm run seed
```

Populates the DB with 3 sample legal documents (NDA, Software License Agreement, Vendor Services Agreement).

## Tests

```bash
# server
cd server && npm test

# client
cd client && npm test
```

---

## API Reference

Base URL: `http://localhost:3001`

All request and response bodies are JSON. See [`requests.http`](./requests.http) for runnable examples (VS Code REST Client).

### Documents

| Method  | Path                         | Description                                         |
| ------- | ---------------------------- | --------------------------------------------------- |
| `GET`   | `/api/documents`             | List all documents (id, title, version, updated_at) |
| `GET`   | `/api/documents/:id`         | Get a single document with full content             |
| `POST`  | `/api/documents`             | Create a document                                   |
| `PATCH` | `/api/documents/:id`         | Apply one or more text replacements                 |
| `GET`   | `/api/documents/:id/changes` | List the change history for a document              |

### Search

| Method | Path                           | Description                     |
| ------ | ------------------------------ | ------------------------------- |
| `GET`  | `/api/documents/search?q=`     | Search across all documents     |
| `GET`  | `/api/documents/:id/search?q=` | Search within a single document |

---

### `POST /api/documents`

```json
{
  "title": "NDA Agreement",
  "content": "This Non-Disclosure Agreement..."
}
```

Returns the created document with `id`, `version: 1`, `created_at`, `updated_at`.

---

### `PATCH /api/documents/:id`

Applies targeted text replacements atomically. Each change specifies the exact text to find and its replacement.

```json
{
  "changes": [
    {
      "operation": "replace",
      "target": { "text": "Disclosing Party", "occurrence": 1 },
      "replacement": "Acme Corp"
    }
  ]
}
```

- `occurrence` is 1-indexed — use `1` for the first match, `2` for the second, etc.
- All changes apply in a single transaction. If any target text is not found, the entire request fails with `400`.
- Returns the updated document with an incremented `version`.

---

### `GET /api/documents/search?q=indemnification&limit=10&offset=0`

Returns matching documents with context snippets (~150 chars) around each match. Case-insensitive.

```json
[
  {
    "document_id": "abc-123",
    "title": "NDA Agreement",
    "snippets": [
      "…the indemnification obligations of each party shall survive termination…"
    ]
  }
]
```

---

### `GET /api/documents/:id/search?q=term`

Same snippet format, scoped to a single document.

---

## Design Rationale

**Targeted replacements over diffs** — Legal contracts have precise clause language. Rather than line-based diffs (which break on reflowed text), changes target an exact string and an occurrence index. This makes the intent explicit and auditable.

**`occurrence` index for disambiguation** — When "Licensee" appears 40 times in a contract, you need a way to target the third one specifically. The occurrence field makes that unambiguous without requiring character offsets, which are fragile as content changes.

**Atomic PATCH** — All changes in a single request either all succeed or all fail. Partial application would leave a document in an inconsistent state.

**Append-only change log** — Every applied change is recorded with its target, occurrence, replacement, and timestamp. This gives a full audit trail without needing to diff content snapshots.

**String scan for search (Phase 1)** — The search service uses a case-insensitive string scan rather than SQLite FTS. For the scope of this project it's fast enough and keeps the stack simple. A production version would use FTS5 or a dedicated search index. An in-memory inverted index (term → list of document IDs + positions, rebuilt on server start) would make repeated searches O(1) lookups instead of O(n) scans, at the cost of memory and cache invalidation complexity on every write.

**Version number over ETag** — Every document carries a `version` integer that increments on each successful PATCH, giving clients a way to detect stale reads. A full ETag implementation would check an `If-Match` header on every PATCH and return `412 Precondition Failed` if the document has changed since the client last fetched it — preventing two concurrent editors from silently overwriting each other. Not implemented here given the single-user scope, but a natural next step for a multi-user production system.

**Drizzle ORM** — Chosen for type-safe queries without heavy abstractions. The schema lives in `server/src/schema.ts` and serves as the single source of truth for both the database and TypeScript types.
