import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getFoundingMembershipForUser } from '@/lib/supabase/founding-admin';

/**
 * GET /api/founding/membership (Feedback D14).
 *
 * Authenticated, user-specific: returns the founding tier locked to the calling
 * user — `{ tier: 'founder_50' | 'founder_30' | null }`. Used by the /account
 * screen to show the confirmed tier (which takes precedence over the predicted
 * tier derived from the public counter).
 *
 * Authorizes INSIDE the handler via supabase.auth.getUser() — the SAME policy as
 * /api/stripe/checkout (design D1). The middleware matcher is intentionally NOT
 * extended. Unlike /api/founding/slots this DOES expose personal data (the
 * caller's own tier), so it must never be reachable unauthenticated.
 */
export async function GET(): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tier = await getFoundingMembershipForUser(user.id);
  return NextResponse.json({ tier });
}
