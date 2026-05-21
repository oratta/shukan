# marketing-seo Specification

## Purpose
TBD - created by archiving change seo-ogp-deploy. Update Purpose after archive.
## Requirements
### Requirement: robots.ts returns marketing-host rules for www

The system SHALL provide an `src/app/robots.ts` (Next.js Metadata API) that returns `{ rules: [{ userAgent: '*', allow: '/' }], sitemap: 'https://www.s-mitch.com/sitemap.xml' }` when the request host (read via `next/headers` `headers()`) is included in `NEXT_PUBLIC_MARKETING_HOSTS`.

#### Scenario: robots for www host allows all

- **WHEN** `src/app/robots.ts` `default export` is invoked with the request host header `www.s-mitch.com` (i.e., `NEXT_PUBLIC_MARKETING_HOSTS=www.s-mitch.com`)
- **THEN** the returned object MUST equal `{ rules: [{ userAgent: '*', allow: '/' }], sitemap: 'https://www.s-mitch.com/sitemap.xml' }`

### Requirement: robots.ts disallows all for apex host (preserves app non-indexed posture)

The system SHALL return `{ rules: [{ userAgent: '*', disallow: '/' }] }` when the request host is NOT a marketing host (apex `s-mitch.com`, localhost, preview URLs not added to env, etc.). This preserves the intent that the authenticated application surface (`(app)` routes) is not indexed by search engines.

#### Scenario: robots for apex disallows everything

- **WHEN** `src/app/robots.ts` `default export` is invoked with the request host header `s-mitch.com`
- **THEN** the returned object MUST equal `{ rules: [{ userAgent: '*', disallow: '/' }] }`

### Requirement: sitemap.ts emits marketing URL for www

The system SHALL provide an `src/app/sitemap.ts` that returns `[{ url: 'https://www.s-mitch.com/', lastModified: <date> }]` when the request host is a marketing host.

#### Scenario: sitemap for www lists root URL

- **WHEN** `src/app/sitemap.ts` `default export` is invoked with the request host header `www.s-mitch.com`
- **THEN** the returned array MUST contain an entry with `url` equal to `https://www.s-mitch.com/`

### Requirement: sitemap.ts returns empty for apex

The system SHALL return an empty array from `src/app/sitemap.ts` when the request host is NOT a marketing host.

#### Scenario: sitemap for apex is empty

- **WHEN** `src/app/sitemap.ts` `default export` is invoked with the request host header `s-mitch.com`
- **THEN** the returned array MUST have length `0`

### Requirement: LP exposes OGP and Twitter Card metadata

The system SHALL set Open Graph and Twitter Card metadata on the marketing page via Next.js Metadata API (`src/app/marketing/layout.tsx` or `page.tsx` `metadata` export).

#### Scenario: og:title and og:image present in HTML

- **WHEN** the marketing page HTML is rendered (e.g., `curl -H "Host: www.s-mitch.com" http://localhost:3000/`)
- **THEN** the response body MUST contain `<meta property="og:title"`, `<meta property="og:description"`, `<meta property="og:image"`, and `<meta name="twitter:card"` tags

### Requirement: Deploy steps document exists with required sections

The system SHALL include a `deploy-steps.md` document inside the longrun directory listing the manual deployment steps for the marketing host.

#### Scenario: deploy-steps.md contains required steps

- **WHEN** the file `_longruns/2026-05-12_lp-branding/deploy-steps.md` exists
- **THEN** it MUST contain section headers (or equivalent enumerated steps) covering: (1) Vercel domain add to existing `shukan` project, (2) Cloudflare DNS CNAME with proxy OFF, (3) Vercel env `NEXT_PUBLIC_MARKETING_HOSTS` setting, (4) SSL `Issued` waiting, (5) production smoke-test checklist

