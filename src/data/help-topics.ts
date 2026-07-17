/**
 * ヘルプトピックのマスター registry。
 *
 * 「はてなボタン → 共通説明モーダル」で表示できるトピックの一覧。ここに ID を足し、
 * src/messages/{ja,en}.json の `help.topics.<id>` に title / body を書くと、
 * 任意のコンポーネントに `<HelpButton topic="<id>" />` を1行で置けるようになる。
 * ID と両ロケールの整合性は help-topics.test.ts が担保する。
 *
 * body は空行（\n\n）区切りで複数段落を書ける。将来 FAQ ページを作る場合は
 * この配列を列挙して同じメッセージを一覧表示すればよい。
 */
export const HELP_TOPIC_IDS = [
  'todayProgress',
  'streak',
  'completionRate',
  'lifeImpact',
  'impactSavings',
  'evidenceConfidence',
  'historyCalendar',
  'evidenceWeight',
  'reviewMood',
] as const;

export type HelpTopicId = (typeof HELP_TOPIC_IDS)[number];

/** help.topics.<id>.body を段落の配列に分解する（空行区切り、前後空白は除去）。 */
export function splitHelpBody(body: string): string[] {
  return body
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}
