# Decisions: オンボーディング v2「一生インパクト診断」

## 2026-06-27 Review#1（REQUEST_CHANGES）への対応

reviewer（runId wf_5586cda3-3f4）が BLOCKER 1 + SHOULD_FIX 1 + NOTE 2 を指摘。ユーザー承認のもと
plan.md を修正（BLOCKER + SHOULD_FIX + NOTE①）し、NOTE② は本ファイルに記録のうえ Review を再実行。

### D1: 過去累積 horizon を未来と KPI 種別で対称化（BLOCKER 対応）
- 問題: 過去を全 KPI 一律「established_since〜今日の暦日数」とすると、earning/cost_saving は未来基準
  （remainingWorkingYears×240営業日）と非対称で約 365/240≒1.5倍に過大計上され、看板数字が不整合になる。
- 決定: 過去 horizon を未来と対称に。health_lifespan/positive_mood=elapsedYears×365、
  cost_saving/earning=elapsedWorkingYears×240。plan.md の change-B スコープ・config rules・AC#7 を更新。
- 根拠: 計算の正しさは plan の最優先事項（意思決定ガイドライン）。builder が自律解決できない設計判断。

### D2: [2] セクション A/B のプリセット相互排他（SHOULD_FIX 対応）
- 問題: 同一プリセットを established と active の両方で選べると habits が2件 insert され [4] で二重計上。
- 決定: セクション A で選んだプリセットは B で除外/非活性（逆も同様）。change-C config rule に追加。
- 根拠: 「二重計上なし」保証は習慣が established/active 排他であることに依存する。

### D3: AC#7 から「規定頻度」乗数を削除（NOTE① 対応）
- 問題: AC#7 が頻度乗数を書くが change-B 本文・未来計算は頻度を持たない（buildHabitFromPreset は everyday=1/日）。
- 決定: AC#7 から頻度を外し、onboarding プリセットは everyday 前提（頻度=1）と明記。未来計算と対称。

### D4: change を 4→3 に統合するのは意図的（NOTE② 記録のみ・plan 変更なし）
- screens doc は 4 change（V1 データモデル / V2 計算 / V3 6画面 / V4 検証+i18n）だが plan は 3（A/B/C）に統合し、
  en/ja i18n・Playwright E2E・redirect-guard を change-C に畳み込む。
- 決定: 統合は意図的。AC#10-13 が畳み込んだ E2E/i18n をカバーするため verifier は E2E/i18n を change-C
  スコープ下で検証する。4 つ目の change 欠落ではない。plan.md は変更しない。

## 2026-06-27 Review#2（APPROVE）と残項目の先取り対応

reviewer（runId wf_d0d14d1d-ed9）= APPROVE（BLOCKER 0）。BLOCKER 解消を確認。残る SHOULD_FIX/NOTE は
builder 自律デフォルト可能だが、ドリフト防止のため APPROVE 方針に沿って plan に一行追記（再Review不要）。

### D5: v2 の trackedKpis は4軸すべて保存（SHOULD_FIX 対応）
- v2 は KPI 選択ステップを持たない（[4]4軸同列）。完了時 user_profiles の trackedKpis に全 KpiKey を保存。
  OnboardingWriteInput の単一 selectedKpi 前提は撤去 or 配列化。change-C ルールに追記。

### D6: [2] プリセット母集団は全カタログ（NOTE 対応）
- v1 の presetsForKpi(kpi) 絞り込みは v2 では使わず、セクション A/B は全プリセットカタログ（KPI非依存）を提示。change-C ルールに追記。

### D7: 過去 horizon 近似の境界テスト固定（NOTE 対応）
- elapsedWorkingYears×240 は推定。established_since 未来日 / 0年 / 極端な長期 の境界を change-B ユニットテストで各1ケース固定。change-B ルールに追記。

## 2026-06-27 change-A: habit-status-model 実装の設計判断

### D-A1: status は read model（Habit）では必須、insert 入力では任意
- 問題: Habit 型に status を追加するとき必須 vs 任意の選択。必須にすると既存の書き込み経路
  （habit-form / discover 採用 / home の handleSubmit / buildHabitFromPreset）が status を渡す必要が生じ破綻。
  任意にすると toHabit の読み出し結果に undefined が型レベルで漏れ「undefined を漏らさない」ルールに反する。
- 決定: 両立させる。Habit.status は必須（`'active' | 'established'`）にし読み出しコンシューマに値を保証。
  insert は専用型 `HabitInsertInput`（status/establishedSince を任意化した Omit）を新設し、
  既存書き込み経路を後方互換に保つ。plan の「insertHabit は status/established_since を運べるシグネチャ」を満たす。
- 根拠: 可逆かつ最小。read 側の型安全（undefined 不漏出）と write 側の後方互換を同時に満たす。
- 波及: useHabits.addHabit / habit-form.onSubmit / home・discover の handleSubmit / buildHabitFromPreset の
  入力型を `Omit<Habit,...>` から `HabitInsertInput` に統一。

### D-A2: snake↔camel マッピングを純粋関数に抽出してテスト
- 問題: AC#6「snake_case↔camelCase 往復」を実 DB なしで検証する必要がある（supabase client が要る）。
- 決定: 書き込み行生成を純粋関数 `buildHabitInsertRow()` に抽出し、`toHabit()` と共に export。
  insertHabit は内部で buildHabitInsertRow を使う。テストは input→insert row→（DB割当列補完）→toHabit の往復で検証。
- 根拠: DB モック不要でマッピングの正しさを固定でき、回帰に強い。

### D-A3: `supabase db push` は実行保留（既存の履歴乖離のため）
- 問題: dev（xhqddzdpcpvxpprxykct）への `db push --dry-run` で「Remote migration versions not found in
  local migrations directory」エラー。remote に 20260612000000 / 20260612000100 / 20260612000200 が存在するが
  local worktree の migrations には無い（本 change と無関係の既存乖離）。
- 決定: `migration repair` / `db pull` は共有 dev DB の履歴を書き換える破壊的操作のため builder では実行しない。
  マイグレーション SQL は `add column if not exists` で冪等・非破壊。実 push は履歴整合後にユーザー or 統合フェーズで行う。
- 根拠: 意思決定ガイドライン「DB は後方互換厳守・共有状態を壊さない」。冪等 SQL なので後追い push は安全。
