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
  "prompt": "Analyze this hazard and return risks and controls: <text>",
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
  "controls": [],
  "raw_response": "DeepSeek response text"
}
```

## Boundaries

- DeepSeek R1 only.
- No extra AI architecture.
- No Gemma, Mistral, or Phi-3 connection.
- Existing modules are not changed.
