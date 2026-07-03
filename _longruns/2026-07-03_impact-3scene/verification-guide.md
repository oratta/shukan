# Verification Guide: 2026-07-03_impact-3scene

> Review フェーズの成果物が本 run ディレクトリに未生成だったため、builder が
> plan.md の受け入れ条件から change 単位の検証 Scenario を起こして追跡する。
> 各 change の builder が担当 Scenario を進捗に応じて [x] 化する。

## change-1: kpi-label-unification

### Scenario 1-1: ja の KPI ラベルが正式名に統一されている（受け入れ条件 #5）
- WHEN: アプリの ja ロケールで impact / evidence のラベル定義を参照する
- THEN: `impact.dailyCost`=「出費削減」、`impact.dailyIncome`=「増える収入」、`evidence.feedbackCost`=「出費削減の算出根拠」、`evidence.feedbackIncome`=「増える収入の算出根拠」であり、旧ラベル「コスト削減」「収入増加」が残存しない
- [x] テスト実装完了
- [x] ロジック実装完了

### Scenario 1-2: ja の impact.fiveDaysImpact が日本語化されている（受け入れ条件 #5）
- WHEN: ja ロケールで `impact.fiveDaysImpact` を参照する
- THEN: 英語（ASCII 英字）が残存せず、日本語表記（「5日間のインパクト」）になっている
- [x] テスト実装完了
- [x] ロジック実装完了

### Scenario 1-3: en の impact.* KPI 名が正準 onboarding.kpi.*.name と一致（受け入れ条件 #6）
- WHEN: en ロケールで `impact.dailyHealth/dailyCost/dailyIncome` を参照する
- THEN: それぞれ `onboarding.kpi.health_lifespan.name`（Healthy lifespan）/ `cost_saving.name`（Cost saving）/ `earning.name`（Income Growth）と一致し、旧名（Health / Cost Savings / Income Gain）が残存しない
- [x] テスト実装完了
- [x] ロジック実装完了

### Scenario 1-4: LP の alt テキストが正準 4 KPI 名で統一されている
- WHEN: `Process.tsx` / `Detail.tsx` の iPhone スクショ alt を参照する
- THEN: 旧軸名（生涯コスト / 可処分時間 / 集中時間）が残存せず、4 つの正式 KPI 名（健康寿命 / 出費削減 / 増える収入 / 前向きな気持ちの時間）で記述されている
- [x] テスト実装完了
- [x] ロジック実装完了

## change-2: onboarding-future-contrast

### Scenario 2-1: オンボ[4]で現在達成率の未来値と100%時の値の両方が表示される（受け入れ条件 #7）
- WHEN: オンボ[4]結果画面を表示する
- THEN: 各 KPI について「今のペースなら」（現在の達成率）と「全部100%身についたら」（達成率=1）の2値が対比表示され、後者は `computeDiagnosisV3` に達成率=1 の selections を渡した計算結果（`buildFullPotentialSelections`）と一致する
- [x] テスト実装完了
- [x] ロジック実装完了

### Scenario 2-2: [4]→[5] の導線文言が KPI 選択（重視したいこと）へ誘導する（タスク B）
- WHEN: オンボ[4]の CTA を参照する
- THEN: CTA が「習慣を選びに進む」ではなく、次画面[5]の「何を大切にしたいか（KPI 選択）」へ自然に誘導する文言（ja「大切にしたいことを選ぶ」/ en「Choose what matters most」）になっている
- [x] テスト実装完了
- [x] ロジック実装完了

## change-3: mood-axis-display

### Scenario 3-1: 4軸目「前向きな気持ちの時間」の impact.* ラベルが正準名で追加されている（change-3 rule）
- WHEN: ja/en ロケールで `impact.dailyPositiveMood` を参照する
- THEN: ja=「前向きな気持ちの時間」（`onboarding.kpi.positive_mood.name` と一致）、en=`onboarding.kpi.positive_mood.name`（Time feeling positive）と一致する
- [x] テスト実装完了
- [x] ロジック実装完了

### Scenario 3-2: 「前向きな気持ちの時間」が対象9箇所に4軸目として表示される（受け入れ条件 #8）
- WHEN: daily-impact-summary / impact-badge / savings-card / stats / discover / 記事シート2種（impact-article-sheet・evidence-article-sheet）/ evidence-picker / evidence-manager-sheet を表示する
- THEN: 各コンポーネントが `impact.dailyPositiveMood` ラベルで4軸目を描画する（値 > 0 のとき。0=未設定は非表示）
- [x] テスト実装完了
- [x] ロジック実装完了

### Scenario 3-3: 全38記事の dailyPositiveMoodMinutes が精査済み（受け入れ条件 #9）
- WHEN: 各記事ファイルの `dailyPositiveMoodMinutes` を参照する
- THEN: 値 > 0 の記事（代表12本）は `inferences.positiveMood` と `calculationLogic.positiveMood`（固定前提16h/50%の根拠）を持ち、値 0 の記事は 0 のままにした理由（二重計上回避）をコード内コメントで明記している
- [x] テスト実装完了
- [x] ロジック実装完了

## change-4: three-scene-habit-display

### Scenario 4-1: established 習慣がデイリーチェックリストから外れ「身についた習慣」セクションに生涯効果付きで表示される（受け入れ条件 #10）
- WHEN: status=established の習慣を持つユーザーがホームを表示する
- THEN: その習慣はデイリーチェックリスト（active のみ）に現れず、ホーム下部の「身についた習慣」セクション（チェックボックスなし）に「この習慣が残りの人生であなたにもたらすこと」の生涯効果（4KPI）付きで表示される
- [x] テスト実装完了
- [x] ロジック実装完了

### Scenario 4-2: established 習慣が stats のデイリー完了率の分母・ストリーク計算に含まれない（受け入れ条件 #10-b）
- WHEN: active と established が混在する状態で stats を表示する / `getHabitsWithStats` の結果を `isDailyTrackedHabit` でフィルタする
- THEN: established 習慣は完了率平均の分母・ストリーク集計に含まれない（`habits.test.ts` の "established habit exclusion from daily metrics" で固定）
- [x] テスト実装完了
- [x] ロジック実装完了

### Scenario 4-3: 習慣編集フォームから status を established に変更でき、ホーム表示が切り替わる（受け入れ条件 #11）
- WHEN: 習慣編集フォームの「完全に身についた」トグルを ON にして保存する
- THEN: `onSubmit` に `status: 'established'` が渡り DB に保存され、ホームのデイリーチェックリストから外れて「身についた習慣」セクションへ移動する
- [x] テスト実装完了
- [x] ロジック実装完了

## change-5: profile-app-connection

### Scenario 5-1: ホームに tracked_kpis の KPI が表示される（受け入れ条件 #12）
- WHEN: ユーザーがホームを表示する（プロフィールの tracked_kpis を持つ）
- THEN: `resolveTrackedKpiDefinitions` が tracked_kpis を KPI カタログ順の定義に解決し（不正キー除外・未設定は全4 KPI フォールバック）、`TrackedKpisCard` がホーム上部にその KPI 名を描画する
- [x] テスト実装完了
- [x] ロジック実装完了

### Scenario 5-2: 設定画面でプロフィールを編集・保存でき user_profiles に反映される（受け入れ条件 #13）
- WHEN: 設定画面のプロフィール編集で生年・性別・収入・KPI 選択を変更し保存する
- THEN: `validateProfileSettingsInput` で妥当性を確認し、`buildUserProfileInput` が upsert 入力（country=JP / currency=JPY）を組み立て、`useProfile.save` → `upsertUserProfile` で `user_profiles` に反映される（update RLS ポリシーは既存 migration に存在）
- [x] テスト実装完了
- [x] ロジック実装完了

### Scenario 5-3: established の生涯効果が resolveDerivedProfileValues で個人化される（受け入れ条件 #14）
- WHEN: プロフィールを持つ／持たないユーザーがホームの「身についた習慣」セクションを表示する
- THEN: ホームが `useProfile` の profile を `EstablishedSection` に渡し、`computeHabitLifetimeEffect(perDay, profile)` が余命（remainingLifeExpectancy）で health_lifespan を個人化する。プロフィール未設定時は V2 既定値（残り寿命40年）でフォールバックしエラーにしない
- [x] テスト実装完了
- [x] ロジック実装完了
