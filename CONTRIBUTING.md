# Contributing to Struxora

Follow these rules for every change. They reflect the [Factory Constitution](FACTORY_CONSTITUTION.md).

---

## 1. Every feature starts with a spec

- **Before writing code**, create a spec in `docs/specs/`.
- Use the template: [docs/SPEC_TEMPLATE.md](docs/SPEC_TEMPLATE.md).
- Include: goal, user stories, acceptance criteria, API routes, DB changes, UI, permissions, tests, rollout notes.
- No feature work without an approved or agreed spec.

---

## 2. PR must pass checks

- All CI checks must pass before merge.
- CI runs: `pnpm -r lint`, `pnpm -r typecheck`, `pnpm -r test` (once workspaces are initialized).
- Fix lint, type, and test failures; do not disable gates without explicit review.

---

## 3. No bypassing RBAC, audit, or tests

- **RBAC**: Every protected route must declare required role(s). Default deny. No backdoors.
- **Audit**: Create/update/delete of key resources must write an audit log entry.
- **Tests**: New behavior must have tests (unit + permission tests where applicable).
- Do not skip permission checks, audit logging, or tests to “ship faster.”

---

## 4. Definition of Done

Before marking a feature done, confirm the [Definition of Done](docs/DEFINITION_OF_DONE.md): schema, validation, RBAC, audit log, tests, docs, run instructions.

---

## 5. One module at a time

- Do not build multiple modules in a single PR unless explicitly scoped.
- Prefer small, reviewable changes that respect module boundaries.
