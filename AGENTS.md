# AGENTS.md — Database LP Web

## Project
Web HTML page generator for The Database Providers.
Next.js (App Router) + TypeScript. Hosted on Vercel.
Bulk-generates HTML pages from Excel against master HTML templates.

## Primary Rules
1. **Never modify master HTML templates.** Read → in-memory copy → replace placeholders → emit new files / ZIP.
2. **Only replace `{{PLACEHOLDER}}` values** (uppercase `A-Z0-9_`). Never alter HTML structure, CSS, JS, IDs, classes, or layout.
3. Catch every exception; return precise validation errors (type, sheet, row, column, value, fix).
4. **Do not edit** the sibling desktop app `Database LP Creator/`.

## Scope
### Shipped
- Internal team login
- Templates: Community, Template 1, Template 2
- Sidebar workflow matching desktop: Dashboard, Template, Excel, Links, Validation, Generate, Reports, Projects, Settings
- Scan → blank Excel, sample HTML, SEO preview, generate ZIP
- Lucide icons only (no custom SVG icons)

### Not yet (desktop parity backlog)
- Project save/load persistence
- Full report downloads pack
- Live HTML / links / hreflang preview
- Bulk Excel replace
- Hreflang settings UI


## Module Map
| Path | Role |
|------|------|
| `src/app/` | Thin routes (login, dashboard) |
| `src/app/api/` | Auth / scan / validate / generate / sample / seo |
| `src/components/ui/` | Shared UI (Button, Card, FileUpload, BrandLogo) |
| `src/components/layout/` | AppSidebar, AppHeader |
| `src/components/dashboard/` | Feature panels + DashboardShell |
| `src/hooks/use-lp-workflow.ts` | Client workflow state + API actions |
| `src/lib/types.ts` | Shared domain types |
| `src/lib/catalog.ts` | Client template picker copy |
| `src/lib/nav.ts` | Sidebar nav config |
| `src/lib/auth.ts` | Session cookie |
| `src/lib/templates.ts` | Bundled master HTML load (server) |
| `src/lib/placeholders.ts` | Scan / replace |
| `src/lib/excel.ts` | Parse service + internal Excel |
| `src/lib/generate.ts` | Orchestrate page generation |
| `templates/` | Master HTML (read-only) |

## Conventions
- Placeholders: `{{NAME}}` → Excel columns `NAME` (headers uppercased on read)
- Auto-filled: `INTERNAL_LINK_*` (not required in service Excel)
- System: `OUTPUT_FILENAME` (or derived from `SLUG`)
- Community sheet name: `Community Content` or `service_pages`

## Docs
See `docs/agents/` and `docs/decisions/`. Track status in `progress.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
