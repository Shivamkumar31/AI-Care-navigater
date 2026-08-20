# AI Care Navigator (Team Hospitality)
### Precision Care Challenge 2026 — Round 2: Production-Level Project Submission

Insurance-aware hospital & treatment navigation platform. Maps a patient's/caregiver's insurance
coverage (ESI, PM-JAY, Arogya Karnataka, Yeshaswini, or private/employer insurance) to eligible
hospitals, room categories, and indicative costs, then tracks the care journey stage-by-stage with
contextual, plain-language insurance guidance.

**This is a decision-support and information platform only. It does not provide medical diagnoses,
clinical treatment recommendations, or binding insurance advice.**

---

## 1. Architecture

```
ai-care-navigator/
├── backend/          Node.js + Express + MongoDB (Mongoose) REST API
│   ├── models/        User, InsurancePolicy, Hospital, CareJourney
│   ├── routes/         auth, insurance, hospitals, journeys
│   ├── utils/
│   │   ├── matchEngine.js      → insurance-to-hospital/room eligibility engine + explanations
│   │   └── guidanceEngine.js   → stage-aware contextual insurance guidance
│   ├── middleware/auth.js      → JWT auth guard
│   └── seed/                   → mock India hospital dataset (10 hospitals, multiple cities/schemes)
├── frontend/          Next.js 14 (App Router) + Tailwind CSS
│   └── app/            landing, register, login, dashboard, insurance, hospitals, journey
├── docker-compose.yml  one-command local stack (Mongo + backend + frontend)
└── README.md
```

**Tech stack:** Next.js, React, Tailwind CSS · Node.js, Express.js · MongoDB, Mongoose · JWT auth, bcrypt.

## 2. Core features implemented (mapped to challenge guidelines)

| Guideline | Implementation |
|---|---|
| Insurance & user data ingestion | `POST /api/insurance` — structured form → normalized `InsurancePolicy` schema (scheme type, coverage limit, room eligibility, exclusions, sub-limits, co-pay) |
| Hospital & care option mapping | `POST /api/hospitals/match` — `matchEngine.js` checks network status, eligible room categories, indicative costs, and specialty/city fit, returning a ranked, explained list |
| Care journey tracking | `CareJourney` model with 6 stages (Pre-Admission → Admission → Investigation → Procedure → Recovery → Discharge); `PATCH /api/journeys/:id/stage` advances the stage and returns fresh guidance |
| Contextual suggestions | `guidanceEngine.js` — plain-language, insurance-aware prompts generated per stage (e.g. room downgrade implications, sub-limit warnings, pre-auth reminders) |
| User-facing experience | Next.js dashboard: insurance summary, hospital suggestion cards, and a stage-stepper timeline UI |
| Non-diagnostic guardrail | Every suggestion/guidance response carries an explicit "decision-support only" disclaimer; no clinical or binding-insurance claims are made anywhere in the UI or API |

## 3. Running locally

### Option A — Docker (recommended, closest to production)
```bash
docker-compose up --build
```
Frontend: http://localhost:3000  ·  Backend: http://localhost:5000/api/health

### Option B — Manual

**Backend**
```bash
cd backend
npm install
cp .env.example .env        # fill in MONGO_URI (local or MongoDB Atlas) and JWT_SECRET
npm run seed                 # loads the mock hospital dataset
npm run dev                  # http://localhost:5000
```

**Frontend**
```bash
cd frontend
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev                        # http://localhost:3000
```

### MongoDB
Use a free MongoDB Atlas cluster for the fastest path to a deployed demo, or run Mongo locally/in Docker.
Update `MONGO_URI` in `backend/.env` accordingly.

## 4. Deployment suggestions (for the "deployed/working demo" deliverable)
- **Backend:** Render / Railway / Fly.io (free tier) — set `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN` env vars.
- **Database:** MongoDB Atlas free (M0) cluster.
- **Frontend:** Vercel — set `NEXT_PUBLIC_API_URL` to your deployed backend URL.

## 5. API summary

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | – | Create account |
| POST | `/api/auth/login` | – | Login, returns JWT |
| POST | `/api/insurance` | ✓ | Add insurance policy |
| GET | `/api/insurance` | ✓ | List user's policies |
| GET | `/api/hospitals` | – | Browse hospital dataset |
| POST | `/api/hospitals/match` | ✓ | Ranked, explained hospital/room matches for a policy |
| POST | `/api/journeys` | ✓ | Start a care journey |
| PATCH | `/api/journeys/:id/stage` | ✓ | Advance stage, get fresh guidance |

## 6. Judging-criteria alignment
- **Vision & pathway:** unifies fragmented insurance/hospital/journey info into one India-specific flow.
- **Working solution:** fully functional API + UI, end-to-end tested locally (register → add policy → match hospitals → run a care journey through all 6 stages).
- **Innovative AI use:** rule-based decision-support engine (transparent, explainable, auditable — important for an insurance/healthcare context) generating natural-language eligibility explanations and stage-aware guidance; can be swapped/augmented with an LLM layer for the demo narrative.
- **Enterprise:** mock but realistic India-specific dataset (ESI/PM-JAY/Arogya Karnataka/Yeshaswini + private insurers across 6 cities), clear non-diagnostic/non-binding disclaimers throughout.

## 7. Suggested next steps before the demo
1. Deploy backend + frontend (see §4) and update env vars.
2. Record a 2–3 min demo video: register → add a PM-JAY/Arogya Karnataka policy → search hospitals → start and advance a care journey.
3. (Optional, for the "innovative AI" score) Add an LLM call (e.g. via Groq/OpenAI) to turn `matchEngine`/`guidanceEngine` output into a conversational assistant reply — the current engine's output is already structured to be a clean prompt input for that.
