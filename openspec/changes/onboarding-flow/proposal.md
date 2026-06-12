# Proposal: onboarding-flow

## Why

Smitch の新規ユーザー（およびプロフィール未作成の既存ユーザー）が、初回ログイン直後に「何を良くしたいか（KPI）」を1つ選ぶだけで、エビデンスに基づく習慣と定量KPIのトラッキングを始められる状態を作る。現状はオンボーディングが存在せず、ログイン直後のユーザーは user_profiles / habits / habit_evidences が空のままホームに到達してしまい、外部リリースに耐える初回体験になっていない。

## What Changes

- `/onboarding` ルートを新設（`(app)` グループ外。Header / BottomNav なし、`/login` と同様の独立レイアウト）
- オンボーディング4画面を実装（上部ステッププログレス付き）:
  - [1] KPI選択: 4枚のカード（見出し=なりたい自分コピー、説明=KPI名＋単位）から1つ選択（単一選択）
  - [2] プロフィール: 年齢・性別・国（必須、国デフォルト日本）＋年収（任意、未入力時は平均年収を使う旨の注記）
  - [3] 習慣のおすすめ: 選んだKPIに対応する習慣プリセットから1つ以上選択
  - [4] 完了: 選んだKPI（現在値0）と習慣リストを表示し「はじめる」でホームへ
- 完了時の書き込みを[4]で一括実行: upsert `user_profiles`（tracked_kpis 含む）→ insert `habits` ＋ `habit_evidences`（既存機構流用）。途中画面ではDBに書き込まない
- 誘導: ログイン済みかつ user_profiles 未作成のユーザーは保護ページから `/onboarding` へ強制リダイレクト（`src/app/(app)/layout.tsx` で判定）。user_profiles 作成済みのユーザーが `/onboarding` を開いたらホームへ（`/onboarding` のレイアウトで判定）。`src/middleware.ts` は変更しない
- i18n: ja は `docs/context/onboarding-screens.md` の確定文言（一字一句変えない）、en は ja からの翻訳を messages に追加
- 途中離脱したユーザーは次回最初からやり直し（途中状態の永続化なし）
- デザイントーンは今後のアプリ全体UI刷新の基準になる品質で作る（既存テーマのCSS変数体系は流用）

## Capabilities

### New Capabilities

- `onboarding`: オンボーディング4画面のフロー（KPI選択 → プロフィール → 習慣のおすすめ → 完了）、user_profiles 有無によるリダイレクト誘導、完了時の一括書き込み（user_profiles / habits / habit_evidences）、ja・en の i18n 表示

### Modified Capabilities

（なし。既存 capability の要件変更はない。`(app)/layout.tsx` の変更は onboarding 誘導の実装であり、既存 spec の要件には影響しない。middleware / marketing-host-routing は変更しない）

## Impact

- **新規コード**:
  - `src/app/onboarding/`（layout.tsx + page.tsx + 画面コンポーネント群）
  - `src/messages/ja.json` / `src/messages/en.json` に `onboarding` 名前空間を追加
- **既存コードの変更**:
  - `src/app/(app)/layout.tsx`: async サーバーコンポーネント化し、user_profiles 未作成なら `redirect('/onboarding')`
- **変更しないもの**:
  - `src/middleware.ts`（auth リダイレクトのみ担当。Edge での DB select と二重判定を避ける）
  - 既存テーブル（habits / habit_evidences / habit_completions / daily_reflections）
- **依存**:
  - change-A（kpi-data-foundation）: `src/data/kpi/catalog.ts`（KPI定義4件・なりたい自分コピー）、`src/data/habit-presets.ts`（習慣プリセット）
  - change-B（user-profiles-db）: `user_profiles` テーブル＋RLS、`src/lib/supabase/profiles.ts`（CRUD）
  - 既存: `src/lib/supabase/habits.ts` の `insertHabit` / `replaceHabitEvidences`、`src/lib/supabase/server.ts`（サーバー側 Supabase クライアント）、next-intl（cookie ベース locale）
- **制約**: 造語禁止（4つの指標は「KPI」とだけ呼ぶ）。画面文言は `docs/context/onboarding-screens.md`（確定）から一字一句変えない
