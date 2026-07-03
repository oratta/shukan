# Tasks: change-1 kpi-label-unification

> Review フェーズの OpenSpec 成果物（tasks.md）が本 run ディレクトリに未生成だったため、
> builder が plan.md change-1 スコープから TDD 用タスクを起こして追跡する。

## change-1: kpi-label-unification

- [x] T1: KPI ラベル統一の失敗テストを作成（`src/__tests__/kpi-label-unification.test.ts`）
- [x] T2: ja.json `impact.dailyCost`→「出費削減」/ `impact.dailyIncome`→「増える収入」
- [x] T3: ja.json `evidence.feedbackCost`→「出費削減の算出根拠」/ `evidence.feedbackIncome`→「増える収入の算出根拠」
- [x] T4: ja.json `impact.fiveDaysImpact` 日本語化（「5日間のインパクト」）
- [x] T5: en.json `impact.dailyHealth/dailyCost/dailyIncome` を正準 `onboarding.kpi.*.name`（Healthy lifespan / Cost saving / Income Growth）に統一
- [x] T6: en.json `evidence.feedbackHealth/Cost/Income` も正準 KPI 名に統一（D-change1-1）
- [x] T7: LP alt テキスト更新（`Process.tsx` / `Detail.tsx` の旧軸名→正準 4 KPI 名。D-change1-2）
- [x] T8: 全テストスイート PASS（`npm run test:run`）・型チェック・lint・build 確認

## change-2: onboarding-future-contrast

- [x] T1: 対比ロジック・文言の失敗テストを作成（`src/__tests__/onboarding-future-contrast.test.ts`）
- [x] T2: `buildFullPotentialSelections`（回答済み習慣を達成率=1 に置換）を `src/lib/onboarding.ts` に追加
- [x] T3: ja/en `result.currentLabel`・`result.fullLabel` を追加、`result.lead`/`result.cta` を対比＋[5]導線に調整
- [x] T4: `onboarding-wizard.tsx` [4] 結果画面を「現在ペース vs 全部100%」の対比表示に改修（`fullResult` を追加）
- [x] T5: `onboarding-messages.test.ts` の cta 期待値を新文言に更新
- [x] T6: 全テストスイート PASS（`npm run test:run`）・型チェック・build 確認
