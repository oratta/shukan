## Why

Smitch には現状 `.github/workflows/` が存在せず、Vercel の Git 自動デプロイのみで稼働している。これでは「Draft PR を更新し続けても CI/preview を消費しない」「main マージ前の最終 CI が Merge Queue で走る」という運用要件を満たせない。OAK Casino の 4 workflow パターンを Smitch 用に修正して導入する必要がある。同時に `vercel.json` の `github` キーを `{ "enabled": false }` に置き換えて Vercel 側の Git 連携を完全に GitHub Actions 経由に統一する。

## What Changes

- `.github/workflows/ci.yml` 新規作成（PR ラベル `preview` 発火 + `merge_group` + `workflow_dispatch` の 3 トリガー、lint + typecheck + test + actionlint）
- `.github/workflows/deploy-preview.yml` 新規作成（PR ラベル `preview` 発火、Fork PR ガード必須）
- `.github/workflows/deploy-staging.yml` 新規作成（main push トリガー、prod Supabase に env override、`staging.s-mitch.com` alias）
- `.github/workflows/deploy-production.yml` 新規作成（workflow_dispatch + confirm input + GitHub Environment "Production" approval gate）
- `vercel.json` の `github` キーを `{ "enabled": false }` に置き換え（既存 `autoAlias: false` は削除）

## Capabilities

### New Capabilities
- `github-actions-deploy`: GitHub Actions 経由で preview / staging / production の 3 環境へデプロイする capability
- `vercel-git-disable-config`: `vercel.json` で Vercel 側の Git 自動連携を無効化する設定

### Modified Capabilities
（なし）

## Impact

- 影響範囲: `.github/workflows/{ci,deploy-preview,deploy-staging,deploy-production}.yml` の 4 ファイル新規 + `vercel.json` の置き換え
- 既存コード変更: なし（src/ は触らない）
- 依存関係: change-A と並列実行可能（A=docs ファイル、B=workflows+vercel.json で重複ファイルゼロ）。change-C/D の前提
- 外部影響: Vercel 側の Git Integration はこの change だけでは切断されない（change-D の手動手順）。マージ後しばらくは Vercel 自動デプロイと GitHub Actions が二重に動く窓があるが、indie プロダクトとして許容
