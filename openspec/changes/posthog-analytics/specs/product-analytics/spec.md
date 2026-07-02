# product-analytics Spec Delta

## ADDED Requirements

### Requirement: PostHog SDK is initialized only when configured
The system SHALL initialize posthog-js at client startup only when `NEXT_PUBLIC_POSTHOG_KEY` is set. When the key is unset, all analytics functions MUST be safe no-ops and the app MUST behave identically.

#### Scenario: Key unset (local dev / preview)
- **WHEN** the app loads without `NEXT_PUBLIC_POSTHOG_KEY`
- **THEN** PostHog is not initialized, no network requests are sent, and no errors occur

#### Scenario: Key set
- **WHEN** the app loads with `NEXT_PUBLIC_POSTHOG_KEY` configured
- **THEN** PostHog initializes with `person_profiles: 'identified_only'` and sends events via the first-party proxy

### Requirement: Analytics traffic is proxied through the app domain
Analytics ingestion SHALL be routed through same-origin `/ingest` rewrites to the PostHog Cloud (US) endpoints so that ad-blockers do not drop events.

#### Scenario: Static asset via proxy
- **WHEN** the client requests `/ingest/static/array.js`
- **THEN** the app serves the PostHog static asset via rewrite (HTTP 200)

#### Scenario: Event ingestion via proxy
- **WHEN** the SDK sends a capture request to `/ingest/...`
- **THEN** the request is forwarded to `us.i.posthog.com`

### Requirement: Users are identified pseudonymously only
The system SHALL identify users with the Supabase user UUID only. Email, name, and other personal attributes MUST NOT be sent. On sign-out the system MUST call reset to unlink the device from the user.

#### Scenario: Login
- **WHEN** a user session is established (initial load or auth state change)
- **THEN** `posthog.identify(<supabase user UUID>)` is called with no personal properties

#### Scenario: Logout
- **WHEN** the auth state changes to SIGNED_OUT
- **THEN** `posthog.reset()` is called

### Requirement: Free-text user content is never captured
Analytics SHALL NOT transmit user free text (habit names, notes, reflection comments). Autocapture MUST mask all element text and attributes (`mask_all_text`, `mask_all_element_attributes`), and custom events MUST send only enums, counts, booleans, and opaque IDs.

#### Scenario: Reflection saved with comment
- **WHEN** a daily reflection with mood and comment is saved
- **THEN** the `reflection_saved` event carries `mood` and `has_comment` only, never the comment body

### Requirement: Core behavior events are captured for success-rate metrics
The system SHALL capture the following events as the data foundation for success-rate features (取り組み数/挫折数): `habit_created`, `habit_updated`, `habit_archived`, `habit_deleted`, `habit_status_set` (with status and is_today), `quit_daily_done`, `urge_flow_started`, `urge_flow_completed`, `rocket_used`, `reflection_saved`.

#### Scenario: Habit created
- **WHEN** a user creates a habit
- **THEN** `habit_created` is captured with `habit_type`, `coping_steps_count`, `evidence_count`

#### Scenario: Habit archived (挫折シグナル)
- **WHEN** a habit is updated with `archived: true`
- **THEN** `habit_archived` is captured with the habit id

#### Scenario: Day status set
- **WHEN** a user marks a day as completed / failed / skipped
- **THEN** `habit_status_set` is captured with `status` and `is_today`

### Requirement: Page views are captured across SPA navigation
The system SHALL capture `$pageview` events on App Router client-side navigation using the SDK's history_change mode (`defaults: '2025-05-24'`).

#### Scenario: Client-side navigation
- **WHEN** the user navigates between pages without a full reload
- **THEN** a `$pageview` event is captured for each route change
