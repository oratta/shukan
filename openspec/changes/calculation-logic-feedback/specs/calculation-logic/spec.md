# Spec: Calculation Logic Display

## Requirements

### REQ-CL-01: CalcStep Type Definition
LifeImpactArticle に `calculationLogic` フィールドを追加する（**optional** — 全記事に追加完了後も optional のまま維持し、UIで guard する）。各指標（health, cost, income）に対して CalcStep 配列を持つ。

```typescript
interface CalcStep {
  label: string;
  value?: string;
  formula?: string;
  result?: string;
}

// LifeImpactArticle に追加
calculationLogic?: {
  health: CalcStep[];
  cost: CalcStep[];
  income: CalcStep[];
};
```

### REQ-CL-02: Calculation Logic Data
全30記事の calculationLogic フィールドに、calculationParams の算出根拠を構造化データで記載する。

### REQ-CL-03: Consistency Validation
全30記事の calculationParams が以下の整合性を持つ:
- 健康寿命: 研究の効果量 → ユーザー調整 → `効果年数 × 525,600 ÷ 残存寿命年数 ÷ 365` で dailyHealthMinutes と一致
- コスト: 個別コスト積み上げ = dailyCostSaving
- 収入: 効果量 × 年収ベース計算 = dailyIncomeGain
- 累積: daily × 30/365/3650 が cumulative テキストの数値と一致

### REQ-CL-04: Collapsible UI Section
evidence-article-sheet の Sources セクション下に展開可能な「計算ロジック」セクションを表示する。デフォルトは折りたたみ状態。

### REQ-CL-05: Three Metric Display
計算ロジックセクション内で3指標（健康寿命 / コスト削減 / 収入増加）ごとにステップを表示する。各ステップは label, value/formula, result の流れ。

## Scenarios

### SCENARIO-CL-01: CalcStep type exists
- WHEN: CalcStep 型を import する
- THEN: label (string), value (string?), formula (string?), result (string?) のフィールドを持つ

### SCENARIO-CL-02: LifeImpactArticle has optional calculationLogic
- WHEN: LifeImpactArticle を参照する
- THEN: calculationLogic は optional プロパティで、存在する場合は health, cost, income の3つの CalcStep[] を持つ

### SCENARIO-CL-03: quit_smoking calculation consistency
- WHEN: quit_smoking 記事の calculationLogic を検証する
- THEN: health ステップの最終結果が dailyHealthMinutes と一致する
- AND: cost ステップの最終結果が dailyCostSaving と一致する
- AND: income ステップの最終結果が dailyIncomeGain と一致する

### SCENARIO-CL-04: Collapsible section renders
- WHEN: evidence-article-sheet が calculationLogic を持つ記事を表示する
- THEN: Sources の下に「計算ロジック」ヘッダーが表示される
- AND: デフォルトでは中身が非表示

### SCENARIO-CL-05: Expand calculation logic
- WHEN: ユーザーが「計算ロジック」ヘッダーをタップする
- THEN: 3指標のステップが展開表示される
- AND: 各ステップに label と value/formula/result が表示される

### SCENARIO-CL-06: Cumulative text consistency
- WHEN: 任意の記事の cumulative テキストを検証する
- THEN: 1ヶ月の値 = daily × 30 の数値と一致
- AND: 1年の値 = daily × 365 の数値と一致
- AND: 10年の値 = daily × 3650 の数値と一致

### SCENARIO-CL-07: quit_smoking post-fix cumulative validation
- WHEN: quit_smoking の dailyHealthMinutes が修正された後
- THEN: cumulative テキストの1ヶ月/1年/10年の健康寿命値が修正後の dailyHealthMinutes × 30/365/3650 と一致する
- AND: コスト/収入の累積値も dailyCostSaving/dailyIncomeGain × 30/365/3650 と一致する

### SCENARIO-CL-08: UI gracefully handles missing calculationLogic
- WHEN: evidence-article-sheet が calculationLogic を持たない記事を表示する
- THEN: 計算ロジックセクションは表示されない（エラーにならない）
