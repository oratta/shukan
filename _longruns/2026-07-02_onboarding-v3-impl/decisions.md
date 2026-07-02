# Decisions: onboarding-v3-impl

## D-exec-1: モデル割り当ての per-change 適合（2026-07-02）
plan.md のモデル割り当ては change × ロール単位だが、build-verify テンプレートの埋め込みポイントは
ロール単位の単一値（`__BUILDER_MODEL__` / `__VERIFIER_MODEL__`）のみ。以下で適合させた:

- **builder**: `CHANGES_JSON` の各エントリに `builderModel` を持たせ、生成スクリプトの Build ループで
  `change.builderModel` を参照するよう exec が生成時に調整（A='sonnet'、B/C=null=inherit）。
  モデル値はエイリアスのみ（model-tiers.md で解決済み）。モデル ID の直書きなし
- **verifier**: Verify ループは run 全体を横断検証するため change 別に切り替え不能。
  割り当て中の最上位ティア **sonnet** をグローバル採用（change-A の haiku 指定は上位互換で吸収。
  検証品質は下がらず、コストのみ僅かに増える安全側）
- **fix ラウンドの builder**（Verify FAIL 時の修正）: どの change に触れるか不定のため
  グローバル `builderModel` = null（inherit）を維持
- **reviewer**: 全 change inherit → `__REVIEWER_MODEL__` = null

## D-A-1: change-A（kpi-income-label）実装範囲の確定（2026-07-02）
review-notes.md の NOTE-1/NOTE-2 をそのまま採用し、以下を機械的に置換した（設計判断の余地なし、逐語置換のみ）:
- `src/data/kpi/catalog.ts`: earning KPI の `name: '稼ぐ能力'` → `'増える収入'`、
  `description` 内の語句「稼ぐ能力」→「増える収入」（文全体は書き直さない）
- `src/messages/ja.json` / `en.json`: 同様に `kpi.earning.name`/`description` を追従
  （en は NOTE-2 のとおり `'Earning power'` → `'Income Growth'`、
  description の 'earning power' → 'income growth'）
- コメント3箇所（NOTE-1）: `src/data/average-income.ts:3` / `src/data/habit-presets.ts:177` /
  `src/components/onboarding/onboarding-wizard.tsx:469` の「稼ぐ能力」を「増える収入」に更新
- `headline: '稼ぐ力のある自分へ'`（catalog/ja.json）と記事本文中の「稼ぐ力」プローズ
  （social-connection / morning-light / fermented-food）は対象外のため無変更
- `src/__tests__/kpi-catalog.test.ts` の earning ケースの期待値を追従更新（TDD: RED確認後にGREEN化）
- 完了確認: `grep -rn '稼ぐ能力' src/` が 0 件。`npm test`（634 tests all green）/
  `npm run lint`（0 errors）/ `npx tsc --noEmit`（0 errors）/ `npm run build`（成功）全通過
