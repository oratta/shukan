# marketing-host-routing

## ADDED Requirements

### Requirement: Marketing host serves LP on root path

The system SHALL serve the marketing landing page at `/` when the request `host` header matches a value listed in the `NEXT_PUBLIC_MARKETING_HOSTS` environment variable (comma-separated).

#### Scenario: www host returns marketing page at root

- **WHEN** a GET request is received with `host: www.s-mitch.com` and `pathname: /`
- **THEN** the middleware MUST internally rewrite the request to `/marketing` and return without calling Supabase `auth.getUser()`

#### Scenario: dev escape hatch in non-production

- **WHEN** the development server runs (`NODE_ENV !== 'production'`) and a GET request is received with `pathname: /` and `?marketing=1` query string
- **THEN** the middleware MUST internally rewrite the request to `/marketing`

### Requirement: Apex host preserves existing authentication flow

The system SHALL preserve the existing authentication-gated routing on the apex host (and any host not in `NEXT_PUBLIC_MARKETING_HOSTS`) without regression.

#### Scenario: apex unauthenticated user gets redirected to login

- **WHEN** an unauthenticated GET request is received with `host: s-mitch.com` and `pathname: /`
- **THEN** the middleware MUST redirect to `/login`

#### Scenario: apex authenticated user reaches home

- **WHEN** an authenticated GET request is received with `host: s-mitch.com` and `pathname: /`
- **THEN** the middleware MUST allow the request to proceed to the existing `(app)/page.tsx`

#### Scenario: localhost without escape hatch behaves as apex

- **WHEN** a GET request is received with `host: localhost:3000`, `pathname: /`, and no `?marketing=1` query
- **THEN** the middleware MUST run the existing authentication flow (redirect to `/login` if unauthenticated)

### Requirement: Marketing path is hidden on apex host

The system SHALL prevent direct access to `/marketing` on apex hosts to avoid exposing the marketing route outside its intended domain.

#### Scenario: apex direct /marketing rewritten to root

- **WHEN** a GET request is received with `host: s-mitch.com` and `pathname: /marketing`
- **THEN** the middleware MUST internally rewrite the request to `/` (URL bar shows `/marketing` but content is from the apex `/` route, subject to existing authentication)

### Requirement: Marketing routing does not invoke Supabase

The system SHALL NOT invoke `@supabase/ssr` `createServerClient` or `auth.getUser` when the request is determined to be a marketing-host request.

#### Scenario: Supabase mock not called for www root

- **WHEN** the middleware is invoked in a Vitest test with `@supabase/ssr` mocked, `host: www.s-mitch.com`, and `pathname: /`
- **THEN** the mocked `createServerClient` MUST have a call count of `0` (which implies `auth.getUser` is also not called downstream)

### Requirement: Marketing page exists at /marketing

The system SHALL provide an `src/app/marketing/page.tsx` React Server Component and an `src/app/marketing/layout.tsx` independent of the existing `(app)` layout, so that the host rewrite has a real target to render.

#### Scenario: /marketing renders standalone layout

- **WHEN** the marketing route is rendered (via rewrite or direct test render in dev)
- **THEN** the page MUST render a Hero placeholder, a CTA linking to `https://s-mitch.com/login` (or `NEXT_PUBLIC_APP_URL + /login` when env is set), and a footer with privacy/terms links, without depending on the `(app)` Header/BottomNav components
