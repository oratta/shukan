# Design: kpi-data-foundation

## Context

オンボーディング再設計（plan: `_longruns/2026-06-12_onboarding-kpi/plan.md`）の change-A。確定ドキュメントは
`docs/context/onboarding-data-model.md`（データモデル）と `docs/context/onboarding-screens.md`（文言）。

現状:
- `src/types/impact.ts` の `LifeImpactArticle` は3軸（dailyHealthMinutes / dailyCostSaving / dailyIncomeGain）固定
- `src/lib/impact.ts` の5関数（calculateDailyImpact / calculateAnnualImpact / calculateImpactSavings / calculateMultiEvidenceImpact / calculateTotalSavings）も3軸固定
- 記事は `src/data/impact-articles/` に35ファイル＋`index.ts` 登録（D2/D10: 静的フロントエンド管理）
- KPIカタログ・習慣プリセット・平均余命表・平均年収表は存在しない

制約:
- 既存3軸の値・計算結果を一切変えない
- 造語禁止。4つは「KPI」とだけ呼ぶ（コード識別子は kpi / catalog 等の英語でよい）
- 記事本文の表示プレースホルダー（renderArticle の replacements）には positiveMood を追加しない
- `src/data/impact-articles/LLM/` 配下の md はビルド対象外の素材で対象外

## Goals / Non-Goals

### Goals
- ImpactArticle 型と累積計算を4KPI化し、全35記事が型チェックを通る状態にする（受け入れ条件 11/13）
- 代表記事10記事程度に研究ベースの positiveMood 値と算出根拠を設定する（受け入れ条件 12）
- change-B/C が参照する静的カタログ（KPI定義4件・習慣プリセット・平均余命表・平均年収表）を提供する

### Non-Goals
- user_profiles テーブル・プロフィール派生値計算（change-B）
- オンボーディング画面・UI表示への組み込み（change-C）
- 残り約25記事への positiveMood 値入れ（backlog・別run）
- Desire束カタログ `desire-bundles.ts`（D12 折衷案により今回は作らない）
- 平均余命・平均年収の日本以外の国対応（5歳刻み・日本のみで開始）

## Decisions

### D-1: 型の required / optional の振り分け
- `calculationParams.dailyPositiveMoodMinutes`: **required（number）**。全35記事に明示的な値（未設定は 0）を強制し、追加漏れを型エラーで検出する
- `inferences.positiveMood`: **optional（string）**。renderArticle で使用しないため、未設定記事に空文字を強制しない。代表記事のみ設定
- `calculationLogic.positiveMood`: **optional（CalcStep[]）**。calculationLogic を持つ既存記事すべてへの追記を強制しない。dailyPositiveMoodMinutes > 0 の記事のみ設定（specで担保）
- `LifeImpactSavings.positiveMoodMinutes` / `DailyImpact.positiveMoodMinutes` / `AnnualImpact.positiveMoodMinutes`: **required**。計算結果には常に含める（0 でも返す）

代替案: inferences.positiveMood も required にして全記事に空文字を入れる → 「未設定」と「空」の区別が曖昧になり、35ファイルに意味のない行が増えるため不採用。

### D-2: 0 = 未設定 のセマンティクス
dailyPositiveMoodMinutes: 0 は「未設定」を意味する（plan の config.yaml rules）。計算上は単に 0 加算で、UI側（change-C 以降）は 0 のとき positiveMood 表示を出さない判定に使える。「未設定」を表す別フィールドやnullは導入しない（YAGNI・既存3軸に前例なし）。

### D-3: positiveMood 値の算出方法（固定前提・機械的算出）
data-model.md §6 の固定前提を定数として使う:
- 起きている時間: 16時間 = 960分/日
- 何もしないときの前向き割合: 50%（= ベースライン 480分/日）

算出パターン: 研究が示す前向き感情（positive affect / mood / well-being）の相対的増分 x% を、ベースラインに対して
`dailyPositiveMoodMinutes = 960分 × 50% × x%` のように分へ機械的に換算する。研究値の新規探索や妥当性議論はしない。
既存記事の Research basis コメント・researchBody に気分・幸福感・ストレス低減の研究記述がある記事のみ対象。

二重計上の回避: dailyHealthMinutes は「寿命延伸の残存余命按分」、dailyPositiveMoodMinutes は「その日のうち前向きでいられる時間の増分」で軸が異なる。同一の研究効果（例: 寿命延伸）を両軸に計上しない。算出根拠は `calculationLogic.positiveMood` の CalcStep（label / value / formula / result）に明記する。

### D-4: 代表記事の候補（10記事程度）
気分・幸福感への効果が研究記述に含まれる以下を候補とする（実装時に researchBody / Research basis から機械的算出できることを確認し、判断が割れるものは 0 のまま残して候補から外す）:
daily_meditation / gratitude_practice / daily_journaling / sleep_7hours / daily_cardio / daily_walking / time_in_nature / quit_social_media / no_screens_before_bed / daily_yoga

選定基準は「前向きな気持ちに関する研究記述が既に記事内にあること」のみ。新規の研究探索はしない（life-impact-article スキルの方法論は CalcStep の書式参照に使う）。

### D-5: カタログの配置と型
既存規約（D2/D10）に従い静的カタログは `src/data` に置く（DB化はユーザー横断集計が必要になった時に再検討）。

- `src/data/kpi/catalog.ts`: `KpiKey = 'health_lifespan' | 'positive_mood' | 'cost_saving' | 'earning'` の union と
  `KpiDefinition { key; name; unit; kind; headline; description; icon }` を定義。`headline` は確定文言の見出し
  （なりたい自分の言葉）、`name` はKPI名、`description` は説明文（いずれも onboarding-screens.md から一字一句変えない）。
  `kind` は data-model.md §2.1 の time_quantity / time_quality / money_out / money_in
- 引き当ては `getKpi(key)`（未知キーは undefined。既存 `getArticle` と同じ流儀）

### D-6: 習慣プリセットの構造とKPI割当
data-model.md §2.3 の形を踏襲: `HabitPreset { id; name; defaultHabitType; icon; articleIds: ArticleId[]; primaryKpis: KpiKey[] }`。
- 既存35記事から束ねる（新記事は作らない）。1プリセット = 1〜複数記事（エビデンス束）
- 各KPIについて primaryKpis にそのKPIを含むプリセットが3〜5個になるよう構成（プリセットは複数KPIに所属可）
- 記事の calculationParams の値分布（health/cost/income が大きい記事）と D-4 の positiveMood 設定記事を手がかりに割り当てる
- プリセット採用時の habits + habit_evidences への書き込みは change-C（既存 Discover 機構の流用）。この change はデータ定義のみ

### D-7: 統計表の形
`src/data/life-expectancy.ts` / `src/data/average-income.ts` とも:
- 日本のみ・5歳刻みブラケット（例: 20-24, 25-29, …）× 性別（male / female）のテーブル＋引き当て関数
- gender 'other' / 'unspecified' は男女平均、範囲外年齢は最近傍ブラケットにフォールバック（エラーにしない。プロフィール入力を計算不能にしないため）
- 国別対応は将来拡張。今はファイル内を日本データのみとし、関数シグネチャに country は持たない（YAGNI。user_profiles.country の利用は change-B の責務）
- 出典（厚生労働省 簡易生命表 / 賃金構造基本統計調査 等の政府統計）と参照年をコメントに明記

### D-8: 累積計算の拡張パターン
既存3軸と同じ展開パターンに1行ずつ足す（config.yaml rules）。対象は `DailyImpact` / `AnnualImpact` / `LifeImpactSavings` の3インターフェースと、5関数内の初期値オブジェクト・加算・reduce すべて。新しい抽象化（軸の配列化等）は導入しない — 既存値を変えないことの確認が diff で自明になる方を優先。

### D-9: テスト戦略
- 既存テスト（`src/__tests__/impact.test.ts` / `calculation-logic.test.ts`）の既存期待値は一切変更しない。positiveMood のケースを追加する
- カタログ・統計表は新規テストファイル（例: `src/__tests__/kpi-catalog.test.ts`）で、確定文言の一致・各KPI 3〜5プリセット・articleId/KpiKey の妥当性・引き当てとフォールバックを検証する

## Risks / Trade-offs

- [二重計上のリスク: 健康寿命と前向きな気持ちの時間に同じ研究効果を計上してしまう] → D-3 の軸の定義（寿命延伸 vs その日の気分時間）を CalcStep に明記し、判断が割れる記事は 0 のまま残す
- [35ファイル一括編集での記入漏れ・誤記] → dailyPositiveMoodMinutes を required にして型チェックで漏れを検出。既存値には触れない機械的な1行追加に限定
- [プリセットのKPI割当が3〜5個に収まらない偏り] → プリセットは複数KPI所属可とし、35記事の calculationParams 分布から束ね直す余地を残す。ユニットテストで3〜5個を固定的に検証
- [統計表の値の精度] → オンボーディングの概算計算用であり医学的・統計的厳密さは不要。出典・参照年をコメントに残し、差し替え可能にする
- [固定前提（16h/50%）が将来変わる] → 定数として1箇所に置き、記事の CalcStep には前提値を明記して追跡可能にする

## Migration Plan

- DBマイグレーションなし（静的データ・型・純粋関数のみ）
- デプロイ順序の制約なし。UI には未接続のため、リリースしてもユーザーから見える変化はない
- ロールバックは git revert のみで完結

## Open Questions

- 代表記事の最終リスト（D-4 の候補10件のうち、機械的算出できず 0 に残るものが出る可能性）→ 実装時に確定。「10記事程度」であり厳密な10件固定ではない（plan 準拠）
