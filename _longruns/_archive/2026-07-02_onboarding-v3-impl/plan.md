# Plan: オンボーディング v3 本実装（段階タップ診断・未来のみ・15習慣）

## 生成情報
- 作成日: 2026-07-02
- Brain Dump元: セッション内（v3 プロト検証済み成果の本実装依頼）
- 質問回数: 3問（達成率の保存 / habit登録規則 / 単位の適用範囲）

## ゴール
子worktree（onboarding-v2-interactive、PR #36 でマージ済み）で検証したプロトタイプを本体に実装し、オンボーディング[2]を「精査済み15習慣 × 段階タップ診断（1画面1習慣・4択）」に、[4]を「未来のみ・新表示単位の結果」に刷新する。あわせて KPI ラベル「稼ぐ能力」→「増える収入」をアプリ全体に反映する。

## ビジネスコンテキスト
- 対象ユーザー: Smitch の新規ユーザー（積み重ねゼロの状態でオンボーディングに入る人）
- 提供価値: タップだけの診断で「習慣が残りの人生にもたらす定量インパクト」のイメージを掴ませ、習慣登録まで1ジェスチャーで完結させる
- 成功指標: [0]→[5] をタップ操作のみで完走でき、完了時に達成率に応じた習慣が DB 登録されている

## 技術要件
- スタック: Next.js 16 / React 19 / TypeScript 5 / Tailwind CSS 4 / next-intl（ja/en）/ Supabase（RLS）
- 参照パターン:
  - UI・挙動の正: `_longruns/2026-06-28_onboarding-v3-interactive/prototype/onboarding-step2-proto.html`（プロトの HTML/CSS/計算ロジックを TSX に移植）
  - 仕様の正: `docs/context/onboarding-v3-effect-model.md`（§1 効果式・MVP=未来のみ・表示単位 / §6 UX確定）
  - 既存実装: `src/components/onboarding/onboarding-wizard.tsx`（v2 6画面）、`src/lib/onboarding.ts`・lifetime-impact 計算まわり（v2 計算API）、`src/data/habit-presets.ts`（確定15本は反映済み）
- 制約:
  - 造語禁止。確定語彙のみ使う（KPI / 達成率 / エビデンス / 習慣）。あの4つは「KPI」とだけ呼ぶ
  - **DB マイグレーション禁止**（今回はスキーマ変更なし。達成率は永続化しない）
  - `openspec/` 配下の既存 specs を壊さない。残置7プリセット（daily_saving_habit / stop_impulse_buying / cook_at_home / deep_focus_work / morning_routine / cut_digital_distraction / keep_learning）のデータ定義は変更しない
  - dev サーバーのポートは他プロジェクトのプロセスを kill して確保しない
- テストフレームワーク: Vitest（既存 634 テスト）
- テスト実行コマンド: `npm test`（型チェック `npx tsc --noEmit` / lint `npm run lint` / ビルド `npm run build`）

## スコープ
### 含むもの
- KPI ラベル「稼ぐ能力」→「増える収入」の一括反映（catalog / messages ja・en / 見出し文言 / 依存テスト）
- 診断計算の v3 化: `効果 = per-day効果 × 達成率 × horizon`（未来のみ・過去項なし）と新表示単位（健康寿命=生涯年 / 前向き=分/日 / 出費削減・増える収入=万円/年）の計算・フォーマット関数
- [2] の全面刷新: 精査済み15習慣のみ・1画面1習慣・4択段階タップ（やってない0%/たまに30%/だいたい70%/完璧100%、2×2グリッド最下部固定）・タップで即次へ・戻るボタン・上部4KPIライブ表示・習慣ごとの個別インパクト表示（lucideアイコン、絵文字不使用）
- [4] の刷新: 未来のみの単一表示（過去/未来二段構えの廃止）・新表示単位
- 「いつから（established_since 入力）」UI と過去累積表示の削除
- 完了時の habit 登録規則: 達成率100%→`status='established'`（established_since=null）/ 30・70%→`status='active'` / 0%→登録しない。user_profiles の upsert は v2 同様
- ja/en 文言（キー集合のパリティ厳守）、テスト更新＋新規テスト、実ブラウザ E2E

### 含まないもの
- 達成率の DB 永続化（理由: オンボの達成率はイメージ喚起用の UI。実際の達成度は日々の実行ログから実績ベースで算出する — ユーザー確定 2026-07-02）
- 過去累積（established_since ベース）の計算・表示（理由: post-launch。effect-model.md §1 で確定）
- ホーム画面の表示単位統一（理由: backlog「アプリ全体UIの再構築」でまとめて対応 — ユーザー確定 2026-07-02）
- cost/earning 系残置7プリセットの精査・解体（理由: 別途ディープリサーチ後）
- 束ねウェイト（HabitEvidence.weight）の調整機構（理由: 精査で原則1習慣=1エビデンスに分解済みのため単純合算=weight 100 のままで二重計上なし）
- 同一エビデンス重複加算防止の汎用機構（issue #34。理由: 15本は articleId が互いに重複しないことをテストで保証すれば MVP は足りる）
- デザインフィックス（配色・トランジションの最終質感調整は後工程。プロト準拠でよい）
- `dailyIncomeGain` 系 per-day 値の年収サンプル再スケール（理由: per-day 収入値は年収1,500万前提のハードコード由来という既知の制限（HANDOFF 記載）。今回は per-day 値を再アンカーせずそのまま使う。現実的年収での値の妥当性調整は別途）
- headline「稼ぐ力のある自分へ」の変更（理由: 置換後の確定文言が存在しない。文言確定後に別途）

## Changes分解

### change-A: kpi-income-label
- **スコープ**: KPI ラベル「稼ぐ能力」→「増える収入」の一括反映。変更対象と置換後の値は以下に**逐語で限定**する:
  1. `src/data/kpi/catalog.ts` の earning KPI の `name`: 「稼ぐ能力」→「増える収入」（en: "Earning Power" 相当 → "Income Growth"）
  2. `src/messages/{ja,en}.json` の KPI name/description 中の語句「稼ぐ能力」→「増える収入」（description は語句置換のみ。文全体の書き直しはしない）
  3. 上記を参照しているコンポーネント・テストの期待値追従
  - **headline「稼ぐ力のある自分へ」は今回変更しない**（置換後の確定文言が存在しないため。文言が確定したら別途対応）
  - **記事本文中の「稼ぐ力」プローズ（social-connection / morning-light / fermented-food 等）は KPI ラベルではないため対象外（変更しない）**
- **使用スキル**: なし（機械的な一括更新）
- **依存関係**: 独立（最初に実行）
- **config.yaml rules**:
  - "ja/en のメッセージキー集合を完全一致させる（パリティ厳守）"
  - "一掃対象は KPI ラベル文字列『稼ぐ能力』（完全一致）のみ。grep -r '稼ぐ能力' src/ が 0 件になることを確認してから完了報告する。『稼ぐ力』（headline・記事本文）は対象外"

### change-B: diagnosis-calc-v3
- **スコープ**: **追加のみ（additive）**。診断計算の v3 化: 達成率（0/0.3/0.7/1.0）を係数として受け取り、未来のみ（過去項なし）で4KPIを計算する関数と、新表示単位のフォーマット関数（健康寿命=生涯年 / 前向きな気持ち=分/日（horizon無し） / 出費削減・増える収入=万円/年（per-day×240就労日））を**新規追加**する。horizon は既存の統計テーブル（平均余命・就業年数・平均年収）＋[1]の実プロフィールから算出（プロトの固定サンプル値 40歳・寿命90 は使わない）。per-day 値（calculationParams）は達成率100%基準としてそのまま使う（再アンカーしない）。`presetPerTimeEffectValue` は据え置きで再利用してよい。
  **既存の `computeLifetimeImpact` / `buildLifetimeImpactInput` / `shouldShowPastBlock` / `presetPerTimeEffectValue` と既存テスト（lifetime-impact.test.ts / onboarding-logic.test.ts）は change-B 時点では一切変更しない**（v2 wizard が参照中のため。削除・改名・シグネチャ変更禁止）。旧 API・旧テストの削除は change-C（wizard 刷新と同時）で行う
- **使用スキル**: なし
- **依存関係**: 独立（change-A と並行可だが同一 worktree のため直列実行）
- **config.yaml rules**:
  - "計算関数は純粋関数として src/lib/ に置き、Vitest でユニットテストする"
  - "四捨五入・単位換算（円→万円、年→小数1桁）の期待値をテストに明記する"
  - "additive 厳守: 既存 export の削除・改名・シグネチャ変更をしない。change-B 完了時点で既存634テスト＋新規テストが全green であること"

### change-C: onboarding-v3-flow
- **スコープ**: [2] を段階タップ診断に全面刷新（精査済み15習慣のみ表示・1画面1習慣・4択2×2最下部固定・タップ即遷移・戻るボタン・上部4KPIライブ・個別インパクトボックス）。[4] を未来のみ・新単位の単一表示に刷新。「いつから」入力・過去/未来二段表示・セクションA/B（established/active 2分類選択）の削除。**「診断する」の active≥1 ゲート（`canAdvanceFromHabits`）も廃止**（AC#11: 全習慣0%でも完了可能に合わせる）。完了時書き込みを達成率→status 自動変換（100%→established・established_since=null / 30・70%→active / 0%→登録なし）に変更。**change-B で温存した旧 API（computeLifetimeImpact / buildLifetimeImpactInput / shouldShowPastBlock）の wizard からの参照除去と、旧関数・旧テスト（過去累積系）の削除もここで行う**。ja/en 文言、既存テストの更新＋新規テスト、実ブラウザ E2E
- **使用スキル**: browser-verification（実ブラウザ E2E）
- **依存関係**: change-A・change-B の後
- **config.yaml rules**:
  - "オンボに表示する15習慣は明示的なリスト（プリセット id 配列）で定義し、残置7プリセットが誤って表示されないことをテストで保証する"
  - "15本の articleIds が互いに重複しないことをテストで保証する（同一エビデンス二重計上の防止）"
  - "全習慣 0% でも完了可能（habit 0件・[4]は0表示）。エラーにしない"
  - "絵文字は使わない。アイコンは lucide（health=heart-pulse / mood=smile / cost=piggy-bank / earn=trending-up）"

## モデル割り当て

自律実行（exec）の各フェーズ agent に割り当てるモデルティアを change × ロールごとに指定する。
exec はこの表を読み、ティアを `plugins/longrun/references/model-tiers.md` で解決して
Workflow の `opts.model` に反映する。

| change | ロール | ティア(haiku/sonnet/inherit) | 理由 | 上書き |
|--------|--------|------------------------------|------|--------|
| change-A | builder | sonnet | 機械的なラベル一括更新（中規模実装） | |
| change-A | verifier | haiku | 定型的な静的検証（grep＋テスト） | |
| change-A | reviewer | inherit | Build Contract レビュー | |
| change-B | builder | inherit | 計算ロジックの TDD 実装（単位換算・期待値設計が要注意） | |
| change-B | verifier | sonnet | 計算期待値の検証を含む静的検証 | |
| change-B | reviewer | inherit | アーキテクチャレビュー | |
| change-C | builder | inherit | 複雑な UI 全面刷新＋書き込み規則変更の TDD 実装 | |
| change-C | verifier | sonnet | UI・書き込み検証を含む静的検証 | |
| change-C | reviewer | inherit | アーキテクチャレビュー | |

## 画面・UI設計
プロト `onboarding-step2-proto.html` が正。骨子:
- [0] イントロ / [1] プロフィール / [3] 計算中 / [5] 完了 は v2 を踏襲（文言の軽微調整のみ可）
- [2] 診断: 上部=4KPIライブ累計（固定）、中央=習慣カード（タイトル・補足・「この習慣が、残りの人生であなたにもたらすこと」個別インパクト4KPI）、最下部固定=4択2×2グリッド。タップで達成率記録→トランジションで次の習慣へ。戻るボタンで前の習慣に戻り再選択可。15習慣で完了→[3]へ
- [4] 結果: 4KPI同列・未来のみ単一値・新表示単位（健康寿命 +N.N年 / 前向き +N分/日 / 出費削減 +N万円/年 / 増える収入 +N万円/年）

## データモデル
**スキーマ変更なし（マイグレーション不要）。**
- `habits.status`（'active'|'established'）と `established_since` は v2 導入済みをそのまま使用。v3 では established_since は常に null で書き込む
- 達成率は `WizardState` 内のみ（例: `Record<presetId, 0|0.3|0.7|1>`）。DB に書かない
- `user_profiles` の upsert（birth_year/gender/country/annual_income/tracked_kpis=全4KPI）は v2 の挙動を維持
- `habit_evidences` は従来どおり weight=100 で作成（15本は1習慣=1エビデンス）

## 受け入れ条件

**必須条件（常に含める）:**
1. [ ] 全changeのOpenSpec仕様が作成・レビュー済み
2. [ ] 全changeのテストが作成され全てPASSしている
3. [ ] ビルドエラーなし（型チェック + ビルド）
4. [ ] 統合テストがPASS（3 change 直列適用後、`npm run lint` / `npx tsc --noEmit` / `npm test` / `npm run build` 全通過）

**機能固有の条件:**
5. [ ] [2] に表示される習慣が精査済み15本のみ（残置7プリセットは非表示）であることをユニットテストで検証
6. [ ] 4択タップで達成率が記録され次の習慣画面へ遷移し、戻るボタンで前の習慣に戻って再選択できる
7. [ ] 上部4KPIライブ累計がタップごとに `per-day効果 × 達成率 × horizon`（新単位）で加算される（計算ユニットテスト。達成率 0/0.3/0.7/1.0 の各ケース）。horizon は KPI 別（effect-model.md §1「表示単位」表が正: 健康寿命=残り寿命年×365 / 前向き=horizon無し（分/日のまま） / 出費削減・増える収入=240就労日）
8. [ ] 各習慣画面に個別インパクト（達成率100%・未来分の4KPI値）が表示される
9. [ ] [4] が未来のみの単一表示・新単位（健康寿命=生涯年 / 前向き=分/日 / 出費削減・増える収入=万円/年）で、過去/未来二段表示と「いつから」入力がコードから削除されている
10. [ ] 完了時: 達成率100%の習慣は status='established'（established_since=null）、30・70%は status='active'、0%は作成されない（書き込みユニットテスト）
11. [ ] 全習慣 0% でも完了でき、habit 0件・[4] は0表示になる
12. [ ] KPI ラベル文字列「稼ぐ能力」（完全一致）が src/ 配下に存在せず「増える収入」に置換されている（ja/en キー集合パリティ含む。headline・記事本文の「稼ぐ力」は対象外）
13. [ ] 15本の articleIds が互いに重複しない（同一エビデンス二重計上なし）ことをテストで検証
14. [ ] 実ブラウザで [0]→[5]→ホーム を通しで完走し、DB 書き込み（habits/user_profiles）を確認

## 意思決定ガイドライン
- 優先順位: プロト忠実 > シンプルさ > 拡張性。迷ったらプロトの挙動・effect-model.md の確定事項に従う
- リスク許容度: 保守的（確定仕様の範囲内で実装。仕様にない機能を足さない）
- 不明点の扱い: シンプルな方を選び decisions.md に記録。用語は確定語彙のみ（造語禁止）
- v2 のコード（セクションA/B・いつから入力・過去累積表示）は「残す」より「消す」を優先（デッドコードを残さない）

## 動作確認方法
- 開発サーバー: `npm run dev`（http://localhost:3000 。ポート使用中なら自プロジェクトのプロセスのみ停止、他プロジェクトは触らず 3001 等を使う）
- テスト: `npm test`（型 `npx tsc --noEmit` / lint `npm run lint` / ビルド `npm run build`）
- 確認手順:
  1. ログイン済みブラウザで `/onboarding` を開く
  2. [0]開始 → [1]プロフィール入力（年齢40・男性・日本・年収空でも可）→ [2]で15習慣を段階タップ（例: タバコ=完璧、運動=だいたい、他=やってない）
  3. 上部4KPIライブがタップごとに増えること、戻るボタンで再選択できることを確認
  4. [3]計算中 → [4]で未来のみ・新単位の結果（増える収入=万円/年 表記）を確認 → [5]完了 → ホーム
  5. DB で habits（タバコ=established・established_since=null / 運動=active、やってない習慣は無し）と user_profiles を確認

## Brain Dumpからの原文メモ
> もうさ、このオンボーディングV2でやった内容を実際のソースに反映させたいんだけど（=子worktreeで検証したプロトの本実装）
> オンボ習慣はこれで良さそうだから子ワークツリーでやったプロトタイプを実コードに実装しよう
> （達成率の保存について）オンボーディングの後っていうのは、ユーザーがどのくらいこの習慣を達成できているかをパーセンテージでアウトプットすることはない。ユーザーが設定や入力することもない。基本的には毎日使っていく中で、今日この習慣できてた・できてなかったをもとに、実際どのくらいアチーブメントしているかが実績ベースで行われる。ここでのアチーブメントレートっていうのは、これからスタートする積み重ねがないユーザーに対して、あくまでイメージをつかんでもらうためのUIなんだ。だからここで永続化する意味があるのかっていうのは、ちょっと微妙
> habit登録規則: 達成率から自動変換（推奨案を採用） / 表示単位の適用範囲: オンボのみ（推奨案を採用）
