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

The implementation is deliberately simple and performs well within the scope of this project:

- **Search** completes in under 500ms on a ~5MB document. Sufficient for a single-user prototype with a small corpus.
- **Replace** is a single-pass scan per target, with all changes in one PATCH committed in a single SQLite transaction — no partial writes, no extra round trips.
- **Large documents** (10MB+) are handled without loading extra copies of the content into memory.

For production, the natural next steps are SQLite FTS5 or an in-memory inverted index for search, and PostgreSQL to remove the write serialisation bottleneck. Both are covered in [`docs/production-readiness.md`](./docs/production-readiness.md).

---

## API Design Rationale

- **Exact text + occurrence targeting** — Legal contracts have precise clause language. Targeting by exact string and occurrence index (e.g. `"Licensee"`, 3rd occurrence) makes each change explicit and auditable. Character offsets would be more precise but are fragile — they shift every time content changes.
- **Atomic PATCH** — All changes in a single request either all succeed or all fail. Partial application would leave a contract in an inconsistent state, which is worse than rejecting the whole request.
- **`occurrence` for disambiguation** — When "Licensee" appears 40 times in a contract, an integer index is the clearest way to target the third one specifically. It reads naturally in the request body and in the change log.
- **Append-only change log** — Every applied change is recorded with its target text, occurrence, replacement, and timestamp. This gives a full audit trail without needing to diff content snapshots.

---

## Trade-offs

### SQLite over PostgreSQL
**Purpose:** Zero-setup local development — one file, no server process, no connection string.  
**Benefit:** Anyone can clone and run without installing a database.  
**Trade-off:** Serialises all writes, so concurrent editors queue up rather than write in parallel. PostgreSQL is the natural migration path when that matters.

### Append-only change log over snapshots
**Purpose:** Record every edit with its target text, occurrence, replacement, and timestamp.  
**Benefit:** Full audit trail with minimal storage — only what changed is stored, not full document copies.  
**Trade-off:** Reverting a change requires replaying the log in reverse. Snapshots make revert trivial but storage grows with every edit.

### Version number over ETag
**Purpose:** Give clients a way to detect if a document has changed since they last fetched it.  
**Benefit:** Simple integer that increments on every PATCH — easy to check and display in the UI.  
**Trade-off:** Doesn't enforce anything — two editors can still overwrite each other silently. ETag + `If-Match` on PATCH would prevent that.

### Document content stored in SQLite over external storage
**Purpose:** Keep the stack simple — one database for both metadata and content.  
**Benefit:** No external dependencies; content is transactional with document metadata.  
**Trade-off:** Large documents bloat the database and slow backups. Production path is blob storage (e.g. S3) with a key reference in the DB.

### Synchronous PATCH over background jobs
**Purpose:** Apply changes and return the updated document in a single request.  
**Benefit:** Simple client experience — no polling or webhooks needed.  
**Trade-off:** A large document with many replacements holds the HTTP connection open. Production path is a job queue returning `202 Accepted` + a job ID.

---

## Future Improvements

- **ETag / concurrency control** — check `If-Match` on PATCH and return `412` if the document changed since the client last fetched it; prevents silent overwrites in a multi-editor scenario
- **In-memory inverted index** — rebuild on server start for O(1) repeated searches instead of O(n) scans; invalidate on every PATCH
- **Version history / revert** — store full document snapshots per version so changes can be rolled back, not just audited
- **PATCH via character range** — complement occurrence-based targeting with `{ range: { start, end } }` for cases where the exact text isn't known
- **Auth + RBAC** — OAuth2/SSO with viewer / editor / admin roles
- **Background jobs for large docs** — offload 10MB+ PATCH operations to a queue; return `202 Accepted` + job ID rather than blocking the request
- **DOCX / PDF upload** — parse uploaded files into plain text on ingest; reverse-export changes back to the original format
