# Tasks: onboarding-flow

## 1. 前提確認と i18n メッセージ

- [ ] 1.1 change-A / change-B の成果物（`src/data/kpi/catalog.ts`・`src/data/habit-presets.ts`・`src/lib/supabase/profiles.ts`・user_profiles テーブル）の実インターフェースを確認し、ずれがあれば design.md の Decisions に吸収方針を追記する
- [ ] 1.2 `src/messages/ja.json` に `onboarding` 名前空間を追加する（`docs/context/onboarding-screens.md` の確定文言を一字一句そのまま。タイトル・サブタイトル・KPIカード4枚分の見出し/KPI名/説明文・補足・年収注記・ボタンラベル・[4]本文の interpolation キーを含む）
- [ ] 1.3 `src/messages/en.json` に `onboarding` 名前空間の英訳を追加する（ja と同一キー構造。キー欠落なし）

## 2. E2E テスト作成（Red）

- [ ] 2.1 specs/onboarding/spec.md の全 Scenario を Playwright E2E テストに変換する（リダイレクト誘導・[1]〜[4]の画面文言と操作・途中離脱・ja/en 表示。この時点では失敗してよい）
- [ ] 2.2 完了時書き込みのユニット/統合テストを作成する（書き込み順序 profile → habits → evidences、失敗時に再試行可能なこと。Supabase クライアントはモック）

## 3. /onboarding ルートとリダイレクト誘導

- [ ] 3.1 `src/app/onboarding/layout.tsx`（サーバーコンポーネント）を作成する: 未ログインなら `redirect('/login')`、user_profiles 作成済みなら `redirect('/')`。Header / BottomNav なしの独立レイアウト（/login と同様）
- [ ] 3.2 `src/app/(app)/layout.tsx` を async サーバーコンポーネント化し、ログイン済みかつ user_profiles 未作成なら `redirect('/onboarding')` を追加する（Header / BottomNav の構造は変えない。middleware は変更しない）

## 4. オンボーディング4画面の実装（Green）

- [ ] 4.1 ウィザードの骨組みを実装する: `src/app/onboarding/page.tsx` ＋クライアントコンポーネント（現在ステップ・選択KPI・プロフィール入力・選択プリセットの React state、永続化なし）と上部ステッププログレス（4ステップ中の現在位置表示）
- [ ] 4.2 画面[1] KPI選択を実装する: KPIカード4枚（見出し=なりたい自分コピー、KPI名＋説明文）、単一選択、未選択時は「次へ」無効、補足文表示
- [ ] 4.3 画面[2] プロフィール入力を実装する: 年齢・性別・国（必須、国デフォルト日本）・年収（任意）、年収注記表示、必須未入力/不正値では「次へ」無効
- [ ] 4.4 画面[3] 習慣のおすすめを実装する: タイトルに選んだKPIのなりたい自分コピーを差し込み、選んだKPIの `primaryKpis` に対応するプリセットのみ表示、各カードに1回あたりの効果表示、1つ以上選択で「この習慣ではじめる」有効（複数選択可）
- [ ] 4.5 画面[4] 完了を実装する: 選んだKPI（現在値 0）と選んだ習慣のリスト表示、本文にKPI名を差し込み、「はじめる」ボタン
- [ ] 4.6 完了時の一括書き込みを実装する: upsert user_profiles（tracked_kpis=選んだKPIキー）→ insert habits（選んだプリセット分）→ replaceHabitEvidences（プリセットの articleIds 分）→ 成功でホームへ遷移。失敗時は[4]に留まりエラー表示＋再試行可能。プリセット→Habit 変換時、`insertHabit` の必須フィールド（frequency / type / dailyTarget 等）は既存 Discover の習慣採用フローと同じ既定値で補う（type はプリセットの defaultHabitType。独自の既定値を発明しない）

## 5. デザイントーン仕上げ

- [ ] 5.1 オンボーディング全画面のデザイントーンを外部リリース基準に仕上げる（既存テーマのCSS変数体系を流用。カードの選択状態・ステッププログレス・余白・タイポグラフィ。グローバルテーマ・globals.css は変更しない）
- [ ] 5.2 ステップ[2]以降に前の画面へ戻る手段を追加する（確定文言のタイトル・ボタンラベル・注記には手を加えない）

## 6. 検証

- [ ] 6.1 E2E テスト（2.1）とユニットテスト（2.2）が全て PASS することを確認する（`npm run test:run` ＋ Playwright）
- [ ] 6.2 型チェック＋ビルドが通ることを確認する（`npm run build`）
- [ ] 6.3 plan.md「動作確認方法」の手順 1〜8 を開発サーバーで通しで確認する（未作成ユーザーの /onboarding 強制 → 4画面通過 → Supabase dev に user_profiles / habits / habit_evidences が作成 → 再アクセスでホームへ）
- [ ] 6.4 ja / en 両ロケールで4画面の文言表示を確認する（ja=確定文言どおり、en=生キー表示なし）
