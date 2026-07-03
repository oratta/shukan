# Tasks: change-1 kpi-label-unification

> Review フェーズの OpenSpec 成果物（tasks.md）が本 run ディレクトリに未生成だったため、
> builder が plan.md change-1 スコープから TDD 用タスクを起こして追跡する。

## change-1: kpi-label-unification

- [x] T1: KPI ラベル統一の失敗テストを作成（`src/__tests__/kpi-label-unification.test.ts`）
- [x] T2: ja.json `impact.dailyCost`→「出費削減」/ `impact.dailyIncome`→「増える収入」
- [x] T3: ja.json `evidence.feedbackCost`→「出費削減の算出根拠」/ `evidence.feedbackIncome`→「増える収入の算出根拠」
- [x] T4: ja.json `impact.fiveDaysImpact` 日本語化（「5日間のインパクト」）
- [x] T5: en.json `impact.dailyHealth/dailyCost/dailyIncome` を正準 `onboarding.kpi.*.name`（Healthy lifespan / Cost saving / Income Growth）に統一
- [x] T6: en.json `evidence.feedbackHealth/Cost/Income` も正準 KPI 名に統一（D-change1-1）
- [x] T7: LP alt テキスト更新（`Process.tsx` / `Detail.tsx` の旧軸名→正準 4 KPI 名。D-change1-2）
- [x] T8: 全テストスイート PASS（`npm run test:run`）・型チェック・lint・build 確認

## change-2: onboarding-future-contrast

- [x] T1: 対比ロジック・文言の失敗テストを作成（`src/__tests__/onboarding-future-contrast.test.ts`）
- [x] T2: `buildFullPotentialSelections`（回答済み習慣を達成率=1 に置換）を `src/lib/onboarding.ts` に追加
- [x] T3: ja/en `result.currentLabel`・`result.fullLabel` を追加、`result.lead`/`result.cta` を対比＋[5]導線に調整
- [x] T4: `onboarding-wizard.tsx` [4] 結果画面を「現在ペース vs 全部100%」の対比表示に改修（`fullResult` を追加）
- [x] T5: `onboarding-messages.test.ts` の cta 期待値を新文言に更新
- [x] T6: 全テストスイート PASS（`npm run test:run`）・型チェック・build 確認

## change-3: mood-axis-display

- [x] T1: 4軸目表示・ラベル・記事精査の失敗テストを作成（`src/__tests__/mood-axis-display.test.ts`）
- [x] T2: `impact.dailyPositiveMood` ラベルを ja/en に追加（正準 `onboarding.kpi.positive_mood.name` と一致）
- [x] T3: 4軸目「前向きな気持ちの時間」を対象9箇所に表示（daily-impact-summary / impact-badge / savings-card / stats / discover / impact-article-sheet / evidence-article-sheet / evidence-picker / evidence-manager-sheet。値 > 0 のときのみ描画）
- [x] T4: 値 0 の26記事に 0 据え置き理由（二重計上回避）のコード内コメントを付与（marker `positiveMood 0:`）
- [x] T5: 全テストスイート PASS（`npm run test:run` 706件）・型チェック（tsc）・lint・build 確認

## change-4: three-scene-habit-display

- [x] T1: 3場面分類・生涯効果計算の失敗テストを作成（`src/__tests__/three-scene-habit-display.test.ts`）＋ `habits.test.ts` に established 除外ケース追加（受け入れ条件 #10-b）
- [x] T2: `isDailyTrackedHabit` / `isEstablishedHabit` 純粋述語を `src/lib/habits.ts` に追加（established をデイリー系指標から除外）
- [x] T3: `computeHabitLifetimeEffect`（習慣の per-day 効果 → 4KPI 生涯値、達成率=1・profile 未設定は既定値フォールバック）を `src/lib/diagnosis-v3.ts` に追加
- [x] T4: 「身についた習慣」セクション（`EstablishedSection`・チェックボックスなし・生涯効果表示）を新規作成しホーム下部に配置。デイリーチェックリスト・PWA day-status・DailyImpactSummary は active のみ
- [x] T5: stats ページの完了率平均・ストリーク集計から established を除外
- [x] T6: 習慣編集フォームに status 手動設定トグル（「完全に身についた」）を追加し `onSubmit` で status を渡す
- [x] T7: ja/en メッセージに established セクション見出し・生涯効果見出し・フォームトグルのラベルを追加
- [x] T8: 全テストスイート PASS（`npm run test:run`）・型チェック（tsc）・lint・build 確認

## change-5: profile-app-connection

- [x] T1: プロフィール接続の失敗テストを作成（`src/__tests__/profile-app-connection.test.ts`）
- [x] T2: `src/lib/profile-settings.ts` 純粋関数（`resolveTrackedKpiDefinitions` / `validateProfileSettingsInput` / `userProfileToSettingsInput` / `buildUserProfileInput` / `toggleTrackedKpi`）を追加。tracked_kpis 未設定は全4 KPI フォールバック
- [x] T3: `useProfile` フック（`fetchUserProfile` 読み出し＋`upsertUserProfile` 保存）を追加
- [x] T4: `TrackedKpisCard`（ホーム上部・tracked_kpis 表示）を追加しホームに配置（AC#12）
- [x] T5: `ProfileEditor`（設定画面・生年/性別/収入/KPI 選択・オンボ入力パターン踏襲）を追加し設定画面に配置（AC#13）
- [x] T6: ホームから `profile` を `EstablishedSection` に接続し established 生涯効果を個人化（AC#14。未設定は既定値フォールバック）
- [x] T7: ja/en メッセージに tracked KPIs カード見出し・設定プロフィール編集セクションのラベルを追加
- [x] T8: 全テストスイート PASS（`npm run test:run`）・型チェック（tsc）・lint・build 確認
