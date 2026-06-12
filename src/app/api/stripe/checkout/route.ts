import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSubscriptionForUser } from '@/lib/supabase/subscriptions';
import { createCheckoutSession, ensureCustomer } from '@/lib/billing/provider';
import { isValidPlan, checkoutModeForPlan, resolvePriceId } from '@/lib/billing/config';

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

  const existing = await getSubscriptionForUser(user.id);
  const customerId = await ensureCustomer({
    userId: user.id,
    email: user.email ?? undefined,
    existingCustomerId: existing?.stripeCustomerId ?? null,
  });

  const session = await createCheckoutSession({
    userId: user.id,
    customerId,
    priceId: resolvePriceId(plan),
    mode: checkoutModeForPlan(plan),
    plan,
  });

  return NextResponse.json({ url: session.url });
}
