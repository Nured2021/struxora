# Struxora — Master Blueprint

## Vision

Struxora is a **Construction Operating System** for Alberta construction and industrial contractors. It combines:

- **AI Safety** — Structured AI outputs with human review
- **Evidence** — Attachments, daily logs, photos, audit trail
- **Scheduling** — Project and resource scheduling
- **Cost** — Change orders, bidding, resource tracking

The platform is built for **20-year scale**: modular, maintainable, secure, and auditable.

---

## User Roles (RBAC)

| Role             | Description |
|------------------|-------------|
| **ORG_OWNER**    | Full org control; billing and settings |
| **ADMIN**        | Org-wide admin; user and project management |
| **PM**           | Project manager; full project scope |
| **FOREMAN**      | Field supervision; daily logs, crew |
| **WORKER**        | Field entry; logs and assigned tasks |
| **SUBCONTRACTOR**| External party; limited project access |
| **CLIENT_VIEWER**| Read-only client access |

Default: **deny**. Every route declares required roles.

---

## Navigation (MVP)

- **Home / Dashboard** — Org/project summary; quick links
- **Organizations** — List/manage orgs (ORG_OWNER, ADMIN)
- **Projects** — List/manage projects; project-scoped features
- **Daily Logs** — Create/view daily logs + photos (FOREMAN, WORKER, PM)
- **Attachments** — Upload/list/download (project-scoped)
- **Audit Log** — View audit trail (ADMIN, ORG_OWNER)
- **Settings** — Profile, org settings, permissions (role-dependent)

---

## MVP Flows

1. **Sign up / Sign in** — Auth (JWT), RBAC assignment, org/project context.
2. **Org + Project setup** — Create org → create project → invite users with roles.
3. **Daily work** — Open project → daily log → add photos/notes → submit; attachments stored (S3), audit logged.
4. **Audit** — Admin opens audit log → filter by org/project/user/action → export if needed.
5. **Client view** — Client_VIEWER logs in → sees only permitted project(s) → read-only.

All flows respect multi-tenant boundaries (`organization_id`, `project_id`) and permissions.
