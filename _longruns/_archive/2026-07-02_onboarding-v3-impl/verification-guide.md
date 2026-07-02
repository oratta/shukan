# Verification Guide: onboarding-v3-impl / change-C（onboarding-v3-flow）

各 Scenario の「テスト実装完了 / ロジック実装完了」を builder が更新する。
実ブラウザ操作の通し確認（AC#14）は longrun-browser-verifier が別途実施する。

## change-C Scenarios（plan.md 受け入れ条件 5〜14 に対応）

### C-S5: [2] は精査済み15習慣のみ（残置7プリセット非表示）
- [x] テスト実装完了（onboarding-logic.test.ts: `ONBOARDING_V3_PRESET_IDS / onboardingV3Presets`）
- [x] ロジック実装完了（onboarding.ts: `ONBOARDING_V3_PRESET_IDS` / `onboardingV3Presets`）

### C-S6: 4択タップで達成率記録→次へ遷移、戻るボタンで前の習慣に戻り再選択
- [x] テスト実装完了（onboarding-logic.test.ts: `setHabitRate / getHabitRate`・再選択で上書き）
- [x] ロジック実装完了（wizard: `chooseRate` / `goBackInHabits`・onboarding.ts: `setHabitRate`）
- [ ] 実ブラウザ確認（AC#14・browser-verifier 残タスク）

### C-S7: 上部4KPIライブ累計が per-day×達成率×horizon（新単位）で加算（0/0.3/0.7/1.0）
- [x] テスト実装完了（diagnosis-v3.test.ts: `kpiRawValue` / `computeDiagnosisV3` 各達成率）
- [x] ロジック実装完了（wizard: `liveResult` = `computeDiagnosisV3(buildDiagnosisSelections)`）

### C-S8: 各習慣画面に個別インパクト（達成率100%・未来分の4KPI）を表示
- [x] テスト実装完了（diagnosis-v3.test.ts: `habitPotentialV3`）
- [x] ロジック実装完了（wizard: `HabitImpactBox` = `habitPotentialV3`）

### C-S9: [4] は未来のみ単一表示・新単位、過去/未来二段＋「いつから」入力がコードから削除
- [x] テスト実装完了（onboarding-messages.test.ts: 二段構え廃止キー不在／logic: 旧関数削除）
- [x] ロジック実装完了（wizard [4] 単一表示・lifetime-impact.ts 削除・onboarding.ts 過去系削除）

### C-S10: 完了時 達成率100%→established(established_since=null) / 30・70%→active / 0%→作成しない
- [x] テスト実装完了（onboarding-write.test.ts: 達成率→status 変換・established_since 未指定）
- [x] ロジック実装完了（onboarding.ts: `rateToHabitStatus` / `runOnboardingWrite`）

### C-S11: 全習慣0%でも完了でき、habit 0件・[4]は0表示
- [x] テスト実装完了（onboarding-write.test.ts 全0%・diagnosis-v3.test.ts 全0%は0表示）
- [x] ロジック実装完了（`canAdvanceFromHabits` ゲート廃止・runOnboardingWrite は0件許容）

### C-S12: KPI ラベル「稼ぐ能力」不在・「増える収入」に置換（ja/en パリティ）
- [x] テスト実装完了（onboarding-messages.test.ts: earning name＝増える収入・旧ラベル不在）
- [x] ロジック実装完了（change-A で完了・本 change で維持。`grep 稼ぐ能力 src/` = 0）

### C-S13: 15本の articleIds が互いに重複しない（二重計上なし）
- [x] テスト実装完了（onboarding-logic.test.ts: `15習慣の articleId 重複なし`）
- [x] ロジック実装完了（ONBOARDING_V3_PRESET_IDS の15本で保証）

### C-S14: 実ブラウザで [0]→[5]→ホーム を完走し DB 書き込みを確認
- [x] テスト実装完了（代替: onboarding-write.test.ts で書き込みペイロードをアサート — NOTE-3）
- [ ] 実ブラウザ確認（AC#14・browser-verifier 残タスク。ログイン済みブラウザ＋Supabase dev 前提）
