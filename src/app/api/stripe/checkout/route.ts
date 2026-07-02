import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSubscriptionForUser } from '@/lib/supabase/subscriptions';
import { createCheckoutSession, ensureCustomer } from '@/lib/billing/provider';
import { isValidPlan, checkoutModeForPlan, resolvePriceId, type Plan } from '@/lib/billing/config';
import { predictFoundingTier } from '@/lib/supabase/founding-admin';
import { resolveFoundingPriceId } from '@/lib/founding/config';

/**
 * Resolve the Checkout Price for a plan (change-B, design D5).
 *
 * For subscription plans (monthly/annual) we pick the Price for the tier the user
 * would land in right now, so the discount is visible at Checkout. The tier is
 * only a prediction — the webhook re-evaluates and corrects on payment success.
 * If the founding tier Price cannot be resolved (env unset / prediction failed),
 * we fall back to the regular Price so Checkout never breaks.
 */
async function resolveCheckoutPriceId(plan: Plan): Promise<string> {
  if (plan === 'lifetime') return resolvePriceId(plan);
  try {
    const tier = await predictFoundingTier();
    return resolveFoundingPriceId(tier, plan);
  } catch {
    return resolvePriceId(plan);
  }
}

/**
 * POST /api/stripe/checkout (change-A).
 *
 * Authorizes inside the handler via supabase.auth.getUser() — the middleware
 * matcher is intentionally NOT extended (design D1). Subscription plans use
 * `mode: subscription`; lifetime uses `mode: payment`. Reuses the user's existing
 * stripe_customer_id when present.
 */
export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { plan?: unknown };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const plan = body.plan;
  if (!isValidPlan(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const existing = await getSubscriptionForUser(user.id, supabase);
  const customerId = await ensureCustomer({
    userId: user.id,
    email: user.email ?? undefined,
    existingCustomerId: existing?.stripeCustomerId ?? null,
  });

  const session = await createCheckoutSession({
    userId: user.id,
    customerId,
    priceId: await resolveCheckoutPriceId(plan),
    mode: checkoutModeForPlan(plan),
    plan,
  });

  return NextResponse.json({ url: session.url });
}
