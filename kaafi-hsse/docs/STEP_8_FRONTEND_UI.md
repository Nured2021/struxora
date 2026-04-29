# Step 8 - Frontend UI

This step adds a simple Next.js + Tailwind CSS UI for the KAAFI MVP.

## Pages

- `/login` - login form, calls `POST /auth/login`, stores JWT in `localStorage`.
- `/dashboard` - calls `GET /dashboard`, shows total JSA, Risk, and PTW counts.
- `/jsa` - creates JSA documents and lists existing JSA documents.
- `/risk` - creates Risk Assessments and shows the calculated `risk_score`, risks, and controls.
- `/ptw` - creates PTW permits and lists existing permits.
- `/ai` - calls `POST /ai/risk-analysis` and displays hazards, risks, and controls.

## Shared frontend files

- `components/Navbar.js`
- `components/FormInput.js`
- `services/api.js`

## Boundaries

- No charts.
- No animations.
- No global state libraries.
- No complex UI framework.
- REST API only.
