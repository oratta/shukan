# Verification Guide: 2026-07-03_impact-3scene

> Review フェーズの成果物が本 run ディレクトリに未生成だったため、builder が
> plan.md の受け入れ条件から change 単位の検証 Scenario を起こして追跡する。
> 各 change の builder が担当 Scenario を進捗に応じて [x] 化する。

## change-1: kpi-label-unification

### Scenario 1-1: ja の KPI ラベルが正式名に統一されている（受け入れ条件 #5）
- WHEN: アプリの ja ロケールで impact / evidence のラベル定義を参照する
- THEN: `impact.dailyCost`=「出費削減」、`impact.dailyIncome`=「増える収入」、`evidence.feedbackCost`=「出費削減の算出根拠」、`evidence.feedbackIncome`=「増える収入の算出根拠」であり、旧ラベル「コスト削減」「収入増加」が残存しない
- [x] テスト実装完了
- [x] ロジック実装完了

### Scenario 1-2: ja の impact.fiveDaysImpact が日本語化されている（受け入れ条件 #5）
- WHEN: ja ロケールで `impact.fiveDaysImpact` を参照する
- THEN: 英語（ASCII 英字）が残存せず、日本語表記（「5日間のインパクト」）になっている
- [x] テスト実装完了
- [x] ロジック実装完了

### Scenario 1-3: en の impact.* KPI 名が正準 onboarding.kpi.*.name と一致（受け入れ条件 #6）
- WHEN: en ロケールで `impact.dailyHealth/dailyCost/dailyIncome` を参照する
- THEN: それぞれ `onboarding.kpi.health_lifespan.name`（Healthy lifespan）/ `cost_saving.name`（Cost saving）/ `earning.name`（Income Growth）と一致し、旧名（Health / Cost Savings / Income Gain）が残存しない
- [x] テスト実装完了
- [x] ロジック実装完了

### Scenario 1-4: LP の alt テキストが正準 4 KPI 名で統一されている
- WHEN: `Process.tsx` / `Detail.tsx` の iPhone スクショ alt を参照する
- THEN: 旧軸名（生涯コスト / 可処分時間 / 集中時間）が残存せず、4 つの正式 KPI 名（健康寿命 / 出費削減 / 増える収入 / 前向きな気持ちの時間）で記述されている
- [x] テスト実装完了
- [x] ロジック実装完了
