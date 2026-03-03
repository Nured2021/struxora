# Struxora API (apps/api)

NestJS API for Struxora. Phase 1: Auth + RBAC (JWT, roles, orgs).

## Prerequisites

- Node 20+
- Docker (for Postgres)
- pnpm 9+ — if missing: `npm install -g pnpm`

## Setup (Windows PowerShell)

All commands from **repo root** unless noted.

1. **Install pnpm** (if missing):

   ```powershell
   npm install -g pnpm
   ```

2. **Install dependencies**:

   ```powershell
   pnpm install
   ```

3. **Start Postgres**:

   ```powershell
   cd infra; docker compose up -d postgres; cd ..
   ```

4. **Configure env**:

   ```powershell
   copy apps\api\.env.example apps\api\.env
   ```
   Edit `apps\api\.env` and set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (min 32 chars).

5. **Run migrations**:

   ```powershell
   pnpm --filter @struxora/api exec prisma migrate dev
   ```

6. **Generate Prisma client** (if needed):

   ```powershell
   pnpm --filter @struxora/api run prisma:generate
   ```

## Run

From repo root:

```powershell
pnpm --filter @struxora/api run start:dev
```

API base: `http://localhost:3000`

## Endpoints

### Health

```powershell
curl http://localhost:3000/health
# {"status":"ok"}
```

### Auth

**Register** (optionally create first org):

```powershell
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d "{\"email\":\"you@example.com\",\"password\":\"password123\",\"name\":\"You\",\"organizationName\":\"My Org\"}"
# 201: {"accessToken":"...","refreshToken":"...","expiresIn":900}
```

**Login**:

```powershell
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d "{\"email\":\"you@example.com\",\"password\":\"password123\"}"
# 200: {"accessToken":"...","refreshToken":"...","expiresIn":900}
```

**Refresh**:

```powershell
curl -X POST http://localhost:3000/auth/refresh -H "Content-Type: application/json" -d "{\"refreshToken\":\"YOUR_REFRESH_TOKEN\"}"
# 200: {"accessToken":"...","refreshToken":"...","expiresIn":900}
```

**Me** (requires Bearer token):

```powershell
curl http://localhost:3000/auth/me -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
# 200: {"user":{"id":"...","email":"...","name":"..."},"memberships":[...]}
```

### Orgs (ORG_OWNER only)

```powershell
curl -X POST http://localhost:3000/orgs -H "Authorization: Bearer YOUR_ACCESS_TOKEN" -H "Content-Type: application/json" -d "{\"name\":\"New Org\",\"slug\":\"new-org\"}"
# 201: {"id":"...","name":"New Org","slug":"new-org",...}
```

## Scripts

- `build`, `start`, `start:dev`, `lint`, `test`, `typecheck`, `prisma:generate`
