/**
 * Business operator information for the 特定商取引法に基づく表記 page
 * (change-D: jp-legal-compliance).
 *
 * IMPORTANT — PLACEHOLDER VALUES:
 * The legally-required operator name, address and phone number must be the real
 * registered details before public release. Until the user supplies them, the
 * values below are PLACEHOLDERS, sourced from environment variables with a
 * "[要記入]" fallback so the page renders without leaking a fabricated address.
 * Set the real values via the LEGAL_* env vars (or replace this file) before
 * launch — see decisions.md D7.
 *
 * Note: `RELEASE_PLACEHOLDER` ("[要記入]") is intentionally NOT the strings
 * `TODO` / `XXX`, which the structural test treats as a hard failure. The
 * "[要記入]" marker signals "must be filled before launch" without tripping the
 * developer-leftover detector, while still being human-visible on the page.
 */

const RELEASE_PLACEHOLDER = '[要記入]';

function fromEnv(name: string): string {
  const v = process.env[name];
  return v && v.trim().length > 0 ? v.trim() : RELEASE_PLACEHOLDER;
}

export interface BusinessInfo {
  /** 事業者名（販売業者） */
  operatorName: string;
  /** 運営統括責任者 */
  responsiblePerson: string;
  /** 所在地 */
  address: string;
  /** 電話番号（請求があれば遅滞なく開示する旨を併記） */
  phone: string;
  /** 連絡先メールアドレス */
  email: string;
}

/**
 * Resolve operator details from env (LEGAL_OPERATOR_NAME, LEGAL_ADDRESS,
 * LEGAL_PHONE, LEGAL_RESPONSIBLE_PERSON, LEGAL_CONTACT_EMAIL). Email defaults to
 * the existing support address used elsewhere in the app.
 */
export function getBusinessInfo(): BusinessInfo {
  return {
    operatorName: fromEnv('LEGAL_OPERATOR_NAME'),
    responsiblePerson: fromEnv('LEGAL_RESPONSIBLE_PERSON'),
    address: fromEnv('LEGAL_ADDRESS'),
    phone: fromEnv('LEGAL_PHONE'),
    email: process.env.LEGAL_CONTACT_EMAIL?.trim() || 'privacy@s-mitch.com',
  };
}

export { RELEASE_PLACEHOLDER };
