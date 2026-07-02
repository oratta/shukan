# Plan: オンボーディング v2「一生インパクト診断」

## 生成情報
- 作成日: 2026-06-27
- Brain Dump元: `docs/context/onboarding-screens-v2.md`（確定版）＋ `docs/context/onboarding-v2-diagnosis-design.md`（承認済み上位設計）
- 質問回数: 4問（[1]画面分割 / [3]結果の見せ方 / 習慣2分類スコープ / 過去累積の推定方法）

## ゴール
v1の4画面KPIウィザードを、習慣を「既に身についた（習慣化済み）」と「これから始める」に分けて
診断し、「あなたは既にこれだけ積んできた（過去）＋これからこれだけ積める（未来）」を二段構えで
見せる6画面の「一生インパクト診断」に置き換える。完了時にユーザーのデータ（プロフィール・習慣）が
入っている状態にする。

## ビジネスコンテキスト
- 対象ユーザー: 新規登録直後のユーザー（オンボーディング初回）
- 提供価値: 選択を迫る前に「自分ごとのインパクト」を体感させ、感情を動かしてから習慣登録につなぐ。
  既存習慣の過去累積を肯定的に見せることで「自分は既に良い人生を歩んできた」と実感させる
- 成功指標: オンボーディング完走（[5]到達）／完了時に habits が1件以上登録されている

## 技術要件
- スタック: Next.js 16 (App Router) / React 19 / TypeScript / Tailwind 4 / Shadcn UI / next-intl (en/ja) / Supabase (PostgreSQL + RLS)
- 参照パターン:
  - v1 オンボーディング: `src/components/onboarding/{onboarding-wizard,kpi-icon}.tsx`, `src/app/onboarding/{layout,page}.tsx`（作り替え元）
  - KPI計算/カタログ: `src/lib/onboarding.ts`, `src/data/habit-presets.ts`, KPI静的カタログ・統計テーブル（平均余命/平均年収。v1で導入済み）
  - Supabase CRUD: `src/lib/supabase/habits.ts`（snake_case↔camelCase マッピング）, `src/lib/supabase/` の user_profiles 周り
  - 既存テスト: `src/__tests__/{onboarding-logic,calculation-logic,profile,user-profiles-migration}.test.ts`
- 制約:
  - **造語禁止**。あの4つは「KPI」とだけ呼ぶ（数字/バケツ/指標と言い換えない）
  - KPI名・「なりたい自分」コピーは v1（`onboarding-screens.md`）の確定語彙を踏襲
  - 既存テーブルを壊さない。habits への列追加は後方互換（既定値 'active'）で行う
  - マイグレーション作成後は自分で `supabase db push` を実行する（dev: xhqddzdpcpvxpprxykct）
  - en ロケールは ja から翻訳して実装時に作成
- テストフレームワーク: Vitest（ユニット/ロジック）＋ Playwright（E2E/画面遷移）
- テスト実行コマンド: `npm run test:run`（Vitest）/ E2Eは Playwright

## スコープ
### 含むもの
- habits テーブルへ `status`（'active' | 'established'）と `established_since`（nullable date）を追加
- 既存習慣の「過去累積」計算（開始日×規定頻度×1回あたり効果の推定。「推定」と明示）
- 過去累積＋未来の一生分を合算して返す計算API
- v2 6画面ウィザード（[0]イントロ [1]プロフィール [2]習慣選択(2分類) [3]計算中 [4]結果(二段構え) [5]完了）
- [2]で既存習慣に「いつから？」入力、これから始める習慣を1つ以上選択
- 完了時に user_profiles と habits（established/active 区別）を保存
- en/ja 両ロケールの文言

### 含まないもの
- 週間ビュー（今週N日実行→KPI増分の視覚化）（理由: ホーム/週間UIは別スコープ・backlog）
- ホームの累積表示（established過去累積＋active積み上げ）（理由: 同上）
- active→established への昇格UI（習慣化しました遷移）（理由: アプリ本体UI・backlog）
- 他者比較機能（理由: 設計未確定・backlog）
- 残り記事への dailyPositiveMoodMinutes 値入れ（理由: コンテンツ作業・backlog）

## Changes分解

### change-A: habit-status-model
- **スコープ**: habits テーブルに `status`（'active'|'established'、既定 'active'）と `established_since`（nullable date）を追加するマイグレーション。RLS が既存どおり機能することの確認。`src/lib/supabase/habits.ts` の型・CRUD（snake_case↔camelCase マッピング）を新列に追従。型定義（Habit型）更新。
  - `toHabit()`（`src/lib/supabase/habits.ts:79` 付近）で `status` を `row.status ?? 'active'` のフォールバック付きで読む（未マイグレーション行/select漏れで undefined が漏れないように）。
  - `insertHabit()` シグネチャを `status`/`established_since` を運べるよう拡張（change-C の書き込み配線がこのシグネチャを使う）。
- **使用スキル**: なし（既存マイグレーションパターン踏襲）
- **依存関係**: 独立（最初に実行）
- **config.yaml rules**:
  - "habits への列追加は後方互換。既定値 'active' で既存行を壊さない"
  - "toHabit は status を 'active' 既定でフォールバック。全コンシューマ（ホーム/習慣一覧）に undefined を漏らさない"
  - "insertHabit は status/established_since を受け取れるシグネチャにする（change-C が使用）"
  - "マイグレーション作成後 `supabase db push` を実行（dev環境）"

### change-B: lifetime-impact-calc（過去累積＋未来一生分）
- **スコープ**: KPI4軸ごとに `{past, future}` を返す合算計算APIを**新規実装**する。
  - **未来の一生分は未実装なので新規に作る**（`src/lib/onboarding.ts` にあるのは `presetPerTimeEffectValue`＝1回あたり効果のみ。remaining余命×日次効果の集計関数は存在しない）。
  - 建材: `presetPerTimeEffectValue`（1回あたり効果）× `src/lib/profile.ts` の `resolveDerivedProfileValues`（`remainingLifeExpectancy` / `remainingWorkingYears` / `dailyWage` 等の horizon 派生値）。
  - **未来（future）= active 習慣のみ**を集計（per-time効果 × horizon日数）。
  - **過去（past）= established 習慣のみ**を集計（per-time効果 × 過去 horizon 日数）。**過去 horizon は未来と KPI 種別で対称にする**: health_lifespan/positive_mood は `elapsedYears × 365`（established_since〜今日の経過年×365暦日）、cost_saving/earning は `elapsedWorkingYears × 240`（経過年を営業年とみなし×240営業日）。**暦日数を全 KPI に一律適用しない**（earning/cost_saving で約 365/240≒1.5倍に過大計上され未来と非整合になるため）。per-time 効果は future と共通で再利用できる。
  - 過去・未来は期間が排他なので相互の二重計上はなし。
- **使用スキル**: なし
- **依存関係**: change-A（status/established_since 列に依存）
- **config.yaml rules**:
  - "未来の一生分は新規実装。既存に集計関数があると仮定して探し回らない（per-time効果×horizon を自前で組む）"
  - "未来 horizon: health_lifespan / positive_mood は remainingLifeExpectancy×365日、cost_saving / earning は remainingWorkingYears×WORKING_DAYS_PER_YEAR(=240日) を乗じる"
  - "過去 horizon は未来と KPI 種別で対称: health_lifespan/positive_mood = elapsedYears×365、cost_saving/earning = elapsedWorkingYears×240。暦日数を全 KPI に一律適用しない（earning/cost_saving の過大計上＝未来との非整合を防ぐ）"
  - "future は active 習慣のみ、past は established 習慣のみ。結果[4]ブロック2（未来）に established の将来継続分は含めない"
  - "過去累積は推定値。UI表示で『推定』と明示できるよう計算結果にフラグ/メタを持たせる"
  - "健康寿命・前向きな気持ちの時間は分→年に換算して返す（端数丸め）"
  - "過去 cost_saving/earning の elapsedWorkingYears×240 は『経過年を営業年とみなす』推定。境界（established_since が未来日 / 0年 / 極端な長期）の挙動をユニットテストで各1ケース固定する"

### change-C: onboarding-v2-flow
- **スコープ**: v1 wizard を v2 6画面に作り替え。[1]プロフィール（年齢/性別/国/年収任意）、[2]習慣選択（既存=チェック＋「いつから」入力 / これから=1つ以上選択）、[3]計算中アニメーション、[4]結果（過去累積ブロック＋未来分ブロック、KPI4軸同列）、[5]完了。完了時に user_profiles と habits（established には established_since とstatus、active は通常）を保存。en/ja 文言。誘導リダイレクト（未完了→/onboarding）の維持
- **使用スキル**: frontend-design（必要に応じて）
- **依存関係**: change-B（合算計算APIに依存）
- **config.yaml rules**:
  - "文言は `docs/context/onboarding-screens-v2.md` 確定版に従う。造語禁止"
  - "established 習慣の保存は `buildHabitFromPreset()` / `runOnboardingWrite()`（`src/lib/onboarding.ts:175,219` 付近）が established_since と status='established' を change-A の insertHabit シグネチャ経由で運ぶよう配線する（『列はあるが値を渡せない』を防ぐ）"
  - "[2]セクションBが1つ以上選択されるまで『診断する』を非活性"
  - "[2]セクションA（established）で選んだプリセットはセクションB（active）で除外/非活性にし逆も同様（プリセット単位で相互排他）。同一プリセットが established と active の両方に insert されて[4]で二重計上されるのを防ぐ（『二重計上なし』保証は習慣が established/active 排他であることに依存）"
  - "結果[4]ブロック1（過去累積）は既存習慣がある場合のみ表示。ブロック2（未来）は active 習慣のみ集計"
  - "v2 は KPI 選択ステップを持たない（[4]は4軸同列）。完了時の user_profiles 保存では trackedKpis に4軸すべて（全 KpiKey）を保存する。OnboardingWriteInput の単一 selectedKpi 前提は撤去 or 配列化する"
  - "[2]セクションA/B に提示するプリセット母集団は全プリセットカタログ（KPI 非依存）。v1 の presetsForKpi(kpi) による KPI 絞り込みは v2 では使わない"

## モデル割り当て

| change | ロール | ティア(haiku/sonnet/inherit) | 理由 | 上書き |
|--------|--------|------------------------------|------|--------|
| change-A | builder | inherit | DBマイグレーション＋RLS＋型/CRUD追従。後方互換が崩れると既存データに影響、確実性重視 | |
| change-A | verifier | haiku | マイグレーション/型の静的検証中心 | |
| change-A | reviewer | inherit | スキーマ変更のBuild Contractレビュー | |
| change-B | builder | inherit | 計算ロジックの正しさが核心。過去累積×合算のTDD実装 | |
| change-B | verifier | haiku | 計算ユニットテストの静的検証中心 | |
| change-B | reviewer | inherit | 計算設計・二重計上回避のレビュー | |
| change-C | builder | inherit | 6画面の状態管理・保存・i18nを伴う複雑なUI実装 | |
| change-C | verifier | sonnet | 画面遷移のブラウザ検証（Playwright）を伴う | |
| change-C | reviewer | inherit | UXフロー・Build Contractレビュー | |

## 画面・UI設計
詳細は `docs/context/onboarding-screens-v2.md`（確定版）が唯一の参照元。要約:
- [0] イントロ: 問いかけ＋「診断を始める」
- [1] プロフィール: 年齢/性別/国/年収(任意)
- [2] 習慣選択: セクションA「もう習慣になっているもの」（チェック→いつから入力）／セクションB「これから始めたいもの」（1つ以上）
- [3] 計算中: アニメーション＋進行マイクロコピー（数秒で自動遷移）
- [4] 結果: ブロック1「あなたはもう、これだけ積んできました」（過去累積・既存習慣ありのみ）／ブロック2「続ければ、これだけ積み上がります」（未来一生分）。各ブロック KPI4軸同列。CTA「この内容ではじめる」
- [5] 完了: 登録習慣リスト（established/active 区別）、CTA「はじめる」→ホーム
- 既存 wizard の語彙・トーンを踏襲

## データモデル
- `habits`（既存テーブルに列追加）:
  - `status` TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','established'))
  - `established_since` DATE NULL（status='established' のとき開始日。年数入力は概算で日付化）
  - 既存の RLS（user_id 単位）はそのまま適用される想定。マイグレーションで確認
- `user_profiles`（既存・v1で導入）: 年齢/性別/国/収入(任意)＋選んだKPI。v2でも完了時に保存
- KPI静的カタログ・統計テーブル（平均余命/平均年収）: v1導入済みを流用

## 受け入れ条件

**必須条件（常に含める）:**
1. [ ] 全changeのOpenSpec仕様が作成・レビュー済み
2. [ ] 全changeのテストが作成され全てPASSしている（`npm run test:run`）
3. [ ] ビルドエラーなし（型チェック + `next build`）
4. [ ] 統合テストがPASS（worktreeマージ後）

**機能固有の条件:**
5. [ ] habits に `status`/`established_since` 列が追加され、既存行は status='active' で壊れない（マイグレーションテスト）
6. [ ] `status='established'` の習慣を `established_since` 付きで保存・取得できる（CRUDテスト、snake_case↔camelCase 往復）
7. [ ] 過去累積計算が「過去 horizon（KPI種別で対称: health_lifespan/positive_mood=elapsedYears×365、cost_saving/earning=elapsedWorkingYears×240） × 1回あたり効果」で算出され、結果に「推定」フラグを持つ（ユニットテスト）。※onboarding プリセットは everyday（頻度=1/日）前提のため頻度乗数は持たない（未来計算と対称）
8. [ ] 合算APIが KPI4軸それぞれに `{past, future}` を返す。past=established習慣のみ、future=active習慣のみで集計される（ユニットテスト）
8b. [ ] 未来一生分の horizon が KPI種別で正しい（health_lifespan/positive_mood=remainingLifeExpectancy×365、cost_saving/earning=remainingWorkingYears×240）（ユニットテスト）
9. [ ] 健康寿命・前向きな気持ちの時間が分→年に換算されて返る（ユニットテスト）
10. [ ] オンボーディング [0]→[5] を通しで完走でき、完了時に user_profiles と habits（established/active）が保存される（E2E/Playwright）
11. [ ] [2]セクションBが0選択のとき「診断する」が非活性、1つ以上で活性（E2E or コンポーネントテスト）
12. [ ] [4]結果で既存習慣がある場合のみ過去累積ブロックが表示される（コンポーネントテスト）
13. [ ] en/ja 両ロケールで全画面の文言が表示される（en リグレッションなし。メッセージテスト）

## 意思決定ガイドライン
- 優先順位: 正しさ（計算・データ整合） > UXの完成度 > 拡張性
- リスク許容度: 中程度（DB列追加は後方互換を厳守、計算は推定と明示）
- 不明点の扱い: オンボーディングの摩擦を増やさない方を選ぶ（推定でよい所は推定）。造語が必要になったら作らず既存語彙で表現

## 動作確認方法
- 開発サーバー: `npm run dev`（ポート使用中なら 3001/3002…）／ URL: `http://localhost:<port>/onboarding`
- テスト: `npm run test:run`（Vitest）、E2E は Playwright
- 確認手順:
  1. テストユーザーのオンボーディング状態をリセット（user_profiles / 関連を初期化）
  2. `/onboarding` にアクセス → [0]イントロから開始
  3. [1]でプロフィール入力 → [2]で既存習慣にチェック＋「いつから」入力、これから始める習慣を1つ以上選択
  4. [3]計算中アニメーション → [4]結果で「過去に積んだ」「これから積める」両ブロックの KPI4軸を確認
  5. [5]完了→ホーム遷移。Supabaseで habits（established/active）と user_profiles が保存されていることを確認
  6. ロケールを en に切り替えて [0]〜[5] の文言が英語表示されることを確認

## Brain Dumpからの原文メモ
> 既に身についた習慣とこれから身につける習慣はまた別にした方がいい。身についたやつはアーカイブじゃなくて
> 「習慣化しました」みたいなステータスを入れる。最初に既に習慣化するものにチェックを入れる→その習慣化した
> フラグをつける。自分の既に身につけた習慣で、自分が他の人と比べてどれだけ素晴らしい人生を歩んでるかを
> 見せるためにそれを使う。他の習慣は、1日でも積み上げたものを毎日実行することで科学的エビデンスに基づいた
> 効果が得られる。週間ごとのビューで何日実行したか→収入が何百円伸びた、健康寿命が何日伸びたが視覚的に確認
> できる。すでに獲得した習慣は、いつ頃から身についているかを入力して今日までの日数をもとに、お酒を飲まない
> 習慣が10年前から成り立っているなら、その10年であなたはこれだけのものをゲットしたんだよと見せたい。
