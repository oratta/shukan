/**
 * Thin, provider-agnostic billing abstraction (design D5, spec: payment provider
 * access goes through a thin abstraction).
 *
 * Application code (API routes, hooks) imports billing operations from here, never
 * the Stripe SDK directly. A future Merchant-of-Record provider (Paddle, Lemon
 * Squeezy, Polar) can replace the Stripe implementation without rewriting callers.
 *
 * The Stripe SDK is only ever instantiated inside `src/lib/billing/stripe.ts`.
 */

import type { Plan } from './config';
import type { SubscriptionStatus } from './entitlement';

export interface CreateCheckoutParams {
  userId: string;
  customerId: string;
  priceId: string;
  mode: 'subscription' | 'payment';
  plan: Plan;
  trialDays?: number;
}

export interface EnsureCustomerParams {
  userId: string;
  email?: string;
  existingCustomerId?: string | null;
}

export interface CreatePortalParams {
  customerId: string;
}

export interface CheckoutSessionResult {
  url: string | null;
}

export interface PortalSessionResult {
  url: string;
}

/**
 * Provider-agnostic domain events parsed from a verified webhook payload.
 * The webhook route dispatches on `kind` and never touches Stripe types.
 */
export type BillingDomainEvent =
  | {
      kind: 'subscription_activated';
      eventId: string;
      eventType: string;
      userId: string;
      plan: Plan;
      stripeCustomerId: string;
      stripeSubscriptionId: string | null;
      status: SubscriptionStatus;
      currentPeriodEnd: string | null;
    }
  | {
      kind: 'subscription_status_changed';
      eventId: string;
      eventType: string;
      stripeSubscriptionId: string;
      status: SubscriptionStatus;
      currentPeriodEnd: string | null;
      cancelAtPeriodEnd: boolean;
    }
  | {
      kind: 'subscription_canceled';
      eventId: string;
      eventType: string;
      stripeSubscriptionId: string;
    }
  | {
      kind: 'invoice_paid';
      eventId: string;
      eventType: string;
      stripeSubscriptionId: string;
      currentPeriodEnd: string | null;
    }
  | {
      kind: 'ignored';
      eventId: string;
      eventType: string;
    };

export {
  createCheckoutSession,
  createPortalSession,
  ensureCustomer,
  verifyAndParseWebhook,
} from './stripe';
