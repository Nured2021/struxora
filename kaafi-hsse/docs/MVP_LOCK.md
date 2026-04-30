# KAAFI MVP Lock

KAAFI HSSE Platform is a clean MVP.

## Allowed system

- Single backend: Node.js with Express.
- Database: PostgreSQL.
- API style: simple REST.
- AI: local Ollama connectors exposed as explicit manual endpoints.
- Modules: Auth, JSA, Risk, PTW, Dashboard, Simple AI.
- Structure: clean modular folders.

## Development rules

- Keep changes small and practical.
- Keep the system working before adding scope.
- Use the existing backend and frontend folders.
- Keep AI requests manually selected by the user.
- Do not add automatic model selection or response combining.
- Do not add architecture beyond this document.
- Remove any change that conflicts with this MVP lock.
