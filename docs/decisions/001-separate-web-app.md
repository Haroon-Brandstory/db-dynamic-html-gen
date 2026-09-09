# ADR 001 — Separate web app

## Decision
Build Database LP Web as a new Next.js project under `work/database-lp-web`, not inside the Tkinter desktop repo.

## Why
- Desktop and web have different runtimes and UX
- Avoid breaking production desktop workflows
- Clean Vercel deploy boundary

## Consequence
Shared logic is reimplemented in TypeScript; templates are copied, not live-linked.
