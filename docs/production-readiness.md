# Production Infrastructure

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

### API Runtime
**Current:** Single Express process  
**Production:** Docker containers, 2+ instances behind a load balancer  
**Trade-off:** Containers are stateless and easy to scale horizontally; adds build and deploy complexity.

### Database
**Current:** SQLite — metadata and document content in one file  
**Production:** PostgreSQL for metadata and change log only  
**Trade-off:** SQLite serialises all writes; PostgreSQL handles concurrent editors and supports a read replica for search offloading.

### Document Content
**Current:** Full text stored as a column in SQLite  
**Production:** Stored in S3, referenced by key in PostgreSQL  
**Trade-off:** Keeps the DB lean and prevents large documents from bloating backups. Adds S3 latency on every read and write.

### Frontend
**Current:** Vite dev server — built for development, not production traffic  
**Production:** Static files built in CI and served from a CDN  
**Trade-off:** Faster globally — users load from an edge node near them. Adds a build and upload step to the deploy pipeline.

### Search
**Current:** In-process O(n) string scan per document  
**Production:** PostgreSQL FTS — Elasticsearch only at 10M+ documents  
**Trade-off:** FTS is free and covers millions of documents without extra infrastructure. Elasticsearch adds significant operational overhead and is only justified at very high scale.

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

| Area          | Current                                            | Production approach                                                                   |
| ------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Auth          | None                                               | OAuth2 / SSO via Auth0 — JWT verified on every request                                |
| Authorization | None                                               | RBAC: `viewer` (read-only) · `editor` (PATCH) · `admin` (create/delete)               |
| Audit log     | Change log exists (target, replacement, timestamp) | Extend with `user_id` + `ip` — already append-only, just needs two fields             |
| Encryption    | None                                               | TLS in transit (HTTPS only); database encrypted at rest                               |
| GDPR          | None                                               | Add `/users/:id/export` and `/users/:id/delete`; 30-day soft-delete before hard purge |
| SOC 2         | None                                               | Audit log + RBAC + MFA on infra access covers the core Trust Service Criteria         |

---

## Scalability & Resilience

**Current bottlenecks:**

- SQLite serialises all writes — breaks under concurrent editors
- String scan is O(n × docs) per search query — degrades linearly with corpus size

**Production mitigations:**

| Problem                 | Solution                                                           | Trade-off                                                                       |
| ----------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Concurrent writes       | Migrate to PostgreSQL                                              | Migration effort; Postgres adds infra cost                                      |
| Search at scale         | In-memory inverted index (rebuild on start, invalidate on PATCH)   | O(1) lookups vs O(n) scan; adds memory pressure + cache invalidation complexity |
| Large doc PATCH (10MB+) | Background job queue (e.g. BullMQ); return `202 Accepted` + job ID | Adds async complexity; client must poll or receive webhook                      |
| Single point of failure | Managed PostgreSQL multi-AZ; API containers across 2 AZs           | Higher cost; ~60s automatic DB failover                                         |

---

## Monitoring & Observability

| Signal  | What to capture                                                                   | Alert threshold               |
| ------- | --------------------------------------------------------------------------------- | ----------------------------- |
| Metrics | Request rate, p99 latency per endpoint, error rate, DB query time                 | p99 > 500ms · error rate > 1% |
| Logs    | Structured JSON — `request_id`, `user_id`, `document_id`, `duration_ms`, `status` | Any 5xx spike                 |
| Tracing | Trace ID propagated across API + DB — attributes slow requests to root cause      | —                             |
| Uptime  | Synthetic check on `GET /api/documents` every 60s                                 | Any failure                   |

Start with one tool (Datadog or CloudWatch) — splitting signals across multiple platforms adds cognitive overhead before you have scale to justify it.

---

## Operations & Cost

| Item          | Strategy                                                                                                                         |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Right-sizing  | Launch small (1–2 API instances, smallest managed Postgres tier); scale up on real traffic data, not projections                 |
| Non-prod cost | Spot/preemptible instances for dev + staging (60–70% cheaper than on-demand)                                                     |
| Multi-region  | **Not at launch** — adds replication lag, data residency complexity, and cost. Revisit only when enterprise customers require it |
| Backups       | Automated daily DB snapshots, 7-day retention; test a restore quarterly                                                          |
| On-call       | Three severity tiers: S1 (data loss / full outage) · S2 (degraded) · S3 (cosmetic). Page on S1/S2 only                           |
