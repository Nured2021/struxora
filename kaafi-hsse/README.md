# KAAFI HSSE Platform

Fresh MVP project for a practical HSSE platform focused on industrial safety workflows.

## MVP Scope

1. Job Safety Analysis (JSA)
2. Risk Assessment
3. Permit to Work (PTW)
4. Simple Dashboard
5. Basic AI Safety Assistant (rule-based first)

## Development Order

1. Initialize clean project structure
2. Build simple user authentication
3. Build JSA module
4. Add risk assessment
5. Add permit to work
6. Add dashboard
7. Add rule-based AI assistant

## Project Structure

```text
kaafi-hsse/
├── frontend/
│   ├── pages/
│   ├── components/
│   └── dashboard/
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── services/
├── ai/
│   ├── dataset/
│   ├── training/
│   └── inference/
└── docs/
```

## Current Status

- Step 1: clean project structure initialized.
- Step 2: simple backend authentication initialized with Express, PostgreSQL, and JWT.
- Step 3: JSA create/list/get API added; AI model placeholders added for future use only.
- Step 4: Risk Assessment create/list/get API added and linked to JSA.
- Step 5: Permit to Work create/list/get API added and linked to JSA plus Risk Assessment.

No legacy modules are reused.
