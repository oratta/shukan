## Why

change-B のワークフローは `STAGING_DOMAIN` 変数を使って `staging.s-mitch.com` への alias を試みるが、Cloudflare DNS でサブドメインを Vercel に向けていなければ動かない。また Vercel プロジェクト `shukan` 側で Git Integration が有効なままだと、`vercel.json` の `enabled: false` を merge しても自動デプロイが二重に走る窓ができる。これらの手動手順とエンドツーエンド動作確認フローを別ドキュメントに集約する必要がある。

## What Changes

- `docs/infrastructure/staging-domain-setup.md` を新規作成
  - **Vercel プロジェクト `shukan` の Git Integration 切断手順**（切断タイミング順序ガイダンス含む）
  - Cloudflare DNS で `staging.s-mitch.com` を Vercel IP（`76.76.21.21`）に向ける手順
  - Vercel に `staging.s-mitch.com` をドメインとして追加する手順（`vercel domains add`）
  - 全体動作確認 e2e フロー（5 ステップ: ラベル作成 → Secrets 登録 → ラベル付与で preview → main マージで staging → workflow_dispatch + approval で prod）

## Capabilities

### New Capabilities
- `staging-domain-setup`: staging.s-mitch.com のドメイン設定と Vercel Git Integration 切断、エンドツーエンド動作確認手順

### Modified Capabilities
（なし）

## Impact

- 影響範囲: `docs/infrastructure/staging-domain-setup.md` 新規追加のみ
- 既存コード変更: なし
- 依存関係: change-B + change-C（ワークフローと GitHub 設定が前提）
- 外部影響: 手順実行時に Vercel Git Integration 切断が発生するため、切断順序を誤ると staging 到達不能の窓が発生する
