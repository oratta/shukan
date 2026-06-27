# Checkpoint: オンボーディング v2「一生インパクト診断」

人間向け監査ログ。制御フローはこのファイルをパースしない（状態の真ソースは Workflow runId + OpenSpec tasks.md）。

## ツール検証結果（preflight）
- 実行: `bash ${CLAUDE_PLUGIN_ROOT}/scripts/openspec-preflight.sh`
- 結果: `OK`（OpenSpec CLI 解決可・openspec/ init 済み）
- 動作モード: **通常モード（OpenSpec あり）**（ユーザー選択。`.degraded-mode` マーカーなし）
- render/template/schema/model-tiers すべて存在確認済み

## モデル割り当て（resolve-model-allocation.mjs）
- hasSection: true / warnings: なし
- builder: 全 change inherit (null)
- reviewer: 全 change inherit (null)
- verifier: change-A/B=haiku, change-C=sonnet
  - **統合 Verify は全 change をまとめて1回検証し change-C の UI/ブラウザ検証を含むため、単一値テンプレートには最も能力の必要な `sonnet` を採用**

## Changes 分解（直列 A→B→C・同一 worktree 共有）
- change-A: habit-status-model（独立・最初）
- change-B: lifetime-impact-calc（change-A 依存）
- change-C: onboarding-v2-flow（change-B 依存）
- 相互依存のため3 change は同一 worktree（現 cwd）で直列実行

## 生成物
- `review.workflow.js`（reviewer-verdict schema 強制）— node --check OK
- `build-verify.workflow.js`（builder-report / verifier-score schema 強制）— node --check OK

## 進捗ログ
- 2026-06-27: preflight OK → 通常モード確定 → params 生成 → workflow 2本レンダリング・構文検証完了
- 2026-06-27: Review#1（runId wf_5586cda3-3f4）= REQUEST_CHANGES（BLOCKER 1 + SHOULD_FIX 1 + NOTE 2）。
  ユーザー承認のもと plan.md 修正（過去horizon対称化 / プリセット相互排他 / AC#7頻度削除）＋decisions.md 記録（D1-D4）→ Review 再実行
- 2026-06-27: Review#2（runId wf_d0d14d1d-ed9）= APPROVE（BLOCKER 0）。残 SHOULD_FIX/NOTE を plan に先取り追記（D5-D7、再Review不要）→ Build Contract 承認ゲートへ
- 2026-06-27: ユーザーが Build Contract 承認 → Build→Verify（runId wf_86438bb3-10d）起動
- 2026-06-27: Build→Verify 完了 = **PASS**（Verify 2周目）。3 change SUCCESS / 全359テスト PASS / next build 成功。
  - コミット: change-A d10497c / change-B a133d4d / change-C c3d1971 / verify-fix fa93b38
  - Verify スコア: functionality=100 quality=100 completeness=86 ux=78 → verdict PASS
  - **要フォロー(1)**: `supabase db push` 未実行（dev DB の migration 履歴乖離: remote に 20260612000000/000100/000200、local に無し）。SQL は冪等(add column if not exists)・非破壊だが実 dev DB への列追加は保留（D-A3/D-V4）。共有 dev DB の履歴 repair は破壊的なため builder が安全側で停止
  - **要フォロー(2)**: ブラウザ E2E（AC#10 通し）は実ブラウザ未実行。verifier は静的（longrun-verifier）。[0]→[5] の核は Vitest ロジックで固定（D-C5）。実ブラウザ通し確認は未
  - **残UX**: [2]セクションBで A 選択済みプリセットが視覚的に disabled されない（state相互排他は動作・機能二重計上なし、UXのみ。verifier finding）
- 2026-06-28: 要フォロー(1) 解決。ユーザー指摘どおり **origin/main を feature ブランチにマージ**して migration 履歴乖離を解消（merge commit f1f46fc）。
  - 乖離の正体: worktree 分岐後に main が monetization の 3 migration（20260612000000/000100/000200）を追加・dev に適用済みだったが local に無かった。マージで local に取り込み整合
  - コンフリクト 10 件解消（messages両保持 / page.tsx import併合+遅延init / habit系7コンポーネントのeslint-disable / impact-article-sheetはmain側）。npm install で stripe 等 6 パッケージ追加
  - 統合検証 AC#4: tsc クリーン / 634 tests PASS / lint 0 errors / next build 成功
  - **`supabase db push` 完了**: 20260627000000_habit_status.sql を dev(xhqddzdpcpvxpprxykct)に適用。migration list で Local/Remote 全一致。AC#5/#6 が実 DB で充足。要フォロー(1) クローズ
  - **残**: 要フォロー(2) 実ブラウザ E2E（AC#10）未実行 / 残UX（[2]プリセット disabled 表示）は未対応
- 2026-06-28: 残UX 修正完了（commit 178dc53）。PresetCard に disabled prop 追加、[2]セクションB で isPresetEstablished の
  プリセットを opacity-50+pointer-events-none+aria-disabled で無効化、subtitle「習慣化済みで選択中」。en/ja に alreadyEstablished 追加。
  634 tests / tsc / lint 0 errors / build すべて PASS
- 2026-06-28: **要フォロー(2) 実ブラウザ E2E 完了**（claude-in-chrome、dev サーバ localhost:3000、ユーザーはログイン済み）。
  [0]→[1]→[2]→[3]→[4]→[5]→ホーム を通しで完走。GIF（onboarding-v2-flow.gif）でユーザーに共有。検証結果:
  - [0] イントロ / [1] プロフィール（年齢40・性別male・国JP・年収空）/ [2] 習慣選択（established=タバコをやめる10年前・active=集中して働く）
  - **UX修正の実証**: セクションB の「タバコをやめる」が disabled=true/aria-disabled/opacity-50/pointer-events-none・subtitle「習慣化済みで選択中です」
  - AC#11: 「診断する」は active 1件選択で活性（ゲート動作）/ AC#12: [4]過去ブロックは established ありで表示・「推定」バッジ付き
  - [4] 二段構え結果: 過去（established のみ）健康寿命+2年/出費削減−2,976,338円/稼ぐ能力+13,657,550円、未来（active のみ）稼ぐ能力+30,000,000円。D1 対称 horizon 動作
  - **DB 永続化検証（Management API）**: habits = タバコをやめる(status=established, established_since=2016-06-27＝10年前正確) / 集中して働く(status=active, established_since=null)。
    user_profiles = birth_year=1986(age40変換正確)/gender=male/country=JP/annual_income=null/currency=JPY/tracked_kpis=[health_lifespan,positive_mood,cost_saving,earning]（全4軸=D5）
  - AC#5/#6/#10/#11/#12/D5 すべて実 DB・実ブラウザで充足
  - **注意**: 検証はユーザーの実 dev アカウントで実施。タバコをやめる/集中して働く の2習慣が追加され user_profile が upsert で上書きされた（要クリーンアップ判断）
