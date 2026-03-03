# Agent Playbook

**Any AI agent working in this repository must follow this playbook.**

---

## 1. Read FACTORY_CONSTITUTION.md first

Before making any changes, read [FACTORY_CONSTITUTION.md](FACTORY_CONSTITUTION.md) in full. It defines:

- Golden principles (modular code, security, spec-first, no broken builds, proven stack, permissions/audit/validation).
- Monorepo structure (apps/api, apps/web, packages/shared, packages/ui, infra).
- Architecture (NestJS, Next.js, PostgreSQL, Prisma, JWT + RBAC, S3, BullMQ, etc.).
- Module design, multi-tenant rules, RBAC roles, testing gates, “never do” rules, and build order.

All work must align with the constitution. Do not propose stack changes or shortcuts that violate it.

---

## 2. Create a spec in docs/specs/ before coding

- **Every feature** starts with a written spec.
- Create the spec file in `docs/specs/` using [docs/SPEC_TEMPLATE.md](docs/SPEC_TEMPLATE.md).
- Include: Title, Goal, User stories, Acceptance criteria, API routes, DB changes, UI pages, Permissions, Tests, Rollout notes.
- Do not implement business logic until the spec exists and is agreed (or explicitly waived).

---

## 3. Implement one module at a time

- Do not build multiple modules in a single change.
- Finish one module (including RBAC, audit, validation, tests) before starting the next.
- Respect module boundaries; no cross-module database access without a service layer.

---

## 4. Add RBAC + audit logs + validation + tests

For every feature:

- **RBAC**: Every route declares required role(s). Default deny. No bypassing.
- **Audit**: Create/update/delete of key resources write an audit log entry.
- **Validation**: Shared validation schemas; validate all inputs at the API boundary.
- **Tests**: Unit tests for services and validation; permission tests for roles; CI must pass.

See [docs/DEFINITION_OF_DONE.md](docs/DEFINITION_OF_DONE.md) for the full checklist.

---

## 5. Run checks before claiming done

Before marking work complete:

- Run `pnpm -r run lint` (or equivalent).
- Run `pnpm -r run typecheck` (or equivalent).
- Run `pnpm -r run test` (or equivalent).

Do not claim a feature is done if any of these fail. Fix failures or document why a check is not yet applicable (e.g. script not added in that package yet).

---

## 6. Provide run instructions

- Document how to run the app (and any required services: DB, Redis, S3, etc.).
- Use environment variables and `.env.example`; never hardcode secrets.
- If the change affects setup or run steps, update the relevant README or CONTRIBUTING.

---

## Summary

1. Read **FACTORY_CONSTITUTION.md** first.  
2. Create a **spec in docs/specs/** before coding.  
3. Implement **one module at a time**.  
4. Add **RBAC + audit + validation + tests**.  
5. **Run lint/typecheck/tests** before claiming done.  
6. **Provide run instructions.**
