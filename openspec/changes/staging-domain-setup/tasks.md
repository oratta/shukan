## 1. staging-domain-setup.md 本体作成

- [ ] 1.1 `docs/infrastructure/staging-domain-setup.md` を新規作成
- [ ] 1.2 概要セクション: staging.s-mitch.com を Vercel に向けて GitHub Actions 経由でデプロイする全手順

## 2. Vercel Git Integration 切断セクション

- [ ] 2.1 Vercel Dashboard > Project Settings > Git > Disconnect の UI 手順を記述
- [ ] 2.2 **切断タイミング順序ガイダンスを太字で明示**: 「main マージ → `deploy-staging.yml` の Actions ログで成功確認 → その後切断」
- [ ] 2.3 順序を誤った場合のリスク（staging 到達不能の窓）を明記
- [ ] 2.4 復旧手順: 切断後動かない場合は Vercel Dashboard で再接続して暫定復旧

## 3. Cloudflare DNS セクション

- [ ] 3.1 Cloudflare Dashboard > s-mitch.com > DNS > Add record の UI 手順を記述
- [ ] 3.2 A レコード `staging` → `76.76.21.21`, Proxy: OFF, TTL: Auto を指定
- [ ] 3.3 既存 apex `s-mitch.com` も A レコードで運用中である旨を脚注で記述

## 4. Vercel domain 追加セクション

- [ ] 4.1 `vercel domains add staging.s-mitch.com shukan` または UI 経由（Project Settings > Domains）の手順
- [ ] 4.2 Vercel の DNS 検証完了確認方法（vercel domains inspect）

## 5. 動作確認 e2e フロー 5 ステップ

- [ ] 5.1 「動作確認 e2e フロー」セクションを末尾に配置
- [ ] 5.2 ステップ 1: `gh label create preview --color ededed --description "Trigger preview deploy and CI"` でラベル作成（前提）
- [ ] 5.3 ステップ 2: `gh secret set` で 9 件の secrets を登録（github-setup.md 参照）
- [ ] 5.4 ステップ 3: テスト PR 起票 → `preview` ラベル付与 → `deploy-preview.yml` + `ci.yml` 発火を Actions タブで確認、Preview URL が PR コメントされる
- [ ] 5.5 ステップ 4: PR を Ready 化 → マージボタンで Merge Queue enqueue → `merge_group` で `ci` PASS → `deploy-staging.yml` が staging.s-mitch.com にデプロイ完了を確認
- [ ] 5.6 ステップ 5: `gh workflow run deploy-production.yml -f confirm=true` → GitHub Environment "Production" approval 待ち → oratta 承認 → s-mitch.com にデプロイ
- [ ] 5.7 各ステップに「期待結果」と「失敗時の確認ポイント」を併記

## 6. assertion 検証

- [ ] 6.1 `test -f docs/infrastructure/staging-domain-setup.md` 成功
- [ ] 6.2 `grep -c "Git Integration" docs/infrastructure/staging-domain-setup.md` 1 以上
- [ ] 6.3 `grep -c "76.76.21.21\\|Cloudflare" docs/infrastructure/staging-domain-setup.md` 1 以上
- [ ] 6.4 `grep -c "vercel domains add\\|Vercel.*Domain" docs/infrastructure/staging-domain-setup.md` 1 以上
- [ ] 6.5 `grep -c "gh label create preview" docs/infrastructure/staging-domain-setup.md` 1 以上
- [ ] 6.6 `grep -c "main マージ\\|deploy-staging.yml" docs/infrastructure/staging-domain-setup.md` 1 以上（順序ガイダンス）
- [ ] 6.7 `grep -c "workflow_dispatch\\|gh workflow run deploy-production" docs/infrastructure/staging-domain-setup.md` 1 以上

## 7. コミット

- [ ] 7.1 `git add docs/infrastructure/staging-domain-setup.md openspec/changes/staging-domain-setup/`
- [ ] 7.2 commit message: `docs: add staging-domain-setup guide (Vercel Git disconnect + Cloudflare DNS + e2e flow)`
