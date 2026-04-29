# KAAFI Backend

Node.js + Express backend for the KAAFI HSSE MVP.

## Step 2 Scope

- Simple user authentication.
- JWT-based session handling.
- Roles: Admin, Supervisor, Worker.

No JSA, PTW, Risk, Dashboard, or AI modules are implemented in this step.

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

4. Create the users table:

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
