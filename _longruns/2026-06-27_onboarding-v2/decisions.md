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

## 2026-06-27 change-B: lifetime-impact-calc 実装の設計判断

### D-B1: 計算 API の入力はプリセットID + established_since（Habit オブジェクトではない）
- 問題: 合算計算の入力を「保存済み Habit[]」にするか「選択中のプリセットID群」にするか。
- 決定: `computeLifetimeImpact({ activePresetIds, establishedHabits:{presetId,establishedSince}[], profile, now? })`。
  per-time 効果は plan 指定どおり `presetPerTimeEffectValue(presetId, kpi)` で引く。onboarding [4] は
  保存前（プリセット選択状態）に結果を見せるため、Habit 保存に依存しないプリセットID入力が自然。
- 根拠: plan「建材は presetPerTimeEffectValue」。保存前計算でき、change-C が選択状態をそのまま渡せる。

### D-B2: elapsedYears は小数（整数 floor しない）／ユリウス年で算出
- 問題: 経過年を整数年に丸めるか小数のままにするか。整数 floor だと established 半年は past=0 になり過小。
- 決定: `elapsedYearsSince = max(0, (now - establishedSince) / (365.25日))` の小数を採用。未来日/不正日付は 0。
  health は ×365、money は ×240 を小数経過年に乗じる（未来 horizon と対称）。
- 根拠: 「もう積んできた」を過小評価しないため小数が適切。境界（未来日/0年/長期）は D7 のとおりユニット固定。

### D-B3: 推定フラグは結果トップレベルの pastIsEstimated（established 有無）
- 問題: 「推定」明示用フラグを per-KPI に持つか結果単位で持つか。
- 決定: `LifetimeImpactResult.pastIsEstimated = establishedHabits.length > 0`。過去ブロックは [4] で一括表示の
  単位（既存習慣ありのみ表示）なので結果単位フラグで十分（YAGNI）。
- 根拠: 可逆かつ最小。UI（change-C）は過去ブロック全体の「推定」表示にこのフラグを使える。

### D-A3: `supabase db push` は実行保留（既存の履歴乖離のため）
- 問題: dev（xhqddzdpcpvxpprxykct）への `db push --dry-run` で「Remote migration versions not found in
  local migrations directory」エラー。remote に 20260612000000 / 20260612000100 / 20260612000200 が存在するが
  local worktree の migrations には無い（本 change と無関係の既存乖離）。
- 決定: `migration repair` / `db pull` は共有 dev DB の履歴を書き換える破壊的操作のため builder では実行しない。
  マイグレーション SQL は `add column if not exists` で冪等・非破壊。実 push は履歴整合後にユーザー or 統合フェーズで行う。
- 根拠: 意思決定ガイドライン「DB は後方互換厳守・共有状態を壊さない」。冪等 SQL なので後追い push は安全。

## 2026-06-27 change-C: onboarding-v2-flow 実装の設計判断

### D-C4: v1 onboarding モジュール/テストを v2 に作り替え（KPI 選択ステップ撤去）
- 問題: plan は「v1 wizard を v2 6画面に作り替え」。v1 の `src/lib/onboarding.ts`（WizardState step1-4 /
  selectedKpi / presetsForKpi / 単一 selectedKpi の OnboardingWriteInput）と対応テストが v2 と非互換。
- 決定: onboarding モジュールを v2 にフル置換。WizardState を `step:0..5 / profile / established[] / activePresetIds`
  に再定義し、KPI 選択を撤去（[4] は4軸同列・D5 で trackedKpis=全 KpiKey）。[2] は全プリセットカタログ提示（D6）。
  `presetPerTimeEffectValue`（lifetime-impact が参照）は API を変えず維持。v1 専用テスト（onboarding-logic /
  onboarding-write / onboarding-messages）は v2 仕様で書き直す。redirect-guard（onboarding-redirect.test.ts）は
  v2 でも不変なので変更しない。
- 根拠: 唯一の非テスト consumer は wizard 本体（同時に作り替え）と lifetime-impact（`presetPerTimeEffectValue`
  のみ・維持）。可逆かつ blast radius 最小。plan の「単一 selectedKpi 前提は撤去 or 配列化」に従う。

### D-C5: Playwright E2E は本環境で自動実行不可 → [0]→[5] ロジックを node Vitest で固定
- 問題: AC#10 は [0]→[5] 通し完走を E2E（Playwright）で要求するが、本リポの Playwright（`e2e-verify.spec.ts`）は
  Google OAuth + 稼働サーバを前提とし、builder 環境（認証なし・サーバ起動不可）では自動実行できない。
- 決定: v1 と同方針（D-C1/D-C2）で、UI はロジック（onboarding.ts）を消費するだけにし、[0]→[5] の核（state 遷移・
  セクションA/B 相互排他・診断ゲート・結果ブロック表示・保存オーケストレーション）を node 環境 Vitest で固定する。
  実ブラウザ通しは change-C verifier（sonnet）スコープで担う（checkpoint のモデル割当どおり）。
- 根拠: 意思決定ガイドライン「正しさ優先」。テスト可能な核を純粋関数に寄せ回帰に強くする。可逆（後で Playwright
  を足せる）。component 自体は build（next build）＋ lint で静的健全性を担保。

### D-C6: 結果は保存前にプリセット選択状態から算出（established_since は年数→日付変換）
- 問題: [4] 結果は habits 保存前（プリセット選択状態）に見せる。established の過去累積には開始日が要る。
- 決定: `buildLifetimeImpactInput(state)` が active=future・established=past 母集団に振り分け、
  `profileInputToUserProfile` で入力プロフィールを計算用 UserProfile に変換、`computeLifetimeImpact`（D-B1 の
  プリセットID入力形）で算出する。「いつから」は `yearsAgoToEstablishedSince(yearsAgo)`（年数→YYYY-MM-DD・
  負値は0年クランプ）で日付化し、保存時も同関数を再利用して [4] 表示と保存値を一致させる。
- 根拠: 保存に依存しない計算入力で [4] を描け、表示と DB 書き込みの過去 horizon が同一根拠になる（不整合防止）。

## 2026-06-27 verify round 1 fix: 品質ゲート（lint/tsc）と a11y 修正

### D-V1: pre-existing lint エラー 9 件を抑制/改名で解消（新規コードは 0 エラー）
- 問題: `npm run lint` が exit:1（9 errors）。内訳は react-hooks/set-state-in-effect 7件・
  react-hooks/preserve-manual-memoization 1件・react-hooks/rules-of-hooks 1件。すべて change-A/B/C 投入前から
  onboarding-data-setup ブランチに存在する pre-existing エラー（新規 onboarding/lifetime-impact コードは 0 エラー）。
  だが verify は lint 全体 exit:0 を要求するため放置不可。
- 決定:
  (1) rules-of-hooks（useHabits.ts:203）= `useRocketOnDate` を `redeemRocketOnDate` に改名。`use` 接頭辞を
      ESLint が React Hook と誤判定していたため。CRUD 関数（src/lib/supabase/habits.ts）・呼び出し側を一括改名。
  (2) set-state-in-effect 7件 = いずれも「マウント時1回 / open 時リセット / 状態遷移トリガ」の意図的パターン。
      `// eslint-disable-next-line react-hooks/set-state-in-effect -- <理由>` で局所抑制。
  (3) preserve-manual-memoization 1件（impact-article-sheet.tsx）= getArticle は純粋静的ルックアップで memo deps
      は意図的。同様に局所 disable。
- 根拠: 機能変更ゼロで可逆。改名は副作用が機能でなく命名のみ（hook 判定回避が目的）。disable は理由コメント付きで
  局所最小。pre-existing を本 longrun の品質ゲートで解消するのが YAGNI かつ blast radius 最小。

### D-V2: pre-existing tsc エラー 9 件をテスト型修正で解消
- 問題: `npx tsc --noEmit` が 9 errors。habits.test.ts/impact.test.ts の makeCompletion ヘルパーが
  HabitCompletion に存在しない `id` を指定（completedAt 欠落）、habits.test.ts のインライン Habit リテラルが
  存在しない `userId` を指定し必須 `status`/`icon`/`dailyTarget` を欠落、middleware.test.ts が読み取り専用
  `NODE_ENV` への代入と spread 引数型不一致。
- 決定: makeCompletion から `id` を除去し必須 `completedAt` を補完。Habit リテラルから `userId` を除去し
  `status:'active'`/`icon`/`dailyTarget` を補完（型と一致）。NODE_ENV は `(process.env as { NODE_ENV?: string })`
  キャストで代入、createServerClient mock は呼び出しを関数型キャストして spread を許容。
- 根拠: テストの型を実型（types/habit.ts）に正しく追従させるだけの修正で、振る舞い・アサーションは不変。359 tests 全 PASS 維持。

### D-V3: [2] 画面「いつから？」年数 input に label 紐付け（a11y）
- 問題: onboarding-wizard.tsx の established プリセットの年数 input が `<label>` と htmlFor/id で紐付いておらず、
  スクリーンリーダーが入力欄の用途を読み上げられない。
- 決定: input に `id={`since-${preset.id}`}` を付与し、隣接 label を `<label htmlFor={`since-${preset.id}`}>` に変更。
  preset.id でユニークな id を保証（複数 established 行でも衝突しない）。
- 根拠: WCAG ラベル紐付けの最小修正。可逆・副作用なし。

### D-V4: supabase db push（status/established_since 実 DB 適用）は履歴整合後に保留（D-A3 踏襲）
- 問題: status/established_since 列は SQL 定義済みだが dev DB との migration 履歴乖離のため db push 未実施。
  AC#5/AC#6 は純粋関数テストで検証済みだが実 DB 反映は未完。
- 決定: 本 verify ラウンドのスコープ（lint/tsc/a11y のコード品質修正）外。D-A3 の判断どおり、履歴整合後に
  ユーザーまたは統合フェーズで実 DB 適用する。コードと SQL 定義は適用可能な状態で維持。
- 根拠: builder 環境は dev DB の migration 履歴整合操作（破壊的になりうる）を自律実行すべきでない。安全側に倒す。
