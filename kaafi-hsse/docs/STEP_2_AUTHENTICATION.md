# Step 2 - User Authentication

This step adds simple MVP authentication to the isolated KAAFI backend.

## Locked stack

- Backend: Node.js + Express
- Database: PostgreSQL
- Auth: JWT

## Included features

- User registration
- User login
- JWT token generation
- Basic roles:
  - Admin
  - Supervisor
  - Worker

## API endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | Create a user and return a JWT token |
| POST | `/auth/login` | Validate credentials and return a JWT token |

## User table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Supervisor', 'Worker')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Boundaries

- No JSA module.
- No Risk Assessment module.
- No PTW module.
- No Dashboard module.
- No AI assistant.
