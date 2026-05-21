# lp-content

## ADDED Requirements

### Requirement: LP renders a Hero section with tagline and subcopy

The system SHALL render a Hero section on `src/app/marketing/page.tsx` that includes the tagline "Switch your path." and a Japanese subcopy summarizing the core promise of Smitch from `docs/context/product-concept.md`.

#### Scenario: Hero section is visible

- **WHEN** the marketing page is rendered (via host rewrite or `?marketing=1` escape hatch)
- **THEN** the page MUST contain the text `Switch your path.` inside an `<h1>` element (the page's single primary heading)
- **AND** the page MUST contain a Japanese subcopy referencing "なりたい自分" and "科学" (the core concept axis)

### Requirement: LP renders a Problem→Solution narrative

The system SHALL render at least one Problem→Solution narrative section that contrasts existing habit apps with Smitch's evidence-based, goal-driven approach.

#### Scenario: Problem and Solution texts coexist

- **WHEN** the marketing page is rendered
- **THEN** the page MUST contain a Japanese text block referencing the existing habit app pattern (the problem) and Smitch's differentiation (the solution)

### Requirement: LP exposes a primary CTA to the app

The system SHALL expose exactly one primary CTA labeled "アプリを始める" (or equivalent Japanese label from `copy.ts`) that links to `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://s-mitch.com'}/login`.

#### Scenario: Primary CTA href points to login

- **WHEN** the marketing page is rendered
- **THEN** the page MUST contain exactly one anchor or button element acting as the primary CTA
- **AND** the CTA's `href` (or computed href if it is a Link component) MUST resolve to `https://s-mitch.com/login` when `NEXT_PUBLIC_APP_URL` is unset
- **AND** the CTA's accessible label MUST be the Japanese label defined in `copy.ts`

### Requirement: LP renders footer with privacy and terms links

The system SHALL render a footer containing links to `/privacy` and `/terms` and a credit line for Genetta Inc.

#### Scenario: Footer links resolve to legal pages

- **WHEN** the marketing page is rendered
- **THEN** the footer MUST contain an anchor with `href="/privacy"` and an anchor with `href="/terms"`
- **AND** the footer MUST include the text "Genetta Inc" (case-insensitive substring match)

### Requirement: LP copy is centralized in copy.ts

The system SHALL keep all human-readable Japanese copy in a single `src/app/marketing/copy.ts` module so that future codex+gpt-image-2 handoff and translation work has a single source.

#### Scenario: copy.ts exports core strings

- **WHEN** the build is performed
- **THEN** `src/app/marketing/copy.ts` MUST export at minimum: `tagline`, `heroSubcopy`, `problemText`, `solutionText`, `ctaLabel`, `footerCredit`

### Requirement: LP uses DESIGN.md semantic colors

The system SHALL use Tailwind CSS classes that reference DESIGN.md semantic color variables (e.g., `bg-background`, `text-foreground`, `bg-primary`) and SHALL NOT introduce new hardcoded hex values.

#### Scenario: No hardcoded hex in marketing pages

- **WHEN** a grep is performed across `src/app/marketing/**/*.{ts,tsx}` for hex color literals matching `#[0-9A-Fa-f]{3,8}`
- **THEN** the match count MUST be `0`. Inline SVG MUST NOT be used in marketing components (the Smitch logo is referenced via `<Image src="/smitch-logo.svg" />` from `public/`, not pasted inline)
