# Step 7 - AI Risk Analysis

This step adds simple AI endpoints through local Ollama. Each endpoint calls one model directly.

## Included endpoint

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/ai/risk-analysis` | Analyze hazard text and return risks and controls |
| POST | `/ai/deepseek` | Manual DeepSeek risk analysis |
| POST | `/ai/mistral` | Manual Mistral text response |
| POST | `/ai/gemma` | Manual Gemma text response |
| POST | `/ai/phi3` | Manual Phi-3 text response |
| POST | `/ai/full-analysis` | Fixed step-by-step analysis using the local connectors |

All endpoints require a JWT bearer token.

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

- Each endpoint calls one model directly.
- Users manually select the model from the frontend.
- Full analysis runs a fixed sequence in `backend/ai/pipeline.service.js`.
- No automatic model selection.
- No hidden model choice.
- No extra AI architecture.
- AI failure falls back immediately.
