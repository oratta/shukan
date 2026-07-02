# Checkpoint: onboarding-v3-impl（人間向け監査ログ）

> 状態の真のソースは Workflow ツール（runId + キャッシュ）と OpenSpec の tasks.md。
> このファイルを機械パースして制御フローを決めてはならない（exec.md D4/S20）。

## 実行情報
- 開始: 2026-07-02
- ランディレクトリ: `_longruns/2026-07-02_onboarding-v3-impl/`
- 動作モード: **通常モード（OpenSpec あり）** — ユーザー選択（AskUserQuestion）
- 実行系: exec v6.0.0（Workflow ツール駆動）

## ツール検証結果
- OpenSpec preflight: `bash .../plugins/longrun/scripts/openspec-preflight.sh` → **OK**（CLI 解決可・openspec init 済み）
- モデル割り当て解決: `resolve-model-allocation.mjs plan.md references/model-tiers.md` → hasSection=true, warnings=[]
  - change-A: builder=sonnet / verifier=haiku / reviewer=inherit
  - change-B: builder=inherit / verifier=sonnet / reviewer=inherit
  - change-C: builder=inherit / verifier=sonnet / reviewer=inherit
- テンプレート: marketplace 版 = cache 6.2.0 版（diff で同一確認済み）

## 進捗
- [x] Step 0: preflight（OK）+ 動作モード確定（通常）
- [x] Step 1: plan.md 読込（change-A → B → C 直列）
- [x] Step 2: Workflow スクリプト生成（review / build-verify とも `node --check` 構文 OK。
      build-verify は Build ループを change 単位モデル参照に調整 — decisions.md D-exec-1）
- [x] Step 3: Review workflow 完了（runId: wf_8dc6d6a1-27f）→ **APPROVE**（BLOCKER 0 / NOTE 3:
      ①「稼ぐ能力」コメント3箇所も change-A で更新 ② en 'Earning power'→'Income Growth' の
      name/description/テスト追従 ③ E2E 不能時は書き込みペイロードのユニットテスト代替を残タスク明示）
- [x] Step 4: Build → Verify workflow 完了（runId: wf_8537f458-c13）
  - Build: 3/3 SUCCESS — change-A `9d97d27`（634 tests）/ change-B `8aba354`（655 tests・新規21）/
    change-C `2a495f5`（643 tests・新規69。lifetime-impact 旧API・旧テスト削除）
  - Verify: round 1 で **PASS**（functionality=100 / quality=100 / completeness=83 / ux=78。
    全ハードしきい値クリア）。stopReason=PASS
  - 検証ゲート: npm test 643/643 / tsc 0 errors / lint 0 errors / build 成功 / grep '稼ぐ能力' src/ = 0件
  - 残課題（verifier findings、非ブロッカー）:
    1. [2] 4択タップの連打ガードなし（setTimeout 460ms 中に連続タップで習慣スキップの恐れ）
    2. onboarding-wizard.tsx のコンポーネントテストなし（連打不具合は既存テストで検出不能）
    3. writeError が汎用文言のみ（エラー種別の区別なし）
    4. AC#1: openspec/changes/ に per-change の proposal/tasks が未作成（Build Contract レビューで代替）
    5. AC#14: 実ブラウザ E2E（[0]→[5]→ホーム通し + DB 書き込み確認）が未実施（残タスク）
- [x] 残課題対応（ユーザー承認「連打ガード修正＋E2E まで自律実行」）
  - 連打ガード: WizardState.advancing + 純粋関数（tapHabitRate / completeHabitAdvance / backInHabits）
    で実装、ユニットテスト10本追加（コミット `4281b70`。RTL/jsdom はコードベース規約により不採用 —
    decisions.md D-C-2）。gates: 653 tests / tsc 0 / lint 0 errors / build 成功
  - AC#14 実ブラウザ E2E: **PASS**（2026-07-02、localhost:3000 = 本 worktree の dev サーバー）
    - [0]→[1]（40歳・男性・日本・年収空）→[2] 15習慣（運動=70%・タバコ=100%・他=0%）→[3]→[4]→[5]→ホーム 完走
    - [2]: タップで即遷移・ライブ4KPI加算（75日=107×0.7 等）・戻る＋再選択維持・
      **連打3クリックでも1画面しか進まない（ガード実地確認）**・タバコ二択 UI・8.4年（年表記切替）
    - [4]: 未来のみ単一表示・新単位（+8.6年 / +50分/日 / +36万円/年 / +162万円/年）・「増える収入」表示
    - [5]: 登録対象は運動（active）とタバコ（習慣化済みバッジ）の2件のみ
    - DB（Supabase dev）: habits = タバコ status='established'・established_since=null /
      運動 status='active'、0%の13習慣は未作成。user_profiles = birth_year 1986・male・JP・
      annual_income null・tracked_kpis 全4KPI。habit_evidences = weight 100 × 2件（quit_smoking / daily_cardio）
  - 未対応（非ブロッカー・後送り）: writeError の汎用文言（エラー種別の区別なし）/
    AC#1 の per-change OpenSpec proposal 未作成（Build Contract レビューで代替）
- [ ] Feedback Tier 確認（/lr:f）→ アーカイブ（/lr:a）
