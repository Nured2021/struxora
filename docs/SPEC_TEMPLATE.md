# Feature Spec Template

Use this template for **every** new feature. Create a spec file in `docs/specs/` before implementing.

---

## Title

**Feature name** (e.g. `RFI Module`, `Submittals`)

---

## Goal

One paragraph: what problem this solves and for whom.

---

## User Stories

- As a [role], I want [action] so that [outcome].
- …

---

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] …

---

## API Routes

| Method | Path | Description | Required role(s) |
|--------|------|-------------|------------------|
| GET    | /…   | …           | …                |
| POST   | /…   | …           | …                |

---

## DB Changes

- New tables: …
- New columns: …
- Indexes: …
- Multi-tenant: organization_id / project_id as required.

---

## UI Pages / Components

- Page: path, purpose, who can see it.
- Components: list and responsibility.

---

## Permissions

| Action | Roles |
|--------|--------|
| Create | … |
| Read   | … |
| Update | … |
| Delete | … |

Default deny. All routes declare required roles.

---

## Tests

- Unit: service layer, validation.
- Integration: API routes, auth, RBAC.
- Permission tests: each role can/cannot perform expected actions.

---

## Rollout Notes

- Migrations required: …
- Feature flag or env: …
- Backward compatibility: …
