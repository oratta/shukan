# Design: onboarding-flow

## Context

- Smitch は Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + next-intl + Supabase (auth + DB + RLS) 構成。認証済みページは `src/app/(app)/` ルートグループ配下にあり、`src/middleware.ts` が auth リダイレクト（未ログイン → /login）を担当する
- change-A（kpi-data-foundation）で静的カタログ（`src/data/kpi/catalog.ts` のKPI定義4件、`src/data/habit-presets.ts` の習慣プリセット）が、change-B（user-profiles-db）で `user_profiles` テーブル＋RLS＋`src/lib/supabase/profiles.ts`（CRUD）が提供される。本 change はその上に4画面のUIフローと誘導を載せる
- 画面構成・文言は `docs/context/onboarding-screens.md`（2026-06-12 確定）が正。データの書き込み内容は `docs/context/onboarding-data-model.md` §5 が正（§5 の画面番号は旧順序なので読み替え。画面順は [1]KPI → [2]プロフィール）
- 制約: 造語禁止（UI文言・コメント・ドキュメントで4指標は「KPI」とだけ呼ぶ）。確定文言は一字一句変えない。middleware は変更しない

## Goals / Non-Goals

**Goals:**

- `/onboarding` ルート（4画面ウィザード＋ステッププログレス）を `(app)` グループ外に実装する
- ログイン済み＋user_profiles 未作成 → `/onboarding` 強制、作成済み＋`/onboarding` → ホーム、のリダイレクト誘導を実装する
- [4]完了時に user_profiles / habits / habit_evidences への一括書き込みを実装する
- ja（確定文言）/ en（翻訳）の i18n 対応
- 今後のアプリ全体UI刷新の基準になるデザイントーン（既存テーマのCSS変数体系は流用）

**Non-Goals:**

- ホーム画面の改修（選んだKPIのホーム表示含む。backlog で別run）
- KPIの後から変更UI（設定画面への追加は別run。DB上は tracked_kpis 更新で対応可能な構造のまま）
- 途中状態の永続化（途中離脱は次回最初からやり直し）
- middleware の変更（auth リダイレクトのみ担当のまま）
- なりたい自分（Desire束）の独立画面・`desire-bundles.ts` カタログ（D12 折衷案: カード見出しコピーとしてのみ実装）
- 既存テーブル（habits / habit_evidences / habit_completions / daily_reflections）の変更

## Decisions

### D1: user_profiles 有無の判定場所 — `(app)/layout.tsx` と `/onboarding` レイアウトの2点に限定

- `src/app/(app)/layout.tsx` を async サーバーコンポーネント化し、`src/lib/supabase/server.ts` の `createClient()` で user を取得 → `user_profiles` を `maybeSingle()` で1行 select → 未作成なら `redirect('/onboarding')`
- `src/app/onboarding/layout.tsx`（サーバーコンポーネント）で逆判定: 未ログインなら `redirect('/login')`、user_profiles 作成済みなら `redirect('/')`
- middleware は変更しない。理由: Edge での DB select と二重判定を避ける（plan.md config.yaml rules で確定）。なお middleware の matcher に `/onboarding` は含まれないため、`/onboarding` 自体の auth チェックは middleware に頼れず、onboarding レイアウト側の `redirect('/login')` が必須（代替案: matcher に `/onboarding` を足す → middleware 変更禁止のため不採用）

### D2: ウィザードは単一ページ `/onboarding` のクライアントコンポーネントで実装（ステップごとのURLを作らない）

- `src/app/onboarding/page.tsx` から1つのクライアントコンポーネント（ウィザード）を描画し、現在ステップ・選択KPI・プロフィール入力・選択プリセットを React state で保持する
- 理由: 「途中状態の永続化なし・途中離脱は最初から」のルールに最も素直（リロードで state が消え画面[1]に戻る）。ステップ別URL（`/onboarding/step/2` 等）にすると深いリンクで前提 state（選択済みKPI）なしに途中画面へ入れてしまい、ガードが余計に要る
- 代替案: searchParams でステップ管理 → リロード時に途中ステップが復元されてしまい「最初からやり直し」と矛盾するため不採用

### D3: 完了時の書き込みはクライアント側から既存ライブラリで実行し、順序は profile → habits ＋ evidences

- 既存 `src/lib/supabase/habits.ts`（browser client ベース）の `insertHabit` / `replaceHabitEvidences` と、change-B の `src/lib/supabase/profiles.ts`（upsert）をクライアントから呼ぶ。RLS が user_id を保証する既存 Discover 機構と同じ流儀
- 順序: upsert user_profiles（tracked_kpis 含む）→ 選んだプリセットごとに insert habits → 各 habit に replaceHabitEvidences（プリセットの articleIds、weight は既定値 100）。plan.md 記載の順序どおり
- 失敗時: 画面[4]に留まりエラー表示＋再試行（「はじめる」再押下）。profile upsert は冪等（user_id PK の upsert）なので再試行安全。habits insert は再試行で重複し得るが、失敗時はその旨を表示して再試行させるシンプルな方を採る（途中まで成功＝profile だけ作成済みで離脱した場合、ユーザーはオンボーディングをスキップされるが、習慣はホーム/Discover から追加できるため致命的ではない）
- 代替案: Server Action / RPC で1トランザクション化 → 既存コードベースにパターンがなく、既存機構流用（plan.md 指示）に反するため不採用。問題が出たら将来 RPC 化

### D4: 習慣プリセットのフィルタは `primaryKpis` に選んだKPIキーを含むものだけ表示

- `src/data/habit-presets.ts`（change-A）の各プリセットは `primaryKpis: KpiKey[]` を持つ。画面[3]では選択KPIキーを `primaryKpis` に含むプリセットのみ表示する
- 「1回あたりの効果」表示は、プリセットが参照する記事の calculationParams から選んだKPIに対応する軸の値を表示する（例: cost_saving → 1回ごとに 出費 −600円）。表示フォーマットは KPI カタログの unit を使う

### D5: i18n は `onboarding` 名前空間を ja.json / en.json に追加

- 既存の flat な名前空間構造（`habits.*`, `auth.*` 等）に倣い `onboarding.*` を追加。ja は確定文言を一字一句そのまま、en は ja から翻訳
- KPIカードの見出し・KPI名・説明文は4枚分あるため `onboarding.kpi.<key>.headline / name / description` のようにKPIキー単位でネストする。KPIキー（health_lifespan / positive_mood / cost_saving / earning）は `src/data/kpi/catalog.ts` と一致させる
- 画面[3]タイトル・[4]本文の「（コピー/KPI名）」差し込みは next-intl の interpolation（`{copy}` / `{kpiName}`）で行う

### D6: デザイントーンは onboarding 配下のコンポーネントで完結させ、グローバルテーマは触らない

- 既存テーマのCSS変数体系（`bg-background` / `text-muted-foreground` / `border-border` 等の Tailwind トークン）を流用しつつ、余白・タイポグラフィ・カードの選択状態・ステッププログレスなどのトーンを外部リリース基準の品質で設計する
- `globals.css` やテーマ変数の変更はしない（全体UI刷新は backlog の別run。そのときに本画面のトーンを基準として展開する）

### D7: 画面間の「戻る」操作

- 確定文言ドキュメントに「戻る」の記載はないが、入力誤りの訂正手段としてステップ[2]以降に前の画面へ戻る手段（戻るリンク/アイコン）を置く。文言ドキュメントが定義するタイトル・ボタンラベル・注記には一切手を加えない（確定文言の範囲外のUI要素として追加）。判断根拠: 確定ドキュメントに記載なし → シンプルかつ可逆的な方（戻れる）を選択

## Risks / Trade-offs

- [保護ページ表示のたびに `(app)/layout.tsx` で user_profiles を1回 select する] → user_id PK の単一行 select で軽量。layout はソフトナビゲーションでは再レンダリングされないため、実質的に初回ロード/SSR時のみのコスト。許容する
- [書き込みがトランザクションでないため部分成功があり得る（D3）] → profile upsert は冪等、失敗時は[4]に留まり再試行可能。profile のみ成功して離脱した場合も習慣はホームから追加可能。発生頻度・影響とも小さいと判断
- [(app)/layout の async 化が既存ページの描画に影響する] → 変更は user 取得＋1 select＋条件 redirect のみ。Header / BottomNav の構造は変えない。統合テスト（受け入れ条件4）で既存ページの回帰を確認
- [en 翻訳の品質] → ja 確定文言からの直訳ベース。en はリリースブロッカーではなく、キー欠落（生キー表示）がないことを Scenario で担保
- [change-A / change-B の成果物（catalog / presets / profiles.ts）のインターフェースが想定とずれる] → 実装着手時に両 change の実物を確認し、ずれがあれば本 change 側のアダプタで吸収（カタログ側は変更しない）

## Migration Plan

- DBマイグレーションなし（user_profiles は change-B が作成）。デプロイは通常のアプリデプロイのみ
- ロールバック: `/onboarding` ルートと `(app)/layout.tsx` の判定を revert すれば従来動作に戻る（書き込まれた user_profiles / habits は既存機構で扱える正規データなので残してよい）

## Open Questions

- なし（不明点が出たら確定ドキュメント（onboarding-screens.md / onboarding-data-model.md）に戻り、書いていなければシンプルな方を選ぶ。判断は本ファイル Decisions に追記する）
