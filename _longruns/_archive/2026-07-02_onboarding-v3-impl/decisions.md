# Decisions: onboarding-v3-impl

## D-exec-1: モデル割り当ての per-change 適合（2026-07-02）
plan.md のモデル割り当ては change × ロール単位だが、build-verify テンプレートの埋め込みポイントは
ロール単位の単一値（`__BUILDER_MODEL__` / `__VERIFIER_MODEL__`）のみ。以下で適合させた:

- **builder**: `CHANGES_JSON` の各エントリに `builderModel` を持たせ、生成スクリプトの Build ループで
  `change.builderModel` を参照するよう exec が生成時に調整（A='sonnet'、B/C=null=inherit）。
  モデル値はエイリアスのみ（model-tiers.md で解決済み）。モデル ID の直書きなし
- **verifier**: Verify ループは run 全体を横断検証するため change 別に切り替え不能。
  割り当て中の最上位ティア **sonnet** をグローバル採用（change-A の haiku 指定は上位互換で吸収。
  検証品質は下がらず、コストのみ僅かに増える安全側）
- **fix ラウンドの builder**（Verify FAIL 時の修正）: どの change に触れるか不定のため
  グローバル `builderModel` = null（inherit）を維持
- **reviewer**: 全 change inherit → `__REVIEWER_MODEL__` = null

## D-A-1: change-A（kpi-income-label）実装範囲の確定（2026-07-02）
review-notes.md の NOTE-1/NOTE-2 をそのまま採用し、以下を機械的に置換した（設計判断の余地なし、逐語置換のみ）:
- `src/data/kpi/catalog.ts`: earning KPI の `name: '稼ぐ能力'` → `'増える収入'`、
  `description` 内の語句「稼ぐ能力」→「増える収入」（文全体は書き直さない）
- `src/messages/ja.json` / `en.json`: 同様に `kpi.earning.name`/`description` を追従
  （en は NOTE-2 のとおり `'Earning power'` → `'Income Growth'`、
  description の 'earning power' → 'income growth'）
- コメント3箇所（NOTE-1）: `src/data/average-income.ts:3` / `src/data/habit-presets.ts:177` /
  `src/components/onboarding/onboarding-wizard.tsx:469` の「稼ぐ能力」を「増える収入」に更新
- `headline: '稼ぐ力のある自分へ'`（catalog/ja.json）と記事本文中の「稼ぐ力」プローズ
  （social-connection / morning-light / fermented-food）は対象外のため無変更
- `src/__tests__/kpi-catalog.test.ts` の earning ケースの期待値を追従更新（TDD: RED確認後にGREEN化）
- 完了確認: `grep -rn '稼ぐ能力' src/` が 0 件。`npm test`（634 tests all green）/
  `npm run lint`（0 errors）/ `npx tsc --noEmit`（0 errors）/ `npm run build`（成功）全通過

## D-B-1: change-B（diagnosis-calc-v3）実装方針の確定（2026-07-02）
plan.md「additive 厳守（既存 export の削除・改名・シグネチャ変更をしない）」に従い、新規モジュール
`src/lib/diagnosis-v3.ts` を追加した。既存 `src/lib/lifetime-impact.ts` / `src/lib/onboarding.ts` は一切変更していない。

- **新モジュール分離の判断**: 選択肢は (a) lifetime-impact.ts に v3 関数を追記 / (b) onboarding.ts に追記 /
  (c) 新ファイル。lifetime-impact は「過去累積＋生涯累計（KPI一律 horizon×日数）」の別モデルで、v3 は
  「未来のみ・KPI別 horizon・年額/生涯年/分日 の混在単位」と計算体系が異なる。混ぜると可読性が落ちるため
  (c) 新ファイルを選択（可逆・YAGNI: v3 廃止時はファイル削除で済む）。change-C の旧 API 削除も見通しやすい。
- **per-day 値の取得**: plan.md 指示どおり `presetPerTimeEffectValue`（onboarding.ts）を再利用（再アンカーせず・
  達成率100%基準）。null（効果0）は 0 として扱う。
- **horizon（effect-model.md §1「表示単位」表 = AC#7 が正）**:
  健康寿命 = 残り寿命年 × 365 暦日 / 前向き = horizon 無し（分/日）/ 出費削減・増える収入 = 240 就労日/年
  （＝年額。生涯累計ではない点が lifetime-impact と決定的に異なる）。残り寿命年は
  `resolveDerivedProfileValues`（[1] 実プロフィール由来。null は V2 既定=残り40年）を使用し、
  プロトの固定サンプル（40歳・寿命90＝残り50年）はハードコードしない。
- **表示単位フォーマット（プロト fmt と同一・AC#9）**: 健康=365日以上は「年」小数1桁（`toFixed(1)`）・
  未満は「日」四捨五入 / 前向き=「分/日」四捨五入 / お金=円→万円で四捨五入して「万円/年」。
  桁区切りは `toLocaleString('ja-JP')`。四捨五入・単位換算の期待値は diagnosis-v3.test.ts に逐一明記。
- **公開 API**: `AchievementRate`(0|0.3|0.7|1) / `ACHIEVEMENT_RATES` / `kpiRawValue` / `formatKpiValue` /
  `computeDiagnosisV3` / `habitPotentialV3`（単体習慣の rate=1 ポテンシャル・AC#8 の個別インパクト用）。
- **達成率の永続化なし**（plan スコープ外）: 本モジュールは計算のみ。WizardState/DB 書き込みは change-C。
- 完了確認: `npm test`（655 tests = 既存634 + 新規21・all green）/ `npx tsc --noEmit`（0 errors）/
  `npm run lint`（0 errors）/ `npm run build`（成功）全通過。既存 lifetime-impact.test.ts /
  onboarding-logic.test.ts は無変更で全 green（additive を実証）。

## D-C-1: change-C（onboarding-v3-flow）実装方針の確定（2026-07-02）
plan.md change-C に従い [2] を段階タップ診断へ全面刷新、[4] を未来のみ単一表示へ刷新、旧 v2 API を削除した。

- **15習慣の明示リスト**: `ONBOARDING_V3_PRESET_IDS`（src/lib/onboarding.ts）に精査済み15本を表示順で定義。
  並びはプロト（onboarding-step2-proto.html）準拠（健康8→前向き5→出費削減1、タバコは健康群9番目）。
  残置7プリセット（daily_saving_habit / stop_impulse_buying / cook_at_home / deep_focus_work /
  morning_routine / cut_digital_distraction / keep_learning）は配列に含めず非表示（テストで保証）。
- **二択習慣（タバコ）**: 30%/70% を無効化する必要があるため `BINARY_ACHIEVEMENT_PRESET_IDS`（Set）＋
  `availableAchievementRates(presetId)` で表現。habit-presets.ts のデータ定義は変更せず（残置7本を壊さない）、
  オンボ固有の設定として onboarding.ts に閉じ込めた（可逆・YAGNI）。
- **達成率→status 自動変換（AC#10）**: `rateToHabitStatus`（1→established / 0.3・0.7→active / 0→null）。
  established でも established_since は書かない（v3 は常に null＝過去累積を持たない）。buildHabitFromPreset の
  establishedSince オプションは削除。runOnboardingWrite は rates を受け取り 15本の表示順で走査、0% は登録しない。
  active は status を省略（既定・後方互換）。
- **診断表示単位のロケール**: [2] 上部ライブ / 個別インパクト / [4] 結果の数値・単位は change-B の
  `formatKpiValue`（diagnosis-v3.ts）をそのまま利用。単位文字列（年 / 日 / 分/日 / 万円/年）は change-B で
  ja ハードコード済み（frozen・APPROVE 済み）。en ロケールでも単位は日本語表記のまま出る＝既知の制限。
  message キー集合のパリティ（onboarding 名前空間）は厳守（ja/en 一致・テストで保証）。値の単位ローカライズは
  別工程（backlog「アプリ全体UIの再構築」）。プロト忠実＞拡張性の優先順位に従いシンプルさを選択。
- **旧 v2 コードの削除（デッドコードを残さない）**: src/lib/lifetime-impact.ts と
  src/__tests__/lifetime-impact.test.ts を削除。onboarding.ts から established/active セクション・
  「いつから」入力・過去/未来二段構え・`canAdvanceFromHabits` ゲート（AC#11: 全習慣0%でも完了可）・
  buildLifetimeImpactInput / shouldShowPastBlock / yearsAgoToEstablishedSince / toggle 系を全削除。
  wizard からの旧 API 参照も除去。presetPerTimeEffectValue は diagnosis-v3 の建材として onboarding.ts に温存。
- **循環参照の回避**: onboarding.ts は diagnosis-v3.ts から `import type` のみ（AchievementRate / HabitSelection）。
  達成率の値配列は onboarding.ts 側でリテラル定義（ACHIEVEMENT_RATE_DISPLAY_ORDER）し、値の循環 import を避けた。
- **AC#14 実ブラウザ E2E（review-notes NOTE-3）**: 本環境ではログイン済みブラウザ＋Supabase dev 稼働の
  E2E を実行できないため、書き込みペイロード（habits の status / established_since=未指定 / user_profiles /
  evidences weight=100）を onboarding-write.test.ts でアサートする代替検証で担保。実ブラウザ通し確認は残タスク。
- 完了確認: `npm test`（643 tests all green）/ `npx tsc --noEmit`（0 errors）/ `npm run lint`（0 errors）/
  `npm run build`（成功）全通過。`grep -rn '稼ぐ能力' src/` = 0 件（維持）。

## D-C-2: [2] タップ遷移の連打ガード（verifier finding 対応・2026-07-02）
Verify PASS 後の残課題（連打で習慣を無回答スキップする恐れ）への対応。修正方式は verifier 提案の
「コンポーネントローカル isAdvancing フラグ + RTL コンポーネントテスト」ではなく、以下を採用した:

- **`advancing` を WizardState に組み込み、遷移を純粋関数化**: `tapHabitRate`（余韻中の再タップ無視・
  達成率記録 + advancing=true）/ `completeHabitAdvance`（advancing でなければ no-op → 余分にスケジュール
  されたタイマーが二重に進めない）/ `backInHabits`（余韻中の戻る無視）を src/lib/onboarding.ts に追加。
  コンポーネントは setState(純粋関数) を適用するだけ。4択ボタンは `disabled={state.advancing}` も付与
- **理由1（レース安全）**: コンポーネントローカルのフラグは同一 tick の連打で closure が stale になり
  タイマーが二重スケジュールされる穴が残る。ガードを state 遷移そのものに持たせると、タイマーが何本
  発火しても advancing=false 後は no-op になり構造的に安全
- **理由2（テスト方式はコードベース規約に従う）**: このコードベースは @testing-library / jsdom を
  意図的に避ける設計（account-billing.test.tsx 等に明記の既存決定。pure reducer + tree-walk 方式）。
  RTL + jsdom を一度導入したが規約違反と気づきアンインストール（package-lock.json も HEAD 復元）。
  代わりに純粋関数のユニットテスト 10 本を onboarding-logic.test.ts に追加（連打・二重タイマー・
  戻る競合・最終習慣→[3]・二択無効値のケースを網羅）
- 完了確認: `npm test`（653 tests = 643 + 新規10・all green）/ `npx tsc --noEmit` 0 errors /
  `npm run lint` 0 errors / `npm run build` 成功

## D-C-3: 完了フローの刷新（達成率→status 自動変換の廃止・ユーザーフィードバック 2026-07-02）
「100%じゃなかった習慣がそのまま登録されるのはうざい」というフィードバックを受け、[4] 以降を刷新した。
plan.md AC#10（自動変換）は本決定で**上書き**される。ユーザー確定事項（AskUserQuestion 4問）:

1. **登録 status は一律 'active'**（established 自動変換廃止。習慣化済みの判定は日々の実行ログの実績が担う）
2. **候補は伸びしろ順**: (1 − 達成率) × 100%ポテンシャル。達成率100% と効果ゼロの習慣は候補から除外
3. **tracked_kpis は全4KPI のまま**（[5] の KPI 選択は候補絞り込み専用の UI。DB に保存しない）
4. **初期チェックは全て未チェック**（チェック0件でもスタート可＝profile のみ書き込み）

新フロー: [4]結果 →「習慣を選びに進む」→ [5] KPI選択（4KPI を1ビューで丁寧に説明・1つ選択。
健康寿命は「寿命そのものではなく〜元気な期間」と寿命との違いを明示）→ [6] 習慣選択
（選んだ KPI への伸びしろ順トップ5・現状%表示・チェック式）→ スタート（書き込み）→ ホーム直行。
旧 [5] 完了画面（準備ができました）・RegisteredHabits・rateToHabitStatus・done.* メッセージは削除。

実装配置: 伸びしろランキング `rankPresetsByGrowth` は diagnosis-v3.ts（onboarding.ts への value 依存が
既にある側。循環回避）。選択状態（focusKpi / chosenPresetIds）は WizardState + 純粋関数
（chooseFocusKpi / toggleChosenPreset）。実ブラウザ E2E で検証済み: タバコ100%が候補から除外され、
睡眠30%の伸びしろが 149日×0.7≈105日 に減衰してランキングに反映されること、チェック2件が
active・established_since=null で DB 登録されることを確認（2026-07-02）。
