## 1. .github/workflows/ ディレクトリ作成

- [ ] 1.1 `.github/workflows/` を mkdir する

## 2. ci.yml 作成

- [ ] 2.1 OAK Casino `.github/workflows/ci.yml` を参考に、Smitch 用 ci.yml を新規作成
- [ ] 2.2 trigger を `pull_request: types: [labeled]` + `merge_group` + `workflow_dispatch` の 3 種に設定（push を含まない）
- [ ] 2.3 各 job 先頭に `if: github.event_name != 'pull_request' || github.event.label.name == 'preview'` を追加
- [ ] 2.4 `actionlint` job を Docker `rhysd/actionlint:latest` で定義
- [ ] 2.5 `lint-and-typecheck` job を定義（`npm ci` → `npm run lint` → `npx next build` で typecheck）
- [ ] 2.6 `lint-and-typecheck` job 末尾に `npm run test:run` step を追加（Smitch 固有）
- [ ] 2.7 env から LIFF 関連を全削除（NEXT_PUBLIC_SUPABASE_URL/ANON_KEY のみを secrets から渡す）
- [ ] 2.8 OAK Casino の `e2e-tests` job は移植しない（Smitch は Playwright E2E 未整備、plan で除外）
- [ ] 2.9 NODE_VERSION は `'22'`（OAK Casino と同じ）

## 3. deploy-preview.yml 作成

- [ ] 3.1 OAK Casino `deploy-preview.yml` を参考に、Smitch 用に作成
- [ ] 3.2 trigger を `pull_request: types: [labeled]` に変更（OAK は [opened, synchronize, reopened]）
- [ ] 3.3 job-level `if:` を `github.event.label.name == 'preview' && github.event.pull_request.head.repo.full_name == github.repository` の AND 条件に設定（Fork PR ガード必須）
- [ ] 3.4 `concurrency: group: preview-deploy-${{ github.event.pull_request.number }}` を維持
- [ ] 3.5 `permissions: pull-requests: write` を維持
- [ ] 3.6 Vercel CLI で `--environment=preview` の pull → build → deploy
- [ ] 3.7 Preview URL を `actions/github-script@v7` で PR コメントに投稿する step を維持
- [ ] 3.8 LIFF env への参照を全削除

## 4. deploy-staging.yml 作成

- [ ] 4.1 OAK Casino `deploy-staging.yml` を参考に、LIFF 関連を全削除した版を作成
- [ ] 4.2 trigger を `push: branches: [main]` に設定
- [ ] 4.3 `concurrency: group: staging-deploy, cancel-in-progress: true` を設定
- [ ] 4.4 `vercel pull --environment=preview` で env 取得
- [ ] 4.5 `sed -i -e '/^NEXT_PUBLIC_SUPABASE_URL=/d' -e '/^NEXT_PUBLIC_SUPABASE_ANON_KEY=/d' -e '/^SUPABASE_SERVICE_ROLE_KEY=/d' "$ENV_FILE"` + `PROD_SUPABASE_*` の追記で client bundle 焼込
- [ ] 4.6 `vercel deploy --prebuilt -e NEXT_PUBLIC_SUPABASE_URL=... -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... -e SUPABASE_SERVICE_ROLE_KEY=...` で runtime env も override
- [ ] 4.7 `vercel alias "$DEPLOY_URL" "$STAGING_DOMAIN"` ステップを `vars.STAGING_DOMAIN` 条件付きで追加
- [ ] 4.8 LIFF/LIFF_MOCK 系の env 操作は一切含めない
- [ ] 4.9 GITHUB_STEP_SUMMARY への結果出力を維持

## 5. deploy-production.yml 作成

- [ ] 5.1 OAK Casino `deploy-production.yml` をほぼそのまま流用（LIFF 言及なしのため最小変更）
- [ ] 5.2 trigger は `workflow_dispatch` のみ、`inputs.confirm` (boolean, default: false) を定義
- [ ] 5.3 最初の step に `confirm != 'true'` で `exit 1` するバリデーションを配置
- [ ] 5.4 `environment: name: Production, url: https://${{ vars.PRODUCTION_DOMAIN }}` を job に指定
- [ ] 5.5 `concurrency: group: production-deploy, cancel-in-progress: false` を設定
- [ ] 5.6 `vercel pull --environment=production` → `vercel build --prod` → `vercel deploy --prebuilt --prod`

## 6. vercel.json 更新

- [ ] 6.1 既存 `vercel.json` を読み、`github` キーの値を `{ "enabled": false }` に書き換える
- [ ] 6.2 `autoAlias` キーを削除する（`enabled: false` 下では no-op のため）
- [ ] 6.3 `$schema` キーは保持する

## 7. assertion 検証（テスト相当）

- [ ] 7.1 `actionlint` で 4 workflow を構文検証 PASS（`docker run --rm -v "$(pwd):/repo" --workdir /repo rhysd/actionlint:latest -color`）
- [ ] 7.2 `npm test` baseline PASS（既存 197 tests）
- [ ] 7.3 `npm run lint` PASS
- [ ] 7.4 `npx next build` PASS（typecheck 兼）
- [ ] 7.5 `grep autoAlias vercel.json` が 0 件
- [ ] 7.6 `grep -A 2 '"github"' vercel.json` が `"enabled": false` を含む
- [ ] 7.7 `grep "synchronize" .github/workflows/ci.yml` が 0 件
- [ ] 7.8 `grep "head.repo.full_name == github.repository" .github/workflows/deploy-preview.yml` が 1 件以上
- [ ] 7.9 `grep "npm test\\|npm run test:run" .github/workflows/ci.yml` が 1 件以上
- [ ] 7.10 `grep -l "PROD_SUPABASE_URL" .github/workflows/deploy-staging.yml` が 1 件以上、`grep -l "LIFF" .github/workflows/deploy-staging.yml` が 0 件

## 8. コミット

- [ ] 8.1 `git add .github/workflows/ vercel.json openspec/changes/github-actions-workflows/`
- [ ] 8.2 commit message: `feat: add GitHub Actions workflows (ci, preview, staging, prod) + vercel.json git-disable`
- [ ] 8.3 コミットハッシュを longrun-builder の報告に含める
