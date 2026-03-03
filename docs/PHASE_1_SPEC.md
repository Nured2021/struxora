# Phase 1 — Specification

Phase 1 delivers the foundation: Auth + RBAC, Orgs + Projects, Attachments, Daily Logs (with photos and PDF), and Audit Log.

---

## 1. Auth + RBAC

**Deliverables**

- JWT-based authentication (login, logout, refresh).
- Role-based access control: ORG_OWNER, ADMIN, PM, FOREMAN, WORKER, SUBCONTRACTOR, CLIENT_VIEWER.
- Default deny; every protected route declares required role(s).
- User entity: id, email, name, role(s) per org/project, created_at, updated_at.

**Acceptance criteria**

- [ ] User can register (or be invited) and sign in with email/password.
- [ ] JWT is issued and validated; refresh works.
- [ ] Each API route documents and enforces required role(s).
- [ ] Unauthorized access returns 403; unauthenticated returns 401.
- [ ] No role escalation; users cannot assign roles above their own.

**Permission matrix (Auth)**

| Action           | Roles |
|------------------|--------|
| Sign in / Sign out | All authenticated |
| Refresh token    | All authenticated |
| Invite user (org) | ORG_OWNER, ADMIN |
| Assign project role | ORG_OWNER, ADMIN, PM (within project) |

---

## 2. Organizations + Projects

**Deliverables**

- Organization: id, name, slug, created_at, updated_at, created_by_user_id.
- Project: id, organization_id, name, code, created_at, updated_at, created_by_user_id.
- Multi-tenant: all queries scoped by organization_id; project-scoped where applicable.

**Acceptance criteria**

- [ ] Org owner/admin can create and edit organizations.
- [ ] Admin/PM can create projects under an org.
- [ ] List orgs/projects filtered by user’s permissions.
- [ ] All entities include organization_id (and project_id where applicable).
- [ ] No cross-tenant data leakage.

**Permission matrix (Orgs + Projects)**

| Action        | Roles |
|---------------|--------|
| Create/edit org | ORG_OWNER |
| List orgs     | ORG_OWNER, ADMIN, PM, FOREMAN, WORKER, SUBCONTRACTOR, CLIENT_VIEWER (own orgs only) |
| Create project | ORG_OWNER, ADMIN, PM |
| Edit project  | ORG_OWNER, ADMIN, PM |
| List projects | Per project role |

---

## 3. Attachments

**Deliverables**

- Store files in S3-compatible storage (no server filesystem).
- Attachment entity: id, organization_id, project_id, filename, mime_type, size, storage_key, created_at, created_by_user_id.
- Upload (presigned or API), download (signed URL or proxy with auth).

**Acceptance criteria**

- [ ] User can upload file(s) for a project they have access to.
- [ ] Files are stored in S3-compatible storage; DB stores metadata only.
- [ ] Download requires same permission as viewing the linked resource.
- [ ] List attachments scoped by project (and org).

**Permission matrix (Attachments)**

| Action     | Roles |
|------------|--------|
| Upload     | PM, FOREMAN, WORKER, ADMIN, ORG_OWNER |
| List/Get   | PM, FOREMAN, WORKER, SUBCONTRACTOR, CLIENT_VIEWER, ADMIN, ORG_OWNER (project-scoped) |
| Delete     | PM, ADMIN, ORG_OWNER |

---

## 4. Daily Logs + Photos + PDF

**Deliverables**

- Daily log: id, organization_id, project_id, log_date, created_at, updated_at, created_by_user_id, body (rich text or markdown).
- Photos linked to daily log (or as attachments with type).
- Generate or attach PDF for a daily log (e.g. export or stored PDF).

**Acceptance criteria**

- [ ] User with FOREMAN/WORKER/PM can create/edit daily log for a project.
- [ ] Photos can be attached to a daily log (upload → attachment + link to log).
- [ ] Daily log can be exported or stored as PDF; access controlled by project role.
- [ ] List daily logs by project and date; scoped by org/project.

**Permission matrix (Daily Logs)**

| Action        | Roles |
|---------------|--------|
| Create/Edit   | PM, FOREMAN, WORKER |
| View          | PM, FOREMAN, WORKER, SUBCONTRACTOR, CLIENT_VIEWER, ADMIN, ORG_OWNER |
| Delete        | PM, ADMIN, ORG_OWNER |
| Export PDF    | Same as View |

---

## 5. Audit Log

**Deliverables**

- Audit log entity: id, organization_id, project_id (optional), user_id, action, resource_type, resource_id, payload (JSON), created_at.
- Write on create/update/delete for key resources (users, orgs, projects, attachments, daily logs).

**Acceptance criteria**

- [ ] All Phase 1 mutations that change data write an audit log entry.
- [ ] Audit log is append-only; no delete/update.
- [ ] Only ORG_OWNER/ADMIN can read audit log; scoped by org (and optionally project).
- [ ] Entries include who, what, when, and relevant identifiers.

**Permission matrix (Audit Log)**

| Action | Roles     |
|--------|-----------|
| Read   | ORG_OWNER, ADMIN |
| Write  | System only (no direct user write) |

---

## Phase 1 Permission Summary

- **Default deny** for all routes.
- Every route documents required role(s).
- Multi-tenant: organization_id (and project_id) on all business entities; no cross-tenant access.
