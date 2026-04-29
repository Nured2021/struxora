# Step 3 - JSA Module

This step adds JSA CRUD endpoints only.

## Included JSA endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/jsa` | Create a JSA document |
| GET | `/jsa` | List JSA documents |
| GET | `/jsa/:id` | Get one JSA document |

All JSA endpoints require a JWT bearer token.

## JSA table

```sql
CREATE TABLE jsa_documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255),
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Boundaries

- No AI logic is implemented.
- No Risk Assessment module.
- No PTW module.
- No Dashboard module.
