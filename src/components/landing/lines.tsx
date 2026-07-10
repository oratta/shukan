import type { ReactNode } from 'react';

/**
 * Render a copy string that contains `\n` as visual line breaks.
 *
 * Copy lives in the message catalog (ja/en); translators control where the lines
 * wrap by inserting `\n`, so the LP never hardcodes locale-specific breaks.
 *
 * This is a plain function (not a component) so the returned <span>s are inlined
 * directly into the parent's children — visible to server rendering and to the
 * structural tree-walk used in tests, which does not execute nested components.
 */
export function lines(text: string): ReactNode {
  return text.split('\n').map((part, i) => (
    <span key={i} className="block">
      {part}
    </span>
  ));
}
