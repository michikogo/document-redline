# Technical Brief: Search Service

**Status:** Draft
**Date:** 2026-05-11
**Author:** Candidate — Full-Stack Engineering Role
**Product Brief:** product-brief-document-redlining-service.md
**Stack:** Node.js / Express / TypeScript · SQLite (better-sqlite3) · Drizzle ORM

---

## Overview

The search service handles keyword search across documents, returning context snippets around each match. It supports both cross-document search and single-document search with pagination. Phase 1 uses a simple string scan; an inverted index is planned for phase 2.

---

## System Architecture

```
Browser (React + Vite · :5173)
         ↓ fetch /api/documents/search
  Express API (:3001)
         ↓
  searchService.ts (string scan · phase 1)
         ↓
  Drizzle ORM
         ↓
  SQLite (better-sqlite3 · server/dev.db)
```

| Component                              | Type           | Role                                                |
| -------------------------------------- | -------------- | --------------------------------------------------- |
| `server/src/routes/search.ts`          | Express router | Handles search endpoints                            |
| `server/src/services/searchService.ts` | Service        | String scan, context snippet extraction, pagination |
| SQLite (`documents`)                   | Embedded DB    | Source of document content for search               |

---

## API Design

```
GET /api/documents/search?q=&limit=10&offset=0
Auth: none

Response: [{ document_id, title, snippets: [string] }]
Errors:
- 400: missing q


GET /api/documents/:id/search?q=
Auth: none

Response: { document_id, title, snippets: [string] }
Errors:
- 400: missing q
- 404: document not found
```

All error responses follow `{ error: string, code: number }`.

**Context snippets:** Each snippet is ~150 characters of text surrounding the match — enough to show the clause in context without returning the full document.

---

## Performance & Scalability

- **Phase 1 approach:** Full string scan — load all document content from SQLite, run `content.toLowerCase().includes(query.toLowerCase())`, extract snippets for matches.
- **Complexity:** O(n·m) where n = total characters across all documents, m = query length. Fine for a local demo with a handful of documents.
- **Bottleneck:** Degrades linearly as document count and size grow. At ~100 large documents (10MB+) it will feel slow.
- **Phase 2 plan:** Replace the scan with an in-memory inverted index or SQLite FTS5 — same API contract, swap the implementation inside `searchService.ts`.

---

## Edge Cases & Error Handling

| Scenario                                          | Expected Behavior                                 |
| ------------------------------------------------- | ------------------------------------------------- |
| Query returns no matches                          | Return empty array `[]` — not a 404               |
| Query is empty string                             | Return 400                                        |
| `limit` or `offset` is non-numeric                | Return 400                                        |
| Document ID doesn't exist (single-doc search)     | Return 404                                        |
| Query matches at the very start or end of content | Snippet clips gracefully — no index out of bounds |

---

## Key Decisions & Tradeoffs

### Search implementation: string scan vs. inverted index

- **Chosen:** Simple string scan for phase 1.
- **Alternatives:** In-memory inverted index (`word → Set<documentId>`), SQLite FTS5 full-text search extension
- **Rationale:** Phase 1 has 3–5 documents. A string scan is correct, simple, and has zero setup cost. Adding the index before it's needed is over-engineering.
- **Tradeoff:** Search degrades linearly at scale. Not acceptable for production but fine for a local demo.
- **Reversible?** Yes — the endpoint contract doesn't change. Swap the implementation in `searchService.ts` in phase 2 without touching the API.

---

### Inverted index vs. SQLite FTS5 (phase 2 decision)

Not built yet — flagged as an open question. Two real options:

|                   | In-memory inverted index | SQLite FTS5                                   |
| ----------------- | ------------------------ | --------------------------------------------- |
| Setup             | Custom code, ~50 lines   | Built into SQLite, one `CREATE VIRTUAL TABLE` |
| Persistence       | Rebuilt on server start  | Persistent — survives restarts                |
| Query flexibility | Exact word match         | Full-text with ranking, prefix search         |
| Complexity        | More to maintain         | Less code, battle-tested                      |

FTS5 is likely the better call for phase 2 — less code, more powerful, no rebuild cost on startup.

---

## Open Questions

| Question                                                                                                                                                     | Owner     | Due                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ---------------------- |
| Phase 2: inverted index (in-memory) vs. SQLite FTS5 (built-in, persistent)? FTS5 is simpler and more capable — worth evaluating before phase 2 build starts. | Candidate | Before Phase 2         |
| Should search be case-insensitive by default? (e.g. "indemnification" matches "Indemnification")                                                             | Candidate | Before building search |
