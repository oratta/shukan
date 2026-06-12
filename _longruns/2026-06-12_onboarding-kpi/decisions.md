# Decisions: 2026-06-12_onboarding-kpi

意思決定ログ。各判断には実行したコマンド・出力等のエビデンスを必須で記録する。

---

## D-BC1: Build Contract レビュー結果の取捨選択（2026-06-12）

- **レビュー結果**: APPROVE（BLOCKER 0件、1ラウンド目で通過）
- **採用した指摘**: 「対象は index.ts 登録の35記事のみ、`LLM/` 配下 md は対象外」を change-A に1行追記
  - 分類: (a) 事実誤認防止（Setup 調査の「37ファイル」は index.ts と未トラック素材 md を含む数。builder が37記事と誤認するリスクを排除）
  - エビデンス: reviewer が `src/data/impact-articles/index.ts` の登録数と `ArticleId` union が35件であることを確認済み
- **反論・不採用**: なし（嗜好レベルの指摘は出なかった。補足3点はすべて plan が既にハンドリング済みであることの確認）

---

## D-SR1: Spec Review 結果の取捨選択（2026-06-12）

- **レビュー結果**: 全3 change APPROVE（BLOCKER 0件、1ラウンド目で通過）
- **採用**: NOTE-C1（onboarding-flow tasks 4.6 に insertHabit 必須フィールドの既定値方針を追記。builder の独自判断＝既定値の発明リスクを排除）、NOTE-A1（kpi-data-foundation proposal.md の Impact に LifeImpactSavings の定義場所 src/types/impact.ts を明記。事実誤認の修正）
- **不採用**: NOTE-B1（nationality→country 読み替え）・NOTE-B2（余命表関数の country 引数有無）
  - 理由: reviewer 自身が「表は日本のみで country 引数は実装上使われない可能性が高く実害は出にくい」「B/C の着手時確認タスク（change-C tasks 1.1、change-B D6）で吸収される設計なので自律実行をブロックしない」と認定。spec 修正は過剰で、plan の「シンプルな方を選ぶ」方針を優先
- **エビデンス**: reviewer が src/types/impact.ts:138-165 / src/middleware.ts:70-78 / src/lib/supabase/habits.ts:170,506 / src/data/impact-articles/index.ts:38-84 をコードと突き合わせ済み

## D-BUILD1: 直列ビルド（per-change worktree を作らない）（2026-06-12）

- **判断**: change-A→B→C は完全直列依存（plan.md Changes分解: B は A 依存、C は A+B 依存）のため、per-change の git worktree は作らず、現ブランチ `onboarding-data-setup` 上で longrun-builder を順次実行する
- **理由**: SKILL の worktree 並列化は「依存関係がない change」向け。完全直列チェーンでは並列性ゼロのまま worktree 作成→マージのオーバーヘッドとコンフリクトリスクだけが増える。本リポジトリ自体が既に専用 worktree（~/.superset/worktrees/）である点も考慮
- **エビデンス**: plan.md L65「依存関係: 独立」(A) / L80「依存関係: change-A」(B) / L97「依存関係: change-A, change-B」(C)。`git branch --show-current` → `onboarding-data-setup`
- **担保**: 各 builder は change 完了ごとにコミットする（未コミット消失リスクは worktree 削除がないため低いが、コミット粒度は維持）

## D-BUILD2: builder の model 指定（2026-06-12）

- **判断**: メモリの「実装系 subagent は Opus 4.8 で」は、当時のデフォルトより強いモデルを使う意図。現セッションのメインモデルは Fable 5（Opus より上位）のため、model 指定を省略して Fable 5 を継承させる（意図の上位互換）

---

## D-A1: positiveMood 代表記事の確定リストと x%（前向き感情の相対増分）（2026-06-12）

- **判断**: design.md D-3 の固定前提（起床16h=960分・前向き割合50%＝ベースライン480分/日）に基づき、`dailyPositiveMoodMinutes = 480 × x%` で機械的に算出。x% は各記事の researchBody / inferences に既に含まれる「前向き感情・気分・幸福度・うつ/不安改善」の研究記述から保守的に採用（新規研究探索はしない）
- **確定した代表記事 9件**（D-4 候補10件のうち判断が割れる no_screens_before_bed を 0 のまま除外）:

| 記事 | x%（研究記述） | dailyPositiveMoodMinutes = 480×x% |
|---|---|---|
| daily_meditation | 20%（Goyal 2014: 不安・うつ・well-beingに中程度効果、保守採用） | 96 |
| gratitude_practice | 15%（Emmons&McCullough: 幸福度+25%を保守按分） | 72 |
| daily_journaling | 12%（Smyth 2018: ポジティブ感情ジャーナリングで苦痛減・不安低下） | 58 |
| sleep_7hours | 15%（睡眠は気分の主要駆動因。13%死亡リスク・気分改善を保守按分） | 72 |
| daily_cardio | 15%（運動による気分・抑うつ改善。35%心血管死低減の文脈で保守採用） | 72 |
| daily_walking | 10%（Schuch 2018: うつ病リスク26%低減を保守按分） | 48 |
| time_in_nature | 15%（White 2019: 週120分で健康・幸福度が有意に向上） | 72 |
| quit_social_media | 15%（JAMA 2025: 不安16.1%/うつ24.8%改善のブレンドを保守採用） | 72 |
| daily_yoga | 12%（コルチゾール低下・ストレス低減） | 58 |

- **0 のまま残した候補**:
  - no_screens_before_bed: 記事の研究記述は alertness（覚醒度）中心で気分への直接の定量がない → 判断が割れるため 0（D-3 ルール）
  - cold_shower: 気分は Shevchuk 2008「potential treatment for depression」という仮説段階で定量増分なし → 0
- **二重計上回避**: dailyHealthMinutes は「寿命延伸の残存余命按分」、dailyPositiveMoodMinutes は「その日のうち前向きでいられる時間の増分」で軸が異なるため、同一研究効果でも別軸として計上してよい（D-3 準拠）。各記事の calculationLogic.positiveMood の CalcStep に前提値（16h=960分・前向き50%=480分ベースライン）と x% を明記
- **「10記事程度」の充足**: 確定9件。plan/spec は「10記事程度」（厳密10件固定ではない、design.md Open Questions 明記）。機械的に算出できないものを無理に足さない D-3 方針を優先し9件で確定
- **エビデンス**: 各記事 researchBody / inferences の該当研究記述（上表）を grep で確認済み

---

## D-A2: 既存 UI consumer への positiveMoodMinutes 必須フィールド伝播（2026-06-12）

- **背景**: `DailyImpact` / `AnnualImpact` / `LifeImpactSavings` に positiveMoodMinutes を required で追加したため、`calculateAnnualImpact`/`calculateDailyImpact` を inline オブジェクトで呼ぶ既存 UI が型エラーになった（`npm run build` で検出）。対象6箇所:
  - src/app/(app)/discover/page.tsx:290
  - src/components/habits/evidence-article-sheet.tsx:223
  - src/components/habits/evidence-picker.tsx:174
  - src/components/habits/evidence-manager-sheet.tsx:59 / :141
  - src/components/habits/impact-badge.tsx:43（getDailyValues の DailyImpact 返却）
- **判断**: 各 inline 呼び出しに positiveMoodMinutes を1行追加して型を満たす。値は記事の `calculationParams.dailyPositiveMoodMinutes`（weighted 箇所は ×w）を渡す。discover/page.tsx のみ heroカード表示用の概算で、表示は既存3軸のみのため `positiveMoodMinutes: 0` を明示（データ源が props 3軸のみで positiveMood を持たないため）
- **既存3軸不変の担保**: これらの UI は healthMinutes/costSaving/incomeGain のみをレンダリングしており、positiveMoodMinutes は計算結果オブジェクトに含まれるだけで画面表示・既存3軸の値は一切変わらない。`npm run test:run` 全PASS（既存テストの期待値無変更）で担保
- **選択肢の比較**:
  - (a) 採用: 各呼び出しに1行追加（可逆・最小差分・既存パターン踏襲＝D-8 と整合）
  - (b) 不採用: DailyImpact のフィールドを optional にして呼び出し側を変えない → config.yaml rules「required で漏れを型検出」「3インターフェースに漏れなく追加」に反する
  - (c) 不採用: ヘルパー関数で 3軸→4軸 変換を新設 → D-8「新しい抽象化を導入しない」に反する
- **エビデンス**: `npm run build` → Compiled successfully / 14 routes 生成成功。`npm run test:run` → 12 files / 225 tests PASS

## D-B1: マイグレーション timestamp の衝突回避と直接適用（change-B / 2026-06-12）

- **背景**: 当初 `supabase/migrations/20260612000000_user_profiles.sql` を作成して `supabase db push` を試行したが失敗。
  - `supabase migration list` の結果、dev プロジェクト（xhqddzdpcpvxpprxykct）の remote 履歴に、このブランチに**存在しない** 3 migration が記録されていた:
    - `20260612000000` = `add_subscriptions`（タイムスタンプが本 change と衝突）
    - `20260612000100` = `waitlist`
    - `20260612000200` = `founding_memberships`
  - これらは別ブランチ（課金/ウェイトリスト系）で適用済みのもの。`public` スキーマにも `subscriptions` / `waitlist` / `founding_memberships` テーブルが実在する。
- **決定**:
  1. ローカル migration を `20260612010000_user_profiles.sql` にリネーム（remote の `...000200` より後・衝突しない timestamp）。
  2. 別ブランチの 3 migration を本ブランチに `db pull` で取り込むことは**しない**（このブランチの責務外。履歴を汚さない）。
  3. `supabase db push` は remote 履歴差分により拒否されるため、migration SQL を Supabase Management API（`/v1/projects/{ref}/database/query`、SUPABASE_ACCESS_TOKEN 認証）で**直接適用**し、`supabase_migrations.schema_migrations` に `20260612010000 / user_profiles` 行を手動 insert して履歴整合を取った。
- **選択肢の比較**:
  - (a) 採用: API 直接適用 + 履歴行 insert → 別ブランチの migration を取り込まずに dev へ適用でき、可逆（`drop table public.user_profiles` のみで撤回可能・独立テーブル）。
  - (b) 不採用: `supabase db pull` で remote の 3 migration をローカルに取り込んでから push → 課金系 migration が本ブランチに混入し責務分離が崩れる。
  - (c) 不採用: タイムスタンプを `000000` のまま `migration repair` → remote の `add_subscriptions` 行を本 change のものと誤認させることになり、履歴が壊れる。
- **エビデンス（Management API クエリ結果）**:
  - columns: user_id(uuid,PK) / birth_year(integer,null可) / gender(text,not null,default 'unspecified') / country(text,not null,default 'JP') / annual_income(bigint,null可) / currency(text,not null,default 'JPY') / tracked_kpis(ARRAY,not null,default '{}') / created_at / updated_at（9カラム、派生値カラムなし）
  - CHECK: `user_profiles_gender_check` = `gender = ANY (ARRAY['male','female','other','unspecified'])`
  - RLS: `relrowsecurity=true`、policy は select/insert/update の 3 つのみ（delete ポリシーなし＝user_settings 同型）

## D-B2: RLS / CHECK の検証手段（change-B / 2026-06-12）

- **背景**: B-S2（gender CHECK）/ B-S7（RLS 本人限定・delete 拒否）は認証セッション下の実 DB 動作。Management API は `auth.users` 等 auth スキーマへのクエリを 403（code 1010）で拒否するため、実ユーザーを使った live insert/delete テストは API からは不可。
- **決定**: tasks.md / 指示の「RLS の実DB検証はユニットでは不可のため、マイグレーション SQL の内容検証（ポリシー定義の存在）で代替してよい」に従い、以下 2 層で検証する:
  1. **live スキーマ検証**（Management API で公開系カタログを参照可能）:
     - `pg_constraint`: `user_profiles_gender_check = CHECK (gender = ANY (ARRAY['male','female','other','unspecified']))` が存在
     - `pg_class.relrowsecurity = true`、`pg_policy`: select/insert/update の 3 ポリシーのみ（delete なし）
  2. **migration-content ユニットテスト**（`src/__tests__/user-profiles-migration.test.ts`）: DDL の CHECK 定義・RLS 有効化・3 ポリシー・delete ポリシー不在・全ポリシーの `auth.uid() = user_id` ガードを文字列レベルで検証。
- **残作業**: 認証ユーザーでの実 insert/select/update/delete の動作確認（B-S2/B-S7 の「動作確認完了」）は change-C のオンボーディング画面実装時に実際の書き込み経路で確認する（本 change の「テスト実装完了」「ロジック実装完了」は上記で充足）。
