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
`src/data/impact-articles/index.ts` に登録された全記事は `calculationParams.dailyPositiveMoodMinutes`（number）を持たなければならない（MUST）。値 0 は「未設定」を意味し、UI側で positiveMood を非表示にできる状態として扱う（計算上の後方互換。現行コーパスは全記事 > 0）。

#### Scenario: 全記事の型適合
- **WHEN** 開発者が型チェック＋ビルド（`npm run build`）を実行する
- **THEN** 全記事が dailyPositiveMoodMinutes を持ち、型エラーなしで成功する

#### Scenario: 0 を未設定として扱う
- **WHEN** dailyPositiveMoodMinutes が 0 の記事を含むエビデンスでデイリーインパクトを計算する
- **THEN** その記事の positiveMoodMinutes への寄与は 0 となり、エラーは発生しない

### Requirement: 全記事の positiveMood 値と算出根拠
登録された全記事は研究ベースの dailyPositiveMoodMinutes（> 0）・`inferences.positiveMood`（推論段落）・`calculationLogic.positiveMood`（CalcStep[]）を持たなければならない（MUST）。値は固定前提（起きている時間16時間・ベースラインの前向き割合50% = 480分/日）に対する相対増分 x% から機械的に算出し、健康寿命（dailyHealthMinutes）との二重計上を避けなければならない（MUST）。x% の根拠は前向き感情（positive affect / mood / well-being）に関する実在の研究であり、出典（sources）に対応する文献を含めなければならない（MUST）。

#### Scenario: 全記事の値と算出根拠の設定
- **WHEN** 開発者がユニットテストで全記事の calculationParams と calculationLogic を検証する
- **THEN** 全記事で dailyPositiveMoodMinutes > 0 かつ 480 以下の整数である
- **THEN** 全記事に calculationLogic.positiveMood（CalcStep[]）と inferences.positiveMood が設定されている
- **THEN** CalcStep に固定前提（起床16h・前向き50%）に基づく算出根拠（label / formula / result）が記録されている

#### Scenario: 二重計上の回避
- **WHEN** 開発者が記事の health と positiveMood の算出根拠を確認する
- **THEN** dailyHealthMinutes は「寿命延伸の残存余命按分」、dailyPositiveMoodMinutes は「その日のうち前向きでいられる時間の増分」であり、同一の研究効果が両軸に計上されていない

### Requirement: 記事本文の positiveMood 推論段落
`renderArticle` は置換プレースホルダーとして health_inference / cost_inference / income_inference / positive_mood_inference / cumulative の5つを扱わなければならない（MUST）。`{{positive_mood_inference}}` は `inferences.positiveMood` で置換する。inferences.positiveMood が未設定の記事ではプレースホルダーを置換せずそのまま残す（未知キーと同じ挙動）ことで、設定漏れに気付ける状態とする。

#### Scenario: renderArticle の positiveMood 段落挿入
- **WHEN** 開発者が inferences.positiveMood を設定した記事に対して renderArticle を実行する
- **THEN** 出力の `{{positive_mood_inference}}` 位置に positiveMood の推論段落が挿入される
- **THEN** 既存4プレースホルダーの置換動作は変わらない

#### Scenario: 未設定記事ではプレースホルダーが残る
- **WHEN** inferences.positiveMood 未設定の記事（テスト用フィクスチャ等）に `{{positive_mood_inference}}` を含む researchBody で renderArticle を実行する
- **THEN** プレースホルダーは置換されずそのまま残る

