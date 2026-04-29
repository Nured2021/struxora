# KAAFI Backend

Node.js + Express backend for the KAAFI HSSE MVP.

## Current Scope

- Simple user authentication.
- JWT-based session handling.
- Roles: Admin, Supervisor, Worker.
- JSA create/list/get endpoints.
- AI model placeholder structure only.

No PTW, Risk, Dashboard, or AI logic is implemented yet.

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a PostgreSQL database.

3. Copy `.env.example` to `.env` and update values:

   ```sh
   cp .env.example .env
   ```

4. Create the database tables:

   ```sh
   psql "$DATABASE_URL" -f schema.sql
   ```

5. Start the API:

   ```sh
   npm start
   ```

## Endpoints

### Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "worker@example.com",
  "password": "password123",
  "role": "Worker"
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "worker@example.com",
  "password": "password123"
}
```

Both endpoints return a JWT token on success.

### Create JSA

Requires `Authorization: Bearer <token>`.

```http
POST /jsa
Content-Type: application/json

{
  "title": "Install scaffold",
  "description": "Prepare area and install scaffold sections",
  "location": "Plant A",
  "status": "draft"
}
```

### List JSA documents

Requires `Authorization: Bearer <token>`.

```http
GET /jsa
```

### Get JSA document

Requires `Authorization: Bearer <token>`.

```http
GET /jsa/1
```

### Create Risk Assessment

Requires `Authorization: Bearer <token>`.

```http
POST /risk
Content-Type: application/json

{
  "jsa_id": 1,
  "hazard": "Working at height",
  "likelihood": 3,
  "severity": 5
}
```

### List Risk Assessments

Requires `Authorization: Bearer <token>`.

```http
GET /risk
```

### Get Risk Assessment

Requires `Authorization: Bearer <token>`.

```http
GET /risk/1
```
