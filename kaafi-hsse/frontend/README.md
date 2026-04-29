# KAAFI Frontend

Simple Next.js + Tailwind CSS frontend for the KAAFI HSSE MVP.

## Pages

- `/login` - login and store JWT in localStorage.
- `/dashboard` - show total JSA, Risk, and PTW counts.
- `/jsa` - create and list JSA documents.
- `/risk` - create a risk assessment and show `risk_score`.
- `/ptw` - create and list permits to work.
- `/ai` - call the DeepSeek risk analysis endpoint.

## Setup

```sh
npm install
npm run dev
```

The frontend uses `NEXT_PUBLIC_API_BASE_URL` when set. If it is not set, it defaults to:

```text
http://localhost:4000
```

## Boundaries

- REST API only.
- No charts.
- No global state library.
- No complex UI framework.

