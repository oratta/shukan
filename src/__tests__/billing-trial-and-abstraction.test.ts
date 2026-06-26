import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// change-A S3: No hardcoded secrets in source
// change-A S18: Trial starts without card
// change-A S28: Callers do not import Stripe SDK directly
// Tasks: 3.1 (trial), config-level checks

// --- S18: trial start writes a trialing row with computed trial_end, no Stripe call ---
const insertTrialRowMock = vi.fn();
vi.mock('@/lib/supabase/subscriptions-admin', () => ({
  insertTrialRow: (...a: unknown[]) => insertTrialRowMock(...a),
  isEventProcessed: vi.fn(),
  markEventProcessed: vi.fn(),
  upsertSubscriptionFromEvent: vi.fn(),
  updateSubscriptionByStripeId: vi.fn(),
}));

const stripeConstructed = { value: false };
vi.mock('stripe', () => ({
  default: class {
    constructor() {
      stripeConstructed.value = true;
    }
  },
}));

import { startTrial } from '@/lib/billing/trial';

const SRC_DIR = join(process.cwd(), 'src');

beforeEach(() => {
  insertTrialRowMock.mockReset().mockResolvedValue(undefined);
  stripeConstructed.value = false;
  process.env.NEXT_PUBLIC_TRIAL_DAYS = '14';
});

describe('trial start (S18)', () => {
  it('creates a trialing subscription row with trial_end = now + configured days and no Stripe call', async () => {
    const now = new Date('2026-06-12T00:00:00Z');
    await startTrial('user-1', now);

    expect(insertTrialRowMock).toHaveBeenCalledTimes(1);
    const arg = insertTrialRowMock.mock.calls[0][0];
    expect(arg.userId).toBe('user-1');
    expect(arg.status).toBe('trialing');
    const expectedEnd = new Date('2026-06-26T00:00:00Z').toISOString();
    expect(new Date(arg.trialEnd).toISOString()).toBe(expectedEnd);
    // No Stripe SDK is constructed during trial start
    expect(stripeConstructed.value).toBe(false);
  });

  it('honors a non-default trial-days configuration (S20 boundary)', async () => {
    process.env.NEXT_PUBLIC_TRIAL_DAYS = '3';
    const now = new Date('2026-06-12T00:00:00Z');
    await startTrial('user-2', now);
    const arg = insertTrialRowMock.mock.calls[0][0];
    expect(new Date(arg.trialEnd).toISOString()).toBe(
      new Date('2026-06-15T00:00:00Z').toISOString()
    );
  });
});

// --- S3 / S28: static source-tree checks ---

function walkFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walkFiles(full, out);
    } else if (/\.(ts|tsx)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

describe('no hardcoded secrets (S3)', () => {
  it('contains no sk_live_ / sk_test_ / whsec_ literals in source', () => {
    const files = walkFiles(SRC_DIR).filter((f) => !f.includes('__tests__'));
    const offenders: string[] = [];
    for (const f of files) {
      const text = readFileSync(f, 'utf8');
      if (/sk_live_[A-Za-z0-9]/.test(text)) offenders.push(f + ' (sk_live_)');
      if (/sk_test_[A-Za-z0-9]/.test(text)) offenders.push(f + ' (sk_test_)');
      if (/whsec_[A-Za-z0-9]/.test(text)) offenders.push(f + ' (whsec_)');
    }
    expect(offenders).toEqual([]);
  });
});

describe('callers do not import Stripe SDK directly (S28)', () => {
  it("only files under src/lib/billing/ import 'stripe'", () => {
    const files = walkFiles(SRC_DIR).filter((f) => !f.includes('__tests__'));
    const billingDir = join(SRC_DIR, 'lib', 'billing') + '/';
    const offenders: string[] = [];
    for (const f of files) {
      const text = readFileSync(f, 'utf8');
      const importsStripe =
        /from\s+['"]stripe['"]/.test(text) || /require\(\s*['"]stripe['"]\s*\)/.test(text);
      if (importsStripe && !f.startsWith(billingDir)) {
        offenders.push(f);
      }
    }
    expect(offenders).toEqual([]);
  });
});
