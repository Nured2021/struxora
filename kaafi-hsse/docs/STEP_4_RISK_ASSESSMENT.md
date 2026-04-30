# Step 4 - Risk Assessment

This step adds a simple Risk Assessment module linked to JSA documents.

## Included endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/risk` | Create a risk assessment linked to a JSA |
| GET | `/risk` | List risk assessments |
| GET | `/risk/:id` | Get one risk assessment |

All Risk Assessment endpoints require a JWT bearer token.

## Risk table

```sql
CREATE TABLE risk_assessments (
  id SERIAL PRIMARY KEY,
  jsa_id INTEGER NOT NULL REFERENCES jsa_documents(id) ON DELETE CASCADE,
  hazard TEXT NOT NULL,
  risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  controls JSONB NOT NULL DEFAULT '[]'::jsonb,
  likelihood INTEGER NOT NULL CHECK (likelihood BETWEEN 1 AND 5),
  severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5),
  risk_score INTEGER NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Logic

- `risk_score = likelihood * severity`
- `likelihood` must be between 1 and 5.
- `severity` must be between 1 and 5.
- `jsa_id` must reference an existing JSA document.
- If `risks` and `controls` are not provided, Step 10 can fill them from the existing DeepSeek connector.

## Boundaries

- No new AI model.
- No advanced scoring.
- No workflow.
- JSA structure is not changed.
