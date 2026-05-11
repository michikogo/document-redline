# Product Brief: Document Redlining Service

**Status:** Draft
**Date:** 2026-05-10
**Owner:** Candidate — Full-Stack Engineering Role
**Domain:** Developer Tool / API (Legal Tech context)

---

## Target Users

### The In-House Lawyer
An attorney at a mid-sized company managing 10–50 active contracts at a time. They're constantly making the same small edits — swapping party names, updating payment terms, correcting defined phrases — across multiple documents. Today they do this in Word, one file at a time, with no audit trail and no way to search across contracts without opening each one manually.

### The Paralegal
A paralegal supporting the legal team who handles the day-to-day document work — tracking changes, making corrections flagged by counsel, and pulling up specific clauses on request. They need a fast way to find text across a stack of contracts and apply edits without touching every file manually.

---

## User Stories

### Document Management
- As a user, I want to see a list of all documents so that I can find what I'm looking for quickly.
- As a user, I want to view the full content of a document so that I can read and review it.
- As a user, I want to create a new document with a title and body so that I can add contracts to the system.

### Text Changes (Redlining)
- As a user, I want to submit a text replacement on a document so that I can correct or update specific language.
- As a user, I want to specify which occurrence of a phrase to replace so that I don't accidentally change the wrong one.
- As a user, I want to see a change log for each document so that I know what was changed, when, and what it was changed to.

### Search
- As a user, I want to search across all documents and get back matching snippets with context so that I can find which contracts contain a specific term without opening each one.
- As a user, I want to search within a single document so that I can find a specific clause without leaving the document I'm working on.
- As a user, I want to paginate search results so that I can work through a large result set without being overwhelmed.

### UI
- As a user, I want to open the app in a browser and see a document list so that I can navigate without using the API directly.
- As a user, I want to submit a replacement from the UI and see the document update so that I can verify the change worked.
- As a user, I want to search from the UI and see results with context so that I don't need Postman to use the product.

---

## Requirements

- PATCH endpoint accepts a `changes` array — each item specifies `target.text`, `target.occurrence`, and `replacement`
- Occurrence targeting supported from day one — `occurrence: 1` replaces the first match, `occurrence: 2` the second, etc.
- Every replacement is persisted to a change log (target text, replacement, timestamp)
- Search returns context snippets around each match, works across all documents and within a single document
- Search supports pagination (`limit` + `offset`)
- App runs with a single command (`npm run dev`) — no manual DB setup, no environment variables required
- Unit tests cover core change logic and search logic, including large-file tests or performance benchmarks
- Sample requests included (curl or Postman collection)
- README includes setup, usage examples, performance considerations, and API design rationale

---

## Soft Requirements

- Bulk replacement — multiple changes in one request applied in sequence (the `changes` array naturally supports this)
- Structured error responses — 4xx for client errors, 5xx with `{ error, code }` body
- Search backed by an in-memory inverted index for performance
- Document version number increments on each successful PATCH
- Seed data: 3 realistic legal documents (NDA, software license, vendor contract)
- Technical doc covering architecture, data model, API reference, and performance notes

---

## Iterations

### Phase 1 — This Submission
A working Express + SQLite + React app that covers the full baseline. Clean code, one-command setup, tests including large-file benchmarks, and docs an engineer can read in 5 minutes.

**Includes:**
- Document CRUD API
- PATCH with `changes` array, occurrence targeting, change log
- Cross-document and single-document search with context snippets + pagination
- Simple document viewer UI (list, viewer, change form, search bar, change log)
- Unit tests including large-file / performance benchmarks
- Sample requests (curl or Postman)
- README with setup, usage, performance notes, and API design rationale

### Phase 2
Add performance, polish, and production-readiness.

**Includes:**
- Inverted index for search performance
- Structured error responses (4xx/5xx)
- Document version number on each PATCH
- Seed data (NDA, software license, vendor contract)
- Technical doc

### Phase 3 and beyond
DOCX/PDF file upload and parsing, real-time collaboration, multi-tenancy, audit logging for compliance (SOC 2 / GDPR), and a hosted production deployment.
