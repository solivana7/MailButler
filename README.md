# MailButler (SoliMail)

An AI-assisted email command center for people who juggle several inboxes. It unifies
Gmail and IMAP accounts in one triage view, uses an LLM to categorize incoming mail and
extract commitments, and turns email into a task system with reminders and weekly digests.

## The problem

Executive inboxes fail silently: a request buried in thread #47 never gets answered, a
commitment made in passing is never tracked. Conventional clients treat email as a list;
this treats it as a work queue. MailButler answers three questions on every message:
*Does this need me? What do I owe someone? When?*

## What it demonstrates

- **Systems thinking about a messy real-world domain** — one unified account/identity
  model spanning Gmail (OAuth2, token refresh) and generic IMAP, with per-account sync
  state, background periodic sync, and cascade-aware account deletion.
- **Pragmatic AI integration** — LLM-based triage (urgent / important / follow-up / task /
  newsletter / archive) with a deterministic rule-based fallback when no API key is
  configured, so the product degrades gracefully instead of failing.
- **Operational design** — demo mode with seeded data when `DATABASE_URL` is absent
  (zero-setup evaluation), full persistence on Postgres, and a single-container
  deployment path via Docker or Railway.
- **Product surface, not just plumbing** — dashboard, digest view, task panel, bulk
  CSV account import, privacy/terms pages, responsive UI.

## Architecture

```
                        ┌──────────────────────────────────────────┐
                        │            React 18 SPA (Vite)           │
                        │  dashboard · inbox · digest · tasks      │
                        │  Zustand store · TanStack Query          │
                        └───────────────────┬──────────────────────┘
                                            │ REST /api/*
                        ┌───────────────────▼──────────────────────┐
                        │          Express + TypeScript API        │
                        │  auth (Gmail OAuth / IMAP) · accounts    │
                        │  emails · tasks · digest · AI analysis   │
                        ├───┬──────────────┬──────────────┬───────┤
                        │   │ Gmail API    │ IMAP sync    │ AI svc │
                        │   │ (token refr) │ (background) │ LLM or │
                        │   │              │              │ rules  │
                        └───┴──────────────┴──────────────┴───────┘
                        ┌───────────────────┴──────────────────────┐
                        │   Neon PostgreSQL (Drizzle ORM)          │
                        │   — or in-memory demo mode w/ seed data  │
                        └──────────────────────────────────────────┘
```

The unified container image (`Dockerfile.backend`) builds the SPA and serves it from
the same Express process behind nginx-style routing; `Dockerfile.frontend` +
`docker-compose.yml` provide a split dev topology.

## Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Zustand, TanStack Query
- **Backend:** Node.js, Express, TypeScript, Drizzle ORM, Neon PostgreSQL (or demo mode)
- **AI:** Kimi (Moonshot AI) for triage/action extraction, rule-based fallback
- **Integrations:** Gmail API (OAuth2), IMAP, CSV bulk import
- **Deploy:** Docker, Docker Compose, Railway (`railway.json`)

## Run it

Prereqs: Node.js 20+, pnpm 9 (`corepack enable`).

```bash
git clone https://github.com/solivana7/MailButler.git
cd MailButler
corepack enable && pnpm install && (cd server && pnpm install)

cp .env.example .env   # all keys optional — placeholders are fine

cd server && pnpm dev  # API on :3001 (new terminal: pnpm dev → :5173)
```

Or fully containerized:

```bash
docker-compose up      # app served at http://localhost:3001
```

`.env.example` documents every variable. With no `DATABASE_URL` the server starts in
demo mode with seeded accounts, emails, tasks, and a digest; add a Neon (or any
Postgres) connection string for persistence. `KIMI_API_KEY` enables LLM triage;
`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` enable live Gmail sync.

## API surface (selected)

```
POST /api/auth/gmail | /api/auth/imap      connect an account (OAuth or IMAP)
GET/POST/PATCH/DELETE /api/accounts        account management + /:id/sync
GET /api/emails?account=…                  triage view, filters, read/star/category
POST /api/emails/:id/analyze               AI triage (single or batch)
GET/POST/PATCH /api/tasks                  extracted commitments
GET  /api/digest/weekly                    outstanding actions, weekly rollup
POST /api/ai/insights · /suggest-actions   cross-inbox intelligence
```

## Status

Portfolio project — provided for review. Not licensed for production use.
