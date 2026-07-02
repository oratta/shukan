# Proposal: kpi-data-foundation

## Why

オンボーディング再設計では、ユーザーが4つのKPI（健康寿命・前向きな気持ちの時間・出費削減・稼ぐ能力）から1つを選んで習慣を始める。しかし現状のインパクト計算は3指標（health / cost / income）固定で「前向きな気持ちの時間」が存在せず（T11/T17）、KPI定義・習慣プリセット・平均余命表・平均年収表の静的カタログも未整備。change-B（user-profiles-db）と change-C（onboarding-flow）が参照するデータ基盤を先に確立する。

## What Changes

- **型拡張（T17）**: `src/types/impact.ts` に `calculationParams.dailyPositiveMoodMinutes` / `inferences.positiveMood` / `calculationLogic.positiveMood` / `LifeImpactSavings.positiveMoodMinutes` を追加
- **全35記事の型適合**: `src/data/impact-articles/index.ts` に登録された35記事を新しい型に適合させる（値未設定の記事は `dailyPositiveMoodMinutes: 0`）。`src/data/impact-articles/LLM/` 配下の md はビルド対象外の素材で対象外
- **代表記事への値設定**: 代表記事10記事程度に研究ベースの `dailyPositiveMoodMinutes` と `calculationLogic.positiveMood` を設定（固定前提: 起きている時間16h・ベースラインの前向き割合50%・二重計上回避から機械的に算出。判断が割れる記事は 0 のまま）
- **累積計算の4KPI化（T11）**: `src/lib/impact.ts` の5関数すべて（`calculateDailyImpact` / `calculateAnnualImpact` / `calculateImpactSavings` / `calculateMultiEvidenceImpact` / `calculateTotalSavings`）と `DailyImpact` / `AnnualImpact` インターフェースに `positiveMoodMinutes` を追加。既存テストに positiveMood ケースを追加
- **新規追加**: `src/data/kpi/catalog.ts` — KPI定義4件（health_lifespan / positive_mood / cost_saving / earning。確定文言の「なりたい自分」コピー・KPI名・単位・説明文）
- **新規追加**: `src/data/habit-presets.ts` — 既存35記事から束ねた習慣プリセット（各KPIに3〜5個）
- **新規追加**: `src/data/life-expectancy.ts` / `src/data/average-income.ts` — 平均余命表・平均年収表（日本・5歳刻み）
- **制約**: 既存3軸（health / cost / income）の既存値・計算結果は一切変えない。記事本文の表示プレースホルダー（`renderArticle` の replacements）には positiveMood を追加しない。新規DBテーブル・UI変更はこの change には含まない

## Capabilities

### New Capabilities
- `kpi-catalog`: KPI定義4件・習慣プリセット・平均余命表・平均年収表を静的カタログ（src/data）として提供する能力

### Modified Capabilities
- `impact-calculation`: 3指標固定 → 4KPI。マルチエビデンス重み付き計算・累積計算に positiveMoodMinutes を追加し、記事の計算パラメータを拡張する

## Impact

- **影響コード**:
  - `src/types/impact.ts`（型拡張。`LifeImpactSavings.positiveMoodMinutes` 追加もここ）
  - `src/data/impact-articles/*.ts`（35記事すべて。うち10記事程度は研究ベース値＋算出根拠を設定）
  - `src/lib/impact.ts`（5関数＋2インターフェース）
  - `src/__tests__/impact.test.ts` / `src/__tests__/calculation-logic.test.ts`（positiveMood ケース追加。既存3軸の期待値は変更しない）
  - 新規: `src/data/kpi/catalog.ts` / `src/data/habit-presets.ts` / `src/data/life-expectancy.ts` / `src/data/average-income.ts` とそのユニットテスト
- **影響データ**: なし（静的データのみ。DBマイグレーション・既存テーブル変更なし）
- **影響UI**: なし（表示への組み込みは change-C 以降。`renderArticle` の出力は不変）
- **後続依存**: change-B が平均余命表・平均年収表を、change-C が KPI カタログ・習慣プリセットを参照する
