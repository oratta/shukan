# Decisions: 2026-07-03_impact-3scene

## D-exec-1: Verify フェーズの verifier モデルは sonnet 一本化
- plan.md のモデル割り当ては change-1 の verifier のみ haiku、change-2〜5 は sonnet。
- 生成 Workflow の Verify ループは全 change 完了後の一括検証であり、change 単位の verifier 切替点が存在しない（テンプレートの `__VERIFIER_MODEL__` はグローバル 1 値）。
- 多数派かつ一括検証の内容（UI・ブラウザ検証を含む）に適合する **sonnet** を静的/ブラウザ両 verifier に採用。change-1 の haiku 指定は反映されないが、検証が過剰品質になる方向のズレであり安全側。

## D-exec-2: builder/reviewer は inherit（opts.model 未指定）
- plan.md の指定どおり。inherit のためセッションモデル（Fable 5）が使われる。plan の理由欄にある「実装系 subagent は Opus」フィードバックは「セッションモデル以上の実装系モデルを使う」意図であり、Fable 5 継承はこれを満たす。

## D-change1-1: en の evidence.feedback* ラベルも正準 KPI 名に統一
- plan.md change-1 スコープは ja の evidence.feedbackCost/Income を明記するが、en 側は「impact.* と onboarding.kpi.* の統一」としか書いていない。
- しかし en evidence.feedbackCost/Income/Health は旧名（Cost Savings / Income Gain / Health Lifespan）を含み、KPI ラベルを含む UI 文言である。ルール「旧名・言い換え・造語を残さない」に従い、en evidence.feedback* も正準（Cost saving / Income Growth / Healthy lifespan）に統一した。低リスクかつ一貫性を担保する方向。

## D-change1-2: LP alt テキストは旧軸名を正準 4 KPI 名に置換し、Detail の個別数値は削除
- Process.tsx / Detail.tsx の alt に旧軸名（生涯コスト / 可処分時間 / 集中時間）が残存していた。これらは現行 4 KPI（健康寿命・出費削減・増える収入・前向きな気持ちの時間）と不一致。
- 選択肢: (a) 軸名だけ置換し数値は流用, (b) 数値ごと 4 KPI にマッピングして新数値を発明, (c) 軸名を正準 4 KPI に置換し検証できない個別数値は削除。
- Detail の旧 alt は軸ごとに具体数値（+2.4 年 / -820 万円 / +1,440 時間 / +2.1 時間/日）を持つが、現行 4 KPI へ 1:1 対応せず、増える収入・前向きな気持ちの時間の数値の根拠がない。数値を発明する (b) はエビデンス基準に反する。
- alt はスクリーンショット画像のアクセシビリティ説明であり「数値カード 4 つ + 上昇トレンドグラフ」で画像の構造は十分伝わる。よって (c) を採用（可逆的・YAGNI・根拠なき数値を置かない）。Process の alt は元々数値なしのため軸名置換のみ。

## D-change2-1: 全部100%対比は buildFullPotentialSelections で達成率=1 を渡すだけ（新規計算なし）
- plan.md change-2 ルール「新規計算ロジックを作らない。diagnosis-v3 の既存関数に達成率パラメータを渡すだけ」に従う。
- 選択肢: (a) diagnosis-v3 に専用の「100%ポテンシャル集計」関数を新設, (b) コンポーネント内で inline に selections を rate=1 へ map, (c) onboarding.ts に純粋関数 `buildFullPotentialSelections` を追加し `computeDiagnosisV3` に渡す。
- (a) は既存 API 増設で過剰（YAGNI 違反）、(b) は TDD 単体テストが書きにくい。回答済み習慣集合の決定は既に `buildDiagnosisSelections` が担うため、その出力を rate=1 に写像する薄い純粋関数 (c) が最小・テスト容易・可逆。→ (c) 採用。

## D-change2-2: [4]→[5] 導線は result.cta を KPI 選択誘導に変更（既存テストも更新）
- [5] は KPI 選択（何を充実させたいか）だが、旧 cta「習慣を選びに進む」は習慣選択([6])を指し不一致。plan タスク B「[4]→[5] 導線文言調整」に従い ja「大切にしたいことを選ぶ」/ en「Choose what matters most」へ変更。
- 旧文言を固定していた `onboarding-messages.test.ts` の期待値も本 change で新文言に更新（plan が明示的に変更を要求するため、リグレッションではなく仕様変更）。
- result.lead も「今のペースと全部100%の差＝伸びしろ」を示す文言に更新（対比表示の意味づけを揃える）。

## D-change3-1: 受け入れ条件 #9 は「値入れ」ではなく「精査＋0据え置き理由の明記」で満たす
- plan.md change-3 スコープは「29記事に値入れ」と読める記述だが、これは plan 執筆時点（値0が29本）のもの。現状は先行 change（kpi-data-foundation / onboarding-v3）で代表12本に既に値＋算出根拠（inferences.positiveMood・calculationLogic.positiveMood）が入っており、値0は26本。
- 既存テスト `calculation-logic.test.ts` の A-S7 が「値 > 0 の記事は 9〜12本（『10記事程度』の上限ガード <= 12）」を固定しており、二重計上回避（起床16h×前向き50%=480分/日の共有ベースラインに対し、全習慣が上乗せすると総和が非現実的になる）を design invariant として encode している。
- 選択肢: (a) 26本すべてに値を入れる（既存テストの <=12 を破り、二重計上invariantに反する）, (b) 上限テストを緩めて値を増やす（先行mergeの design 判断を覆すスコープ拡大・リスク）, (c) 値 > 0 は代表12本に据え置き、値0の26本は「一次mood効果が独立して確立せず、効果は他KPIで計上済み＝二重計上回避」の理由コメントを付けて精査済みとする。
- 受け入れ条件 #9 は「値 > 0、または 0 のままの理由コメント付き」であり (c) で充足。change-3 ルール「根拠なしに値を置かない」「二重計上回避」にも合致。可逆的・保守的・YAGNI により (c) を採用。marker `positiveMood 0:` を付与し、テストで全0記事に理由コメントがあることを固定した。

## D-change3-2: 4軸目は値 > 0 のときのみ描画（0=未設定は非表示）
- `dailyPositiveMoodMinutes` の型コメントが「0 = 未設定（UI 非表示判定に使える）」と定義済み。
- 選択肢: (a) 常時4軸表示（0 のとき「+0分」を出す）, (b) 値 > 0 のときのみ4軸目を描画。
- (a) は mood 値を持たない大多数の習慣で「+0分」のノイズが出て情報密度を下げる。(b) は既存の型セマンティクスに従い、mood をエビデンスとして持つ習慣でのみ4軸目が現れる。9箇所すべてで (b)（`> 0` 条件レンダリング）を採用。集計系（daily-impact-summary / savings-card / stats total / evidence-manager 合計）は合算値 > 0 のとき表示。
- アイコンは lucide `Smile` で4軸目を統一（PartyPopper は perfect 演出で使用済みのため回避）。

## D-change4-1: established 除外は純粋述語 `isDailyTrackedHabit` / `isEstablishedHabit` で一元化
- plan.md change-4 は「既存コードは habit.status で一切フィルタしていない。この change が最初の分岐導入者。除外方針を habits.test.ts にケース追加して固定」を要求。
- 選択肢: (a) 各ページ（home / stats）で `h.status !== 'established'` をインライン記述, (b) `shouldShowToday` を established 除外に変更（既存の意味を上書き）, (c) 純粋述語 `isDailyTrackedHabit`（!archived && status!=='established'）と `isEstablishedHabit`（!archived && status==='established'）を lib/habits.ts に追加し全消費点で共有。
- (a) は分岐が散在しテスト不能、(b) は shouldShowToday の既存セマンティクス（!archived）を破壊し他消費点に波及。(c) は単一の純粋関数でテスト固定でき、home のデイリーリスト・PWA day-status・DailyImpactSummary・yesterday review・stats 集計すべてが同一述語を参照する。→ (c) 採用（YAGNI・テスト容易・非破壊）。shouldShowToday は後方互換のため据え置き。

## D-change4-2: established の生涯効果は per-day 効果を diagnosis-v3 horizon に流し込む（新規計算なし）
- plan.md change-4 は established セクションに「オンボと同形式」の生涯効果を要求。オンボ診断はプリセット由来（presetPerTimeEffectValue）だが、ユーザー習慣は evidences（articleId）由来で per-day 効果の取得経路が異なる。
- 選択肢: (a) established 用に専用の生涯計算を新設, (b) 習慣の evidences をプリセットへ逆マッピングして habitPotentialV3 を再利用, (c) evidences の per-day 効果（既存 `calculateDailyImpact`）を diagnosis-v3 の horizon/表示単位ロジック（`kpiRawValue` rate=1 + `formatKpiValue`）へ流す薄い関数 `computeHabitLifetimeEffect` を追加。
- (a) は horizon/単位の二重定義でオンボと乖離リスク、(b) は evidence→preset の一意な逆写像が存在せず破綻。(c) は表示単位・horizon をオンボ[4]と完全共有し、per-day 取得のみ習慣側（calculateDailyImpact）に委譲する最小差分。→ (c) 採用。profile 引数は default null（V2 既定=残り寿命40年）でフォールバックし、change-5 で個人化を接続する拡張点を残した。

## D-change4-3: status 手動トグルは編集時のみ・自動昇格なし
- plan.md change-4 rule「established の自動昇格提案・卒業演出を実装しない（手動設定のみ）」。
- HabitForm は add/edit 兼用だが、新規作成時に「完全に身についた」を出すのは意味的に不自然（達成実績ゼロの習慣を established にするユースケースが薄い）。`initialData` があるとき（=編集時）のみトグルを描画し、onSubmit で `status: established ? 'established' : 'active'` を渡す。updateHabitById は既に status 更新に対応済みのため配線のみ。可逆・YAGNI。

## D-change5-1: tracked_kpis 未設定は全4 KPI にフォールバック（純粋関数 resolveTrackedKpiDefinitions）
- plan.md change-5 rule「プロフィール未設定ユーザーには現行のデフォルト値でフォールバックし、エラーにしない」。
- onboarding は完了時に tracked_kpis へ全4軸を書き込む（onboarding.ts D5）が、未オンボ／行なし／不正キー混入のケースがある。
- 選択肢: (a) 未設定時は何も表示しない, (b) 未設定時は全4 KPI を表示, (c) 未設定時はエラー表示。
- (c) はルール違反。(a) はホームの「大切にしていること」が空になり情報価値ゼロ。(b) は「まだ絞り込んでいない＝全部大切」の自然な既定で、KPI カタログ順を保つ純粋関数 `resolveTrackedKpiDefinitions`（不正キー除外＋空/null は全4）に集約しテスト固定。→ (b) 採用（YAGNI・非エラー・テスト容易）。

## D-change5-2: プロフィール読み書きは useProfile フックに集約し、表示/編集コンポーネントは props 受け取り
- ホーム（tracked_kpis 表示・established 個人化）と設定（編集）の両方が user_profiles を必要とする。
- 選択肢: (a) 各ページで直接 fetchUserProfile/upsert を呼ぶ, (b) Context Provider を新設, (c) useHabits と同型の useProfile フック（fetch on mount＋save）を追加し、TrackedKpisCard/ProfileEditor は profile/onSave を props で受ける。
- (a) は読み書きロジックが散在しテスト不能。(b) は Provider 追加が過剰（2画面のみ・YAGNI 違反）。(c) は既存 useHabits パターンと一貫し、コンポーネントは純粋 props で tree-walk/grep テスト可能。→ (c) 採用。ProfileEditor に onSave を注入することで Supabase 依存を画面側に閉じ込め、コンポーネントは表示ロジックのみに。

## D-change5-3: 設定のプロフィール編集は「生年」直接入力（オンボの age 入力とは差異を許容）
- plan.md change-5 スコープ／AC#13 は「生年・性別・収入・KPI 選択」を明示。オンボ[1]は age 入力→birthYear 変換。
- 選択肢: (a) オンボと同じ age 入力にする, (b) plan の記述どおり birthYear 直接入力, (c) オンボの inline フィールドを共通コンポーネントに抽出して両者で再利用。
- (c) は 773 行の wizard から inline フィールドを剥がす破壊的リファクタで、他 change 完了後の低リスク方針に反する。(a) は plan の「生年」記述と乖離。(b) は plan/AC に忠実で、UserProfile.birthYear と直結し変換不要（余計な派生を挟まない）。「オンボ入力 UI のコンポーネント再利用を基本方針」は満たせないが、ボタン選択・万円入力などの入力パターン（見た目・操作トーン）は踏襲した。→ (b) 採用（plan 忠実・可逆・非破壊）。

## D-change5-4: established 個人化は既存 computeHabitLifetimeEffect に profile を渡す配線のみ
- computeHabitLifetimeEffect は change-4 で既に profile 引数（default null → V2 既定値）を持ち、health_lifespan を remainingLifeExpectancy で個人化する。
- 新規計算は不要。ホームが useProfile の profile を EstablishedSection→computeHabitLifetimeEffect に流すだけで AC#14 を満たす。cost_saving/earning は per-day×240 日で profile 非依存（現行仕様維持）。プロフィール未設定は resolveDerivedProfileValues(null)=残り寿命40年でフォールバックしエラーにしない。→ 配線のみ・非破壊。

## D-change5-5: update RLS ポリシーは既存 migration に存在（追加マイグレーション不要）
- plan.md change-5 rule「設定画面からの user_profiles UPDATE 前に update RLS ポリシーの存在を確認する」。
- `supabase/migrations/20260612010000_user_profiles.sql` に "Users can update own profile"（for update / using auth.uid()=user_id / with check 同）が既に定義済み。オンボ書き込み実績どおり存在。→ マイグレーション追加不要。テストで migration に `for update` が含まれることを固定した。

## D-change5-6: プロフィール保存の失敗ハンドリングと読み込み中インジケータ（Verify round1 静的FAIL 修正）
- 課題: (1) useProfile.save の re-throw を ProfileEditor.handleSave が catch しておらず、ネットワークエラー/RLS 拒否時に unhandled rejection となりユーザーへ失敗が伝わらない。(2) settings ページは profileLoading 中に ProfileEditor を非表示にするだけで可視インジケータが無く「編集欄が無い」ように見え、後から急に現れる。
- 選択肢比較:
  - A) useProfile.save 内で catch して null 返却 → UI 側で成否判定できず、成功と失敗を区別できない。却下（可観測性が下がる）。
  - B) ProfileEditor.handleSave に try/catch を追加し saveError state で settings.profileSaveError を表示 → 保存 UI と同じ場所でユーザーに失敗を可視化でき、二重送信ガード（saving）も維持。採用（UI 層でエラー表示するのが責務として自然）。
  - C) トースト/グローバル通知基盤を新設 → YAGNI。既存にトースト基盤なし。却下。
- ローディング: 既存の共通スピナー（size-8 animate-spin rounded-full border-2 border-primary border-t-transparent、home/stats/ReviewCalendar と同一）を Card 内に配置。role="status" + aria-label=common.loading でアクセシビリティ確保。
- メッセージ: settings.profileSaveError を ja/en に追加（成功時 profileSaved と対）。
- TDD: profile-app-connection.test.ts に 4 テスト追加（catch 配線 / profileSaveError 配線 / profileLoading→animate-spin / profileSaveError キー存在）。RED 4件→実装→GREEN。全 753 テスト PASS、lint 0 error、tsc clean、build 成功。

## D-feedback-1: [4]結果は「単一対比カード」から「KPIごとの説明セクション＋まとめ」構成へ（F1〜F4）
- ユーザーフィードバック（2026-07-03）: [4] は 4KPI を 1 カードの対比テーブルに詰め込んでいたが、(a) 全部100%列の見出しラベル・値の単位が 375px 幅で改行して崩れる（F1）、(b) 各 KPI の重要性（特に健康寿命・前向きな気持ちの時間）が数字だけでは腹落ちしない（F4）。「この画面はこだわりたい」。
- 採用構成: 見出し（F3 で「あなたの習慣がもたらすインパクト」に変更）→ リード → **KPIごとの独立セクション ×4**（アイコン＋KPI名＋説明文 body＋「身についてない人と比べて / 全部100%身についたら」の2値対比）→ **4KPIまとめ**（縮約対比・F1 の折り返し対策）→ 身についている習慣リスト → CTA。
- F1 の折り返し対策: 崩れの原因は固定幅列（w-20/w-24）に長い見出し「全部100%身についたら」と「+127万円/年」が収まらず wrap していたこと。まとめは (1) 列見出しを撤去し `currentLabel ／ fullLabel` の凡例 1 行（段落として自然折り返し）に置換、(2) 値は `whitespace-nowrap tabular-nums`、名前は `flex-1 truncate` で可変幅にした。セクション内の 2 値も grid-cols-2 の各セルで `whitespace-nowrap`。375px でラベル11字×11px≒100px が半幅セルに収まる。
- F2: 列ラベル「今のペースなら」→「身についてない人と比べて」。診断は未来のみ加算モデル（非実践者=0 基準）なので、現在ペース値＝習慣なしと比べた増分であり意味的にも整合する。en は "vs. someone without these habits"。
- F4 説明文: エビデンス規律に従い数値・過剰断定を body に含めず（証明/必ず を禁止語としてテスト固定）、「研究で示されています」トーンに統一。数字は既存 diagnosis-v3 の result/fullResult 表示値のみ（新規計算なし）。健康寿命・前向きな気持ちの時間を重点説明（前向きは既存 kpiSelect/記事データの支持範囲＝健康・生産性・人間関係との関連に限定）。造語なし（KPI 名はカタログ4語のみ）。
- 0 値の扱い: cur/full の raw<=0 は「—」表示（+0 のノイズを避ける。D-change3-2 の 0=非表示方針と整合）。セクション自体は教育目的で 4 つとも常時表示。

## D-feedback-2: [4]習慣リストのアイコン・効果値・エビデンス記事（F5/F6）
- F5: answeredHabits（rate>0）の各行に preset.icon（KpiIcon）＋主要KPI（primaryKpis[0]）の生涯ポテンシャル値（habitPotentialV3 の達成率100%基準・既存関数の再利用、新規計算なし）を表示。KpiIcon の ICON_MAP に不足していたオンボ15習慣のアイコン（dumbbell/salad/glass-water/hamburger/soup/pen-line/message-circle-heart）を追加（未登録は Sparkles にフォールバックしていた）。
- F6: 行タップで**既存の EvidenceArticleSheet**（アプリ本体の Discover/Home で使用中・articleId を受け取る bottom sheet）を preset.articleIds[0] で開く。新規記事UIは作らない。affordance は ChevronRight＋hover:border-primary/40＋active:scale。ImpactArticleSheet（habit を要求する Dialog）ではなく EvidenceArticleSheet を選択した理由: オンボ時点で habit レコードは未作成で articleId のみ手元にあるため、articleId を直接受ける後者が適合。
- TDD: onboarding-impact-sections.test.ts を新規追加（kpiSections body の存在/長さ/健康寿命・前向きの枠組み語/過剰断定不在、summaryLabel等の存在、15習慣のアイコン・主要KPI・先頭記事の解決）。onboarding-messages.test.ts の title/currentLabel 期待値を新文言へ更新。全 760 テスト PASS、tsc clean、lint 0 error、build 成功。
