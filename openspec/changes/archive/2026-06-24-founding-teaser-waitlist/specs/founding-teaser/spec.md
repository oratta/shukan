# founding-teaser

## ADDED Requirements

### Requirement: Founding teaser page renders the program sections in order

The system SHALL render a teaser page at `/founding` composed of, in order: a Hero section communicating the Founding Member value, a tier benefits section (50% off tier and 30% off tier), a CS-priority promise message, a waitlist signup form, and a FAQ section. Copy SHALL follow the brand tone (quiet, honest, no hype) and SHALL NOT use fake urgency or dark patterns (no fake countdowns, no fabricated scarcity).

#### Scenario: All five sections are present

- **WHEN** the `/founding` page is rendered
- **THEN** the page MUST contain a Hero section with a single `<h1>` describing the Founding Member program
- **AND** the page MUST contain a tier benefits section referencing both the 50% off tier and the 30% off tier
- **AND** the page MUST contain the CS-priority promise message
- **AND** the page MUST contain a waitlist email form
- **AND** the page MUST contain a FAQ section with at least 3 question/answer pairs

#### Scenario: No dark-pattern urgency devices

- **WHEN** the `/founding` page is rendered
- **THEN** the page MUST NOT contain a countdown timer component
- **AND** any scarcity numbers shown (remaining slots) MUST originate from live API data, never from literals in copy or components

### Requirement: Founding teaser page is publicly accessible without authentication

The system SHALL serve `/founding` to unauthenticated visitors on both the app host and marketing hosts (`NEXT_PUBLIC_MARKETING_HOSTS`). The middleware matcher in `src/middleware.ts` SHALL NOT be extended; `/founding` stays outside the matcher so no Supabase session check or `/login` redirect applies.

#### Scenario: Unauthenticated visitor sees the teaser

- **WHEN** a visitor without a Supabase session requests `/founding` (on the apex host or on a host listed in `NEXT_PUBLIC_MARKETING_HOSTS`)
- **THEN** the teaser page MUST render with HTTP 200
- **AND** the visitor MUST NOT be redirected to `/login`

#### Scenario: Middleware matcher is unchanged

- **WHEN** `src/middleware.ts` is inspected after this change
- **THEN** the exported `config.matcher` MUST NOT include `/founding`

### Requirement: Founding teaser copy is localized via next-intl founding namespace

The system SHALL store all human-readable teaser copy under a `founding` namespace in `src/messages/en.json` and `src/messages/ja.json`, resolved through the existing cookie-based next-intl setup (`src/i18n/request.ts`). The page SHALL NOT use the static export pattern of `src/app/marketing/copy.ts`.

#### Scenario: Locale switches the rendered copy

- **WHEN** the `/founding` page is rendered with the `locale` cookie set to `ja`
- **THEN** the page MUST render the Japanese copy from the `founding` namespace in `src/messages/ja.json`
- **AND** when the `locale` cookie is `en` or absent, the page MUST render the English copy from `src/messages/en.json`

#### Scenario: founding namespace keys exist in both locales

- **WHEN** `src/messages/en.json` and `src/messages/ja.json` are parsed
- **THEN** both files MUST contain a `founding` namespace with an identical key set covering at minimum: hero, tier benefits, CS-priority promise, waitlist form labels/messages, and FAQ entries

### Requirement: Waitlist signup persists email to Supabase

The system SHALL persist waitlist signups to a Supabase `waitlist` table with columns `id`, `email` (unique), `locale`, `source`, `created_at`. The submission path SHALL validate email format before insert, save the visitor's current next-intl locale, and record a `source` identifier (defaulting to the founding teaser). Resubmitting an already-registered email SHALL be neutralized via upsert and presented to the visitor as a success (no information leak about existing registrations, no error).

#### Scenario: Valid email is saved with locale and source

- **WHEN** a visitor submits a syntactically valid email through the waitlist form while the locale cookie is `ja`
- **THEN** a row MUST exist in `waitlist` with that email, `locale = 'ja'`, a non-empty `source`, and a `created_at` timestamp
- **AND** the form MUST show a success message in the visitor's locale

#### Scenario: Invalid email is rejected before insert

- **WHEN** a visitor submits a value that does not match the email format
- **THEN** no row MUST be inserted into `waitlist`
- **AND** the form MUST show a localized validation error

#### Scenario: Duplicate email is neutralized

- **WHEN** a visitor submits an email that already exists in `waitlist`
- **THEN** the operation MUST complete without raising a visible error (upsert / ignore-duplicates semantics)
- **AND** the table MUST still contain exactly one row for that email
- **AND** the form MUST show the same success message as a first-time signup

### Requirement: Waitlist table enforces anon-insert-only RLS

The `waitlist` table SHALL enable Row Level Security with: an INSERT policy granted `to anon` (and authenticated), no SELECT/UPDATE/DELETE policy for `anon` (reads only via `service_role`, which bypasses RLS), a `unique(email)` constraint, and an email format CHECK constraint at the database level. Because an anon INSERT policy is the first of its kind in this codebase, the migration SHALL document the intent and constraints in SQL comments.

#### Scenario: Anon can insert but cannot read

- **WHEN** a client using the anon key inserts a valid waitlist row
- **THEN** the insert MUST succeed
- **AND** a subsequent SELECT on `waitlist` by the same anon client MUST return zero rows (or be denied)

#### Scenario: Database-level constraints reject bad data

- **WHEN** an insert is attempted with a malformed email or with an email that already exists
- **THEN** the database MUST reject the malformed email via the CHECK constraint
- **AND** the duplicate email MUST violate the `unique(email)` constraint unless the caller used upsert semantics

#### Scenario: Migration documents the anon-insert precedent

- **WHEN** the waitlist migration file is inspected
- **THEN** it MUST contain SQL comments explaining why anon INSERT is allowed, why SELECT is restricted to service_role, and the abuse mitigations (unique email, format CHECK, upsert neutralization)

### Requirement: Remaining slot display shows live counts from the founding counter API

The tier benefits section SHALL display the remaining slot counts for the 50% off and 30% off tiers using the public counter API provided by change-B (`founding-member-program`). Slot numbers SHALL NOT be hardcoded anywhere in components, messages, or copy. While the counter API is unavailable (change-B not yet deployed, or fetch failure), the section SHALL gracefully omit the numeric counts and render the tier benefits without numbers instead of showing stale or invented values.

#### Scenario: Live counts are rendered from the API

- **WHEN** the counter API responds with remaining counts for both tiers
- **THEN** the tier benefits section MUST display those exact numbers as the remaining slots for the 50% off and 30% off tiers

#### Scenario: Counter API unavailable falls back without fake numbers

- **WHEN** the counter API is unreachable or returns an error
- **THEN** the page MUST still render the tier benefits section without numeric remaining counts
- **AND** the page MUST NOT display any hardcoded or cached-stale slot number

#### Scenario: No hardcoded slot numbers in source

- **WHEN** the founding teaser components and the `founding` message namespace are inspected
- **THEN** they MUST NOT contain literal remaining-slot numbers; tier capacity wording may describe the program (e.g., "first 50 members") only as static program description sourced from configuration-backed copy, while the "remaining" figures MUST come exclusively from the API response
