# Database LP Web

Next.js web app for The Database Providers — generate HTML pages from Excel against bundled master templates.

**Separate from** the desktop Tkinter app (`Database LP Creator`). Do not mix the two.

## Features (MVP)

- Internal team login (shared password)
- Templates: Community, Template 1, Template 2
- Workflow: Template → Excel → optional Internal Links → Validate → Generate ZIP
- Internal links required only when the template has `INTERNAL_LINK_*`

## Local setup

```bash
cd database-lp-web
cp .env.example .env.local
# edit TEAM_PASSWORD and AUTH_SECRET
npm install
npm run dev
```

Open http://localhost:3000

## Vercel

1. Import this repo (or this folder) into Vercel
2. Set env vars: `TEAM_PASSWORD`, `AUTH_SECRET`
3. Deploy

Large batches: serverless has a time limit (`maxDuration` 60s on generate). Cap via `MAX_GENERATE_ROWS` (default 800).

## Rules

- Master HTML under `templates/` is read-only
- Only `{{UPPERCASE_PLACEHOLDERS}}` are replaced
- Community Excel: sheet `Community Content` or `service_pages`; `slug` → filename if no `OUTPUT_FILENAME`
