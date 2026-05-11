# Product Brief: Document Redlining Service

**Status:** Draft
**Date:** 2026-05-10
**Owner:** Candidate — Full-Stack Engineering Role
**Domain:** Developer Tool / API (Legal Tech context)

---

## Target Users

### The Evaluator (primary)
A Sandstone engineer reviewing this take-home submission. They'll clone the repo, run it locally, and assess code quality, API design, and feature completeness in a live Part III discussion. They want to see clean, working code — not a prototype that requires setup debugging.

### The End User (informs design decisions)
An in-house lawyer or paralegal managing 10–50 active contracts at a time. They make recurring text changes (party names, dates, defined terms), need to search across documents for specific clauses, and want a record of what changed. Today they do this manually in Word — no audit trail, no API, no scale.

---

## User Stories

### Document Management
- As a user, I want to see a list of all documents so that I can find what I'm looking for quickly.
- As a user, I want to view the full content of a document so that I can read and review it.
- As a user, I want to create a new document with a title and body so that I can add contracts to the system.

### Text Changes (Redlining)
- As a user, I want to submit a text replacement on a document so that I can correct or update specific language.
- As a user, I want to specify which occurrence of a phrase to replace (e.g. the 2nd instance of "Licensee") so that I don't accidentally change the wrong one.
- As a user, I want to submit multiple replacements in a single request so that I can make several edits at once without round-tripping.
- As a user, I want to see a change log for each document so that I know what was changed, when, and what it was changed to.

### Search
- As a user, I want to search a single document for a keyword and get back matching snippets with context so that I can find the relevant clause without reading the whole thing.
- As a user, I want to search across all documents at once so that I can find which contracts contain a specific term.
- As a user, I want to paginate search results so that I can work through a large result set.

### UI
- As a user, I want to open the app in a browser and see a document list so that I can navigate without using the API directly.
- As a user, I want to submit a replacement from the UI and see the document update so that I can verify the change worked.
- As a user, I want to search from the UI and see results with context so that I don't need Postman to use the product.

---

## Requirements

- Text replacement must support occurrence targeting — replace the nth match of a phrase, not all of them
- Bulk replacement must accept an array of changes in one request and apply them in sequence
- Every replacement must be persisted to a change log (target text, replacement, timestamp)
- Search must return context snippets (~150 chars) around each match, not just line numbers
- Search must work across all documents and within a single document
- Search must support pagination (limit + offset)
- All endpoints must return appropriate 4xx for client errors and 5xx with `{ error, code }` for server errors
- App must run with a single command (`npm run dev`) — no manual DB setup, no environment variables required
- Unit tests must cover core change logic and search logic, including edge cases (occurrence not found, large documents)
- A README must be included with setup instructions, usage examples, and API design rationale

---

## Soft Requirements

- Search backed by an in-memory inverted index (rebuilt on server start) for performance — acceptable trade-off for demo scope
- Document version number increments on each successful PATCH
- Seed data included: 3 realistic legal documents (NDA, software license, vendor contract)
- curl examples or a `requests.http` file for every endpoint
- Technical doc covering architecture, data model, API reference, and performance notes

---

## Iterations

### Phase 1 — This Submission
A working Express + SQLite + React app that covers all user stories above. Clean code, one-command setup, tests on core logic, and docs an engineer can read in 5 minutes.

**Includes:**
- Document CRUD API
- Text replacement with occurrence targeting + bulk support
- Change log per document
- Inverted index search with context snippets
- Simple document viewer UI (list, viewer, change form, search bar, change log)
- Unit tests (changeService, searchService)
- README + technical doc + curl samples

### Phase 2
Add intelligence and production-readiness if phase 1 demonstrates the core value.

**Includes:**
- LLM integration — AI-assisted search, AI-suggested replacements
- True accept/reject redline workflow (like Word's Track Changes)
- ETag-based concurrency control to prevent conflicting edits
- Authentication + basic role separation

### Phase 3 and beyond
DOCX/PDF file upload and parsing, real-time collaboration, multi-tenancy, audit logging for compliance (SOC 2 / GDPR), and a hosted production deployment.
