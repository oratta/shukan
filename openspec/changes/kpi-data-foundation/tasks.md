# Tasks: kpi-data-foundation

## 1. 型拡張（T17）

- [ ] 1.1 `src/types/impact.ts` を拡張する: `calculationParams.dailyPositiveMoodMinutes`（required number）/ `inferences.positiveMood?`（optional string）/ `calculationLogic.positiveMood?`（optional CalcStep[]）/ `LifeImpactSavings.positiveMoodMinutes`（required number）を追加
- [ ] 1.2 `src/data/impact-articles/` の index.ts 登録35記事すべてに `dailyPositiveMoodMinutes: 0` を追加し、型チェックを通す（既存3軸の値・他のフィールドには触れない）

## 2. 累積計算の4KPI化（T11）

- [ ] 2.1 `src/lib/impact.ts` の `DailyImpact` / `AnnualImpact` インターフェースに `positiveMoodMinutes` を追加
- [ ] 2.2 `calculateDailyImpact` / `calculateAnnualImpact` / `calculateImpactSavings` / `calculateMultiEvidenceImpact` / `calculateTotalSavings` の5関数すべての初期値オブジェクト・加算・reduce に positiveMoodMinutes を追加（既存3軸と同じ展開パターンに1行ずつ。renderArticle の replacements は変更しない）
- [ ] 2.3 `src/__tests__/impact.test.ts` / `src/__tests__/calculation-logic.test.ts` に positiveMood ケースを追加（重み付き合算・累積加算・0=未設定記事の混在・calculateTotalSavings の総和）。既存の期待値は一切変更しない

## 3. 代表記事への positiveMood 値設定

- [ ] 3.1 design.md D-4 の候補10記事について、記事内の研究記述から固定前提（起床16h=960分・前向き50%）で機械的に算出できるか確認し、対象記事と値を確定する（判断が割れる記事は 0 のまま候補から外す）
- [ ] 3.2 確定した代表記事（10記事程度）に `dailyPositiveMoodMinutes`（> 0）・`inferences.positiveMood`・`calculationLogic.positiveMood`（CalcStep に前提値と算出根拠を明記）を設定する。二重計上回避（dailyHealthMinutes と同一効果を計上しない）を各記事で確認
- [ ] 3.3 代表記事の値設定を検証するユニットテストを追加（dailyPositiveMoodMinutes > 0 の記事数が10程度、> 0 の全記事に calculationLogic.positiveMood が存在）

## 4. 静的カタログ

- [ ] 4.1 `src/data/kpi/catalog.ts` を作成: KpiKey union＋KpiDefinition 型＋4件の定義（確定文言: 見出し・KPI名・単位・説明文を onboarding-screens.md から一字一句変えずに転記）＋`getKpi` 引き当て関数
- [ ] 4.2 `src/data/habit-presets.ts` を作成: 既存35記事から束ねた習慣プリセット（id / name / defaultHabitType / icon / articleIds / primaryKpis）。各KPIに3〜5個になるよう割り当てる
- [ ] 4.3 `src/data/life-expectancy.ts` を作成: 日本・5歳刻み×性別の平均余命表＋引き当て関数（範囲外は最近傍ブラケット、other/unspecified は男女平均にフォールバック。出典・参照年をコメントに明記）
- [ ] 4.4 `src/data/average-income.ts` を作成: 日本・5歳刻み×性別の平均年収表＋引き当て関数（フォールバック・出典コメントは 4.3 と同様）
- [ ] 4.5 カタログ・統計表のユニットテストを追加: KPI定義4件の確定文言一致／getKpi の引き当てと未知キー undefined／各KPIのプリセット数3〜5／全プリセットの articleIds が isValidArticleId を通る・primaryKpis がKPIキーである／統計表の引き当てとフォールバック

## 5. 検証

- [ ] 5.1 `npm run test:run` で全テストPASS（既存テストの期待値無変更でPASSすること＝既存3軸の計算結果が不変であることを確認）
- [ ] 5.2 `npm run build` で型チェック＋ビルドが成功する
