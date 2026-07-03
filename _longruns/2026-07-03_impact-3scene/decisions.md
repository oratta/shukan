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
