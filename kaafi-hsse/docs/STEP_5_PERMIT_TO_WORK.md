# Step 5 - Permit to Work

This step adds a simple Permit to Work module linked to JSA and Risk Assessment records.

## Included endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/ptw` | Create a PTW permit linked to a JSA and Risk Assessment |
| GET | `/ptw` | List PTW permits |
| GET | `/ptw/:id` | Get one PTW permit |

All PTW endpoints require a JWT bearer token.

## PTW table

```sql
CREATE TABLE ptw_permits (
  id SERIAL PRIMARY KEY,
  jsa_id INTEGER NOT NULL REFERENCES jsa_documents(id) ON DELETE CASCADE,
  risk_id INTEGER NOT NULL REFERENCES risk_assessments(id) ON DELETE CASCADE,
  permit_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Logic

- `jsa_id` must reference an existing JSA document.
- `risk_id` must reference an existing Risk Assessment.
- The selected Risk Assessment must belong to the selected JSA.
- New permits default to `pending`.

## Boundaries

- No approval workflow.
- No AI.
- No notifications.
- Existing JSA and Risk modules are not changed.
