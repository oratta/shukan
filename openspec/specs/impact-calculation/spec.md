# impact-calculation Specification

## Purpose
TBD - normalized from archived change evidence-marketplace (delta format had leaked into the main spec). Update Purpose after review.
## Requirements
### Requirement: マルチエビデンス重み付きインパクト計算
システムは単一エビデンスから複数エビデンスの重み付き合算でインパクトを計算しなければならない（MUST）。計算対象は4KPI（健康寿命（分）・前向きな気持ちの時間（分）・出費削減（円）・稼ぐ能力（円））とする。既存3軸（healthMinutes / costSaving / incomeGain）の計算結果は positiveMoodMinutes の追加によって一切変わってはならない（MUST NOT）。

#### Scenario: 複数エビデンスのデイリーインパクト計算
- **WHEN** 習慣に複数のエビデンスが紐付いている（各weight付き）
- **THEN** デイリーインパクト = Σ(article.dailyX × evidence.weight / 100) で計算される
- **THEN** 健康寿命（分）、前向きな気持ちの時間（分）、出費削減（円）、稼ぐ能力（円）の4KPIが計算される

#### Scenario: 累積インパクトの計算
- **WHEN** 習慣の累積インパクトを計算する
- **THEN** completedDays × デイリーインパクト で累積値が算出される
- **THEN** 累積値（LifeImpactSavings）に positiveMoodMinutes が含まれ、完了日数に応じて加算される
- **THEN** status='completed' または 'rocket_used' の日数のみカウントされる
- **THEN** status='failed' の日数はカウントされない

#### Scenario: エビデンス0件のインパクト
- **WHEN** 習慣にエビデンスが紐付いていない
- **THEN** impactSavingsはundefined（計算されない）
- **THEN** インパクト関連UIは非表示

#### Scenario: 存在しないarticleIdへの耐性
- **WHEN** エビデンスのarticleIdに対応する記事が見つからない
- **THEN** そのエビデンスはスキップされ、エラーは発生しない

#### Scenario: 既存3軸の計算結果の不変
- **WHEN** 開発者が既存テスト（`src/__tests__/impact.test.ts` / `src/__tests__/calculation-logic.test.ts`）を実行する
- **THEN** 既存3軸（healthMinutes / costSaving / incomeGain）の期待値を一切変更することなく全テストがPASSする

#### Scenario: 全習慣合計に positiveMoodMinutes が含まれる
- **WHEN** 開発者が複数習慣（positiveMood 値あり・なし混在）で calculateTotalSavings を実行する
- **THEN** 合計の positiveMoodMinutes は各習慣の positiveMoodMinutes の総和になる
- **THEN** 値が 0（未設定）の記事しか持たない習慣の寄与は 0 となり、エラーは発生しない

### Requirement: 後方互換性
システムは既存のimpactArticleIdとの後方互換性を維持しなければならない（MUST）。

#### Scenario: レガシーデータのフォールバック
- **WHEN** 習慣にevidences配列が空で、impactArticleIdが設定されている
- **THEN** impactArticleIdを使用してインパクトが計算される（weight=100相当）

### Requirement: 記事の positiveMood 計算パラメータ
`src/data/impact-articles/index.ts` に登録された全35記事は `calculationParams.dailyPositiveMoodMinutes`（number）を持たなければならない（MUST）。値 0 は「未設定」を意味し、UI側で positiveMood を非表示にできる状態として扱う。

#### Scenario: 全35記事の型適合
- **WHEN** 開発者が型チェック＋ビルド（`npm run build`）を実行する
- **THEN** 全35記事が dailyPositiveMoodMinutes を持ち、型エラーなしで成功する
- **THEN** 値を設定しない記事には dailyPositiveMoodMinutes: 0 が明示されている

#### Scenario: 0 を未設定として扱う
- **WHEN** dailyPositiveMoodMinutes が 0 の記事を含むエビデンスでデイリーインパクトを計算する
- **THEN** その記事の positiveMoodMinutes への寄与は 0 となり、エラーは発生しない

### Requirement: 代表記事の positiveMood 値と算出根拠
代表記事（10記事程度）は研究ベースの dailyPositiveMoodMinutes（> 0）と `calculationLogic.positiveMood`（CalcStep[]）を持たなければならない（MUST）。値は固定前提（起きている時間16時間・ベースラインの前向き割合50%）から機械的に算出し、健康寿命（dailyHealthMinutes）との二重計上を避けなければならない（MUST）。機械的に算出できず判断が割れる記事は 0（未設定）のまま残す。

#### Scenario: 代表記事の値と算出根拠の設定
- **WHEN** 開発者がユニットテストで代表記事の calculationParams と calculationLogic を検証する
- **THEN** 10記事程度で dailyPositiveMoodMinutes > 0 である
- **THEN** dailyPositiveMoodMinutes > 0 の全記事に calculationLogic.positiveMood（CalcStep[]）が設定されている
- **THEN** CalcStep に固定前提（起床16h・前向き50%）に基づく算出根拠（label / formula / result）が記録されている

#### Scenario: 判断が割れる記事は未設定のまま
- **WHEN** 研究記述から固定前提で機械的に算出できない記事を確認する
- **THEN** その記事の dailyPositiveMoodMinutes は 0（未設定）のままである
- **THEN** calculationLogic.positiveMood は設定されていない

### Requirement: 記事本文プレースホルダーの不変
`renderArticle` の置換プレースホルダー（health_inference / cost_inference / income_inference / cumulative）に positiveMood を追加してはならない（MUST NOT）。`inferences.positiveMood` は計算・将来表示用のデータとして保持するのみとする。

#### Scenario: renderArticle の出力不変
- **WHEN** 開発者が positiveMood 値を設定した代表記事に対して renderArticle を実行する
- **THEN** 出力は従来の4プレースホルダーの置換のみで構成され、positiveMood の段落は挿入されない
- **THEN** 既存記事の renderArticle 出力は変更前と同一である

