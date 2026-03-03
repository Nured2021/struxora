# Backend Initialization (Phase 1 Step A)

## Title

**Backend Initialization** — NestJS API bootstrap with Prisma, health check, Docker, and tests.

---

## Goal

Bootstrap the API application (apps/api) so the monorepo has a runnable NestJS backend, PostgreSQL via Prisma, a health endpoint for probes, Dockerized Postgres in infra, and a minimal test setup. No auth or business logic in this step.

---

## User Stories

- As a developer, I want to run the API locally so that I can iterate on Phase 1 features.
- As a developer, I want a health endpoint so that orchestration and load balancers can check liveness.
- As a developer, I want Prisma and Postgres in Docker so that I do not need a local PostgreSQL install.

---

## Acceptance Criteria

- [ ] NestJS application runs (TypeScript, Express; no Fastify).
- [ ] Prisma is configured with PostgreSQL via DATABASE_URL; no business tables yet.
- [ ] Initial migration scaffold exists (empty or placeholder).
- [ ] GET /health returns 200 and { status: "ok" }.
- [ ] apps/api has scripts: build, start, start:dev, lint, test, typecheck.
- [ ] apps/api extends root tsconfig.json.
- [ ] infra provides Postgres service; API can connect using DATABASE_URL.
- [ ] apps/api has .env.example with DATABASE_URL.
- [ ] Basic test for /health endpoint exists and passes.
- [ ] No Auth, no business logic, no frontend.

---

## API Routes

| Method | Path    | Description     | Required role(s) |
|--------|---------|-----------------|------------------|
| GET    | /health | Liveness check  | None (public)    |

---

## DB Changes

- None. Prisma schema has datasource and generator only; no application models yet. Initial migration for scaffold only.

---

## UI Pages / Components

- N/A (API only).

---

## Permissions

- /health is public (no RBAC).

---

## Tests

- Integration (or e2e): GET /health returns 200 and { status: "ok" }.

---

## Rollout Notes

- Run `pnpm install` at repo root. Run Postgres via `infra` Docker. Run migrations from apps/api when adding tables later.
