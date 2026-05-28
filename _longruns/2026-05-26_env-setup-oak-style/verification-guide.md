# Verification Guide — env-setup-oak-style

## 環境

- URL: localhost:3000（開発時）/ staging.s-mitch.com（staging 動作確認時）/ s-mitch.com（prod 動作確認時）
- 起動: `npm run dev`
- テスト: `npm run test:run`
- lint: `npm run lint`
- ビルド: `npx next build`
- workflow 構文検証: `docker run --rm -v "$(pwd):/repo" --workdir /repo rhysd/actionlint:latest -color`

## 注記: インフラ run の Scenario 検証方針

本 run はインフラ構築のため、Scenario の THEN は**ファイル存在 + grep + コマンド PASS**で代替する。「ユーザー画面操作」は受け入れ条件 15-18（手動確認条件）として残し、本 verification-guide では各 Scenario の自動検証可能項目のみチェックする。

---

## change-A: env-strategy-docs

### S1: 4 環境の URL と Supabase 接続先の対応表が記載されている
- WHEN: 運用者が `docs/infrastructure/environment-strategy.md` を開く
- THEN: dev/preview/staging/prod の 4 環境の URL + Supabase ID の対応表が確認できる
- [ ] テスト実装完了（assertion: `grep` ベース）
- [ ] ロジック実装完了（docs ファイル作成）
- [ ] 動作確認完了（grep PASS）
- [ ] ユーザー確認完了

### S2: LIFF/LINE 記述が含まれていない
- WHEN: `grep -i liff docs/infrastructure/environment-strategy.md` 実行
- THEN: 0 件
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S3: Staging 禁則事項セクションが (a)(b)(c) の 3 観点を含む
- WHEN: 「禁則事項」セクションを読む
- THEN: prod DB 書き込み / RLS / QA 専用アカウントの 3 点が明記
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S4: vercel.json 設計理由が記載されている
- WHEN: `enabled: false` / `autoAlias` で検索
- THEN: Git 連携無効化 + autoAlias no-op の説明が見つかる
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S5: 開発ワークフローセクションが新運用 5 段階を反映
- WHEN: 「開発ワークフロー」セクションを読む
- THEN: Draft PR → ラベル → Ready/Merge Queue → main マージ → workflow_dispatch の 5 段階記述
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

---

## change-B: github-actions-workflows

### S6: ci.yml のトリガー条件
- WHEN: `ci.yml` の `on:` セクションを読む
- THEN: `pull_request: types: [labeled]` + `merge_group` + `workflow_dispatch` の 3 種のみ、`synchronize`/`push` なし
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S7: ci.yml の label フィルタ
- WHEN: 各 job の `if:` を読む
- THEN: `preview` ラベル以外で発火しないガード
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S8: ci.yml に npm test step がある
- WHEN: `grep "npm test\|npm run test:run" .github/workflows/ci.yml`
- THEN: 1 件以上
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S9: ci.yml に actionlint job がある
- WHEN: `ci.yml` 内に `rhysd/actionlint` Docker image 参照
- THEN: actionlint job 定義あり
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S10: deploy-preview.yml の job-level if（Fork PR ガード必須）
- WHEN: `grep "head.repo.full_name == github.repository" .github/workflows/deploy-preview.yml`
- THEN: 1 件以上 + `label.name == 'preview'` も AND で含む
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S11: deploy-preview.yml の Preview URL コメント機能
- WHEN: `grep "actions/github-script" .github/workflows/deploy-preview.yml`
- THEN: 1 件以上
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S12: deploy-staging.yml の env override
- WHEN: `deploy-staging.yml` を読む
- THEN: `PROD_SUPABASE_URL/ANON_KEY/SERVICE_ROLE_KEY` を sed override + `vercel deploy -e` で runtime override + LIFF 言及なし
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S13: deploy-staging.yml の staging.s-mitch.com alias
- WHEN: `grep "vercel alias" .github/workflows/deploy-staging.yml`
- THEN: 1 件以上 + `concurrency: group: staging-deploy` も存在
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S14: deploy-production.yml の trigger と input
- WHEN: `deploy-production.yml` を読む
- THEN: `on: workflow_dispatch:` のみ + `inputs.confirm` (boolean) 定義
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S15: deploy-production.yml の Environment 指定
- WHEN: `grep "environment:" -A 2 .github/workflows/deploy-production.yml`
- THEN: `name: Production` + `url: https://${{ vars.PRODUCTION_DOMAIN }}`
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S16: deploy-production.yml の confirm validation
- WHEN: 最初の step を読む
- THEN: `confirm != 'true'` で `exit 1` するバリデーション
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S17: actionlint PASS
- WHEN: `docker run --rm -v "$(pwd):/repo" --workdir /repo rhysd/actionlint:latest -color`
- THEN: exit code 0、エラーゼロ
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S18: vercel.json の github.enabled: false
- WHEN: `grep -A 2 '"github"' vercel.json`
- THEN: `"enabled": false` を含む
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S19: vercel.json の autoAlias 削除
- WHEN: `grep autoAlias vercel.json`
- THEN: 0 件
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

---

## change-C: github-setup-guide

### S20: 必要な Secrets/Vars が網羅されている
- WHEN: `docs/infrastructure/github-setup.md` を読む
- THEN: Secrets 9 件 + Vars 2 件が全て記載
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S21: gh CLI コマンド例がある
- WHEN: `grep "gh secret set" docs/infrastructure/github-setup.md`
- THEN: 1 件以上
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S22: PR 上で ci を Required にしない理由
- WHEN: Branch Protection セクションを読む
- THEN: ラベル未付与で pending 化する問題 + Merge Queue 経由の ci PASS を Required にする設計理由
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S23: Merge Queue の Required Status Check 設定手順
- WHEN: Merge Queue セクションを読む
- THEN: `ci` を Required Status Check として指定する手順
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S24: GitHub Environment 作成手順
- WHEN: Environment セクションを読む
- THEN: "Production" 作成 + Required reviewers = oratta
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S25: ラベル作成コマンド + タイミング警告
- WHEN: ラベルセクションを読む
- THEN: `gh label create preview` コマンド + 「workflow merge 前に作成」太字警告
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S26: Vercel env 登録コマンド
- WHEN: `grep "vercel env add" docs/infrastructure/github-setup.md`
- THEN: Preview スコープへの Supabase 系 env 登録例
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

---

## change-D: staging-domain-setup

### S27: Vercel Git Integration 切断手順の存在
- WHEN: `docs/infrastructure/staging-domain-setup.md` を読む
- THEN: Vercel Dashboard 経由の Disconnect UI 操作手順
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S28: 切断タイミング順序ガイダンス
- WHEN: 「切断タイミング」セクション
- THEN: main マージ → deploy-staging.yml 成功確認 → 切断 の順序が明示 + 失敗時リスク説明
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S29: Cloudflare DNS 手順
- WHEN: Cloudflare セクションを読む
- THEN: A レコード staging → 76.76.21.21, proxy OFF の UI 手順
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S30: Vercel domain 追加手順
- WHEN: Vercel domain セクションを読む
- THEN: `vercel domains add staging.s-mitch.com` または UI 手順
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S31: 動作確認 e2e フロー 5 ステップ
- WHEN: 「動作確認 e2e フロー」セクション
- THEN: ラベル作成 → Secrets → preview ラベル付与 → main マージ → workflow_dispatch + approval の 5 ステップ
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了
