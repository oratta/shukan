# Plan: issue#13 効果数字の3場面構造とオンボ成果物のアプリ接続

## 生成情報
- 作成日: 2026-07-03
- Brain Dump元: GitHub issue #13 + 確定タスクリストコメント（issuecomment-4871824518）+ セッション内対話
- 質問回数: 4問

## ゴール
効果の数字を「習慣の状態」で時間軸を変えて見せる3場面構造（オンボ診断=未来の対比 / active=積み上げ / established=生涯効果）を実装し、オンボーディングの成果物（tracked_kpis・プロフィール）をアプリ本体に接続する。launch-blocker issue #13 の確定タスク A〜D（D-4 を除く）を完了させる。

## ビジネスコンテキスト
- 対象ユーザー: オンボーディングを完了して習慣に取り組む Smitch ユーザー
- 提供価値: 場面ごとに意味のある数字（伸びしろの可視化 / 行動の即時報酬 / 確定した資産の確認）を見せることで、継続動機を最大化する。ローンチ可否の主要ゲート
- 成功指標: issue #13 の確定タスク A〜D（D-4 除く）が全てチェック済みになり、issue をクローズできる状態

## 技術要件
- スタック: Next.js 16.1.6 / React 19 / TypeScript 5 / Tailwind CSS 4 / next-intl（ja/en）/ Supabase
- 参照パターン:
  - 効果計算: `src/lib/impact.ts`（v2系）・`src/lib/diagnosis-v3.ts`（達成率パラメータ受け取り済み）
  - プロフィール: `src/lib/profile.ts` の `resolveDerivedProfileValues`（余命・日給）
  - habits.status: `src/types/habit.ts` の `'active' | 'established'`（型・CRUD・マイグレーション実装済み）
  - 記事データ: `src/data/impact-articles/`（記事38ファイル。`index.ts` と `LLM/` サブディレクトリを除く）。値の根拠は life-impact-article スキルのエビデンス基準に従う
  - 既存テスト: `src/__tests__/impact.test.ts` / `diagnosis-v3.test.ts` / `habit-status-crud.test.ts` / `onboarding-messages.test.ts` の形式を踏襲
- 制約:
  - **造語禁止**。あの4つの指標は「KPI」とだけ呼ぶ。KPI 正式名は「健康寿命」「出費削減」「増える収入」「前向きな気持ちの時間」
  - 新規計算ロジックは作らない（オンボ対比は diagnosis-v3 に達成率=1 を渡すだけ。active は現行 completedDays ベース維持）
  - 「いつから続けているか」入力は追加しない。過去推定はやらない
  - established への自動昇格・卒業演出は実装しない（MVP 外）
  - dailyPositiveMoodMinutes の値設定は固定前提（起床16h・前向き50%・二重計上回避）と設定済み代表記事のパターンを踏襲する
  - **記事本文プローズ内の「コスト削減」「収入増加」は自然な日本語として残してよい**（ラベル統一の置換対象は KPI ラベル定義・UI 文言のみ。`src/data/impact-articles/` の本文を機械置換しない）
- テストフレームワーク: Vitest（unit/component）
- テスト実行コマンド: `npm run test:run`

## スコープ
### 含むもの
- A. ラベル・文言統一（「出費削減」「増える収入」への統一、en KPI 名統一、ja.json 英語残存修正、LP alt 更新）
- B. オンボ[4]結果画面: 現在達成率の未来値と「全部100%に身についたら」の対比表示 + [4]→[5] 導線文言調整
- C. 3場面構造: active の積み上げ＋今日の増分表示 / 4軸目「前向きな気持ちの時間」の UI 表示 / 全記事の dailyPositiveMoodMinutes 精査・値入れ / established のデイリーチェック除外＋ホーム内別セクション（生涯効果表示）/ 習慣編集フォームの status 手動設定
- D. オンボ成果物接続: ホームに tracked_kpis 反映 / 設定画面にプロフィール編集（生年・性別・収入・KPI 選択）/ resolveDerivedProfileValues を established・習慣詳細の生涯効果表示に接続

### 含まないもの
- D-4 KPI 起点プリセット（理由: issue 上も優先度低・MVP 外候補。ユーザー確認済み）
- アプリ全体 UI の再構築（理由: スコープが別次元。backlog に残留。ただし本 run のホーム変更は backlog 側の「ホームでの tracked_kpis 表示・強調」を先行消化する）
- established 昇格の自動提案・卒業演出（理由: issue 上 MVP 外確定）
- 過去累積の本格導入（理由: effect-model §1.5 の既定方針どおり post-launch）

## Changes分解

> 全 change は本 worktree（`oratta/13`）上で直列実行する。messages/*.json 等の共有ファイルを複数 change が触るため、並列 worktree は使わない。

### change-1: kpi-label-unification
- **スコープ**: タスク A 全部。`src/messages/ja.json` / `en.json` の `impact.dailyCost`→「出費削減」、`impact.dailyIncome`→「増える収入」、`ja.json` の `evidence.feedbackCost`→「出費削減の算出根拠」・`evidence.feedbackIncome`→「増える収入の算出根拠」、en の `impact.*` と `onboarding.kpi.*` の KPI 名統一、`ja.json` の `impact.fiveDaysImpact` 日本語化、LP alt テキスト更新（`src/components/landing/Process.tsx` / `Detail.tsx`）
- **使用スキル**: なし（機械的置換＋波及確認）
- **依存関係**: 独立（最初に実行）
- **config.yaml rules**:
  - "KPI 正式名は『健康寿命』『出費削減』『増える収入』『前向きな気持ちの時間』のみ。旧名・言い換え・造語を残さない"
  - "英語 KPI 名の正準は `onboarding.kpi.*.name` 側（Healthy lifespan / Cost saving / Income Growth）とし、`impact.*` をそれに合わせる。change-1 で扱うのは既存3軸のみ（4軸目 positive_mood の `impact.*` ラベル追加は change-3 スコープ）"
  - "置換対象はラベル定義・UI 文言のみ。`src/data/impact-articles/` の記事本文プローズは置換しない"

### change-2: onboarding-future-contrast
- **スコープ**: タスク B 全部。オンボ[4]結果画面に「現在の達成率での未来」と「全習慣100%に身についた場合」の対比を表示（diagnosis-v3 に達成率=1 を渡す）。[4]→[5] の導線文言を「あなたが今重視したいのはどれ？」の流れに調整
- **使用スキル**: なし
- **依存関係**: change-1（KPI ラベルキーを参照するため）
- **config.yaml rules**:
  - "新規計算ロジックを作らない。diagnosis-v3 の既存関数に達成率パラメータを渡すだけ"
  - "『いつから』入力・過去推定を追加しない"

### change-3: mood-axis-display
- **スコープ**: タスク C の4軸目関連。「前向きな気持ちの時間」を `daily-impact-summary.tsx` / `impact-badge.tsx` / `savings-card.tsx` / `stats/page.tsx` / `discover/page.tsx` / 記事シート2種 / `evidence-picker.tsx` / `evidence-manager-sheet.tsx` に表示。全38記事ファイルの `dailyPositiveMoodMinutes` を精査し、固定前提（起床16h・前向き50%・二重計上回避）＋設定済み代表記事パターン踏襲で値入れ（意図的に 0 のままにする記事はコード内コメントで理由を明記。現状29記事が値0で、値入れ対象はこの29本に集中する。フィールド欠落記事は無い）
- **使用スキル**: life-impact-article（値のエビデンス基準）
- **依存関係**: change-2（直列実行。ラベルは change-1 に論理依存）
- **config.yaml rules**:
  - "dailyPositiveMoodMinutes は根拠なしに値を置かない。固定前提と既存設定済み記事のパターンから導出し、導出根拠を記事ファイル内コメントに残す"
  - "最初に値設定済みの代表記事を全て特定してパターンを抽出し、その後に残り記事へ展開する（いきなり個別記事から始めない）"
  - "4軸目 positive_mood の `impact.*` ラベル（ja/en）はこの change で追加する"

### change-4: three-scene-habit-display
- **スコープ**: タスク C の3場面構造。active 習慣の「アプリ開始からの積み上げ＋今日の増分」の明確化（計算は現行維持・ラベル正式名統一）。established 習慣をデイリーチェック対象から除外し、ホーム下部の「身についた習慣」セクション（チェックボックスなし）に生涯効果（「この習慣が残りの人生であなたにもたらすこと」・オンボと同形式）を表示。**established 習慣はデイリー系指標（stats の完了率・ストリーク・PWA day-status マップ）からも除外する**（既存コードは `habit.status` で一切フィルタしていないため、この change が最初の分岐導入者。除外方針を `src/__tests__/habits.test.ts` にケース追加して固定する）。習慣編集フォームに status 手動設定（「完全に身についた」トグル）を追加
- **使用スキル**: なし
- **依存関係**: change-3（直列実行）
- **config.yaml rules**:
  - "established の自動昇格提案・卒業演出を実装しない（手動設定のみ）"
  - "active の積み上げ計算は completedDays 実績ベースの現行ロジックを変更しない"
  - "established はデイリー系指標（完了率・ストリーク・day-status）から除外し、生涯効果表示のみに用いる"

### change-5: profile-app-connection
- **スコープ**: タスク D（D-4 除く）。ホームにオンボで選んだ KPI（`user_profiles.tracked_kpis`）を反映。設定画面にプロフィール編集（生年・性別・収入・KPI 選択。オンボ入力 UI のコンポーネント再利用を基本方針）。`resolveDerivedProfileValues`（余命・日給）を established セクション・習慣詳細の生涯効果表示に接続
- **使用スキル**: なし
- **依存関係**: change-4（established 表示に個人化を接続するため）
- **config.yaml rules**:
  - "プロフィール未設定ユーザーには現行のデフォルト値でフォールバックし、エラーにしない"
  - "設定画面からの `user_profiles` UPDATE 前に、update RLS ポリシーの存在を確認する（オンボ書き込み実績があるため存在する可能性が高いが、無ければマイグレーション追加）"

## モデル割り当て

自律実行（exec）の各フェーズ agent に割り当てるモデルティアを change × ロールごとに指定する。
exec はこの表を読み、ティアを `plugins/longrun/references/model-tiers.md` で解決して
Workflow の `opts.model` に反映する。

| change | ロール | ティア(haiku/sonnet/inherit) | 理由 | 上書き |
|--------|--------|------------------------------|------|--------|
| change-1 | builder | inherit | ユーザーフィードバック「実装系 subagent は Opus」に従う | |
| change-1 | verifier | haiku | 文言置換の定型的な静的検証（grep＋テスト） | |
| change-1 | reviewer | inherit | Build Contract レビュー | |
| change-2 | builder | inherit | オンボ UI の対比表示実装（実装系は Opus 継承） | |
| change-2 | verifier | sonnet | ブラウザ検証を伴う UI 検証 | |
| change-2 | reviewer | inherit | Build Contract レビュー | |
| change-3 | builder | inherit | 39記事のエビデンス精査を伴う値設定＋複数コンポーネント改修 | |
| change-3 | verifier | sonnet | UI 表示＋データ整合の検証 | |
| change-3 | reviewer | inherit | Build Contract レビュー | |
| change-4 | builder | inherit | ホーム構造変更を含む複雑な TDD 実装 | |
| change-4 | verifier | sonnet | ブラウザ検証を伴う UI 検証 | |
| change-4 | reviewer | inherit | アーキテクチャレビュー | |
| change-5 | builder | inherit | オンボ UI 再利用の設計判断を伴う実装 | |
| change-5 | verifier | sonnet | ブラウザ検証を伴う UI 検証 | |
| change-5 | reviewer | inherit | アーキテクチャレビュー | |

## 画面・UI設計
- **オンボ[4]結果画面**: 既存の未来値表示に「全部100%に身についたら」の対比を追加。2値の対比が一目で分かる形式（現在→100% の並置または差分強調）。プロト準拠アニメ（count-up 等）の既存トーンを踏襲
- **ホーム**: 上部に「選んだ KPI」（tracked_kpis）の表示。デイリーチェックリストは active 習慣のみ。下部に「身についた習慣」セクション（established・チェックボックスなし・生涯効果表示）
- **active 習慣の効果表示**: 「アプリを始めてからの積み上げ」＋「今日の増分」を4軸（健康寿命・出費削減・増える収入・前向きな気持ちの時間）で表示
- **習慣編集フォーム**: status の手動設定 UI（「完全に身についた」）を追加
- **設定画面**: プロフィール編集セクション（生年・性別・収入・KPI 選択）。オンボの入力 UI コンポーネントを再利用

## データモデル
新規テーブル・カラムなし。既存スキーマを UI に接続するのみ:
- `habits.status`（`'active' | 'established'`）: 型・CRUD・マイグレーション実装済み。編集フォームから更新できるようにする
- `user_profiles`（tracked_kpis・生年・性別・収入）: オンボ書き込み済み。読み出し＋設定画面からの更新を追加
- `src/data/impact-articles/*.ts` の `dailyPositiveMoodMinutes`: 静的データの値更新（DB 変更なし）

## 受け入れ条件

**必須条件（常に含める）:**
1. [ ] 全changeのOpenSpec仕様が作成・レビュー済み
2. [ ] 全changeのテストが作成され全てPASSしている
3. [ ] ビルドエラーなし（型チェック + ビルド）
4. [ ] 統合テストがPASS（全change完了後の `npm run test:run` 一括実行）

**機能固有の条件:**
5. [ ] KPI ラベル定義・UI 文言（`src/messages/` および LP 含む UI コンポーネント。**`src/data/impact-articles/` の記事本文プローズは除外**）に旧ラベル「コスト削減」「収入増加」が残存しない。`ja.json` の `impact.fiveDaysImpact` に英語が残存しない
6. [ ] `en.json` の `impact.*` の KPI 英語名が正準の `onboarding.kpi.*.name`（Healthy lifespan / Cost saving / Income Growth）と一致している
7. [ ] オンボ[4]で、現在の達成率での未来値と達成率100%時の値の両方が表示され、100%時の値は `diagnosis-v3` に達成率=1 を渡した計算結果と一致する
8. [ ] 「前向きな気持ちの時間」が対象9箇所（daily-impact-summary / impact-badge / savings-card / stats / discover / 記事シート2種 / evidence-picker / evidence-manager-sheet）に4軸目として表示される
9. [ ] 全38記事の `dailyPositiveMoodMinutes` が精査済み（値 > 0、または 0 のままの理由コメント付き）
10. [ ] status=established の習慣がホームのデイリーチェックリストに表示されず、「身についた習慣」セクションに生涯効果付きで表示される
10-b. [ ] established 習慣が stats のデイリー完了率の分母・ストリーク計算に含まれない（`habits.test.ts` にケースあり）
11. [ ] 習慣編集フォームから status を established に変更すると DB に保存され、ホームの表示が切り替わる
12. [ ] ホームに `user_profiles.tracked_kpis` の KPI が表示される
13. [ ] 設定画面でプロフィール（生年・性別・収入・KPI 選択）を編集・保存でき、`user_profiles` に反映される
14. [ ] established の生涯効果が `resolveDerivedProfileValues`（余命・日給）で個人化される。プロフィール未設定時はデフォルト値でフォールバックする

## 意思決定ガイドライン
- 優先順位: issue 確定タスクの忠実な実装 > シンプルさ > 見た目の作り込み
- リスク許容度: 保守的（既存の計算ロジック・オンボフローを壊さない）
- 不明点の扱い: issue コメント（4871824518）を正とする。UI の細部はオンボで確立したデザイントーンに合わせ、シンプルな方を選ぶ

## 動作確認方法
- 開発サーバー: `npm run dev`（http://localhost:3000。ポート使用中なら 3001 以降。dev Supabase `xhqddzdpcpvxpprxykct` に接続）
- テスト: `npm run test:run`（Vitest 一括）、型チェック `npx tsc --noEmit`、ビルド `npm run build`
- ブラウザ検証: Verify フェーズで longrun-browser-verifier による実ブラウザ検証を実施する（オンボ[4]対比表示 → [5]導線 → ホームの KPI 表示・established セクション → 習慣編集フォームの status 変更 → 設定画面のプロフィール編集）
- テストデータ: dev は oratta@gmail.com（Google OAuth）。habits + user_profiles の delete でリセット可
- 確認手順:
  1. オンボを最初から実行し、[4]で現在達成率と100%対比が表示されること
  2. ホームで tracked_kpis と active 習慣の積み上げ＋今日の増分が表示されること
  3. 習慣編集で status を「完全に身についた」に変更 → ホーム下部の「身についた習慣」セクションに生涯効果付きで移動すること
  4. 設定画面でプロフィールを編集 → established の生涯効果の数字が変わること（個人化）

## Brain Dumpからの原文メモ
> issue#13 の対応（効果数字の3場面構造: オンボ=未来/active=積み上げ/established=生涯値）。確定タスクリストは GitHub issue #13 のコメント参照
>
> （issue コメントより）効果の数字は「習慣の状態」で時間軸を変える。オンボ=伸びしろの可視化・自分事化 / active=行動の即時報酬 / established=確定した資産の確認。実装はこのコメントを正とする。
>
> （対話での決定）established はホーム内別セクション / データ拡充は今回 run で自律設定 / D-4・UI全体刷新は含めない / ブラウザ検証あり
