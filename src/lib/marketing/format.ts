/**
 * LP の数値表記。ロケールに依らず同じ桁区切りで描画してサーバー出力を安定させる
 * （数値そのものは言語に依存しないため、ここは意図的に固定）。
 */
const GROUPED = new Intl.NumberFormat('en-US');

export function formatInt(value: number): string {
  return GROUPED.format(Math.round(value));
}

export function formatOneDecimal(value: number): string {
  return (Math.round(value * 10) / 10).toFixed(1);
}
