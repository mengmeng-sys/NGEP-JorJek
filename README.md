# JorJek

Peer-to-peer digital-skill forum + mentoring bridge for CADT students.

This is a starting **codebase scaffold**, not a finished app — it gives every team
member a folder that matches their task-tracker ownership so work can start in
parallel without collisions. See `JorJek_Project_Scope.pdf` (project docs folder)
for what's actually in scope for the Sep 17, 2026 demo.

## Structure

```
jorjek-app/
├── frontend/     React (Vite + React Router, JavaScript) app — CS1, CS2
├── backend/      Node/Express (JavaScript) API + Prisma/PostgreSQL — CS3 (schema), TN1 (auth/sessions), TN2 (infra/notifications)
└── docker-compose.yml   local PostgreSQL for development
```

Plain JavaScript throughout (`.js` / `.jsx`) — no TypeScript, no build-time
type checking. `frontend/jsconfig.json` exists only so editors can resolve the
`@/...` import alias; it has no effect on how the app runs.

Routing is client-side, defined in one place — `frontend/src/App.jsx` — rather
than the file-based routing Next.js uses. Pages live in `frontend/src/pages/`;
add a new page by creating it there and registering its route in `App.jsx`.

## Phase 1 vs Phase 2 — READ BEFORE YOU BUILD

Per the current project scope, **session booking is Phase 2** and is *not* built
for the Sep 17 demo. The "Request a Session" button in the UI should render
**disabled**, labeled "Coming Soon" (see `frontend/src/components/session/RequestSessionButton.jsx`).
The backend route for it returns `501 Not Implemented` on purpose
(`backend/src/routes/sessions.routes.js`) so nobody accidentally wires it up early.

The Prisma schema *does* model the Phase 2 tables (`SessionRequest`, `SessionRating`)
now, so there's no breaking migration needed later — they're just unused until
Phase 2 starts.

Phase 1 karma is fed by **upvotes**, not session ratings (there are no session
ratings yet). See `backend/src/services/karma.service.js`.

## Getting started

### 1. Database (local dev)
```bash
docker compose up -d          # starts PostgreSQL on localhost:5432
```

### 2. Backend
```bash
cd backend
cp .env.example .env          # fill in DATABASE_URL, JWT_SECRET
npm install
npx prisma migrate dev --name init
npm run dev                   # http://localhost:4000 (nodemon, auto-restarts)
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env          # set VITE_API_URL=http://localhost:4000
npm install
npm run dev                   # http://localhost:3000
```

## Who owns what (maps to JorJek_4Week_Plan.xlsx)

| Area | Folder | Owner(s) |
|---|---|---|
| DB schema | `backend/prisma/schema.prisma` | CS3 |
| Auth (CADT email gate, JWT) | `backend/src/routes/auth.routes.js`, `backend/src/middleware/` | TN1 |
| Posts, tags, comments, votes | `backend/src/routes/posts.routes.js`, `comments.routes.js`, `votes.routes.js`, `tags.routes.js` | CS3 / TN2 |
| Notifications (polling vs WebSockets decision) | `backend/src/services/notification.service.js` | TN2 |
| Karma | `backend/src/services/karma.service.js` | CS3 |
| Reports/safety | `backend/src/routes/reports.routes.js` | TN1 |
| Sessions (Phase 2 stub only) | `backend/src/routes/sessions.routes.js` | TN1 (later) |
| Frontend feed, post, comment UI | `frontend/src/pages/HomePage.jsx`, `PostDetailPage.jsx`, `NewPostPage.jsx`, `frontend/src/components/post/`, `comment/` | CS1 |
| Frontend profile, tag, search, notifications UI | `frontend/src/pages/ProfilePage.jsx`, `TagFeedPage.jsx`, `SearchPage.jsx`, `NotificationsPage.jsx`, `frontend/src/components/profile/`, `tag/` | CS2 |
| Product/scope decisions | — | DB |

## Stack

React (Vite, React Router, JavaScript) · Node/Express (JavaScript, CommonJS
`require`/`module.exports`) · PostgreSQL via Prisma · hosted on Render/Railway
(recommended, not yet formally confirmed by the team — see project scope doc,
Section 6). Confirmed by the team on 2026-08-29: React (not Next.js) for the
frontend, Node for the backend, plain JavaScript (not TypeScript) throughout.
