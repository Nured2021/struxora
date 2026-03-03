# infra

Infrastructure (monorepo).

## Postgres (Phase 1)

From repo root:

```bash
cd infra && docker compose up -d postgres
```

Connect from the API using `DATABASE_URL` (see `apps/api/.env.example`):

- Host: `localhost`, Port: `5432`
- User: `struxora`, Password: `struxora`, DB: `struxora`
