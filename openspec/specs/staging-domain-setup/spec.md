# staging-domain-setup Specification

## Purpose
TBD - created by archiving change staging-domain-setup. Update Purpose after archive.
## Requirements
### Requirement: Vercel Git Integration 切断手順と順序ガイダンスが記載されている

`docs/infrastructure/staging-domain-setup.md` SHALL Vercel プロジェクト `shukan` の Git Integration 切断手順と、切断タイミングの順序ガイダンスを MUST 記載する。

#### Scenario: Git Integration 切断手順の存在
- **WHEN** 運用者が `docs/infrastructure/staging-domain-setup.md` を読む
- **THEN** Vercel Dashboard → Project Settings → Git → Disconnect の UI 操作手順が記載されている

#### Scenario: 切断タイミング順序ガイダンス
- **WHEN** 運用者が「切断タイミング」または該当セクションを読む
- **THEN** 「main マージ → `deploy-staging.yml` 成功確認 → その後切断」の順序が明示されており、「切断を先に行うと staging 到達不能の窓が発生する」旨が説明されている

### Requirement: Cloudflare DNS と Vercel domain 追加の両手順が記載されている

`staging.s-mitch.com` のドメイン設定について、Cloudflare DNS 側と Vercel 側の両手順は MUST 記載する。

#### Scenario: Cloudflare DNS 手順
- **WHEN** 運用者が「Cloudflare DNS」セクションを読む
- **THEN** A レコード `staging` → `76.76.21.21`（Vercel IP）, proxy OFF の UI 設定手順が記載されている

#### Scenario: Vercel domain 追加手順
- **WHEN** 運用者が「Vercel domain 追加」セクションを読む
- **THEN** `vercel domains add staging.s-mitch.com` または UI 操作（Project Settings > Domains > Add）の手順が記載されている

### Requirement: 動作確認 e2e フロー 5 ステップが記載されている

エンドツーエンドの動作確認手順は 5 ステップで MUST 記載する。

#### Scenario: 動作確認手順の存在
- **WHEN** 運用者が「動作確認 e2e フロー」セクションを読む
- **THEN** 以下 5 ステップが順序付けで記述されている:
  1. `gh label create preview --color ededed` でラベル作成（前提）
  2. `gh secret set` で必要 secrets を登録（github-setup.md を参照）
  3. テスト PR を起票 → ラベル `preview` を付与 → `deploy-preview.yml` + `ci.yml` 発火、Preview URL が PR コメントに投稿される
  4. main にマージ（Merge Queue 経由）→ `merge_group` で `ci` PASS → `deploy-staging.yml` が `staging.s-mitch.com` にデプロイ
  5. `gh workflow run deploy-production.yml -f confirm=true` → reviewer 承認後に `s-mitch.com` にデプロイ

