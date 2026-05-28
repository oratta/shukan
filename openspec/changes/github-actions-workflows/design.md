## Context

OAK Casino には 5 本の workflow（ci, deploy-preview, deploy-staging, deploy-production, setup-vercel-env）があり、本 change はこのうち 4 本を Smitch 用に修正移植する。`setup-vercel-env.yml` は plan.md でスコープ外（`vercel env add` の手動手順で代替）。

## Goals / Non-Goals

**Goals:**
- Draft PR + Merge Queue 運用を実現する CI トリガー設計
- Fork PR からの secret 漏洩を防ぐ Fork PR ガード（deploy-preview.yml）
- Staging で prod Supabase を参照する env override（OAK Casino と同等の手法）

**Non-Goals:**
- LIFF/LINE 関連の env 操作（Smitch では不要）
- Playwright E2E test の CI 実行（Smitch は Playwright 未整備、plan で除外明記）
- `setup-vercel-env.yml` の移植（`vercel env add` 手動手順で代替）
- reusable workflow 抽出（4 本でまず動かす、使用実績後に検討）

## Decisions

### D1: ci.yml のトリガーは 3 種類のみ
- `pull_request: types: [labeled]` + label.name == 'preview' フィルタ
- `merge_group`（Merge Queue 経由の最終 CI）
- `workflow_dispatch`（手動トリガー）
- **push トリガーは含めない**（PR push で自動発火しない要件のため）

### D2: ci.yml に npm test step を追加（OAK Casino にはない）
- OAK Casino の ci.yml は Playwright 中心で `npm test` step がない
- Smitch は Vitest で 197 tests があるため、`lint-and-typecheck` job 内に `npm test` step を追加する

### D3: deploy-preview.yml は Fork PR ガードを必ず維持
- OAK Casino オリジナル: `if: github.event.pull_request.head.repo.full_name == github.repository`
- Smitch でも同条件を job-level if に **AND で**結合: `if: github.event.label.name == 'preview' && github.event.pull_request.head.repo.full_name == github.repository`
- 理由: ラベルは外部協力者の PR でも付与可能なため、Fork PR からの secret 漏洩経路を必ず塞ぐ

### D4: deploy-staging.yml は OAK Casino から LIFF 関連を全削除
- env override の `sed -e '/NEXT_PUBLIC_LIFF_ID/d'` 等 LIFF 系 3 行を削除
- `vercel deploy --prebuilt -e NEXT_PUBLIC_LIFF_ID=...` も削除
- Supabase override の 3 つの env だけを残す

### D5: deploy-production.yml は OAK Casino をほぼそのまま流用
- LIFF 言及がないので最小変更
- `vars.PRODUCTION_DOMAIN` を `s-mitch.com` に設定する旨は change-C の手順書に記載

### D6: vercel.json の更新方針
- 既存: `{ "$schema": "https://openapi.vercel.sh/vercel.json", "github": { "autoAlias": false } }`
- 新規: `{ "$schema": "https://openapi.vercel.sh/vercel.json", "github": { "enabled": false } }`
- `$schema` は保持。`autoAlias` は削除（`enabled: false` 下では no-op）

## Risks / Trade-offs

- **リスク**: `vercel.json` の `github.enabled: false` を merge しても Vercel 側 project の Git Integration 設定はそのまま残るため、しばらく二重デプロイ状態になる → change-D の手順書で「main マージ → deploy-staging.yml 成功確認 → Vercel Git Integration 切断」の順序を明記して対処
- **リスク**: Merge Queue の Required Status Check は `merge_group` イベントで走る `ci` を参照するため、PR 上で `ci` を Required Status Check にすると `preview` ラベル未付与の PR がマージ不可になる → change-C の手順書で「PR 上では `ci` を Required にしない」と明記
- **トレードオフ**: ci.yml の trigger を「ラベル発火のみ」にすると、PR を開いた直後はテストが走らない。レビュー前に CI を確認したい場合は明示的に `preview` ラベルを付与する必要がある → これは要件の意図通り（PR push の都度 CI を走らせない）
