# Step 3 - JSA Module and AI Structure

This step adds JSA CRUD endpoints and placeholder AI model structure only.

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

## AI structure

Created placeholder-only files:

- `backend/ai/ai.service.js`
- `backend/ai/models/deepseek.model.js`
- `backend/ai/models/mistral.model.js`
- `backend/ai/models/gemma.model.js`
- `backend/ai/models/phi3.model.js`

## Boundaries

- No AI logic is implemented.
- No AI model is called.
- No AI libraries are installed.
- No Risk Assessment module.
- No PTW module.
- No Dashboard module.
