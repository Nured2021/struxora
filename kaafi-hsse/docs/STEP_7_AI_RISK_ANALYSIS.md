# Step 7 - AI Risk Analysis

This step adds one simple AI endpoint using DeepSeek R1 through local Ollama.

## Included endpoint

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/ai/risk-analysis` | Analyze hazard text and return risks and controls |

The endpoint requires a JWT bearer token.

## Connector

`backend/ai/deepseek.connector.js` sends:

```json
{
  "model": "deepseek-r1:7b",
  "prompt": "Analyze the following hazard and respond ONLY in JSON format with keys: hazards, risks, controls. No explanation. Hazard: <text>",
  "stream": false
}
```

to:

```text
http://localhost:11434/api/generate
```

## Response shape

```json
{
  "hazards": [],
  "risks": [],
  "controls": []
}
```

If the AI response cannot be parsed as JSON, the connector returns:

```json
{
  "hazards": [],
  "risks": [],
  "controls": ["Unable to parse AI response"]
}
```

## Boundaries

- DeepSeek R1 only.
- One connector.
- One endpoint.
- No extra AI architecture.
- Existing modules are not changed.
