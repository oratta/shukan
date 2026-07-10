/**
 * Clarity LP のトークン。
 *
 * この LP はアプリ本体のテーマ切り替え（next-themes の `.dark`）から独立した
 * 常時ライトのページとして設計されている。そのため semantic token
 * （bg-background / text-foreground 等）は使わず、色は明示値で固定する。
 */

/** 4 指標それぞれのインク色。印刷物を想定した彩度の低い色。 */
export const AXIS_INK = {
  health: '#0f766e',
  cost: '#a16207',
  income: '#1d4ed8',
  mood: '#6d28d9',
} as const;

export type AxisKey = keyof typeof AXIS_INK;

/** 棒の下敷き（トラック）。 */
export const TRACK = '#f4f4f5';

/** 罫線・軸線。 */
export const RULE = '#e4e4e7';
