# Sanctum — Test Credentials

## Test Account
- **Username**: sanctum_reader
- **Email**: reader@sanctum.study
- **Password**: ReaderPass123!

## Backend API
- Node/Express on internal port `8001` (via supervisor)
- Public: use `REACT_APP_BACKEND_URL` / `VITE_API_URL` (preview URL)
- Auth via JWT cookie AND `Authorization: Bearer` header (both supported)

## Existing Report (seeded)
- Report ID: `6a4fda1a6e07e2b9f72bbb4f`  (Interview Plan - Senior React Engineer, matchScore 82)
- URL: `/interview/6a4fda1a6e07e2b9f72bbb4f`

## Notes
- Google Gemini generation currently uses the EMERGENT_LLM_KEY proxy at
  `https://integrations.emergentagent.com/llm/chat/completions`. Budget may
  be $0 on the shared key — new plan generation may fail with a
  `budget_exceeded` LLM error until credits are topped up. All other flows
  (auth, viewing reports, PDF download) work independently.
- Résumé PDF download runs entirely **client-side via jsPDF** — no
  Puppeteer / Chromium dependency.
