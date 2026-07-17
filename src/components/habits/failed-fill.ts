import type * as React from 'react';

/**
 * failed 日の反転塗り（issue #104）: 赤い面積 = やってしまった度合い（100 − resistRate）。
 * resistRate 未入力（無抵抗含む）は全面赤。緑は使わない（緑＝達成専用のカラールール）。
 * 週ドット・ステータスボタン・詳細カレンダーで共用する。
 */
export function failedFillStyle(
  resistRate: number | undefined,
  // v2: 失敗の赤は --danger、未抵抗ぶんの下地は --track（CSS 変数は inline style で有効）。
  { red = 'var(--danger)', neutral = 'var(--track)' }: { red?: string; neutral?: string } = {}
): React.CSSProperties {
  if (resistRate === undefined || resistRate <= 0) {
    return { backgroundColor: red };
  }
  const failedPortion = 100 - resistRate;
  return {
    background: `conic-gradient(${red} 0% ${failedPortion}%, ${neutral} ${failedPortion}% 100%)`,
  };
}
