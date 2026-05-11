# Part II: Production Infrastructure

> How to evolve the current prototype into a production-grade service.
> **Current stack:** Express · TypeScript · SQLite (better-sqlite3) · Drizzle ORM · React · Vite · GitHub Actions CI

---

## Architecture & Infra

```
Current
─────────────────────────────────────────
  Browser → Vite dev server (React)
          → Express (single process)
              └── SQLite (local file, content in DB)

Production
─────────────────────────────────────────
  Browser → Static build (React, CDN-hosted)
          → Load balancer
              └── Express containers (2+ instances, Docker)
                    ├── PostgreSQL (metadata + change log)
                    └── S3 (document content)
```

| Component | Current | Production | Trade-off |
|-----------|---------|------------|-----------|
| API runtime | Single process | Docker containers, horizontally scaled | Containers are stateless and easy to scale; adds build/deploy complexity |
| Database | SQLite file (metadata + content) | PostgreSQL (metadata + change log only) | SQLite serialises all writes; Postgres handles concurrency + read replica for search |
| Document content | Stored as text column in SQLite | Stored in S3, referenced by key | Keeps DB lean; large docs don't bloat DB backups. Trade-off: adds S3 latency on every read/write |
| Frontend | Vite dev server | Static build + CDN | CDN eliminates frontend latency globally; no change to the API |
| Search | In-process O(n) string scan | PostgreSQL FTS → Elasticsearch at scale | FTS is free and covers millions of docs; Elasticsearch adds significant ops overhead — only justified at 10M+ docs |

---

## CI/CD & Deployment

**Current:** GitHub Actions runs server + client tests on every PR.

**Production additions:**

1. Add Docker build + image push step to the existing workflow
2. Deploy to **two environments**: `dev` (auto on merge to main) → `prod` (rolling deploy with health checks). Staging skipped at this stage — adds maintenance overhead not justified without high customer volume
3. **DB migrations:** `drizzle-kit migrate` runs as a pre-deploy task — if it fails, the deploy aborts before new code goes live
4. **Rollback:** tag every image with the git SHA; rollback = redeploy the previous tag (< 2 min)

---

## Security & Compliance

| Area | Current | Production approach |
|------|---------|---------------------|
| Auth | None | OAuth2 / SSO via Auth0 — JWT verified on every request |
| Authorization | None | RBAC: `viewer` (read-only) · `editor` (PATCH) · `admin` (create/delete) |
| Audit log | Change log exists (target, replacement, timestamp) | Extend with `user_id` + `ip` — already append-only, just needs two fields |
| Encryption | None | TLS in transit (HTTPS only); database encrypted at rest |
| GDPR | None | Add `/users/:id/export` and `/users/:id/delete`; 30-day soft-delete before hard purge |
| SOC 2 | None | Audit log + RBAC + MFA on infra access covers the core Trust Service Criteria |

---

## Scalability & Resilience

**Current bottlenecks:**
- SQLite serialises all writes — breaks under concurrent editors
- String scan is O(n × docs) per search query — degrades linearly with corpus size

**Production mitigations:**

| Problem | Solution | Trade-off |
|---------|----------|-----------|
| Concurrent writes | Migrate to PostgreSQL | Migration effort; Postgres adds infra cost |
| Search at scale | In-memory inverted index (rebuild on start, invalidate on PATCH) | O(1) lookups vs O(n) scan; adds memory pressure + cache invalidation complexity |
| Large doc PATCH (10MB+) | Background job queue (e.g. BullMQ); return `202 Accepted` + job ID | Adds async complexity; client must poll or receive webhook |
| Single point of failure | Managed PostgreSQL multi-AZ; API containers across 2 AZs | Higher cost; ~60s automatic DB failover |

---

## Monitoring & Observability

| Signal | What to capture | Alert threshold |
|--------|----------------|-----------------|
| Metrics | Request rate, p99 latency per endpoint, error rate, DB query time | p99 > 500ms · error rate > 1% |
| Logs | Structured JSON — `request_id`, `user_id`, `document_id`, `duration_ms`, `status` | Any 5xx spike |
| Tracing | Trace ID propagated across API + DB — attributes slow requests to root cause | — |
| Uptime | Synthetic check on `GET /api/documents` every 60s | Any failure |

Start with one tool (Datadog or CloudWatch) — splitting signals across multiple platforms adds cognitive overhead before you have scale to justify it.

---

## Operations & Cost

| Item | Strategy |
|------|----------|
| Right-sizing | Launch small (1–2 API instances, smallest managed Postgres tier); scale up on real traffic data, not projections |
| Non-prod cost | Spot/preemptible instances for dev + staging (60–70% cheaper than on-demand) |
| Multi-region | **Not at launch** — adds replication lag, data residency complexity, and cost. Revisit only when enterprise customers require it |
| Backups | Automated daily DB snapshots, 7-day retention; test a restore quarterly |
| On-call | Three severity tiers: S1 (data loss / full outage) · S2 (degraded) · S3 (cosmetic). Page on S1/S2 only |
