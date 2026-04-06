# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Struxora is a Construction Operating System built as a pnpm monorepo. The only active service is the NestJS API at `apps/api`. The web frontend (`apps/web`) and shared packages are placeholders.

### Running the API

1. The Prisma schema uses **SQLite** (`file:./dev.db`), not PostgreSQL — no Docker or external DB needed for development.
2. Before first run, ensure `apps/api/.env` exists (copy from `.env.example`, set `DATABASE_URL="file:./dev.db"` and add JWT secrets of 32+ chars).
3. Generate the Prisma client and push the schema:
   ```
   pnpm --filter @struxora/api run prisma:generate
   pnpm --filter @struxora/api exec prisma db push
   ```
4. Start the dev server: `pnpm --filter @struxora/api run start:dev` (port 3000).
5. Health check: `curl http://localhost:3000/health` → `{"status":"ok"}`.

### Lint / Typecheck / Test

- **Lint**: ESLint is configured with `.eslintrc.cjs` (legacy format) but ESLint 9 is installed. Run with: `cd apps/api && ESLINT_USE_FLAT_CONFIG=false npx eslint "{src,test}/**/*.ts"`. Pre-existing lint errors exist in the codebase.
- **Typecheck**: `pnpm --filter @struxora/api run typecheck`. The root `tsconfig.json` has `declarationMap: true` with `declaration: true` which conflicts with `--noEmit` in `apps/api`; this produces a pre-existing TS5069 error.
- **Tests**: `pnpm --filter @struxora/api run test`. Pre-existing test failures exist because committed `.js` files use TC39 decorators incompatible with the NestJS common version. The `nest start --watch` command (used by `start:dev`) compiles `.ts` source correctly and the app runs fine.
- **CI checks** (per `CONTRIBUTING.md`): `pnpm -r lint`, `pnpm -r typecheck`, `pnpm -r test`.

### Key gotchas

- The existing Prisma migration (`20260301000001_auth_rbac`) was generated for PostgreSQL and cannot be applied with `prisma migrate dev` when using SQLite. Use `prisma db push` instead to sync the schema.
- The `packages/api/package.json` is a stale duplicate — the real API workspace is `apps/api`.
- OpenAI integration is optional; the rule-based JSA engine works without `OPENAI_API_KEY`.
- Scripts in `/scripts/` are PowerShell (`.ps1`) and intended for Windows; they are not directly runnable on Linux.
