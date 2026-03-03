# Auth + RBAC (Phase 1 — First Feature)

## Title

**Auth + RBAC** — JWT authentication and role-based access control for the API.

---

## Goal

Enable users to register, sign in with email/password, and obtain JWTs so that the API can identify callers and enforce roles (ORG_OWNER, ADMIN, PM, FOREMAN, WORKER, SUBCONTRACTOR, CLIENT_VIEWER). Only ORG_OWNER can create an organization initially; ORG_OWNER/ADMIN can invite members (later). Scope is **apps/api only** (no web frontend in this spec).

---

## User Stories

- As a new user, I want to register with email and password so that I can sign in and use the platform.
- As a registered user, I want to log in with email and password so that I receive a JWT and can call protected endpoints.
- As an authenticated user, I want to refresh my token so that I can stay signed in without re-entering credentials.
- As an authenticated user, I want to call GET /auth/me so that I can see my profile and org memberships/roles.
- As an ORG_OWNER, I want to be the only one who can create an organization initially (invite/add members in a later spec).

---

## Acceptance Criteria

- [ ] **Pass:** POST /auth/register with valid email + password creates a user and returns tokens (or 201 + session).
- [ ] **Pass:** POST /auth/login with valid email + password returns access token (and refresh token if implemented).
- [ ] **Pass:** POST /auth/refresh with valid refresh token returns a new access token.
- [ ] **Pass:** GET /auth/me with valid Bearer token returns current user and memberships/roles.
- [ ] **Fail:** Register with duplicate email returns 409 or 400 with clear message.
- [ ] **Fail:** Login with wrong password returns 401.
- [ ] **Fail:** Request to protected route without token returns 401.
- [ ] **Fail:** Request with invalid/expired token returns 401.
- [ ] **Fail:** User cannot assign themselves or others a role above their own (no escalation).
- [ ] **Pass:** Only a user with ORG_OWNER role (or first user creating org) can create an organization.
- [ ] **Pass:** All auth-related mutations that change data write an audit_log entry (e.g. register, login if tracked).
- [ ] **Pass:** Prisma schema includes users, organizations, memberships, refresh_tokens (optional), audit_logs; migrations run cleanly.

---

## API Routes

| Method | Path | Description | Required role(s) |
|--------|------|-------------|------------------|
| POST | /auth/register | Register with email + password; optionally create first org | None (public) |
| POST | /auth/login | Sign in with email + password | None (public) |
| POST | /auth/refresh | Issue new access token from refresh token | None (valid refresh token in body/cookie) |
| GET | /auth/me | Current user + memberships/roles | Authenticated (valid JWT) |

Logout is optional (e.g. invalidate refresh token server-side or client discard).

---

## DB Changes

- **users:** id, email, password_hash, name (optional), created_at, updated_at. Unique on email.
- **organizations:** id, name, slug, created_at, updated_at, created_by_user_id. Unique on slug.
- **memberships:** id, organization_id, user_id, role (enum: ORG_OWNER | ADMIN | PM | FOREMAN | WORKER | SUBCONTRACTOR | CLIENT_VIEWER), created_at, updated_at. Unique on (organization_id, user_id). FK to users, organizations.
- **refresh_tokens (optional):** id, user_id, token_hash, expires_at, created_at. FK to users. Index on token_hash or user_id for lookup/revocation.
- **audit_logs:** id, organization_id (nullable), project_id (nullable), user_id, action, resource_type, resource_id, payload (Json), created_at. Indexes: organization_id, user_id, created_at.

Multi-tenant: organization_id on memberships and audit_logs; project_id on audit_log when applicable later. No cross-tenant data access.

---

## UI Pages / Components

- N/A (apps/api only; no web in this spec).

---

## Permissions

| Action | Roles / Condition |
|--------|-------------------|
| Register | Public |
| Login | Public |
| Refresh | Holder of valid refresh token |
| GET /auth/me | Any authenticated user |
| Create organization | ORG_OWNER only (or first user in system creating first org) |
| Invite/add members | ORG_OWNER, ADMIN (later endpoint; document only here) |

Default deny on all protected routes. All protected routes declare required role(s) or “authenticated”.

---

## Tests

- **Unit:** Auth service — register (success, duplicate email), login (success, wrong password), refresh (success, invalid/expired), hash/verify password. Validation schemas for register/login payloads.
- **E2E:** POST /auth/register → 201 and token; POST /auth/login → 200 and token; POST /auth/refresh → 200 and new token; GET /auth/me with Bearer → 200 and user + memberships; GET /auth/me without token → 401; login wrong password → 401.
- **Permission (at least one):** e.g. user with role WORKER cannot create an organization (only ORG_OWNER can); or GET /auth/me returns only that user’s data and roles (no other users’ data).

---

## Rollout Notes

- Migrations: add users, organizations, memberships, refresh_tokens (optional), audit_logs. Run `prisma migrate dev` with a descriptive name.
- Env: JWT_SECRET (or ACCESS_TOKEN_SECRET / REFRESH_TOKEN_SECRET), token expiry values. No hardcoded secrets.
- Backward compatibility: new tables only; existing /health and any other routes unchanged. Auth is additive.
