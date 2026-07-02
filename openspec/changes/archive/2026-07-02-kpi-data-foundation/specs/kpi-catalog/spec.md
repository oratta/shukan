# kpi-catalog 仕様（kpi-data-foundation）

## ADDED Requirements

### Requirement: KPI定義カタログ
システムは静的カタログ（`src/data/kpi/catalog.ts`）でKPI定義4件を提供しなければならない（MUST）。キーは health_lifespan / positive_mood / cost_saving / earning とし、各定義は確定文言（docs/context/onboarding-screens.md）の見出し（なりたい自分の言葉）・KPI名・単位・説明文を持つ。文言は確定文言から一字一句変えてはならない（MUST NOT）。

#### Scenario: 4件のKPI定義の取得
- **WHEN** 開発者がカタログを import してユニットテストで全定義を検証する
- **THEN** 4件のKPI定義が取得でき、以下の確定文言と一致する:
- **THEN** health_lifespan = KPI名「健康寿命」・単位「分」・見出し「長く健康でいられる自分へ」
- **THEN** positive_mood = KPI名「前向きな気持ちの時間」・単位「分」・見出し「前向きな気持ちで過ごせる自分へ」
- **THEN** cost_saving = KPI名「出費削減」・単位「円」・見出し「お金で諦めない自分へ」
- **THEN** earning = KPI名「稼ぐ能力」・単位「円」・見出し「稼ぐ力のある自分へ」

#### Scenario: キーによる引き当て
- **WHEN** 開発者がキー指定の取得関数を 'positive_mood' で呼ぶ
- **THEN** 対応するKPI定義が返る
- **THEN** 未知のキーでは undefined が返り、エラーは発生しない

### Requirement: 習慣プリセットカタログ
システムは `src/data/habit-presets.ts` で、既存35記事を束ねた習慣プリセットを提供しなければならない（MUST）。各プリセットは id・名前・defaultHabitType・アイコン・1つ以上の articleIds（登録済み ArticleId）・primaryKpis（KPIカタログのキー）を持ち、4KPIのそれぞれについて primaryKpis にそのKPIを含むプリセットが3〜5個存在しなければならない（MUST）。

#### Scenario: 各KPIに3〜5個のプリセット
- **WHEN** 開発者がユニットテストで各KPIキーを primaryKpis に含むプリセットを抽出する
- **THEN** 4KPIすべてについて3〜5個のプリセットが返る

#### Scenario: articleId の妥当性
- **WHEN** 開発者がユニットテストで全プリセットの articleIds を isValidArticleId で検証する
- **THEN** 全件が `src/data/impact-articles/index.ts` に登録済みの35記事のIDであり、空配列のプリセットは存在しない

#### Scenario: primaryKpis の妥当性
- **WHEN** 開発者がユニットテストで全プリセットの primaryKpis を検証する
- **THEN** 全件がKPIカタログの4キーのいずれかであり、空配列のプリセットは存在しない

### Requirement: 平均余命表
システムは `src/data/life-expectancy.ts` で日本の平均余命表（残りの平均年数）を提供しなければならない（MUST）。粒度は5歳刻み×性別とし、年齢と性別から平均余命（年）を引き当てる関数を提供する。

#### Scenario: 年齢×性別の引き当て
- **WHEN** 開発者がユニットテストで引き当て関数を（42, 'male'）で呼ぶ
- **THEN** 40〜44歳ブラケット×男性に対応する平均余命（年）が返る

#### Scenario: 範囲外・性別未指定のフォールバック
- **WHEN** 表の範囲外の年齢、または gender が 'other' / 'unspecified' で引き当て関数を呼ぶ
- **THEN** エラーにならず、定義済みのフォールバック（年齢は最近傍ブラケット、性別は男女の平均値）で値が返る

#### Scenario: 出典の明記
- **WHEN** 開発者がデータファイルを確認する
- **THEN** 統計の出典（政府統計等）と参照年がコメントに明記されている

### Requirement: 平均年収表
システムは `src/data/average-income.ts` で日本の平均年収表（円）を提供しなければならない（MUST）。粒度は5歳刻み×性別とし、年齢と性別から平均年収を引き当てる関数を提供する。収入未入力ユーザーの計算フォールバック（change-B で使用）の元データとなる。

#### Scenario: 年齢×性別の引き当て
- **WHEN** 開発者がユニットテストで引き当て関数を（42, 'male'）で呼ぶ
- **THEN** 40〜44歳ブラケット×男性に対応する平均年収（円）が返る

#### Scenario: 範囲外・性別未指定のフォールバック
- **WHEN** 表の範囲外の年齢、または gender が 'other' / 'unspecified' で引き当て関数を呼ぶ
- **THEN** エラーにならず、定義済みのフォールバック（年齢は最近傍ブラケット、性別は男女の平均値）で値が返る

#### Scenario: 出典の明記
- **WHEN** 開発者がデータファイルを確認する
- **THEN** 統計の出典（政府統計等）と参照年がコメントに明記されている
