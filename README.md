# document-redline

A document redlining service — REST API + React UI for making targeted text changes to contracts and searching across document content.

Built as a take-home project for Sandstone.

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

### Seed Data

```bash
npm run seed
```

Populates the DB with 3 sample legal documents (NDA, Software License Agreement, Vendor Services Agreement).

### Tests

```bash
cd server && npm test   # server unit tests
cd client && npm test   # component tests
```

---

## Usage

See [`requests.http`](./requests.http) for runnable examples in VS Code (REST Client extension) with curl equivalents.

### Typical workflow

**1. Create a document**
```bash
curl -X POST http://localhost:3001/api/documents \
  -H "Content-Type: application/json" \
  -d '{"title": "NDA", "content": "This agreement is between the Disclosing Party and the Receiving Party."}'
# returns: { "id": "abc-123", "version": 1, ... }
```

**2. Search for a clause**
```bash
curl "http://localhost:3001/api/documents/search?q=Disclosing+Party"
# returns: [{ "document_id": "abc-123", "title": "NDA", "snippets": ["...Disclosing Party and the Receiving..."] }]
```

**3. Apply a targeted replacement**
```bash
curl -X PATCH http://localhost:3001/api/documents/abc-123 \
  -H "Content-Type: application/json" \
  -d '{
    "changes": [{
      "operation": "replace",
      "target": { "text": "Disclosing Party", "occurrence": 1 },
      "replacement": "Acme Corp"
    }]
  }'
# returns: { "id": "abc-123", "version": 2, "content": "...Acme Corp..." }
```

**4. Review the change log**
```bash
curl http://localhost:3001/api/documents/abc-123/changes
# returns: [{ "target_text": "Disclosing Party", "replacement": "Acme Corp", "applied_at": "..." }]
```

---

## API Reference

Base URL: `http://localhost:3001`

All request and response bodies are JSON. See [`requests.http`](./requests.http) for runnable examples (VS Code REST Client).

### Error responses

All errors return JSON: `{ "error": "...", "code": 404 }`

| Status | When |
|--------|------|
| `400` | Missing/invalid fields, target text not found, empty search query |
| `404` | Document ID not found |
| `500` | Unexpected server error |

### Documents

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/documents` | List all documents (id, title, version, updated_at) |
| `GET` | `/api/documents/:id` | Get a single document with full content |
| `POST` | `/api/documents` | Create a document |
| `PATCH` | `/api/documents/:id` | Apply one or more text replacements |
| `GET` | `/api/documents/:id/changes` | List the change history for a document |

### Search

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/documents/search?q=` | Search across all documents |
| `GET` | `/api/documents/:id/search?q=` | Search within a single document |

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

Applies targeted text replacements atomically. Accepts an array — all changes succeed or all fail.

```json
{
  "changes": [
    {
      "operation": "replace",
      "target": { "text": "Disclosing Party", "occurrence": 1 },
      "replacement": "Acme Corp"
    },
    {
      "operation": "replace",
      "target": { "text": "Receiving Party", "occurrence": 1 },
      "replacement": "Beta LLC"
    }
  ]
}
```

- `occurrence` is 1-indexed — `1` for the first match, `2` for the second, etc.
- If any target text is not found, the entire request fails with `400` and nothing is written.
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

## Performance

**Search** — case-insensitive string scan, O(n) per document. Benchmarked against a ~5MB document: completes in under 500ms. The production path is PostgreSQL FTS5 or an in-memory inverted index (term → document IDs + positions, rebuilt on server start) for O(1) repeated lookups. Trade-off: the index adds memory pressure and requires invalidation on every PATCH.

**Replace** — single-pass scan per target string, O(n) per change. Multiple changes in one PATCH each scan independently but commit in a single SQLite transaction — atomic with no extra round trips.

**Large documents** — the 10MB+ case is handled gracefully: the scan streams through content without loading extra copies into memory. The bottleneck at that size is the SQLite write, not the scan.

---

## Design Rationale

**Targeted replacements over diffs** — Legal contracts have precise clause language. Rather than line-based diffs (which break on reflowed text), changes target an exact string and an occurrence index. This makes the intent explicit and auditable.

**`occurrence` index for disambiguation** — When "Licensee" appears 40 times in a contract, you need a way to target the third one specifically. The occurrence field makes that unambiguous without requiring character offsets, which are fragile as content changes.

**Atomic PATCH** — All changes in a single request either all succeed or all fail. Partial application would leave a document in an inconsistent state.

**Append-only change log** — Every applied change is recorded with its target, occurrence, replacement, and timestamp. This gives a full audit trail without needing to diff content snapshots.

**Version number over ETag** — Every document carries a `version` integer that increments on each successful PATCH, giving clients a way to detect stale reads. A full ETag implementation would check an `If-Match` header on every PATCH and return `412 Precondition Failed` if the document has changed since the client last fetched it — preventing two concurrent editors from silently overwriting each other. Not implemented here given the single-user scope, but a natural next step for a multi-user production system.

**Drizzle ORM** — Chosen for type-safe queries without heavy abstractions. The schema lives in `server/src/schema.ts` and serves as the single source of truth for both the database and TypeScript types.

**RESTful PATCH over action-based endpoints** — `PATCH /api/documents/:id` was chosen over `POST /api/documents/:id/apply-changes`. REST is more predictable and cacheable, and PATCH accurately describes a partial update. The trade-off: PATCH implies idempotency, but our operation isn't strictly idempotent (applying the same change twice would fail on the second attempt if the target text is already replaced). An action-based endpoint would make that clearer. For this scope, REST's familiarity wins.

**SQLite over PostgreSQL** — SQLite was a deliberate choice for zero-setup local development (one file, no server process, no connection string). The trade-off is that SQLite serialises all writes — two concurrent editors would queue up rather than write in parallel. Acceptable for a single-user prototype; PostgreSQL is the natural migration path when concurrency matters.

**Append-only change log over document snapshots** — each change stores only what changed (target text, occurrence, replacement, timestamp) rather than a full copy of the document. This keeps storage lean but makes reverting a change complex — you'd need to replay the log in reverse. Snapshots make revert trivial but storage grows with every edit. For an audit-trail use case, the log approach is the right default.

---

## Future Improvements

- **ETag / concurrency control** — check `If-Match` on PATCH and return `412` if the document changed since the client last fetched it; prevents silent overwrites in a multi-editor scenario
- **In-memory inverted index** — rebuild on server start for O(1) repeated searches instead of O(n) scans; invalidate on every PATCH
- **Version history / revert** — store full document snapshots per version so changes can be rolled back, not just audited
- **PATCH via character range** — complement occurrence-based targeting with `{ range: { start, end } }` for cases where the exact text isn't known
- **Auth + RBAC** — OAuth2/SSO with viewer / editor / admin roles
- **Background jobs for large docs** — offload 10MB+ PATCH operations to a queue; return `202 Accepted` + job ID rather than blocking the request
- **DOCX / PDF upload** — parse uploaded files into plain text on ingest; reverse-export changes back to the original format
