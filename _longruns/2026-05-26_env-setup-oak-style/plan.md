# Plan: Smitch 環境構成（OAK Casino パターン移植 + Draft PR + Merge Queue）

## 生成情報
- 作成日: 2026-05-26
- Brain Dump元: `/wt-setup` 経由のセッション内引数
- 質問回数: 7問

## ゴール
OAK Casino で確立された 4 環境構成（dev / preview / staging / prod）を Smitch リポジトリに移植する。ただし「PR push では何も自動実行しない・明示的に CI/Preview をトリガーし、マージボタン押下で初めて最終 CI が走る」という Draft PR 中心のワークフローを成立させる。

## ビジネスコンテキスト
- 対象ユーザー: oratta（indie 開発者）
- 提供価値:
  - Draft PR を更新し続けながら、開発進行のたびに無駄に CI/Vercel ビルドを消費しない（コスト + 待ち時間削減）
  - 「マージするときだけ最後の CI が走り、失敗するとマージできない」という最小コストでの安全網
  - staging で本番同等データの動作確認、prod は明示的な workflow_dispatch + GitHub Environment approval で誤デプロイ防止
- 成功指標: PR 起票 → ラベル付与で preview → main マージで staging 自動デプロイ → workflow_dispatch + approval で prod デプロイ、までの全フローが Smitch 上で動作する

## 技術要件
- スタック: Next.js 16.1.6 / Vercel / Supabase / GitHub Actions / Vercel CLI (`npm i -g vercel`)
- 参照パターン:
  - `~/.superset/worktrees/OAK Casino/proud-dryosaurus/.github/workflows/{ci,deploy-preview,deploy-staging,deploy-production,setup-vercel-env}.yml`
  - `~/.superset/worktrees/OAK Casino/proud-dryosaurus/docs/environment-strategy.md`
  - `~/.superset/worktrees/OAK Casino/proud-dryosaurus/vercel.json`（`github.enabled: false`）
- 制約:
  - PR push トリガー（`on: pull_request: types: [synchronize]`）禁止。明示トリガーのみ
  - Smitch 本体機能（src/）には触らない
  - Cloudflare DNS の実操作は CLI から行わず、手順記述のみとする
  - Supabase マイグレーション自動適用は導入しない（手動 `supabase db push`）
- テストフレームワーク: Vitest（既存）+ Playwright（インストール済、E2E 未整備のため smoke のみ）
- テスト実行コマンド: `npm test` / `npm run lint` / `npx next build`
- インフラ検証: `actionlint`（Docker 経由）+ `gh workflow run` での手動発火検証

## スコープ

### 含むもの
- Smitch 用の `docs/infrastructure/environment-strategy.md` 作成（OAK Casino docs の Smitch 文脈版）
- `.github/workflows/` 配下に 4 本のワークフローを新規配置:
  - `ci.yml` — lint + typecheck + test。**トリガーは PR ラベル `preview` 付与 + Merge Queue（`merge_group`）のみ**
  - `deploy-preview.yml` — Vercel Preview デプロイ。**トリガーは PR ラベル `preview` 付与のみ**
  - `deploy-staging.yml` — main push 時の staging 自動デプロイ。env override で **prod Supabase** に差し替え + `staging.s-mitch.com` への alias
  - `deploy-production.yml` — `workflow_dispatch` + `confirm=true` input + GitHub Environment "Production" approval gate（reviewer: oratta）
- `vercel.json` の `github` キーを `{ "enabled": false }` に**置き換える**（既存 `autoAlias: false` は削除。`enabled: false` で Git 連携自体が無効化されるため `autoAlias` は no-op になり不要）
- GitHub Merge Queue を有効化するための Branch Protection 設定手順をドキュメント化（GitHub UI 操作 + `gh api` コマンド両方）
- GitHub Secrets / Vars セットアップ手順:
  - Secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PROD_SUPABASE_URL`, `PROD_SUPABASE_ANON_KEY`, `PROD_SUPABASE_SERVICE_ROLE_KEY`
  - Vars: `STAGING_DOMAIN=staging.s-mitch.com`, `PRODUCTION_DOMAIN=s-mitch.com`
- GitHub Environment "Production" 作成 + Required reviewers: oratta の設定手順をドキュメント化
- `staging.s-mitch.com` の DNS（Cloudflare）+ Vercel domain 追加手順をドキュメント化
- 各ラベル（`preview`）作成手順
- `_archive` 内 `2026-05-26_env-setup-oak-style` ランディレクトリの維持

### 含まないもの
- Smitch 本体機能の改修（理由: スコープ外。本タスクはインフラ構築のみ）
- Supabase Free → Pro アップグレードの実行（理由: コスト判断はユーザー本人。本 run は手順記述のみ）
- LIFF / LINE 関連設定（理由: Smitch は OAuth/Email 認証で LINE 不使用）
- Cron Jobs の設定（理由: Smitch には現状 cron がない。必要になれば別 run）
- 既存 deploy（Vercel 自動）からの GitHub Actions への切替時のダウンタイム検証（理由: indie プロダクトで一時的なデプロイ停止は許容）
- Smitch コードベースへの reusable workflow 抽出（理由: ワークフロー 4 本でまず動かし、抽象化は使用実績後）
- 統合テストの新規追加（理由: 既存テストの実行で十分。新規 e2e は本タスクスコープ外）

## Changes分解

### change-A: OAK Casino 環境戦略の Smitch 文脈ドキュメント化
- **スコープ**: `docs/infrastructure/environment-strategy.md` を新規作成。OAK Casino の `docs/environment-strategy.md` をベースに、Smitch 用に書き換える
  - 各環境の URL（staging.s-mitch.com / s-mitch.com）/ Supabase プロジェクト ID（`xhqddzdpcpvxpprxykct` dev, `erminkotxfnxlkxktejv` prod）
  - LIFF 関連セクションは削除し、Smitch の Google OAuth + Email 認証セクションに置き換える
  - Cron Jobs セクションは「現状なし」として記述
  - 本 run のワークフロー（Draft PR + Merge Queue + ラベル発火 preview）を反映した「開発ワークフロー」セクション
  - **Staging 動作確認時の禁則事項セクション**（必須）: (a) staging は prod DB を参照するため、自分のアカウントでの書き込みは prod に直接反映される、(b) RLS により他ユーザーのデータは見えないが書き込みは本物、(c) QA 用途では prod に専用 QA アカウントを作成して使う
  - **`vercel.json` の `github.enabled: false` 設計理由セクション**: 「GitHub Actions + Vercel CLI でデプロイするため Git 連携自体を無効化。`autoAlias` は Git 連携前提のオプションのため削除した」を記載
- **使用スキル**: なし（純粋な編集）
- **依存関係**: change-B と**並列可能**（docs とワークフロー実装は相互独立）
- **config.yaml rules**:
  - "ドキュメントは Smitch の実プロジェクト ID と URL を使用すること（OAK Casino の値を残さない）"
  - "LIFF/LINE 関連記述は完全に削除すること"
  - "Staging が prod DB を参照する点のリスク注意書きを必ず含めること"

### change-B: GitHub Actions ワークフロー 4 本の配置 + vercel.json 更新
- **スコープ**: `.github/workflows/` を新設し、以下 4 本を配置:
  - `ci.yml`: lint + typecheck（`npx next build` で代替）+ test（`npm test`）+ actionlint。トリガー: `pull_request: types: [labeled]` で label.name == 'preview' 時 + `merge_group` + `workflow_dispatch`
  - `deploy-preview.yml`: PR ラベル `preview` 付与時に Vercel Preview デプロイ。PR コメントに Preview URL を書き込む。OAK Casino 版をベースに `pull_request: types: [opened, synchronize, reopened]` → `pull_request: types: [labeled]` + label.name フィルタに変更
  - `deploy-staging.yml`: main push で発火。OAK Casino 版から LIFF 上書き処理を全削除、Supabase URL/key 上書き + `staging.s-mitch.com` alias のみ残す
  - `deploy-production.yml`: OAK Casino 版をほぼそのまま流用（LIFF 言及なし）。`environment: name: Production` で reviewer 承認ゲート
  - `vercel.json` の `github` キーを `{ "enabled": false }` に**置き換え**（`autoAlias: false` は削除）
- **使用スキル**: なし（テンプレ移植）
- **依存関係**: change-A と**並列可能**。change-C / change-D の前提
- **config.yaml rules**:
  - "OAK Casino のワークフローを参照するが、LIFF/LIFF_MOCK の env は全て削除すること"
  - "ci.yml の trigger は push を含まないこと（PR ラベル発火 + merge_group + workflow_dispatch のみ）"
  - "actionlint を CI に含めること（OAK Casino と同じく Docker 経由）"
  - "実装前に `cat package.json` で既存 scripts を確認し、`typecheck` スクリプトがあればそれを使用、なければ OAK Casino と同じ `npx next build` で代替"

### change-C: GitHub Merge Queue + Branch Protection + Environment 設定手順書
- **スコープ**: `docs/infrastructure/github-setup.md` を作成し、以下の GitHub 側設定手順を `gh` CLI コマンド + UI 操作の両方で記述:
  - Branch Protection Rule（main ブランチ）:
    - **PR 上では `ci` を Required Status Check に指定しない**（ラベル `preview` 未付与時は `ci` が走らないため pending のままになりマージ不可になる問題を回避）
    - 代わりに **Require merge queue を有効化** + Merge Queue の Required Status Check に `ci` を指定。`merge_group` イベント経由で実行される `ci` の PASS のみがマージ条件になる
    - この設計理由を手順書内に明記（GitHub の Merge Queue + Required Status Check の仕様: `merge_group` で実行されたチェックが Required の対象になる）
  - Merge Queue 設定（最小 PR=1、CI 必須、デフォルト推奨値）
  - GitHub Environment "Production" 作成 + Required reviewers = oratta
  - GitHub Secrets / Vars の登録（実値ではなくキー名と取得元のみ記述）
  - **PR ラベル `preview` の作成**: `gh label create preview --color ededed --description "Trigger preview deploy and CI"`
  - **重要**: ラベル作成はワークフロー merge より**前**に行う必要がある旨を太字で警告（ラベル不在だと付与操作自体ができないため）
- **使用スキル**: なし（手順書のみ）
- **依存関係**: change-B（ワークフローが存在することで Required status check が意味を持つ）
- **config.yaml rules**:
  - "実 token・実 key は記述しないこと（取得元のみ）"
  - "可能な限り `gh` コマンドの一括実行例を提供すること"
  - "PR 上の Required Status Check に `ci` を指定しない設計理由を必ず記述すること"

### change-D: Vercel + Cloudflare DNS staging.s-mitch.com 設定手順 + Vercel Git Integration 切断 + 動作確認手順
- **スコープ**: `docs/infrastructure/staging-domain-setup.md` を作成:
  - **Vercel プロジェクト `shukan` の Git Integration 切断手順**: Vercel Dashboard → Project Settings → Git → Disconnect。これにより push 時の Vercel 自動デプロイが完全に止まり、以降は GitHub Actions のみがデプロイ経路になる
  - Cloudflare DNS で `staging.s-mitch.com` の A レコードを Vercel IP（`76.76.21.21`）に設定する手順
  - Vercel プロジェクト `shukan` に `staging.s-mitch.com` をドメイン追加する手順（`vercel domains add`）
  - 動作確認 e2e フロー（このランのVerify段階で実行する）:
    1. **`gh label create preview --color ededed` でラベル作成**（必須・前提）
    2. `gh secret set` で必要 secrets を登録
    3. PR を起票してラベル `preview` を付与 → `deploy-preview.yml` + `ci.yml` が走り、Preview URL がコメントされる
    4. main にマージ（Merge Queue 経由）→ `merge_group` で `ci` 実行 PASS → `deploy-staging.yml` が staging.s-mitch.com にデプロイ
    5. `gh workflow run deploy-production.yml -f confirm=true` → approval 待ち → oratta 承認で s-mitch.com にデプロイされる
- **使用スキル**: なし
- **依存関係**: change-B, change-C
- **config.yaml rules**:
  - "Cloudflare 操作は API キー操作を含まないこと（UI 手順のみ）"
  - "ラベル作成 (`gh label create preview`) はワークフロー merge 前に行う旨を verify 手順 1 として明記すること"

## 画面・UI設計
（インフラタスクのため UI 変更なし）

## データモデル
（DB スキーマ変更なし。Supabase 接続先を環境ごとに切り替えるだけ）

参考: 環境ごとの Supabase 接続先
| 環境 | プロジェクト | 用途 |
|---|---|---|
| dev (local) | `xhqddzdpcpvxpprxykct` | 開発 + Preview 共有 |
| preview (Vercel) | `xhqddzdpcpvxpprxykct` | PR 動作確認 |
| staging (Vercel) | `erminkotxfnxlkxktejv` (prod) | env override で prod DB を参照 |
| production (Vercel) | `erminkotxfnxlkxktejv` (prod) | 本番 |

## 受け入れ条件

**必須条件（常に含める）:**
1. [ ] 全changeのOpenSpec仕様が作成・レビュー済み
2. [ ] 全changeのテストが作成され全てPASSしている（**インフラ run のため、テスト = actionlint PASS + workflow 構文検証 + 既存 `npm test` PASS + `npm run lint` PASS で代替**）
3. [ ] ビルドエラーなし（`npx next build` 成功）
4. [ ] 統合テストがPASS（worktreeマージ後に `npm test && npm run lint && npx next build` が全て通る）

**機能固有の条件:**
5. [ ] `docs/infrastructure/environment-strategy.md` が存在し、OAK Casino の LIFF 関連記述が含まれていない（`grep -i liff docs/infrastructure/environment-strategy.md` が空）
6. [ ] `.github/workflows/{ci,deploy-preview,deploy-staging,deploy-production}.yml` の 4 ファイルが存在し、`actionlint` で構文エラーなし
7. [ ] `ci.yml` のトリガーが「PR ラベル発火 + `merge_group` + `workflow_dispatch` のみ」であること（`actionlint` PASS + ファイル全体を目視確認。`on.pull_request.types` に `synchronize`/`opened`/`reopened` 等の push 連動型が含まれていないことを人間が読んで確認する）
8. [ ] `deploy-preview.yml` のトリガーが `pull_request: types: [labeled]` であり、job レベルに `if: github.event.label.name == 'preview'` ガードを持つ
9. [ ] `deploy-staging.yml` のトリガーが `push: branches: [main]` で `concurrency: group: staging-deploy` を持つ
10. [ ] `deploy-production.yml` のトリガーが `workflow_dispatch` で `environment: name: Production` を持つ
11. [ ] `vercel.json` の `github` キーが `{ "enabled": false }` であり、`autoAlias` キーが**含まれていない**（`grep autoAlias vercel.json` が空であること + `grep -A 2 '"github"' vercel.json` が `"enabled": false` を含むこと）
12. [ ] `docs/infrastructure/github-setup.md` に Merge Queue 設定の `gh` コマンド例 + 「PR 上では `ci` を Required Status Check に**しない**」設計理由が記載されている
13. [ ] `docs/infrastructure/staging-domain-setup.md` に Cloudflare DNS / Vercel domain 追加 / **Vercel Git Integration 切断手順** / `gh label create preview` の 4 手順が全て含まれている
14. [ ] `docs/infrastructure/environment-strategy.md` に「Staging 動作確認時の禁則事項」セクションが存在し、prod DB 書き込みリスクと QA アカウント運用について記載されている

**手動確認条件（自律 verify では到達できないため、ユーザー確認フェーズで判断）:**
15. [ ] PR ラベル `preview` 付与で `deploy-preview.yml` が発火し、Preview URL が PR コメントに投稿される
16. [ ] main マージ → `staging.s-mitch.com` がデプロイ・到達可能
17. [ ] `gh workflow run deploy-production.yml -f confirm=true` → reviewer 承認後に `s-mitch.com` がデプロイされる
18. [ ] PR 中の merge ボタンクリックで Merge Queue が走り、CI 失敗時はマージ不可

## 意思決定ガイドライン
- 優先順位: **OAK Casino との一致性 > シンプルさ > 拡張性**
  - 同じパターンを別プロジェクトで再現することが価値の中心。OAK Casino で動いている書き方を変えない
- リスク許容度: 中程度
  - Staging が prod DB を共有するため、データ破壊操作は本タスクスコープに含めない
- 不明点の扱い: **OAK Casino の実装を優先**
  - workflow の細かい記法（`concurrency` のキー名、`cache: 'npm'` の有無等）は OAK Casino と完全に同じにする
  - Smitch 固有の事情（Supabase プロジェクト ID、ドメイン、LIFF 不在）でのみ差分を持つ

## 動作確認方法
- 開発サーバー: `npm run dev`（http://localhost:3000）
- テスト: `npm test`（vitest）
- lint: `npm run lint`
- ビルド: `npx next build`
- workflow 構文検証: `docker run --rm -v "$(pwd):/repo" --workdir /repo rhysd/actionlint:latest -color`
- 確認手順:
  1. ローカルで `npm test && npm run lint && npx next build` が全て通る
  2. `actionlint` が `.github/workflows/*.yml` で構文エラーゼロ
  3. ドキュメント 3 本（environment-strategy.md / github-setup.md / staging-domain-setup.md）の整合性を読み返し確認
  4. （手動）ユーザーが `docs/infrastructure/github-setup.md` の手順に従って Secrets/Vars/Environment/Merge Queue を実際に設定
  5. （手動）テスト PR を起こして label 付与 → preview → main マージ → staging → prod までの 4 段階フローを通す

## Brain Dumpからの原文メモ
> OAK Casinoで構築しているような本番環境設定をしたいです。エッセンスとしては、Vercelのステージ環境があり、GitHubのメインはVercelのステージ環境とつながっていて、GitHubアクション上で明示的に本番にデプロイするという流れにしたい。まず、開発環境、プレビュー環境、ステージ環境、本番環境それぞれの環境がどのように構築されているかを、OAK Casino上でチェックして整理してください。もう一個プレビュー環境に関してはワークフローとして、最初にプルリクを作ってそれを更新し続けるというドラフトのプルリクを作る運用ができるように、プルリクにプッシュされたからといってCIとかプレビュー環境をすぐ作る必要はない。ユーザーは明示的にCIの実行やプレビュー環境へのデプロイを明示するようなイメージです。理想は、マージするときに最後のCIが走り、CIが失敗するとマージできない、という流れです。
