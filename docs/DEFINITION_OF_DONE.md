# Definition of Done

Before marking any feature or module **done**, verify every item below.

---

## Schema

- [ ] Database schema defined (Prisma or equivalent).
- [ ] All business entities include: organization_id, project_id (when applicable), created_at, updated_at, created_by_user_id.
- [ ] Migrations run cleanly; no destructive changes without explicit approval.

---

## Validation

- [ ] Shared validation schemas (e.g. Zod) for inputs.
- [ ] API validates all inputs; invalid payloads return 4xx with clear messages.
- [ ] No duplicate schemas; reuse from `packages/shared` where possible.

---

## RBAC

- [ ] Every route declares required role(s).
- [ ] Default deny; unauthorized access returns 403.
- [ ] Permission matrix documented in spec and implemented.
- [ ] No bypassing RBAC (no “admin override” without explicit role).

---

## Audit Log

- [ ] Create/update/delete of key resources write an audit log entry.
- [ ] Entry includes: user_id, action, resource_type, resource_id, payload (if needed), created_at.
- [ ] Audit log is append-only.

---

## Tests

- [ ] Unit tests for service layer and validation.
- [ ] Permission tests: expected roles can/cannot access.
- [ ] CI runs tests; merge blocked if tests fail.

---

## Docs

- [ ] Spec exists in `docs/specs/` (using SPEC_TEMPLATE.md).
- [ ] API routes and permissions documented in spec.
- [ ] Run instructions updated (README or CONTRIBUTING) if needed.

---

## Run Instructions

- [ ] How to run the app (and any required services) is documented.
- [ ] No hardcoded secrets; use .env.example and env vars.
- [ ] Staging verification before production deploy.

---

**No feature is “done” without permissions, audit logs, and validation.** — Factory Constitution
