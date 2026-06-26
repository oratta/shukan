'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { submitWaitlist, type WaitlistState } from './actions';

const INITIAL_STATE: WaitlistState = { ok: false };

export function WaitlistForm() {
  const t = useTranslations('founding.waitlist');
  const [state, formAction, pending] = useActionState(submitWaitlist, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <label htmlFor="waitlist-email" className="block text-sm font-medium text-foreground">
          {t('emailLabel')}
        </label>
        <input
          id="waitlist-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={t('emailPlaceholder')}
          aria-invalid={!state.ok && Boolean(state.message)}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? t('submitting') : t('submit')}
      </button>

      {state.message ? (
        <p
          role={state.ok ? 'status' : 'alert'}
          className={
            state.ok
              ? 'text-sm text-foreground'
              : 'text-sm text-destructive'
          }
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
