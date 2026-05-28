## Why

Smitch リポジトリには現状 `.github/workflows/` も `docs/infrastructure/` も存在せず、Vercel の Git 自動デプロイのみで稼働している。今後 OAK Casino と同じ 4 環境（dev / preview / staging / prod）+ Draft PR + Merge Queue 運用に移行するにあたり、設計判断・接続先・禁則事項を一箇所に集約したドキュメントが必要。これがないと change-B/C/D の workflow 実装や手順書が断片化し、後から運用者（=自分）が「なぜこの設計か」を追えなくなる。

## What Changes

- `docs/infrastructure/environment-strategy.md` を新規作成
  - OAK Casino の `docs/environment-strategy.md` をベースに Smitch 文脈で書き換え
  - LIFF/LINE 関連セクションは完全削除し、Smitch の Google OAuth + Email 認証に置き換え
  - Cron Jobs セクションは「現状なし」と記述
  - 「開発ワークフロー」セクションに Draft PR + Merge Queue + `preview` ラベル発火を反映
  - **新規セクション**: Staging 動作確認時の禁則事項（prod DB 書き込みリスク、QA 専用アカウント運用）
  - **新規セクション**: `vercel.json` の `github.enabled: false` 設計理由（GitHub Actions + Vercel CLI でデプロイするため Git 連携自体を無効化、`autoAlias` は no-op になり削除）

## Capabilities

### New Capabilities
- `environment-strategy`: 4 環境の責務・接続先・運用ルールを定義する設計ドキュメント

### Modified Capabilities
（なし — 既存 spec への影響はない）

## Impact

- 影響範囲: `docs/infrastructure/environment-strategy.md` の追加のみ
- 既存コード変更: なし
- 依存関係: change-B（workflow 実装）と並列実行可能。`vercel.json` の最終形は plan で確定済みのため change-B の出力を待つ必要はない
