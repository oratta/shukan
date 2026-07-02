# Review 申し送り（Build Contract レビュー NOTE 3 件 / 2026-07-02 APPROVE）

## NOTE-1（change-A スコープ）
「稼ぐ能力」は KPI ラベル（catalog.ts / messages ja・en）以外に、既存コメントにも含まれる:
- `src/lib/average-income.ts:3`
- `src/data/habit-presets.ts:177`
- `src/components/onboarding/onboarding-wizard.tsx:469`

これらのコメント更新も change-A スコープ内として扱うこと（config rule「grep -r '稼ぐ能力' src/ が 0 件」
を満たすために必要）。「稼ぐ力」（headline・記事本文）は対象外という区別は維持する。

## NOTE-2（change-A の en 側）
en は現状 `name='Earning power'`（小文字 p）/ description に 'earning power'。
'Income Growth' への置換で name/description の両方を漏れなく更新し、
`kpi-catalog.test.ts` の name 期待値（'稼ぐ能力'→'増える収入'）を追従すること。
headline の期待値は据え置き。

## NOTE-3（change-C の AC#14 実ブラウザ E2E）
実ブラウザ E2E はログイン済みブラウザ＋Supabase dev 稼働が前提。E2E 環境が使えない場合は
ユニット/コンポーネントテストでの代替検証（habits/user_profiles 書き込みペイロードのアサート）を行い、
実ブラウザ確認を残タスクとして builder-report に明示すること。
