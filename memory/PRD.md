# Sanctum — Interview Study Desk

## Problem Statement
_You have to change the whole UI and UX of this web app. Remove the placeholders from all places and add some smooth transition features. Also the pdf download feature is not working so fix it. Make the whole website looking perfect and more attractive and make it study oriented._

## Concept
**Sanctum** is a scholarly interview-prep workspace — a warm parchment reading room that turns any job posting into a curriculum: match score, technical / behavioral questions with model answers, skill gaps, and a day-by-day preparation roadmap.

## Tech stack
- **Frontend**: React 19 + Vite 8 + Sass; `jspdf` (client-side PDF), `lucide-react` (icons), react-router 7
- **Backend**: Node.js + Express + Mongoose; JWT auth; Multer for uploads
- **AI**: Emergent LLM proxy (`https://integrations.emergentagent.com/llm/chat/completions`) via `EMERGENT_LLM_KEY`
- **Ports**: backend :8001, frontend :3000 (supervised)

## Design system
- **Palette**: warm parchment (#f4efe2 / #ebe3ce / #faf6ea), deep espresso ink (#1e1a15), terracotta CTA (#c25b26), gold accent (#c99146), forest secondary (#2f4a3a)
- **Type**: `Fraunces` (variable serif) for display + italic accents · `Manrope` for body · `JetBrains Mono` for micro-labels
- **Textures**: subtle SVG-noise grain + ruled-paper notebook lines + book-corner ornaments
- **Motion**: `page-in` fade-and-drift, staggered reveals, floating labels, animated match-score conic ring, hover-lifts

## What's implemented (Jan 2026)
- [x] Complete UI/UX rewrite in the "Sanctum" scholarly aesthetic
- [x] All placeholder attributes replaced with animated floating labels
- [x] Smooth transitions: page fades, staggered lists, hover lifts, ring animation, expanding Q&A cards
- [x] **PDF download fix** — moved off broken Puppeteer/Chromium to reliable client-side `jsPDF` generation with typographic layout, page numbers, and safe filename
- [x] Emergent LLM proxy wiring in `ai.service.js` (works when key budget is available)
- [x] `data-testid` coverage on every interactive/critical element
- [x] Responsive: header stacks, mobile menu, interview mobile tabs (Score / Content / Gaps)
- [x] 100% frontend test pass rate (13/13, iteration_1.json)

## Personas
- **Job seeker preparing for interviews** — wants structured, calm, scholarly prep

## Backlog (P1/P2)
- P1: New-plan drafting requires an active LLM budget — surface a friendlier error UI if the proxy returns `budget_exceeded`
- P1: Search / filter across saved plans
- P2: Export a single question as a flashcard image
- P2: Timer + speak-out-loud rehearsal mode on the roadmap page
- P2: Optional dark-academia night-desk theme toggle

## Test credentials
See `/app/memory/test_credentials.md`
