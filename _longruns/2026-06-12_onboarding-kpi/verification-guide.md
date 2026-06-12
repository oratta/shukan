# Verification Guide

## 環境
- URL: http://localhost:3000（ポート使用中なら dev-server ルールに従い空きポート）
- 起動: `npm run dev`
- テスト: `npm run test:run`（Vitest）/ 型チェック＋ビルド: `npm run build`
- 権威ソースは各 change の spec.md。本ファイルはその派生ビュー＋進捗トラッカー。

## change-A: kpi-data-foundation

### A-S1: 複数エビデンスのデイリーインパクト計算（4KPI）
- WHEN: 習慣に複数のエビデンス（weight付き）が紐付いた状態で計算を実行する
- THEN: デイリーインパクト = Σ(article.dailyX × weight / 100) で、4KPI（健康寿命分・前向きな気持ちの時間分・出費削減円・稼ぐ能力円）が計算される
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### A-S2: 累積インパクトに positiveMoodMinutes が含まれる
- WHEN: 習慣の累積インパクトを計算する
- THEN: completedDays × デイリーで累積され、LifeImpactSavings に positiveMoodMinutes が含まれる（completed/rocket_used のみカウント）
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### A-S3: エビデンス0件・存在しないarticleIdへの耐性
- WHEN: エビデンス0件、または articleId 不明のエビデンスで計算する
- THEN: impactSavings は undefined / 不明エビデンスはスキップされエラーにならない
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### A-S4: 既存3軸の計算結果の不変
- WHEN: 既存テスト（impact.test.ts / calculation-logic.test.ts）を実行する
- THEN: 既存3軸の期待値を一切変更せず全テスト PASS
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### A-S5: calculateTotalSavings の positiveMoodMinutes 総和
- WHEN: positiveMood 値あり・なし混在の複数習慣で合計を計算する
- THEN: 合計 positiveMoodMinutes は各習慣の総和。0（未設定）記事のみの習慣の寄与は 0 でエラーなし
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### A-S6: 全35記事の型適合（dailyPositiveMoodMinutes）
- WHEN: `npm run build`（型チェック）を実行する
- THEN: 全35記事が dailyPositiveMoodMinutes を持ち型エラーなし（未設定記事は 0 を明示）
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### A-S7: 代表記事の値と算出根拠
- WHEN: ユニットテストで代表記事の calculationParams / calculationLogic を検証する
- THEN: 10記事程度で dailyPositiveMoodMinutes > 0、全件に calculationLogic.positiveMood（固定前提16h/50%の根拠付き）が設定されている
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### A-S8: renderArticle の出力不変
- WHEN: positiveMood 値を設定した記事で renderArticle を実行する
- THEN: 出力は従来の4プレースホルダー置換のみ。positiveMood の段落は挿入されない
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### A-S9: KPI定義カタログ4件（確定文言）
- WHEN: カタログを import して全定義を検証する
- THEN: health_lifespan「健康寿命/分/長く健康でいられる自分へ」、positive_mood「前向きな気持ちの時間/分/前向きな気持ちで過ごせる自分へ」、cost_saving「出費削減/円/お金で諦めない自分へ」、earning「稼ぐ能力/円/稼ぐ力のある自分へ」。キー引き当て関数は未知キーで undefined
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了（ブラウザ間接確認: オンボーディング画面[1]で4KPIカードが確定文言どおり表示）
- [ ] ユーザー確認完了

### A-S10: 習慣プリセット（各KPI 3〜5個・参照妥当性）
- WHEN: 各KPIキーで primaryKpis フィルタし、全プリセットの articleIds / primaryKpis を検証する
- THEN: 4KPIすべてに3〜5個。articleIds は登録済み35記事のID、primaryKpis は4キーのいずれか。空配列なし
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了（ブラウザ間接確認: cost_saving 選択時に画面[3]で当該KPIのプリセット5件のみ表示）
- [ ] ユーザー確認完了

### A-S11: 平均余命表・平均年収表の引き当てとフォールバック
- WHEN: 引き当て関数を（42, 'male'）／範囲外年齢／gender 'other' で呼ぶ
- THEN: 40〜44ブラケット×男性の値が返る。範囲外は最近傍ブラケット、性別未指定は男女平均でエラーなし。出典・参照年がコメントに明記
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

## change-B: user-profiles-db

### B-S1: プロフィールの upsert（新規・更新・年収NULL）
- WHEN: upsertUserProfile を新規/既存/annualIncome:null で呼ぶ
- THEN: 1ユーザー1行で作成・更新され camelCase で返る。派生値カラムは存在しない。年収NULLでも保存できる
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了（ブラウザ間接確認: オンボーディング完了で user_profiles 1行作成、annual_income=null 保存・派生値カラムなしを Management API で確認）
- [ ] ユーザー確認完了

### B-S2: gender の CHECK 制約
- WHEN: gender に許可外の値で insert を試みる
- THEN: CHECK 制約違反でエラーになり行は保存されない
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### B-S3: fetchUserProfile（camelCase / 未作成は null）
- WHEN: 作成済み／未作成ユーザーで fetchUserProfile を呼ぶ
- THEN: 作成済みは camelCase オブジェクト（trackedKpis は選択順の string 配列）、未作成はエラーなしで null
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### B-S4: 派生値計算（age / remainingLifeExpectancy / dailyWage / remainingWorkingYears）
- WHEN: birthYear/gender/country/annualIncome 入りプロフィールで派生値計算を呼ぶ
- THEN: age=現在年−birthYear、余命は平均余命表から、dailyWage=年収÷労働日数、残労働=退職年齢−age（65歳以上は 0）
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### B-S5: 年収未入力時の平均年収フォールバック
- WHEN: annualIncome:null のプロフィールで日給計算を呼ぶ
- THEN: 平均年収表（age×gender）から引いた値÷労働日数で dailyWage が算出され、NaN にならない
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### B-S6: プロフィール null 時の V2_DEFAULT_PROFILE フォールバック
- WHEN: プロフィール null で派生値解決関数を呼ぶ
- THEN: V2_DEFAULT_PROFILE 相当（42歳・男性・年収1500万・日給62,500・余命40年・残労働23年）の派生値が返る
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### B-S7: RLS 本人限定（select/insert/update のみ、delete 拒否）
- WHEN: 本人セッションで自分の行を読み書き／他人の行を select・insert・update／自分の行を delete する
- THEN: 本人は成功、他人の行は 0 行・拒否、delete はポリシーなしで拒否（user_settings と同型）
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

## change-C: onboarding-flow

### C-S1: 未作成ユーザーのホーム→/onboarding リダイレクト
- WHEN: user_profiles 未作成のログイン済みユーザーがホーム（/）を開く
- THEN: /onboarding にリダイレクトされ画面[1]「どんな自分に切り替えますか？」が表示される
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了（ホーム/→/onboarding リダイレクト、画面[1]表示を確認）
- [ ] ユーザー確認完了

### C-S2: 未作成ユーザーの他保護ページ→/onboarding
- WHEN: 未作成ユーザーが /discover や /settings を開く
- THEN: /onboarding にリダイレクトされる
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了（/discover・/settings いずれも /onboarding へリダイレクト）
- [ ] ユーザー確認完了

### C-S3: 作成済みユーザーの /onboarding→ホーム
- WHEN: 作成済みユーザーが /onboarding を URL 直打ちで開く
- THEN: ホーム（/）にリダイレクトされる
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了（プロフィール作成済みで /onboarding 直打ち→ホームへリダイレクト）
- [ ] ユーザー確認完了

### C-S4: 未ログインユーザーの /onboarding→/login
- WHEN: 未ログインで /onboarding を開く
- THEN: /login にリダイレクトされる
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了（未認証 HTTP リクエストで /onboarding→307 /login を確認）
- [ ] ユーザー確認完了

### C-S5: ステッププログレスが進む
- WHEN: 画面[1]でKPIカードを選び「次へ」を押す
- THEN: 画面[2]が表示され、上部プログレスが4ステップ中2番目を示す
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了（「ステップ 2/4」表示・プログレスバー前進を確認）
- [ ] ユーザー確認完了

### C-S6: 画面[1] 4枚のKPIカードが確定文言で表示
- WHEN: 画面[1]を開く
- THEN: タイトル・サブタイトル・4カードの見出し（長く健康でいられる自分へ／前向きな気持ちで過ごせる自分へ／お金で諦めない自分へ／稼ぐ力のある自分へ）・KPI名・説明文・補足が確定文言どおり表示される
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了（ja で4カードの見出し・KPI名・説明文・補足が確定文言どおり表示）
- [ ] ユーザー確認完了

### C-S7: 画面[1] 単一選択（選び直しで切り替え・未選択は次へ無効）
- WHEN: カードを選択／別カードをタップ／未選択で「次へ」を試す
- THEN: 選択は常に1枚のみ。選択で次へ進め、未選択時は「次へ」が disabled
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了（カード切替で常に1枚選択・未選択時「次へ」disabled を確認）
- [ ] ユーザー確認完了

### C-S8: 画面[2] フォーム表示（国デフォルト日本・年収注記）
- WHEN: 画面[2]を開く
- THEN: タイトル「あなたの数字で計算します」、4項目表示、国は「日本」初期選択、年収欄に「未入力の場合は、年齢・性別・国の平均年収を使って計算します」の注記
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了（ja でタイトル・4項目・国=日本初期選択・年収注記を確認）
- [ ] ユーザー確認完了

### C-S9: 画面[2] 年収未入力でも進める／必須未入力・不正値は進めない
- WHEN: 年齢・性別・国のみ入力で「次へ」／必須未入力や年齢に不正値（負・200等）で試す
- THEN: 年収空欄でも[3]へ進む。必須未入力・不正値では「次へ」無効で[2]に留まる
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了（年齢200・-5で「次へ」disabled、年齢42＋性別＋年収空欄で enabled→[3]進行を確認）
- [ ] ユーザー確認完了

### C-S10: 画面[3] 選んだKPIのプリセットのみ表示
- WHEN: [1]で「お金で諦めない自分へ」を選び[3]まで進む
- THEN: タイトル「「お金で諦めない自分へ」に効く習慣」、cost_saving 向けプリセットのみ表示、各カードに1回あたりの効果表示
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了（cost_saving プリセット5件のみ表示・各カードに「1回ごとに 出費削減 −X円」を確認）
- [ ] ユーザー確認完了

### C-S11: 画面[3] 1つ以上選択でボタン有効（複数可・未選択は無効）
- WHEN: 習慣カードを0枚／1枚／2枚以上選択する
- THEN: 0枚では「この習慣ではじめる」disabled。1枚以上で有効になり[4]へ。複数選択分はすべて[4]のリストに表示
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了（0枚で disabled、2枚選択で enabled→[4]に両方表示を確認）
- [ ] ユーザー確認完了

### C-S12: 画面[4] 選んだKPI（現在値0）と習慣リスト表示
- WHEN: [3]から[4]に到達する
- THEN: タイトル「準備ができました」、本文にKPI名差し込み、KPIが現在値 0 で表示、選んだ習慣リスト表示
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了（「準備ができました」・本文に「出費削減」差し込み・現在値0円・選んだ習慣リスト表示を確認）
- [ ] ユーザー確認完了

### C-S13: はじめる押下で一括書き込み→ホーム遷移
- WHEN: [4]で「はじめる」を押す
- THEN: ホームへ遷移し選んだ習慣が表示される。Supabase に user_profiles 1行（tracked_kpis=選んだKPI）・habits（プリセット分）・habit_evidences（articleIds 分）が作成されている
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了（はじめる→ホーム遷移・習慣表示、DB に user_profiles[tracked_kpis=cost_saving]・habits 2件・habit_evidences 3件作成を Management API で確認）
- [ ] ユーザー確認完了

### C-S14: 書き込み失敗時のエラー表示と再試行
- WHEN: [4]で「はじめる」押下時に書き込みが失敗する
- THEN: [4]に留まりエラーメッセージ表示、「はじめる」再押下で再試行できる
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了（fetch インターセプタで書き込み失敗を注入→[4]で「保存に失敗しました。もう一度お試しください。」表示、解除後の再押下でホーム遷移・1セッション分の重複なし書き込みを確認）
- [ ] ユーザー確認完了

### C-S15: 完了後は /onboarding に戻れない
- WHEN: 完了済みユーザーが再度 /onboarding を開く
- THEN: ホームにリダイレクトされる
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了（完了済みユーザーが /onboarding 再アクセス→ホームへリダイレクト。C-S3 と同一挙動）
- [ ] ユーザー確認完了

### C-S16: 途中離脱は最初からやり直し
- WHEN: [3]まで進んだ状態でリロード／再アクセスする
- THEN: /onboarding の画面[1]が初期状態（未選択）で表示され、途中入力は復元されない
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了（画面[3]までの状態でリロード→画面[1]・全カード未選択で再表示を確認）
- [ ] ユーザー確認完了

### C-S17: ja ロケールで確定文言表示
- WHEN: ja ロケールで4画面を順に進む
- THEN: 全画面のタイトル・サブタイトル・カードコピー・注記・ボタンラベルが確定文言どおり
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了（ja で[1]〜[4]全画面のタイトル・サブタイトル・カードコピー・注記・ボタン（次へ/この習慣ではじめる/はじめる）が確定文言どおり表示）
- [ ] ユーザー確認完了

### C-S18: en ロケールで翻訳文言表示
- WHEN: en ロケールで4画面を順に進む
- THEN: 全文言が英語で表示され、生キー表示がない
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了 ← **修正済み（7069059）／再ブラウザ検証 PASS（2026-06-12）**: en で[1]〜[4]を通し確認。画面[3]タイトルのKPIコピー（"Toward a self that never gives up because of money"）・習慣カード名（"Cut out the bad stuff"/"Save every day"/"Stop impulse buying"/"Cook at home"/"Quit drinking"）・効果ラベル（"Cost saving −1,300 yen each time"）・画面[4]本文（'...your "Cost saving" begins to build up.'）・KPI名/単位（"Cost saving" / "0 yen"）がすべて英語表示。生キー・日本語混在なし。en 経由でも DB の habit.name は日本語確定名（「体に悪いものを減らす」「毎日の節約」）で保存＝D-C4 を Management API で確認。ja（C-S17）も[1]〜[4]再確認しリグレッションなし。【初回FAIL記録】当初は画面[3]/[4]が i18n キーでなく静的カタログ生文字列（selectedKpiDef.headline/.name、presetPerTimeEffect の def.name）を直接描画し en でも日本語のままだった
- [ ] ユーザー確認完了
