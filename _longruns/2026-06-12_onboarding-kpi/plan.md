# Plan: オンボーディング再設計の実装（γ）— KPI選択＋データ投入

## 生成情報
- 作成日: 2026-06-12
- Brain Dump元: docs/context/onboarding-RESUME.md ほか設計ドキュメント4点＋セッション内対話
- 質問回数: 4問（文言決定2問を除く実装スコープ質問）

## ゴール
オンボーディング4画面（[1]KPIを1つ選ぶ → [2]プロフィール → [3]習慣のおすすめ → [4]完了）を実装し、
完了時点で user_profiles（プロフィール＋選んだKPI）・habits・habit_evidences にユーザーのデータが
入っている状態にする。

## ビジネスコンテキスト
- 対象ユーザー: Smitch の新規ユーザー（外部リリースに向けた最初の体験）。プロフィール未作成の既存ユーザーも対象
- 提供価値: 「何を良くしたいか」を1つ選ぶだけで、エビデンスに基づく習慣と定量KPIのトラッキングが始まる
- 成功指標: オンボーディング完了時に user_profiles 1行＋habits 1行以上＋habit_evidences が書き込まれている

## 技術要件
- スタック: Next.js 16.1.6 (App Router) / React 19 / TypeScript 5 / Tailwind CSS 4 / shadcn / next-intl (ja・en) / Supabase (auth + DB + RLS)
- 参照パターン:
  - DBアクセス: `src/lib/supabase/habits.ts`（snake_case↔camelCase マッピング）
  - 認証リダイレクト: `src/middleware.ts`
  - 静的データ: `src/data/impact-articles/`（D2/D10 の静的フロントエンド管理）
  - 既存テーブル設計: `user_settings`（user_id 主キー 1:1、RLS 自分のみ）
- 制約:
  - **造語禁止。あの4つは「KPI」とだけ呼ぶ**（コード識別子は kpi / catalog 等の英語でよいが、UI文言・コメント・ドキュメントで新しいラベルを発明しない）
  - 画面文言は `docs/context/onboarding-screens.md`（確定済み）から一字一句変えない。en はそこから翻訳
  - データモデルは `docs/context/onboarding-data-model.md`（確定済み）に従う。新規DBテーブルは user_profiles 1つだけ
  - 既存テーブル（habits / habit_evidences / habit_completions / daily_reflections）は変更しない
  - マイグレーション作成後は `supabase db push` まで実行する（dev プロジェクト）
- テストフレームワーク: Vitest（ユニット）+ Playwright（E2E、ブラウザ検証は longrun-browser-verifier）
- テスト実行コマンド: `npm run test:run`

## スコープ
### 含むもの
- `user_profiles` テーブルのマイグレーション＋RLS＋CRUD ライブラリ
- 静的カタログ: KPI定義4件 / 習慣プリセット / 平均余命表・平均年収表（日本のみ・5歳刻みで開始）
- 記事の型拡張（T17）: `dailyPositiveMoodMinutes` ほか positiveMood 系フィールド追加、累積計算への反映
- 代表記事（10記事程度）への「前向きな気持ちの時間」の研究ベース値の設定（残りは0＝未設定扱い）
- オンボーディング4画面の実装（確定文言、ja/en）
- 誘導: ログイン済みかつ user_profiles 未作成の全ユーザーを /onboarding にリダイレクト。スキップ不可。作成済みユーザーが /onboarding を開いたらホームへ
- impact-calculation spec の更新（T11: 3指標固定 → 4KPI）
- オンボーディングのデザイントーンを「今後のアプリ全体UI刷新の基準」になる品質で作る

### 含まないもの
- ホーム画面の改修（理由: スコープ超過。「アプリ全体UIをオンボーディングのデザイントーンに合わせて再構築」として backlog に記録し次run以降で対応。選んだKPIのホーム表示もそこに含む）
- 残り記事（約25記事）への positiveMood 値入れ（理由: 記事執筆級の作業量。backlog に記録し別run）
- なりたい自分（Desire束）の独立画面（理由: D12 で折衷案に確定。カード見出しコピーとして実装するのみ。`desire-bundles.ts` カタログも今回は作らない）
- user_settings の localStorage 移行、管理画面、KPIの後から変更UI（設定画面への追加は別run。DB上は tracked_kpis 更新で対応可能な構造にする）
- docs/context 配下のドキュメント矛盾修正 T1〜T10, T13, T18（理由: git管理外の Obsidian 文書。plan 外で対応）

## Changes分解

### change-A: kpi-data-foundation
- **スコープ**: 記事の型拡張（T17）＋静的カタログ＋累積計算の4KPI化。
  - `src/types/impact.ts`: `calculationParams.dailyPositiveMoodMinutes` / `inferences.positiveMood` / `calculationLogic.positiveMood` / `LifeImpactSavings.positiveMoodMinutes` を追加
  - 全35記事を新しい型に適合させる（未設定記事は dailyPositiveMoodMinutes: 0）
  - 代表記事10記事程度に研究ベースの値と計算ロジックを設定（出発点の前提: 起きている時間16h／前向き割合50%、二重計上回避）
  - `src/data/kpi/catalog.ts`: KPI定義4件（health_lifespan / positive_mood / cost_saving / earning。確定文言の「なりたい自分」コピー含む）
  - `src/data/habit-presets.ts`: 既存35記事から束ねた習慣プリセット（各KPIに3〜5個）
  - `src/data/life-expectancy.ts` / `src/data/average-income.ts`: 平均余命表・平均年収表（日本・5歳刻み）
  - 累積計算: `src/lib/impact.ts` の5関数すべて（`calculateDailyImpact` / `calculateAnnualImpact` / `calculateImpactSavings` / `calculateMultiEvidenceImpact` / `calculateTotalSavings`）に positiveMoodMinutes を追加。`DailyImpact` / `AnnualImpact` インターフェースにもフィールド追加。既存テスト（`src/__tests__/impact.test.ts`, `calculation-logic.test.ts`）に positiveMood ケースを追加
  - openspec/specs/impact-calculation の MODIFIED requirement（T11）
- **使用スキル**: life-impact-article（代表記事の値設定の方法論参照）
- **依存関係**: 独立
- **config.yaml rules**:
  - "値が未設定（0）の記事では positiveMood をUI非表示にできるよう、0 を『未設定』として扱う"
  - "既存3軸（health/cost/income）の既存値・計算結果を一切変えない"
  - "`src/lib/impact.ts` の `DailyImpact`・`AnnualImpact`・`LifeImpactSavings` の3インターフェースと、それらを構築する全関数の初期値オブジェクト・reduce に positiveMoodMinutes を漏れなく追加する（既存3軸と同じ展開パターンに1行ずつ足す）"
  - "positiveMood の値は data-model.md §6 の固定前提（起床16h・前向き50%・二重計上回避）から機械的に算出し、研究値の新規探索や妥当性議論はしない。算出根拠を `calculationLogic.positiveMood` の CalcStep に明記し、判断が割れる記事は 0（未設定）のまま残す"
  - "記事本文の表示プレースホルダー（`renderArticle` の replacements）には今回 positiveMood を追加しない。`inferences.positiveMood` は計算・将来表示用のデータとして持つのみ"

### change-B: user-profiles-db
- **スコープ**: user_profiles テーブルと周辺ロジック。
  - マイグレーション: onboarding-data-model.md §1.1 の DDL（user_id PK / birth_year / gender / country / annual_income / currency / tracked_kpis text[] / created_at / updated_at）＋RLS（自分のみ select/insert/update）
  - `supabase db push` で dev に適用
  - `src/lib/supabase/profiles.ts`: CRUD（habits.ts と同じ snake↔camel マッピング流儀）
  - `src/lib/profile.ts`: 派生値計算（age / remainingLifeExpectancy / dailyWage / remainingWorkingYears、収入未入力時の平均年収フォールバック）。`V2_DEFAULT_PROFILE` は未設定時フォールバックとして残す
- **使用スキル**: supabase-postgres-best-practices
- **依存関係**: change-A（平均余命表・平均年収表を参照）
- **config.yaml rules**:
  - "派生値（年齢・残存余命・日給）はDBに保存しない。入力だけ保存し計算で出す"
  - "RLSは既存 user_settings と同型にする"

### change-C: onboarding-flow
- **スコープ**: オンボーディング4画面と誘導。
  - `/onboarding` ルート（`(app)` グループ外。Header/BottomNav なし、/login と同様の独立レイアウト）
  - [1] KPI選択: 4枚のカード（見出し=なりたい自分コピー、説明=KPI名＋単位）から1つ選択
  - [2] プロフィール: 年齢・性別・国（必須、デフォルト日本）＋年収（任意、未入力時の平均年収注記）
  - [3] 習慣のおすすめ: 選んだKPIのプリセットから1つ以上選択
  - [4] 完了: 選んだKPI（現在値0）＋習慣リスト表示 → ホームへ
  - 完了時の書き込み: upsert user_profiles（tracked_kpis 含む）→ insert habits ＋ habit_evidences（既存機構流用）
  - 誘導: ログイン済み＋user_profiles なし → /onboarding 強制。user_profiles あり＋/onboarding アクセス → ホームへ（実装場所は config.yaml rules で `(app)/layout.tsx` に一本化）
  - i18n: ja は確定文言、en は翻訳して messages に追加
  - デザイントーン: 今後の全体UI刷新の基準になる新しい雰囲気として設計（既存テーマのCSS変数体系は流用）
- **使用スキル**: frontend-design, react-best-practices, web-design-guidelines
- **依存関係**: change-A, change-B
- **config.yaml rules**:
  - "画面文言は docs/context/onboarding-screens.md から変えない（ja）"
  - "途中離脱したユーザーは次回ログイン時に最初からやり直し（途中状態の永続化はしない）"
  - "書き込みは[4]完了時に一括（途中画面ではDBに書かない）"
  - "user_profiles 有無の判定は `src/app/(app)/layout.tsx`（サーバーコンポーネント）で行い、未作成なら `redirect('/onboarding')`。`/onboarding` ルートのレイアウトで作成済みなら `redirect('/')`。middleware は auth リダイレクトのみ担当し変更しない（Edge でのDB select と二重判定を避ける）"

## 画面・UI設計
確定文言・画面構成は `docs/context/onboarding-screens.md`（2026-06-12 確定）を正とする。

- 全4画面、上部にステッププログレス表示
- [1] タイトル「どんな自分に切り替えますか？」＋KPIカード4枚（単一選択）
- [2] タイトル「あなたの数字で計算します」＋フォーム4項目
- [3] タイトル「『（なりたい自分コピー）』に効く習慣」＋プリセットカード（複数選択可・1つ以上）
- [4] タイトル「準備ができました」＋選んだKPI（現在値0）と習慣リスト → 「はじめる」
- デザイントーンは外部リリース基準。このトーンが今後のアプリ全体UI刷新の基準になる

## データモデル
`docs/context/onboarding-data-model.md`（確定）を正とする。要点:

- 新規DB: `user_profiles` 1テーブルのみ（user_id PK、tracked_kpis text[] に選んだKPIキーを選択順で保存）
- 静的カタログ（src/data）: KPI定義4件 / 習慣プリセット / 平均余命表 / 平均年収表
- 既存流用: habits / habit_evidences / habit_completions / daily_reflections（変更なし）
- 記事の型: calculationParams に dailyPositiveMoodMinutes 追加（K4）。LifeImpactSavings に positiveMoodMinutes 追加
- 書き込みマップ: [1]KPI選択→tracked_kpis / [2]プロフィール→user_profiles / [3]習慣→habits＋habit_evidences / [4]完了→書き込み実行＋ホームへ
- ※画面順は onboarding-screens.md（D13確定）の [1]KPI→[2]プロフィール が正。data-model.md §5 の書き込みマップは旧順序（プロフィール先）の番号で書かれているため、画面番号は読み替える（書き込み内容自体は同じ）

## 受け入れ条件

**必須条件（常に含める）:**
1. [ ] 全changeのOpenSpec仕様が作成・レビュー済み
2. [ ] 全changeのテストが作成され全てPASSしている
3. [ ] ビルドエラーなし（型チェック + ビルド）
4. [ ] 統合テストがPASS（worktreeマージ後）

**機能固有の条件:**
5. [ ] ログイン済みで user_profiles 未作成のユーザーが保護ページにアクセスすると /onboarding にリダイレクトされる
6. [ ] user_profiles 作成済みのユーザーが /onboarding にアクセスするとホームにリダイレクトされる
7. [ ] [1]で4枚のKPIカードが確定文言（見出し・KPI名・説明文）で表示され、1つ選択すると次へ進める（複数選択不可）
8. [ ] [2]で年齢・性別・国が必須、年収が任意。年収未入力でも次へ進め、「未入力の場合は、年齢・性別・国の平均年収を使って計算します」の注記が表示される
9. [ ] [3]で選んだKPIに対応する習慣プリセットのみが表示され、1つ以上選択すると「この習慣ではじめる」が有効になる
10. [ ] [4]の「はじめる」押下で user_profiles 1行（tracked_kpis=選んだKPIキー）・habits（選んだプリセット分）・habit_evidences（プリセットの articleIds 分）が書き込まれ、ホームへ遷移する
11. [ ] ImpactArticle 型に dailyPositiveMoodMinutes が追加され、全35記事が型チェックを通る（未設定記事は 0）
12. [ ] 代表記事（10記事程度）に研究ベースの dailyPositiveMoodMinutes と calculationLogic.positiveMood が設定されている
13. [ ] 累積計算結果（LifeImpactSavings）に positiveMoodMinutes が含まれ、完了日数に応じて加算される
14. [ ] ja / en 両ロケールでオンボーディング全画面の文言が表示される（en は ja からの翻訳）
15. [ ] 収入未入力のプロフィールで日給計算が平均年収表の値で行われる（ユニットテスト）

## 意思決定ガイドライン
- 優先順位: 確定ドキュメントへの忠実さ > シンプルさ > 拡張性 > パフォーマンス
- リスク許容度: 保守的（既存の habits 機構・既存3軸の計算を壊さない）
- 不明点の扱い: 確定ドキュメント（onboarding-screens.md / onboarding-data-model.md）に戻る。書いていなければシンプルな方を選ぶ
- 文言・命名で迷ったら: 造語を作らず、確定文言またはユーザーの言葉をそのまま使う

## 動作確認方法
- 開発サーバー: `npm run dev`（ポート3000。使用中なら dev-server ルールに従い空きポート）→ http://localhost:3000
- テスト: `npm run test:run`（Vitest）、型チェック＋ビルド: `npm run build`
- 確認手順:
  1. 新規 Google アカウント（または user_profiles を削除したテストユーザー）でログイン
  2. ホームにアクセスすると /onboarding にリダイレクトされることを確認
  3. [1]でKPIカード4枚の文言を確認し「お金で諦めない自分へ」を選択 → 次へ
  4. [2]で年齢・性別・国のみ入力（年収は空欄のまま）→ 平均年収の注記を確認 → 次へ
  5. [3]で出費削減向けプリセットが表示されることを確認し1つ選択 → この習慣ではじめる
  6. [4]で選んだKPI（現在値0）と習慣を確認 → はじめる → ホームへ遷移
  7. Supabase dev の user_profiles / habits / habit_evidences にデータが入っていることを確認
  8. 再度 /onboarding にアクセスするとホームへ戻されることを確認

## Brain Dumpからの原文メモ
> コンセプトを変えてリリースに到達する。オンボーディングを起点にUI/UXを再構築し、オンボーディング完了時にユーザーのデータが入っている状態にする。
> （ホーム改修について）今回のオンボーディングの中で、アプリUI/UXの雰囲気自体も新しいものとして作っちゃって、後々オンボーディングの雰囲気とかに合わせて全体を修正するみたいなタスクをやるはず。外部へリリースするにあたってオンボーディングを整理して、もっとわかりやすく整理されたUIに調整する。→ バックログに記録すること
