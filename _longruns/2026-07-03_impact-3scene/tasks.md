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
