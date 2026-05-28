# GitHub Setup Guide — Smitch

`.github/workflows/{ci,deploy-preview,deploy-staging,deploy-production}.yml` の 4 本のワークフローを動かすために必要な **GitHub 側の設定一覧**と、その**再現可能な手順**を本書にまとめる。

OAK Casino で確立された Draft PR + Merge Queue + ラベル発火 preview のワークフローを Smitch に移植するための、GitHub UI / `gh` CLI / `vercel` CLI それぞれの操作手順を含む。

## 設定の前提

- `gh` CLI が認証済み（`gh auth status` で確認）
- `vercel` CLI が認証済み（`vercel whoami` で確認）
- リポジトリ管理権限（Admin）を持つアカウントで実行

## 推奨設定順序（必ずこの順で進めること）

```
1. PR ラベル `preview` の作成
   ↓
2. GitHub Secrets / Vars の登録
   ↓
3. GitHub Environment "Production" の作成 + Required reviewers
   ↓
4. Branch Protection Rule + Merge Queue の有効化
   ↓
5. Vercel 環境変数（Preview / Production）の手動登録
   ↓
6. テスト PR を起票して動作確認
```

> なぜこの順序か:
> - **ラベルが先**: ラベル不在では PR への付与操作自体ができず、`deploy-preview.yml` が発火する手段がなくなる
> - **Secrets/Vars が先**: 不在のままワークフロー実行すると失敗するため
> - **Environment が先**: `deploy-production.yml` の `environment: name: Production` が存在しないと dispatch しても即エラー
> - **Branch Protection / Merge Queue は後**: Required Status Check として `ci` を指定する都合上、`ci.yml` が一度でも `merge_group` 経由で走った実績を後で参照しやすい
> - **Vercel env は後**: GitHub Actions が `vercel deploy` を呼ぶ時点でVercel側に env がないとビルド時に解決できないが、登録自体は GitHub Actions に依存しないので前後どちらでもよい（本書では明示の分離のため後段で扱う）

---

## 1. PR ラベル `preview` の作成（最優先・最初に行うこと）

> **重要: workflow merge 前に必ず作成すること。**  
> ラベルが存在しない状態でワークフローを merge すると、PR にラベル `preview` を付与する操作自体ができないため、`deploy-preview.yml` と `ci.yml`（PR トリガー）は永久に発火しない。

```bash
gh label create preview \
  --color ededed \
  --description "Trigger preview deploy and CI"
```

### 作成済みかどうかの確認

```bash
gh label list | grep preview
```

`preview  Trigger preview deploy and CI  ededed` が表示されれば OK。

### 既に同名ラベルがあって色や説明を更新したい場合

```bash
gh label edit preview \
  --color ededed \
  --description "Trigger preview deploy and CI"
```

---

## 2. GitHub Secrets / Vars の登録

ワークフローから `${{ secrets.* }}` / `${{ vars.* }}` で参照する値を登録する。

### Secrets 一覧（9 件）

| キー名 | 取得元 | 用途 |
|---|---|---|
| `VERCEL_TOKEN` | Vercel Dashboard > Account Settings > Tokens > Create Token（スコープ: Full Access、Expiration: 適切な期間） | `vercel deploy` / `vercel alias` の認証 |
| `VERCEL_ORG_ID` | Vercel Dashboard > Account Settings > General > **Your ID**（または `cat .vercel/project.json` の `orgId`） | Vercel CLI の組織識別 |
| `VERCEL_PROJECT_ID` | Vercel プロジェクト `shukan` > Settings > General > **Project ID**（または `cat .vercel/project.json` の `projectId`） | デプロイ先プロジェクト識別 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dev プロジェクト `xhqddzdpcpvxpprxykct` > Settings > API > **Project URL** | dev/preview の Supabase 接続 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dev プロジェクト `xhqddzdpcpvxpprxykct` > Settings > API > **anon public** | dev/preview の Supabase 接続（クライアント） |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dev プロジェクト `xhqddzdpcpvxpprxykct` > Settings > API > **service_role secret** | dev/preview の Supabase 接続（管理用） |
| `PROD_SUPABASE_URL` | Supabase prod プロジェクト `erminkotxfnxlkxktejv` > Settings > API > **Project URL** | staging/prod の Supabase 接続 |
| `PROD_SUPABASE_ANON_KEY` | Supabase prod プロジェクト `erminkotxfnxlkxktejv` > Settings > API > **anon public** | staging/prod の Supabase 接続（クライアント） |
| `PROD_SUPABASE_SERVICE_ROLE_KEY` | Supabase prod プロジェクト `erminkotxfnxlkxktejv` > Settings > API > **service_role secret** | staging/prod の Supabase 接続（管理用） |

### Vars 一覧（2 件）

| キー名 | 値 | 用途 |
|---|---|---|
| `STAGING_DOMAIN` | `staging.s-mitch.com` | `deploy-staging.yml` の alias 先 |
| `PRODUCTION_DOMAIN` | `s-mitch.com` | `deploy-production.yml` の alias 先 + Environment URL |

### Secrets 一括登録の `gh` コマンド例

`gh secret set <KEY>` は標準入力から値を読むため、対話入力モードか、`pbpaste` / ファイルから流し込む形で安全に登録できる（実値はシェル履歴に残さない）。

```bash
# --- 対話入力モード（推奨）: 1 件ずつ入力 ---
gh secret set VERCEL_TOKEN
gh secret set VERCEL_ORG_ID
gh secret set VERCEL_PROJECT_ID
gh secret set NEXT_PUBLIC_SUPABASE_URL
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY
gh secret set SUPABASE_SERVICE_ROLE_KEY
gh secret set PROD_SUPABASE_URL
gh secret set PROD_SUPABASE_ANON_KEY
gh secret set PROD_SUPABASE_SERVICE_ROLE_KEY

# --- クリップボード（macOS）から流し込む例 ---
# 値を一度コピーしてから:
pbpaste | gh secret set VERCEL_TOKEN

# --- ファイルから流し込む例 ---
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY < ./_tmp/anon.txt

# --- 登録確認（値は表示されない、キー名のみ）---
gh secret list
```

### Vars 一括登録の `gh` コマンド例

Vars は実値を表示しても問題ない（ドメイン名のみ）ため、コマンドラインで直接登録できる。

```bash
gh variable set STAGING_DOMAIN --body "staging.s-mitch.com"
gh variable set PRODUCTION_DOMAIN --body "s-mitch.com"

# --- 登録確認 ---
gh variable list
```

---

## 3. GitHub Environment "Production" の作成

`deploy-production.yml` の `environment: name: Production` を機能させるため、reviewer 承認ゲートとして Production Environment を作成する。

### UI 手順

1. リポジトリの **Settings** > **Environments** を開く
2. **New environment** をクリックし、Name に `Production` を入力 > **Configure environment**
3. **Deployment protection rules** > **Required reviewers** を有効化
4. テキストボックスに `oratta` を入力し、サジェストから選択 > **Save protection rules**
5. （任意）**Deployment branches and tags** を `Selected branches and tags` にして `main` のみ許可

### `gh api` 経由でも設定可能（オプション）

```bash
# Environment 作成 + Required reviewers 設定
# - reviewers.id は oratta の GitHub User ID（数値）。`gh api users/oratta --jq .id` で取得
ORATTA_ID=$(gh api users/oratta --jq .id)
REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)

gh api -X PUT "repos/${REPO}/environments/Production" \
  -f "wait_timer=0" \
  -F "prevent_self_review=false" \
  -F "reviewers[][type]=User" \
  -F "reviewers[][id]=${ORATTA_ID}" \
  -F "deployment_branch_policy[protected_branches]=true" \
  -F "deployment_branch_policy[custom_branch_policies]=false"
```

### 確認

- Settings > Environments に **Production** が表示され、`Required reviewers` バッジに `1 required reviewer` が出ていれば OK

---

## 4. Branch Protection + Merge Queue の有効化

main ブランチに Branch Protection Rule を設定し、Merge Queue を有効化する。

### 設計の前提（重要）

**PR 上では `ci` を Required Status Check に指定しない。** これは非標準だが、本リポジトリのワークフロー設計のために必須:

- `ci.yml` は `pull_request: types: [labeled]` で `label.name == 'preview'` でのみ発火する
- ラベル `preview` 未付与の通常の Draft PR では `ci` ジョブは**そもそも存在しない（Run history が無い）**
- この状態で `ci` を PR の Required Status Check に指定すると、GitHub は「必須チェックの結果待ち（pending）」と判定し、ラベルを付与しない限り**永久にマージできなくなる**
- 一方、Merge Queue 側の Required Status Check は `merge_group` イベントで実行されたチェックを参照する。`ci.yml` には `merge_group` トリガーが含まれているため、Merge Queue 経由でマージする際は必ず `ci` が新しく走り、その PASS のみがマージ条件になる

つまり:
- **PR 上**: Required Status Check に `ci` を**指定しない**（pending 化を回避）
- **Merge Queue 上**: Required Status Check に `ci` を**指定する**（実質的なマージガード）

これにより「Draft PR は何度プッシュしてもコストゼロ」「マージボタンを押した瞬間に最終 CI が走り、失敗するとマージできない」というワークフローが成立する。

### UI 手順

#### 4.1 Branch Protection Rule の作成

1. **Settings** > **Branches** > **Add branch ruleset**（または classic の **Add branch protection rule**）
2. Branch name pattern: `main`
3. **Rules**:
   - [x] **Require a pull request before merging**
     - Required approvals: `0`（indie 開発のため自分自身でマージ可）
     - [ ] Dismiss stale pull request approvals when new commits are pushed
   - [x] **Require status checks to pass**
     - **このセクションに `ci` を追加しないこと**（理由は上記）
     - 必要に応じて軽量チェックのみ（例: `actionlint` を別 workflow にしている場合はそれを）
   - [x] **Require merge queue**（後述 4.2 で詳細設定）
   - [x] **Block force pushes**
4. **Save changes**

#### 4.2 Merge Queue の設定

Branch ruleset / Branch protection rule の中の **Require merge queue** を有効化したうえで、Merge Queue の詳細設定を行う。

1. ルールセット編集画面の **Require merge queue** を展開
2. **Merge method**: `Squash and merge`（推奨）または `Merge commit`
3. **Build concurrency**: `1`（直列実行で安全側）
4. **Minimum / Maximum group size**: 既定の `1` / `5` のままで OK
5. **Wait time**: `5` minutes（既定）
6. **Required status checks to pass before merging**（**こちら**に `ci` を指定する）:
   - `ci`（`ci.yml` の job 名と一致させること）
   - 必要に応じて他の `merge_group` トリガー対応 workflow も
7. **Save**

### `gh api` 経由での設定例

Branch protection / merge queue の設定は REST API でも可能。`gh api` の `-F` でフラグを送る:

```bash
REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)

# Branch Protection (classic API)
# - required_status_checks.contexts は空配列 = PR 上では ci を Required にしない
# - required_pull_request_reviews は最小設定（approvals=0）
gh api -X PUT "repos/${REPO}/branches/main/protection" \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": []
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0,
    "dismiss_stale_reviews": false,
    "require_code_owner_reviews": false
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": false,
  "lock_branch": false,
  "allow_fork_syncing": true,
  "required_merge_queue_checks": {
    "checks": [{ "context": "ci" }]
  }
}
JSON

# 注: required_merge_queue_checks の正確な仕様は GitHub の更新で変動するため、
# UI で一度設定した後に `gh api repos/${REPO}/branches/main/protection` で
# 取得した JSON を真とすること。
```

> 補足（GitHub Merge Queue 仕様メモ）:  
> Merge Queue の Required Status Check は、PR をキューに入れた瞬間に GitHub が一時ブランチ `gh-readonly-queue/main/pr-<N>-<sha>` を生成し、そこに対して `merge_group` イベントを発火させる。`ci.yml` がそのイベントをハンドルして PASS した場合のみ、main へ fast-forward される。失敗した場合はキューから外され、PR はマージ不可状態に戻る。

### 確認

```bash
# Branch protection が有効か
gh api "repos/${REPO}/branches/main/protection" --jq '.required_status_checks.contexts, .required_merge_queue_checks // "no merge queue"'

# Merge Queue の有無は Web UI で Settings > Branches > main の rules を見るのが確実
```

---

## 5. Vercel 環境変数（Preview / Production）の手動登録

OAK Casino の `setup-vercel-env.yml` 相当の workflow を Smitch では持たない（plan で除外）。代わりに `vercel env add` を手動実行して Vercel プロジェクトに直接登録する。

### 前提

```bash
# Vercel プロジェクトと紐付け（初回のみ・worktree ルートで）
vercel link --project shukan
```

### Preview スコープへの登録

Preview 環境では **dev Supabase**（`xhqddzdpcpvxpprxykct`）を参照する。

```bash
# 対話入力で値を貼り付け
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
vercel env add SUPABASE_SERVICE_ROLE_KEY preview
```

### Production スコープへの登録

Production 環境では **prod Supabase**（`erminkotxfnxlkxktejv`）を参照する。

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

> 注: `deploy-staging.yml` は **production** ビルドを `staging.s-mitch.com` に alias する設計のため、ビルド時環境変数は Production スコープの値が使われる。さらに workflow 内で `vercel deploy -e PROD_SUPABASE_URL=... -e PROD_SUPABASE_ANON_KEY=... -e PROD_SUPABASE_SERVICE_ROLE_KEY=...` の runtime override を併用して prod DB に接続する。  
> staging 専用に Vercel 側で別 env を持つ必要はない（GitHub Actions の override で吸収）。

### 登録確認

```bash
# Vercel 側に登録された env 一覧
vercel env ls

# 環境ごとのフィルタも可能
vercel env ls preview
vercel env ls production
```

---

## 6. 設定完了確認チェックリスト

以下を全て満たした状態がセットアップ完了。テスト PR で動作確認まで通すこと。

- [ ] **ラベル**: `gh label list | grep preview` で `preview` ラベルが見つかる
- [ ] **Secrets 9 件**: `gh secret list` に `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PROD_SUPABASE_URL`, `PROD_SUPABASE_ANON_KEY`, `PROD_SUPABASE_SERVICE_ROLE_KEY` の 9 件すべてが表示される
- [ ] **Vars 2 件**: `gh variable list` に `STAGING_DOMAIN=staging.s-mitch.com`, `PRODUCTION_DOMAIN=s-mitch.com` が表示される
- [ ] **Environment**: Settings > Environments に `Production` が存在し、Required reviewers に oratta が登録されている
- [ ] **Branch Protection**: Settings > Branches で `main` に Branch ruleset / protection が有効化されている
  - PR 上の Required Status Check に `ci` が含まれて**いない**こと（pending 回避）
- [ ] **Merge Queue**: Branch ruleset で `Require merge queue` が有効、かつ Merge Queue の Required Status Check に `ci` が含まれている
- [ ] **Vercel env (Preview)**: `vercel env ls preview` に `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` が登録されている
- [ ] **Vercel env (Production)**: `vercel env ls production` に同 3 件が登録されている
- [ ] **動作確認用テスト PR**:
  1. テスト PR を起票（src 配下の些細な変更で可）
  2. PR にラベル `preview` を付与 → `deploy-preview.yml` と `ci.yml` が発火し、PR コメントに Preview URL が投稿される
  3. PR のマージボタン押下 → Merge Queue に入り、`merge_group` 経由で `ci` が走って PASS した場合のみ main に fast-forward
  4. main マージ後、`deploy-staging.yml` が発火し `staging.s-mitch.com` がデプロイされる
  5. `gh workflow run deploy-production.yml -f confirm=true` を実行 → Production Environment の reviewer 承認待ち → oratta が承認 → `s-mitch.com` にデプロイされる

---

## 参考リンク

- 関連ドキュメント:
  - `docs/infrastructure/environment-strategy.md` — 4 環境構成の全体像と Smitch 固有の Supabase 接続戦略
  - `docs/infrastructure/staging-domain-setup.md` — `staging.s-mitch.com` の DNS / Vercel domain 追加 / Git Integration 切断手順
- 関連ワークフロー:
  - `.github/workflows/ci.yml`
  - `.github/workflows/deploy-preview.yml`
  - `.github/workflows/deploy-staging.yml`
  - `.github/workflows/deploy-production.yml`
