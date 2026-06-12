This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Billing (Stripe) setup

This app uses Stripe for subscriptions (monthly/annual) and a Lifetime one-time
purchase. The `subscriptions` Supabase table is the source of truth for billing
state; the app never queries Stripe at render time.

1. Add Stripe keys to `.env.local` (see `.env.local.example`):
   `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`,
   `NEXT_PUBLIC_TRIAL_DAYS` (default 14).
2. Create the Products / Prices (all with `tax_behavior: inclusive`, immutable):

   ```bash
   STRIPE_SECRET_KEY=sk_test_xxx npx tsx scripts/stripe-setup.ts
   ```

   Copy the printed `price_...` IDs into `.env.local` as `STRIPE_PRICE_MONTHLY`,
   `STRIPE_PRICE_ANNUAL`, `STRIPE_PRICE_LIFETIME`. Without a key the script exits
   with a descriptive error and does not call Stripe.
3. Forward webhooks locally:

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

Migrations for `subscriptions` / `stripe_events` live in
`supabase/migrations/`. Apply them with `supabase db push` (run on the main
branch after merge for the dev project).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
