# Technical Brief: Change Service

**Status:** Draft
**Date:** 2026-05-10
**Author:** Candidate — Full-Stack Engineering Role
**Product Brief:** product-brief-document-redlining-service.md
**Stack:** Node.js / Express / TypeScript · SQLite (better-sqlite3) · Drizzle ORM

---

## Overview

The change service handles all document mutations — creating and retrieving documents, applying text replacements with occurrence targeting, and persisting a change log. It is one of two services in the Document Redlining API; the other is the search service.

---

## System Architecture

```
Browser (React + Vite · :5173)
         ↓ fetch /api/*
  Express API (:3001)
         ↓
  Drizzle ORM
         ↓
  SQLite (better-sqlite3 · server/dev.db)
```

| Component | Type | Role |
|-----------|------|------|
| `server/src/routes/documents.ts` | Express router | Handles document CRUD and PATCH endpoints |
| `server/src/services/changeService.ts` | Service | Core replacement logic — occurrence targeting, applying changes |
| `server/src/schema.ts` | Drizzle schema | Type-safe table definitions for `documents` and `changes` |
| SQLite (`documents`, `changes`) | Embedded DB | Persists document content and change log |

---

## Data Model

```
Document {
  id:         TEXT        // cuid — primary key
  title:      TEXT        // contract name
  content:    TEXT        // full plain text of the document
  version:    INTEGER     // increments on each successful PATCH
  created_at: TEXT        // ISO 8601 timestamp
  updated_at: TEXT        // ISO 8601 timestamp
}

Change {
  id:          TEXT       // cuid — primary key
  document_id: TEXT       // FK → Document.id
  target_text: TEXT       // the phrase that was replaced
  occurrence:  INTEGER    // which occurrence was targeted
  replacement: TEXT       // what it was replaced with
  applied_at:  TEXT       // ISO 8601 timestamp
}
```

**Relationships:** Document has many Changes.
**Owned by:** SQLite, local file at `server/dev.db`.

---

## API Design

```
GET /api/documents
Auth: none

Response: [{ id, title, version, updated_at }]


GET /api/documents/:id
Auth: none

Response: { id, title, content, version, created_at, updated_at }
Errors:
- 404: document not found


POST /api/documents
Auth: none

Request:  { "title": string, "content": string }
Response: { id, title, content, version, created_at, updated_at }
Errors:
- 400: missing title or content


PATCH /api/documents/:id
Auth: none

Request:  {
  "changes": [
    {
      "operation": "replace",
      "target": { "text": string, "occurrence": number },
      "replacement": string
    }
  ]
}
Response: { id, title, content, version, updated_at }
Errors:
- 400: missing or malformed changes array
- 404: document not found


GET /api/documents/:id/changes
Auth: none

Response: [{ id, target_text, occurrence, replacement, applied_at }]
Errors:
- 404: document not found
```

All error responses follow `{ error: string, code: number }`.

---

## Edge Cases & Error Handling

| Scenario | Expected Behavior |
|----------|-------------------|
| `target.text` not found in document | Return 400 — do not modify the document |
| `occurrence` is 2 but only 1 match exists | Return 400 — do not partially apply |
| Empty `target.text` or `replacement` | Return 400 — reject before hitting the DB |
| `changes` array is empty | Return 400 — nothing to apply |
| Document ID doesn't exist | Return 404 |
| SQLite write fails | Return 500 with `{ error: "Internal server error", code: 500 }` |

---

## Key Decisions & Tradeoffs

### Change log: delta only vs. full document snapshot

- **Chosen:** Delta only — store `target_text`, `occurrence`, `replacement`, and `applied_at` per change.
- **Alternatives:** Full snapshot (save entire document content before and after each change)
- **Rationale:** The product only needs to show what changed and when — not restore previous versions. Snapshots add significant DB bloat on large documents with no benefit for this scope.
- **Tradeoff:** No undo/redo capability. Reverting a change requires manually re-applying it in reverse.
- **Reversible?** Yes — add a `snapshots` table later without touching the existing schema.

---

### SQLite vs. PostgreSQL

- **Chosen:** SQLite via `better-sqlite3`, with Drizzle ORM as the query layer.
- **Alternatives:** PostgreSQL (hosted or local via Docker)
- **Rationale:** Zero setup for the evaluator — no Docker, no connection strings, no environment variables. DB file lives at `server/dev.db` and is created on first run. Drizzle adds type-safe queries without requiring a separate migration tool or schema file sync step.
- **Tradeoff:** Not suitable for production — no concurrent writes, no connection pooling. Any production deployment requires migrating to Postgres.
- **Reversible?** Partially — Drizzle supports Postgres with the same query API, so swapping the driver is straightforward. Schema is simple enough to port, but migrating the data is a non-trivial step.

---

### Drizzle ORM vs. raw SQL

- **Chosen:** Drizzle ORM.
- **Alternatives:** Raw SQL via `better-sqlite3` directly, Prisma
- **Rationale:** Drizzle gives type-safe queries and a single source of truth for the schema (`schema.ts`) without the overhead of Prisma's separate schema language, migration runner, or generated client. Queries stay readable and close to SQL.
- **Tradeoff:** Slightly more setup than raw SQL. Drizzle doesn't auto-create tables — `CREATE TABLE IF NOT EXISTS` is still run manually on startup.
- **Reversible?** Yes — Drizzle is a thin layer over `better-sqlite3`. Removing it means replacing `.select().from()` calls with `.prepare().all()` calls; the schema maps 1:1.

---

### Monorepo: single repo, two packages

- **Chosen:** `server/` and `client/` under one root. Root `package.json` uses `concurrently` to run both with `npm run dev`.
- **Alternatives:** Separate repos, Next.js app with API routes
- **Rationale:** One `git clone`, one command, no repo coordination. Next.js was considered but the product brief specifies Express — mixing API routes with React adds unnecessary coupling.
- **Tradeoff:** No shared type package in phase 1 — types duplicated between client and server.
- **Reversible?** Yes — extract into separate repos or add a `packages/types` workspace later.

---

## Open Questions

| Question | Owner | Due |
|----------|-------|-----|
| ~~Should a PATCH with multiple changes be atomic?~~ Resolved: all changes are validated in memory first, then written in a single `sqlite.transaction()`. Any failure returns 400 with no DB write. | Candidate | Resolved |
