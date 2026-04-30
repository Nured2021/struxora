# Step 6 - Simple Dashboard

This step adds a simple API-only dashboard summary.

## Included endpoint

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/dashboard` | Return counts and recent records |

The Dashboard endpoint requires a JWT bearer token.

## Response shape

```json
{
  "total_jsa": 0,
  "total_risks": 0,
  "total_ptw": 0,
  "recent_jsa": [],
  "recent_risks": [],
  "recent_ptw": []
}
```

## Logic

- Count records from `jsa_documents`.
- Count records from `risk_assessments`.
- Count records from `ptw_permits`.
- Return the latest 5 records from each table.

## Boundaries

- No AI.
- No charts.
- No frontend.
- No analytics engine.
