# Architect

## Stack
Next.js App Router, TypeScript, Tailwind, jose (JWT cookie), xlsx, jszip.

## Flow
```mermaid
flowchart LR
  login[Login] --> dash[Dashboard]
  dash --> tpl[PickTemplate]
  tpl --> excel[UploadExcel]
  excel --> val[ValidateAPI]
  val --> gen[GenerateAPI]
  gen --> zip[DownloadZIP]
```

## Hosting
Vercel serverless. Templates traced via `outputFileTracingIncludes`.
Generate capped by `maxDuration` + `MAX_GENERATE_ROWS`.
