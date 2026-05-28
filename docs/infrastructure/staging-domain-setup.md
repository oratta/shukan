# Staging Domain Setup

`staging.s-mitch.com` を Vercel プロジェクト `shukan` に向けて GitHub Actions 経由でデプロイするための、ドメイン設定 / Vercel Git Integration 切断 / エンドツーエンド動作確認手順を集約する。

## 概要

本ドキュメントは、staging 環境を「Vercel 自動デプロイ」から「GitHub Actions 主導デプロイ」へ移行するために必要な、コード外（インフラ / ダッシュボード）操作をまとめる。

対象作業:

1. **Cloudflare DNS**: `staging.s-mitch.com` を Vercel IP (`76.76.21.21`) に向ける（A レコード、proxy OFF）
2. **Vercel domain 追加**: Vercel プロジェクト `shukan` に `staging.s-mitch.com` をドメインとして登録
3. **Vercel Git Integration 切断**: 二重デプロイを防ぐため、`shukan` プロジェクトの Git 連携を Dashboard から無効化
4. **動作確認 e2e フロー**: ラベル作成 → Secrets 登録 → Preview → Staging → Production の 5 ステップ通し動作確認

前提:

- change-B（`.github/workflows/{ci,deploy-preview,deploy-staging,deploy-production}.yml` および `vercel.json` の `github.enabled: false` 化）が main にマージ済み
- change-C（`docs/infrastructure/github-setup.md` に従って Secrets/Vars/Environment/Merge Queue/ラベル の準備が完了）
- Vercel CLI (`vercel`) と GitHub CLI (`gh`) がローカルにインストール済みでログイン済み
- Cloudflare の s-mitch.com ゾーンに編集権限がある

参考: [`environment-strategy.md`](./environment-strategy.md), [`github-setup.md`](./github-setup.md)

---

## 1. Cloudflare DNS

`staging.s-mitch.com` のサブドメインを Vercel に向ける A レコードを Cloudflare Dashboard で追加する。

> 本 run では Cloudflare API トークン操作は扱わない（API トークン管理は別 run）。**UI 手順のみ**で実施する。

### 手順

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. 左ペインから `s-mitch.com` ゾーンを選択
3. サイドバーの **DNS** → **Records** を開く
4. 右上の **Add record** をクリック
5. 以下を入力:

   | 項目 | 値 |
   |---|---|
   | Type | `A` |
   | Name | `staging` |
   | IPv4 address | `76.76.21.21` |
   | Proxy status | **DNS only**（オレンジ雲を OFF にしてグレー雲にする） |
   | TTL | Auto |

6. **Save** をクリック
7. 反映確認:

   ```bash
   dig +short staging.s-mitch.com
   # → 76.76.21.21
   ```

### 期待結果

- `dig +short staging.s-mitch.com` で `76.76.21.21` が返る
- Cloudflare DNS 一覧画面に `staging A 76.76.21.21 DNS only` が表示される

### 失敗時の確認ポイント

- 雲アイコンがオレンジ（Proxy ON）になっていないか → Vercel の SSL 検証が失敗する。必ず **DNS only** にする
- 既存の `staging` レコードがあれば編集ではなく追加してしまっていないか
- DNS 反映待ち（数分〜数十分）→ `dig @1.1.1.1 staging.s-mitch.com` で再確認

> 注: 既存の apex `s-mitch.com` も A レコード方式（`76.76.21.21`）で運用中であり、`staging` サブドメインも同じ方式に揃える（MEMORY.md / `environment-strategy.md` 参照）。CNAME ではなく A レコードを使う理由は、Vercel ドキュメントが apex/サブで統一できる A レコードを推奨しているため。

---

## 2. Vercel Domain 追加

Cloudflare DNS で staging サブドメインが Vercel IP に向いたら、Vercel プロジェクト `shukan` 側にもドメインを登録する。

### 手順（CLI 推奨）

```bash
# Vercel ログイン（未ログイン時のみ）
vercel login

# プロジェクトをリンク（未リンク時のみ）
vercel link --yes --project shukan

# staging.s-mitch.com を shukan プロジェクトに追加
vercel domains add staging.s-mitch.com shukan
```

成功すると `> Success! Domain staging.s-mitch.com added to project shukan.` のような出力になる。

### 手順（UI 経由 / 代替）

CLI が使えない場合は Vercel Dashboard から追加する:

1. [Vercel Dashboard](https://vercel.com/orattas-projects/shukan) を開く
2. 上部タブ **Settings** → 左ペイン **Domains**
3. **Add Domain** をクリック
4. `staging.s-mitch.com` を入力 → **Add** をクリック
5. 検証画面が表示されるが、Cloudflare で A レコードを設定済みなら自動的に Valid Configuration になる

### 検証

DNS が正しく向いていれば数秒〜数分で Vercel 側の検証が通る。CLI で状態確認:

```bash
vercel domains inspect staging.s-mitch.com
```

出力例:

```
> Inspecting domain staging.s-mitch.com under <team>...
  Domain                staging.s-mitch.com
  Verified              true
  Nameservers           (Cloudflare)
  DNS Records           A  76.76.21.21
```

### 期待結果

- `vercel domains inspect staging.s-mitch.com` で `Verified true` が表示される
- Vercel Dashboard の Domains 一覧で `staging.s-mitch.com` が緑チェック（Valid Configuration）

### 失敗時の確認ポイント

- `Invalid Configuration` 表示 → Cloudflare の A レコード値が `76.76.21.21` か再確認、Proxy が ON になっていないか確認
- ドメインが他プロジェクトに登録済みエラー → `vercel domains rm staging.s-mitch.com` で剥がしてから再追加
- 反映が遅い → 5〜10 分待って再度 `vercel domains inspect`

---

## 3. Vercel Git Integration 切断

Vercel プロジェクト `shukan` の Git 連携が有効なままだと、`vercel.json` で `github.enabled: false` を設定していても、GitHub Actions 経由のデプロイと Vercel 側の自動デプロイが**衝突する窓**が発生する。Dashboard から完全切断する。

### 切断タイミング順序ガイダンス（最重要）

**必ず以下の順序で実施すること:**

1. change-B の workflow を含むコミットを **main にマージ**
2. `deploy-staging.yml` が Actions タブで成功し、`staging.s-mitch.com` で実際にアプリが動くことを確認
3. **その後** に Vercel Dashboard から Git Integration を切断する

順序を逆にすると（切断 → workflow がまだ未マージ）、Vercel 側は自動デプロイを止め、GitHub Actions もまだ動かないため、**staging（および preview）への新規デプロイ経路が一時的に消失する窓**が発生する。Indie プロダクトのため重大な障害にはならないが、想定外の到達不能を避けるため順序は守ること。

### 切断手順

1. [Vercel Dashboard](https://vercel.com/orattas-projects/shukan) を開く
2. 上部タブ **Settings** をクリック
3. 左ペイン **Git** を選択
4. 「Connected Git Repository」のリポジトリ表示の下の **Disconnect** ボタンをクリック
5. 確認モーダルで `shukan` と入力（または「Disconnect」を確認）→ **Disconnect** で確定

切断後、以後 main / PR への push で Vercel 自動デプロイは走らなくなる。デプロイはすべて GitHub Actions (`deploy-preview.yml` / `deploy-staging.yml` / `deploy-production.yml`) 経由となる。

### 期待結果

- Vercel Dashboard > Settings > Git に「Connect Git Repository」ボタンが表示される（=未接続状態）
- 以後 GitHub への push で Vercel Dashboard の Deployments タブに自動デプロイが追加されない
- GitHub Actions 経由のデプロイ（後述の e2e フロー）は引き続き成功する

### 失敗時 / 復旧手順

万が一切断後に GitHub Actions 側のデプロイが動かない、または順序を誤って先に切断してしまった場合の暫定復旧:

1. Vercel Dashboard > Settings > Git > **Connect Git Repository** をクリック
2. GitHub の `oratta/Shukan` リポジトリを選択して再接続
3. Vercel の自動デプロイで暫定的に staging を復活させる
4. その間に GitHub Actions 側の問題（Secrets 不足 / workflow syntax エラー等）を解消
5. GitHub Actions 経由のデプロイ成功を確認したら、再度切断手順を実施

> 注: `vercel.json` の `github.enabled: false` だけでは Dashboard 側の Git Integration 全機能を切ることはできない（Production Branch 設定など Dashboard UI 側の自動連携が残る）。完全停止には Dashboard 切断が必須。

---

## 4. 動作確認 e2e フロー

ドメイン設定と Git Integration 切断が終わったら、以下 5 ステップを順番に実行して、開発フロー全体（preview → staging → production）が GitHub Actions 経由で機能することを確認する。

### ステップ 1: `preview` ラベル作成（前提）

GitHub Actions の `ci.yml` と `deploy-preview.yml` は `preview` ラベルがトリガーになっているため、ラベルが存在しないと PR にラベル付与できない。

```bash
gh label create preview --color ededed --description "Trigger preview deploy and CI"
```

**重要**: このラベル作成は change-B の workflow が main にマージされる**前**に完了させること。順序が逆だと、preview ラベルが PR に貼れないため、preview デプロイ / ci がそもそも発火できない。

#### 期待結果

- `gh label list | grep preview` で 1 件表示される

#### 失敗時の確認ポイント

- すでに存在エラー → `gh label edit preview --color ededed --description "Trigger preview deploy and CI"` で更新
- 権限エラー → `gh auth status` でログイン確認、リポジトリの write 権限があるか確認

---

### ステップ 2: GitHub Secrets / Vars 登録

`docs/infrastructure/github-setup.md` セクション「Secrets」「Vars」に記載の 9 件の Secrets と 2 件の Vars を `gh secret set` / `gh variable set` で登録する。

代表例（詳細と全件リストは [`github-setup.md`](./github-setup.md) を参照）:

```bash
# Secrets (9 件)
gh secret set VERCEL_TOKEN              # Vercel personal token
gh secret set VERCEL_ORG_ID
gh secret set VERCEL_PROJECT_ID
gh secret set PROD_SUPABASE_URL
gh secret set PROD_SUPABASE_ANON_KEY
gh secret set PROD_SUPABASE_SERVICE_ROLE_KEY
gh secret set STAGING_SUPABASE_URL
gh secret set STAGING_SUPABASE_ANON_KEY
gh secret set STAGING_SUPABASE_SERVICE_ROLE_KEY

# Vars (2 件)
gh variable set STAGING_DOMAIN --body "staging.s-mitch.com"
gh variable set PRODUCTION_DOMAIN --body "s-mitch.com"
```

#### 期待結果

- `gh secret list` で 9 件、`gh variable list` で 2 件表示される

#### 失敗時の確認ポイント

- secret 値の貼り付けで改行が混入していないか → `gh secret set <NAME> < value.txt` でファイル経由登録に切り替え
- Vercel token のスコープ不足 → Vercel ダッシュボード > Account Settings > Tokens で `Full Account` スコープのトークンを再発行

---

### ステップ 3: テスト PR で Preview デプロイ + CI 発火確認

`preview` ラベルが付与されたタイミングで `deploy-preview.yml` + `ci.yml` が発火し、Preview URL が PR コメントに自動投稿されることを確認する。

```bash
# 適当な軽微変更でブランチを切る
git checkout -b chore/e2e-verify
echo "<!-- e2e verify -->" >> README.md
git add README.md && git commit -m "chore: e2e verify"
git push -u origin chore/e2e-verify

# Draft PR を起票（label 未付与状態では何も走らない）
gh pr create --draft --title "chore: e2e verify" --body "e2e verify"

# preview ラベルを付与（ここで CI と preview deploy が発火）
gh pr edit --add-label preview
```

#### 期待結果

- GitHub の Actions タブで `ci.yml` と `deploy-preview.yml` が同時に走り始める（runs に新規エントリ）
- `ci.yml` は `lint` / `test` / `build` / `actionlint` job がすべて PASS
- `deploy-preview.yml` の最終 step で Preview URL（例 `https://shukan-xxxxx.vercel.app`）が PR コメントとして自動投稿される
- Preview URL をブラウザで開くとアプリが Staging Supabase（または該当 Preview 用 env）に接続して動作する

#### 失敗時の確認ポイント

- Actions が発火しない → ラベル名が `preview` か（typo 確認）、`deploy-preview.yml` の `if: ... label.name == 'preview'` が一致しているか
- Preview URL がコメントされない → `actions/github-script` step のログを確認、`pull-requests: write` permission が job に付与されているか
- Fork PR でデプロイされない → 正しい挙動（fork ガード `head.repo.full_name == github.repository` により stop）

---

### ステップ 4: PR Ready 化 → Merge Queue → Staging デプロイ

Preview が動いたら PR を Ready 化し、Merge Queue 経由で main にマージ。`merge_group` トリガーで `ci` が PASS した後に `deploy-staging.yml` が `staging.s-mitch.com` にデプロイされる。

```bash
# Draft を解除
gh pr ready

# Merge Queue へ enqueue（PR 画面の「Merge when ready」ボタンと等価）
gh pr merge --merge --auto
```

GitHub UI でも可（Conversation タブ右下「Merge when ready」/「Add to merge queue」）。

#### 期待結果

- Merge Queue に enqueue され、`merge_group` トリガーで `ci.yml` が再実行され PASS
- main にマージ完了
- 直後に `deploy-staging.yml` が起動し、最後の step で `staging.s-mitch.com` への alias が成功
- ブラウザで `https://staging.s-mitch.com` を開くと最新コミットの内容が反映されている
- `concurrency: group: staging-deploy` により多重実行が発生しない

#### 失敗時の確認ポイント

- Merge Queue に入らない → Branch Protection の Required Status Checks 設定（`ci` を Merge Queue Required にしているか）を `github-setup.md` 通りに再確認
- `vercel alias` 失敗 → `vercel domains inspect staging.s-mitch.com` で Verified 状態か再確認、`STAGING_DOMAIN` Vars 値の typo 確認
- `staging.s-mitch.com` が古いまま → ブラウザ強制リロード（Cmd+Shift+R）、Vercel Dashboard > Deployments で最新 deployment に Alias が付いているか確認

---

### ステップ 5: Production デプロイ（workflow_dispatch + approval）

最後に手動トリガーで Production にデプロイ。`workflow_dispatch` + GitHub Environment "Production" の Required reviewers (= oratta) による承認待ちで二重ガードする。

```bash
gh workflow run deploy-production.yml -f confirm=true
```

#### 期待結果

- Actions タブに `deploy-production.yml` の run が新規作成され、Environment "Production" の承認待ち状態（Waiting for review）になる
- oratta が GitHub UI で Approve すると run が再開
- 最終 step で `s-mitch.com` への alias が成功
- ブラウザで `https://s-mitch.com` を開くと最新コミットの内容が反映されている

#### 失敗時の確認ポイント

- 承認画面が出ない → `deploy-production.yml` の `environment: name: Production` 指定があるか、リポジトリ Settings > Environments で `Production` が作成され Required reviewers に oratta が登録されているか
- `confirm` バリデーションで即 fail → `-f confirm=true` を付け忘れていないか
- `vercel alias` 失敗 → 既存 apex の Vercel domain 登録状態を `vercel domains inspect s-mitch.com` で確認
- Prod 切替後にアプリがエラー → `PROD_SUPABASE_*` Secrets の値を再確認（Staging 用と混在していないか）

---

## まとめ

| 作業 | 操作対象 | 完了判定 |
|---|---|---|
| Cloudflare DNS | Cloudflare Dashboard | `dig +short staging.s-mitch.com` → `76.76.21.21` |
| Vercel domain 追加 | Vercel CLI / Dashboard | `vercel domains inspect staging.s-mitch.com` → `Verified true` |
| Vercel Git 切断 | Vercel Dashboard | Settings > Git に "Connect Git Repository" ボタン表示 |
| e2e フロー | GitHub / Vercel / ブラウザ | staging.s-mitch.com / s-mitch.com 両方に最新コミット反映 |

切断順序の遵守と、e2e フロー 5 ステップの順序実行が、ダウンタイムなき移行の鍵となる。
